/**
 * Monaco Editor Language Registration for JEXL
 * Helper functions to register JEXL language support with Monaco Editor
 */

import { jexlLanguageConfiguration } from './language-configuration.js';
import { jexlMonarchLanguage } from './monarch-language.js';
import {
  createJexlFunctionItems,
  createJexlTransformItems,
  createJexlCompletionItems,
  createJexlKeywords,
  createJexlOperators,
  getJexlCompletionDoc,
  getOperatorDoc,
} from "./completion-provider.js";

export const JEXL_LANGUAGE_ID = "jexl";

/**
 * Registers JEXL language support with Monaco Editor
 * @param monaco - The Monaco Editor instance
 */
export function registerJexlLanguage(monaco: any) {
  // Check if language is already registered using Monaco's API
  const registeredLanguages = monaco.languages.getLanguages();
  const isAlreadyRegistered = registeredLanguages.some(
    (lang: any) => lang.id === JEXL_LANGUAGE_ID
  );

  if (isAlreadyRegistered) {
    return;
  }

  // Register the language
  monaco.languages.register({
    id: JEXL_LANGUAGE_ID,
    extensions: [".jexl"],
    aliases: ["JEXL", "jexl"],
    mimetypes: ["text/jexl"],
  });

  // Set language configuration
  monaco.languages.setLanguageConfiguration(
    JEXL_LANGUAGE_ID,
    jexlLanguageConfiguration
  );

  // Set monarch tokenizer
  monaco.languages.setMonarchTokensProvider(
    JEXL_LANGUAGE_ID,
    jexlMonarchLanguage
  );

  // Register completion provider
  monaco.languages.registerCompletionItemProvider(JEXL_LANGUAGE_ID, {
    provideCompletionItems: function (model: any, position: any) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      // Get text before cursor to analyze context
      const textBeforeCursor = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      // The current word being typed (for filtering)
      const currentWord = word.word || "";

      // Look for the last pipe operator before the cursor
      const lastPipeIndex = textBeforeCursor.lastIndexOf("|");
      const isAfterPipe =
        lastPipeIndex !== -1 &&
        // Make sure there's no significant content after the pipe (just whitespace and partial word)
        /^\s*\w*$/.test(textBeforeCursor.substring(lastPipeIndex + 1));

      // Check if we're after an identifier (function, variable, etc.)
      // This regex matches: word characters, closing brackets/parens, or numbers at the end
      const afterIdentifierMatch = textBeforeCursor.match(/[\w\]\)]\s*$/);
      const isAfterIdentifier = afterIdentifierMatch !== null && !isAfterPipe;

      // Check if we're at the start or after an operator
      const afterOperatorMatch = textBeforeCursor.match(
        /[+\-*/%^=!<>&|?:,([\s]\s*$/
      );
      const isAfterOperatorOrStart =
        afterOperatorMatch !== null || textBeforeCursor.trim() === "";

      if (isAfterPipe) {
        // After pipe: only show transforms, filter by current word
        const transformItems = createJexlCompletionItems(
          "transform",
          currentWord
        );
        return {
          suggestions: transformItems.map((item) => ({ ...item, range })),
        };
      } else if (isAfterIdentifier) {
        // After identifier: suggest operators and pipe
        const operatorItems = createJexlOperators();
        return {
          suggestions: operatorItems.map((item) => ({ ...item, range })),
        };
      } else if (isAfterOperatorOrStart) {
        // At start or after operator: show functions and keywords, filter by current word
        const functionItems = createJexlCompletionItems(
          "function",
          currentWord
        );
        const keywordItems = createJexlKeywords();

        return {
          suggestions: [
            ...functionItems.map((item) => ({ ...item, range })),
            ...keywordItems.map((item) => ({ ...item, range })),
          ],
        };
      } else {
        // Fallback: show all functions and keywords, filter by current word
        const functionItems = createJexlCompletionItems(undefined, currentWord);
        const keywordItems = createJexlKeywords();

        return {
          suggestions: [
            ...functionItems.map((item) => ({ ...item, range })),
            ...keywordItems.map((item) => ({ ...item, range })),
          ],
        };
      }
    },
  });

  // Register hover provider
  monaco.languages.registerHoverProvider(JEXL_LANGUAGE_ID, {
    provideHover: function (model: any, position: any) {
      const word = model.getWordAtPosition(position);
      if (!word) return;

      // Check if we're after a pipe operator to determine context
      const textBeforeCursor = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: word.startColumn,
      });

      // Look for the last pipe operator before this word
      const lastPipeIndex = textBeforeCursor.lastIndexOf("|");
      const isAfterPipe =
        lastPipeIndex !== -1 &&
        // Make sure there's no significant content after the pipe (just whitespace)
        /^\s*$/.test(textBeforeCursor.substring(lastPipeIndex + 1));

      // Determine preferred type based on context
      const preferredType = isAfterPipe ? "transform" : "function";

      // Try to get documentation for function/transform
      const doc = getJexlCompletionDoc(word.word, preferredType);

      if (doc) {
        // Create formatted markdown content
        const markdownContent = `**${doc.label}** (${doc.type}) - ${doc.detail}\n\n${doc.documentation}`;

        return {
          range: new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn
          ),
          contents: [{ value: markdownContent }],
        };
      }

      // If no function/transform found, try operators
      const operatorDoc = getOperatorDoc(word.word);
      if (operatorDoc) {
        return {
          range: new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn
          ),
          contents: [
            {
              value: `**${operatorDoc.label}** - ${operatorDoc.detail}\n\n${operatorDoc.documentation}`,
            },
          ],
        };
      }
    },
  });

  // Register folding provider for arrays and objects
  monaco.languages.registerFoldingRangeProvider(JEXL_LANGUAGE_ID, {
    provideFoldingRanges: function (model: any) {
      const ranges: any[] = [];
      const text = model.getValue();
      const lines = text.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Find opening brackets/braces
        for (let j = 0; j < line.length; j++) {
          if (line[j] === "[" || line[j] === "{") {
            const openChar = line[j];
            const closeChar = openChar === "[" ? "]" : "}";

            // Find matching closing bracket/brace
            let depth = 1;
            let found = false;

            for (let k = i; k < lines.length && !found; k++) {
              const startPos = k === i ? j + 1 : 0;
              const searchLine = lines[k];

              for (let l = startPos; l < searchLine.length; l++) {
                if (searchLine[l] === openChar) {
                  depth++;
                } else if (searchLine[l] === closeChar) {
                  depth--;
                  if (depth === 0) {
                    // Found matching closing bracket
                    if (k > i) {
                      // Only fold if spans multiple lines
                      ranges.push({
                        start: i + 1,
                        end: k + 1,
                        kind: monaco.languages.FoldingRangeKind.Region,
                      });
                    }
                    found = true;
                    break;
                  }
                }
              }
            }
          }
        }
      }

      return ranges;
    },
  });
}

/**
 * Checks if JEXL language has been registered
 * @param monaco - The Monaco Editor instance  
 * @returns true if language is already registered
 */
export function isJexlLanguageRegistered(monaco: any): boolean {
  const registeredLanguages = monaco.languages.getLanguages();
  return registeredLanguages.some((lang: any) => lang.id === JEXL_LANGUAGE_ID);
}

/**
 * Creates a Monaco Editor instance with JEXL language support
 * @param monaco - The Monaco Editor instance
 * @param container - The DOM element to mount the editor
 * @param options - Editor options
 * @returns Monaco Editor instance
 */
export function createJexlEditor(monaco: any, container: HTMLElement, options: any = {}) {
  // Ensure JEXL language is registered (safe to call multiple times)
  registerJexlLanguage(monaco);

  return monaco.editor.create(container, {
    language: JEXL_LANGUAGE_ID,
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    folding: true,
    ...options
  });
}
