import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface ReflectionPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gratitude: string;
  accomplishment: string;
  improvement: string;
  onSave: (gratitude: string, accomplishment: string, improvement: string) => Promise<void>;
}

export function ReflectionPopup({
  open,
  onOpenChange,
  gratitude: initialGratitude,
  accomplishment: initialAccomplishment,
  improvement: initialImprovement,
  onSave,
}: ReflectionPopupProps) {
  const [gratitude, setGratitude] = useState(initialGratitude);
  const [accomplishment, setAccomplishment] = useState(initialAccomplishment);
  const [improvement, setImprovement] = useState(initialImprovement);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setGratitude(initialGratitude);
      setAccomplishment(initialAccomplishment);
      setImprovement(initialImprovement);
    }
  }, [open, initialGratitude, initialAccomplishment, initialImprovement]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(gratitude, accomplishment, improvement);
      toast({ title: 'Reflection saved' });
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Error saving reflection', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    // Store that user skipped today
    localStorage.setItem('lastReflectionSkip', new Date().toDateString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            End of Day Reflection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="popup-gratitude" className="text-sm font-medium">
              What am I grateful for today?
            </Label>
            <Textarea
              id="popup-gratitude"
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="Three things I'm grateful for..."
              className="min-h-[70px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="popup-accomplishment" className="text-sm font-medium">
              What did I accomplish today?
            </Label>
            <Textarea
              id="popup-accomplishment"
              value={accomplishment}
              onChange={(e) => setAccomplishment(e.target.value)}
              placeholder="My wins and achievements..."
              className="min-h-[70px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="popup-improvement" className="text-sm font-medium">
              How can I improve tomorrow?
            </Label>
            <Textarea
              id="popup-improvement"
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              placeholder="Areas for growth..."
              className="min-h-[70px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Today
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Reflection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
