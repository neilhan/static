import { Conversation, Sentence } from '../types';
import { generateConversationHash } from './srs';

export const parseSentence = (line: string): Sentence => {
  // Look for hyphen-minus (-), en-dash (–), or em-dash (—)
  const match = line.match(/[-–—]/);
  const firstDashIndex = match ? match.index : -1;
  
  if (firstDashIndex === undefined || firstDashIndex === -1) {
    return { target: line.trim(), native: '' };
  }

  const target = line.substring(0, firstDashIndex).trim();
  const native = line.substring(firstDashIndex + 1).trim();
  
  return { target, native };
};

export const parseInput = (input: string): Conversation[] => {
  if (!input.trim()) return [];

  const normalized = input.replace(/\r\n/g, '\n');
  // Split by double newlines (or more) to get conversation blocks
  const blocks = normalized.split(/\n\s*\n/);
  
  return blocks
    .map(block => block.trim())
    .filter(block => block.length > 0)
    .map((block, index) => {
      const lines = block.split('\n').filter(line => line.trim() !== '');
      const sentences = lines.map(parseSentence);
      const contentHash = generateConversationHash(sentences);
      
      return {
        id: `conv-${index}-${Date.now()}`, 
        contentHash,
        sentences
      };
    });
};
