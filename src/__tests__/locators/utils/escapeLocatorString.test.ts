import { escapeLocatorString } from '../../../features/locators/utils/escapeLocatorString';

describe('escapeLocatorString', () => {
  describe('should properly escape, when received', () => {
    it('strings with double quotes', () => {
      expect(escapeLocatorString('He said "Hello"')).toBe('He said \\"Hello\\"');
    });

    it('strings with single quotes', () => {
      expect(escapeLocatorString("It's a test")).toBe("It\\'s a test");
    });

    it('strings with backslashes', () => {
      expect(escapeLocatorString('Path\\to\\file')).toBe('Path\\\\to\\\\file');
    });

    it('strings with mixed special characters', () => {
      expect(escapeLocatorString('He said "It\'s alright"')).toBe('He said \\"It\\\'s alright\\"');
    });

    it('JSON strings', () => {
      const input = '{"category":"Header","action":"go to dashboard","label":"icon:logo"}';
      const expected = '{\\"category\\":\\"Header\\",\\"action\\":\\"go to dashboard\\",\\"label\\":\\"icon:logo\\"}';
      expect(escapeLocatorString(input)).toBe(expected);
    });
  });

  describe("shouldn't change", () => {
    it('string without special characters', () => {
      const normalString = 'Just a normal string';
      expect(escapeLocatorString(normalString)).toBe(normalString);
    });

    it('empty strings', () => {
      expect(escapeLocatorString('')).toBe('');
    });

    it('URL strings', () => {
      const UrlString = '/orgs/jdi-testing/hovercard';
      expect(escapeLocatorString(UrlString)).toBe(UrlString);
    });
  });

  // tests for invalid data types:
  describe('should throw an error or handle, when received', () => {
    it('objects', () => {
      const obj = { key: 'value' };
      expect(() => escapeLocatorString(obj as any)).toThrow();
    });

    it('arrays', () => {
      const arr = ['text1', 'text2'];
      expect(() => escapeLocatorString(arr as any)).toThrow();
    });

    it('null', () => {
      expect(() => escapeLocatorString(null as any)).toThrow();
    });

    it('undefined', () => {
      expect(() => escapeLocatorString(undefined as any)).toThrow();
    });
  });
});
