 import { Button } from "@/components/ui/button";
 import { Separator } from "@/components/ui/separator";
 import {
   Heading1,
   Heading2,
   Heading3,
   List,
   ListOrdered,
   CheckSquare,
   Bold,
   Italic,
   Code,
   Quote,
   Link,
   Minus,
 } from "lucide-react";
 import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
 
 interface NoteToolbarProps {
   onInsert: (prefix: string, suffix?: string, multiline?: boolean) => void;
   onWrapSelection: (prefix: string, suffix: string) => void;
 }
 
 export function NoteToolbar({ onInsert, onWrapSelection }: NoteToolbarProps) {
   const tools = [
     { icon: Bold, label: "Bold", shortcut: "⌘B", action: () => onWrapSelection("**", "**") },
     { icon: Italic, label: "Italic", shortcut: "⌘I", action: () => onWrapSelection("*", "*") },
     { icon: Code, label: "Code", shortcut: "⌘E", action: () => onWrapSelection("`", "`") },
     { type: "separator" },
     { icon: Heading1, label: "Heading 1", shortcut: "⌘1", action: () => onInsert("# ") },
     { icon: Heading2, label: "Heading 2", shortcut: "⌘2", action: () => onInsert("## ") },
     { icon: Heading3, label: "Heading 3", shortcut: "⌘3", action: () => onInsert("### ") },
     { type: "separator" },
     { icon: List, label: "Bullet List", action: () => onInsert("- ", undefined, true) },
     { icon: ListOrdered, label: "Numbered List", action: () => onInsert("1. ", undefined, true) },
     { icon: CheckSquare, label: "Task List", action: () => onInsert("- [ ] ", undefined, true) },
     { type: "separator" },
     { icon: Quote, label: "Quote", action: () => onInsert("> ") },
     { icon: Minus, label: "Divider", action: () => onInsert("\n---\n") },
     { icon: Link, label: "Link Note", action: () => onWrapSelection("[[", "]]") },
   ];
 
   return (
     <div className="flex items-center gap-0.5 p-1.5 bg-muted/50 rounded-lg border mb-2 flex-wrap">
       {tools.map((tool, i) => {
         if (tool.type === "separator") {
           return <Separator key={i} orientation="vertical" className="h-6 mx-1" />;
         }
         const Icon = tool.icon!;
         return (
           <Tooltip key={i}>
             <TooltipTrigger asChild>
               <Button
                 variant="ghost"
                 size="sm"
                 className="h-8 w-8 p-0"
                 onClick={tool.action}
               >
                 <Icon className="h-4 w-4" />
               </Button>
             </TooltipTrigger>
             <TooltipContent side="bottom" className="text-xs">
               {tool.label}
               {tool.shortcut && <span className="ml-2 text-muted-foreground">{tool.shortcut}</span>}
             </TooltipContent>
           </Tooltip>
         );
       })}
     </div>
   );
 }