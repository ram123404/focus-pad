import { ParsedInput } from '@/types';
import { format, addDays, nextMonday, nextFriday, parse } from 'date-fns';

const DATE_KEYWORDS: Record<string, () => string> = {
  'today': () => format(new Date(), 'yyyy-MM-dd'),
  'tomorrow': () => format(addDays(new Date(), 1), 'yyyy-MM-dd'),
  'monday': () => format(nextMonday(new Date()), 'yyyy-MM-dd'),
  'tuesday': () => format(addDays(nextMonday(new Date()), 1), 'yyyy-MM-dd'),
  'wednesday': () => format(addDays(nextMonday(new Date()), 2), 'yyyy-MM-dd'),
  'thursday': () => format(addDays(nextMonday(new Date()), 3), 'yyyy-MM-dd'),
  'friday': () => format(nextFriday(new Date()), 'yyyy-MM-dd'),
  'saturday': () => format(addDays(nextFriday(new Date()), 1), 'yyyy-MM-dd'),
  'sunday': () => format(addDays(nextFriday(new Date()), 2), 'yyyy-MM-dd'),
};

const PRIORITY_KEYWORDS: Record<string, 'low' | 'medium' | 'high'> = {
  'low': 'low',
  'medium': 'medium',
  'high': 'high',
  'urgent': 'high',
  'important': 'high',
  '!': 'high',
  '!!': 'high',
  '!!!': 'high',
};

const NOTE_INDICATORS = ['note:', 'memo:', '#note', 'remember:'];
const TASK_INDICATORS = ['todo:', 'task:', 'do:', '[]', '[ ]'];

export function parseQuickInput(input: string): ParsedInput {
  let text = input.trim();
  let type: 'note' | 'task' = 'task'; // Default to task
  let dueDate: string | undefined;
  let priority: 'low' | 'medium' | 'high' | undefined;
  const tags: string[] = [];

  // Check for explicit type indicators
  for (const indicator of NOTE_INDICATORS) {
    if (text.toLowerCase().startsWith(indicator)) {
      type = 'note';
      text = text.slice(indicator.length).trim();
      break;
    }
  }

  for (const indicator of TASK_INDICATORS) {
    if (text.toLowerCase().startsWith(indicator)) {
      type = 'task';
      text = text.slice(indicator.length).trim();
      break;
    }
  }

  // Extract tags (#word)
  const tagMatches = text.match(/#(\w+)/g);
  if (tagMatches) {
    tagMatches.forEach(tag => {
      tags.push(tag.slice(1).toLowerCase());
      text = text.replace(tag, '').trim();
    });
  }

  // Extract priority keywords
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    if (PRIORITY_KEYWORDS[word]) {
      priority = PRIORITY_KEYWORDS[word];
      text = text.replace(new RegExp(`\\b${word}\\b`, 'i'), '').trim();
      break;
    }
  }

  // Check for exclamation marks at end
  if (text.endsWith('!!!')) {
    priority = 'high';
    text = text.slice(0, -3).trim();
  } else if (text.endsWith('!!')) {
    priority = 'high';
    text = text.slice(0, -2).trim();
  } else if (text.endsWith('!')) {
    priority = 'medium';
    text = text.slice(0, -1).trim();
  }

  // Extract date keywords
  for (const [keyword, getDate] of Object.entries(DATE_KEYWORDS)) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(text)) {
      dueDate = getDate();
      type = 'task'; // If there's a date, it's likely a task
      text = text.replace(regex, '').trim();
      break;
    }
  }

  // Try to parse dates like "Jan 15" or "15/1"
  const datePatterns = [
    /\b(\d{1,2})[\/\-](\d{1,2})\b/, // 15/1 or 15-1
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\b/i, // Jan 15
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        let parsedDate: Date;
        if (pattern === datePatterns[0]) {
          const [, day, month] = match;
          const year = new Date().getFullYear();
          parsedDate = new Date(year, parseInt(month) - 1, parseInt(day));
        } else {
          const [, month, day] = match;
          const year = new Date().getFullYear();
          parsedDate = parse(`${month} ${day} ${year}`, 'MMM d yyyy', new Date());
        }
        if (!isNaN(parsedDate.getTime())) {
          dueDate = format(parsedDate, 'yyyy-MM-dd');
          type = 'task';
          text = text.replace(match[0], '').trim();
        }
      } catch {
        // Invalid date, ignore
      }
      break;
    }
  }

  // Clean up extra spaces
  text = text.replace(/\s+/g, ' ').trim();

  // If no date and text seems more like a note (longer, no action verb at start)
  const actionVerbs = ['buy', 'get', 'call', 'email', 'send', 'finish', 'complete', 'submit', 'meet', 'review', 'check', 'fix', 'update', 'create', 'make', 'do', 'schedule'];
  const firstWord = text.split(' ')[0].toLowerCase();
  
  if (!dueDate && !priority && text.length > 50 && !actionVerbs.includes(firstWord)) {
    type = 'note';
  }

  return {
    type,
    title: text,
    dueDate,
    priority,
    tags,
  };
}
