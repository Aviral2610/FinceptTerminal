// Regex Parser - Regular expression pattern matching

import { BaseParser } from './BaseParser';

export class RegexParser extends BaseParser {
  name = 'Regex';
  description = 'Regular expression pattern matching';

  async execute(data: any, expression: string): Promise<any> {
    try {
      const text = typeof data === 'string' ? data : JSON.stringify(data);
      const regex = this.parseRegex(expression);

      // If global flag is set, matchAll might be better to capture groups,
      // but match() is standard for "get all occurrences".
      // However, String.prototype.match with /g returns string[] and loses capturing groups.
      // String.prototype.matchAll returns iterator of matches with groups.

      if (regex.flags.includes('g')) {
        const matches = [...text.matchAll(regex)];
        if (matches.length === 0) return null;

        // If we have capturing groups, return them
        // If the pattern has capturing groups, matches[i] will have length > 1 (index 0 is full match)
        const hasGroups = matches[0].length > 1;

        if (hasGroups) {
             return matches.map(m => {
                 if (m.length === 2) return m[1]; // Single group -> value
                 return m.slice(1); // Multiple groups -> array of values
             });
        }

        // No groups, just return the full matches
        return matches.map(m => m[0]);
      }

      // Non-global execution
      const match = text.match(regex);
      if (!match) return null;

      // If capturing groups exist
      if (match.length > 1) {
        // Single capturing group
        if (match.length === 2) {
          return match[1];
        }
        // Multiple capturing groups - return array of values
        return match.slice(1);
      }

      // No capturing groups - return full match
      return match[0];
    } catch (error) {
      throw new Error(`Regex parsing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  validate(expression: string): { valid: boolean; error?: string } {
    if (!expression || expression.trim().length === 0) {
      return { valid: false, error: 'Expression cannot be empty' };
    }

    try {
      this.parseRegex(expression);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Invalid regex: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private parseRegex(expression: string): RegExp {
    // Check for /pattern/flags format
    // We match the last slash to separate pattern and flags
    const match = expression.match(/^\/(.+)\/([gimsuy]*)$/);

    if (match) {
      try {
        return new RegExp(match[1], match[2]);
      } catch (e) {
        // Fallback to treating the whole string as a pattern if constructing RegExp failed
        // (though it's unlikely if it matched the format, unless flags are invalid)
        throw e;
      }
    }

    // Treat as raw pattern with no flags
    return new RegExp(expression);
  }

  getExample(): string {
    return '/Price: (\\d+(\\.\\d{2})?)/';
  }

  getSyntaxHelp(): string {
    return `
Regex Syntax:

Standard JavaScript Regular Expressions are supported.

Formats:
1. Raw pattern:
   ^\\d+$             - Matches string containing only digits
   Price: \\d+        - Matches "Price: " followed by digits

2. Slash notation (supports flags):
   /pattern/flags
   /price/i          - Case insensitive match
   /\\d+/g           - Global match (find all)

Extraction Rules:
- No capturing groups: Returns the full match
- One capturing group: Returns the extracted value
- Multiple groups: Returns an array of extracted values
- Global flag (/g): Returns an array of matches (or arrays of groups)

Examples:
  Expression: /ID: (\\d+)/
  Input: "User ID: 12345"
  Result: "12345"

  Expression: /(\w+): (\\d+)/
  Input: "Price: 100"
  Result: ["Price", "100"]
    `.trim();
  }
}
