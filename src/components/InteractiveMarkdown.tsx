import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface InteractiveMarkdownProps {
  content: string;
  onContentChange: (newContent: string) => void;
  onLinkClick?: (noteName: string) => void;
  className?: string;
}

export function InteractiveMarkdown({ 
  content, 
  onContentChange, 
  onLinkClick,
  className 
}: InteractiveMarkdownProps) {
  const checkboxCounterRef = useRef(0);

  // Build a map of task line indices
  const taskLineIndices = content.split('\n')
    .map((line, idx) => ({ line, idx }))
    .filter(({ line }) => /- \[[ x]\]/i.test(line))
    .map(({ idx }) => idx);

  const handleCheckboxToggle = (taskIndex: number, checked: boolean) => {
    const lineIdx = taskLineIndices[taskIndex];
    if (lineIdx === undefined) return;

    const lines = content.split('\n');
    const line = lines[lineIdx];

    if (checked) {
      lines[lineIdx] = line.replace(/- \[ \]/, '- [x]');
    } else {
      lines[lineIdx] = line.replace(/- \[x\]/i, '- [ ]');
    }

    onContentChange(lines.join('\n'));
  };

  // Reset counter before each render
  checkboxCounterRef.current = 0;

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          input: ({ node, ...props }) => {
            if (props.type === 'checkbox') {
              const taskIndex = checkboxCounterRef.current++;
              return (
                <input
                  type="checkbox"
                  checked={props.checked}
                  className="h-4 w-4 rounded border-primary text-primary focus:ring-primary cursor-pointer mr-2"
                  onChange={(e) => {
                    handleCheckboxToggle(taskIndex, e.target.checked);
                  }}
                />
              );
            }
            return <input {...props} />;
          },
          p: ({ children, ...props }) => {
            if (typeof children === 'string' || Array.isArray(children)) {
              const processChildren = (child: React.ReactNode): React.ReactNode => {
                if (typeof child !== 'string') return child;
                
                const parts = child.split(/(\[\[[^\]]+\]\])/g);
                if (parts.length === 1) return child;
                
                return parts.map((part, i) => {
                  const match = part.match(/\[\[([^\]]+)\]\]/);
                  if (match) {
                    return (
                      <button
                        key={i}
                        onClick={() => onLinkClick?.(match[1])}
                        className="text-primary hover:underline font-medium"
                      >
                        {match[1]}
                      </button>
                    );
                  }
                  return part;
                });
              };
              
              const processed = Array.isArray(children) 
                ? children.map(processChildren)
                : processChildren(children);
              
              return <p {...props}>{processed}</p>;
            }
            return <p {...props}>{children}</p>;
          },
          li: ({ children, node, ...props }) => {
            const isTask = node?.children?.some(
              (child: any) => child.tagName === 'input' && child.properties?.type === 'checkbox'
            );
            
            return (
              <li 
                {...props} 
                className={cn(
                  isTask && "list-none flex items-start gap-0",
                  props.className
                )}
              >
                {children}
              </li>
            );
          },
          h1: ({ children, ...props }) => (
            <h1 {...props} className="text-2xl font-bold mt-6 mb-3 pb-2 border-b">{children}</h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 {...props} className="text-xl font-semibold mt-5 mb-2">{children}</h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 {...props} className="text-lg font-medium mt-4 mb-2">{children}</h3>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className={cn("block bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto", className)} {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({ children, ...props }) => (
            <blockquote 
              {...props} 
              className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-4"
            >
              {children}
            </blockquote>
          ),
        }}
      >
        {content || '*No content yet*'}
      </ReactMarkdown>
    </div>
  );
}
