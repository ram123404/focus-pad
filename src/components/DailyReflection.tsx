import { useState, useEffect } from 'react';
import { Sparkles, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface DailyReflectionProps {
  gratitude: string;
  accomplishment: string;
  improvement: string;
  onUpdate: (field: 'reflection_gratitude' | 'reflection_accomplishment' | 'reflection_improvement', value: string) => void;
  compact?: boolean;
}

export function DailyReflection({
  gratitude,
  accomplishment,
  improvement,
  onUpdate,
  compact = false,
}: DailyReflectionProps) {
  const [open, setOpen] = useState(!compact);

  if (compact) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="py-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Daily Reflection
                </div>
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <ReflectionFields
                gratitude={gratitude}
                accomplishment={accomplishment}
                improvement={improvement}
                onUpdate={onUpdate}
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          Daily Reflection
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <ReflectionFields
          gratitude={gratitude}
          accomplishment={accomplishment}
          improvement={improvement}
          onUpdate={onUpdate}
        />
      </CardContent>
    </Card>
  );
}

function ReflectionFields({
  gratitude,
  accomplishment,
  improvement,
  onUpdate,
}: Omit<DailyReflectionProps, 'compact'>) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="gratitude" className="text-sm text-muted-foreground">
          What am I grateful for today?
        </Label>
        <Textarea
          id="gratitude"
          value={gratitude}
          onChange={(e) => onUpdate('reflection_gratitude', e.target.value)}
          placeholder="Three things I'm grateful for..."
          className="min-h-[60px] resize-none text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="accomplishment" className="text-sm text-muted-foreground">
          What did I accomplish today?
        </Label>
        <Textarea
          id="accomplishment"
          value={accomplishment}
          onChange={(e) => onUpdate('reflection_accomplishment', e.target.value)}
          placeholder="My wins and achievements..."
          className="min-h-[60px] resize-none text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="improvement" className="text-sm text-muted-foreground">
          How can I improve tomorrow?
        </Label>
        <Textarea
          id="improvement"
          value={improvement}
          onChange={(e) => onUpdate('reflection_improvement', e.target.value)}
          placeholder="Areas for growth..."
          className="min-h-[60px] resize-none text-sm"
        />
      </div>
    </>
  );
}
