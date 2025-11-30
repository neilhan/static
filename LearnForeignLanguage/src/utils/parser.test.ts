import { describe, it, expect } from 'vitest';
import { parseInput, parseSentence } from './parser';

describe('parser', () => {
  describe('parseSentence', () => {
    it('parses sentence with separator', () => {
      const result = parseSentence('Hello - Hola');
      expect(result).toEqual({ target: 'Hello', native: 'Hola' });
    });

    it('parses sentence without separator', () => {
      const result = parseSentence('Hello World');
      expect(result).toEqual({ target: 'Hello World', native: '' });
    });

    it('parses sentence with multiple separators', () => {
      const result = parseSentence('Hello - Hola - Mundo');
      expect(result).toEqual({ target: 'Hello', native: 'Hola - Mundo' });
    });
    
    it('trims whitespace', () => {
      const result = parseSentence('  Hello   -   Hola  ');
      expect(result).toEqual({ target: 'Hello', native: 'Hola' });
    });
  });

  describe('parseInput', () => {
    it('parses multiple conversations separated by empty lines', () => {
      const input = `
        Hello - Hola
        How are you? - ¿Cómo estás?

        Good morning - Buenos días
      `;
      const conversations = parseInput(input);
      expect(conversations).toHaveLength(2);
      expect(conversations[0].sentences).toHaveLength(2);
      expect(conversations[0].sentences[0].target).toBe('Hello');
      expect(conversations[1].sentences).toHaveLength(1);
      expect(conversations[1].sentences[0].target).toBe('Good morning');
    });

    it('handles empty input', () => {
      expect(parseInput('')).toEqual([]);
      expect(parseInput('   ')).toEqual([]);
    });
  });
});

