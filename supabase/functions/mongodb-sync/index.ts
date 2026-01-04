import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient, ObjectId } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

let client: MongoClient | null = null;

async function getDatabase() {
  if (!client) {
    const mongoUri = Deno.env.get('MONGODB_URI');
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not configured');
    }
    client = new MongoClient();
    await client.connect(mongoUri);
    console.log('Connected to MongoDB');
  }
  return client.database();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const db = await getDatabase();
    const { action, collection, data, id, query } = await req.json();

    console.log(`MongoDB action: ${action} on collection: ${collection}`);

    const coll = db.collection(collection);
    let result: any;

    switch (action) {
      case 'findAll':
        result = await coll.find(query || {}).toArray();
        break;

      case 'findOne':
        result = await coll.findOne({ _id: new ObjectId(id) });
        break;

      case 'insertOne':
        const insertResult = await coll.insertOne({
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        result = { _id: insertResult.toString(), ...data };
        break;

      case 'updateOne':
        await coll.updateOne(
          { _id: new ObjectId(id) },
          { $set: { ...data, updatedAt: new Date().toISOString() } }
        );
        result = { _id: id, ...data };
        break;

      case 'deleteOne':
        await coll.deleteOne({ _id: new ObjectId(id) });
        result = { deleted: true, _id: id };
        break;

      case 'bulkWrite':
        // For syncing all data at once
        if (data.notes) {
          await coll.deleteMany({});
          if (data.notes.length > 0) {
            await coll.insertMany(data.notes.map((note: any) => ({
              ...note,
              _id: note.id ? new ObjectId(note.id) : new ObjectId(),
            })));
          }
        }
        result = { synced: true };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('MongoDB error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
