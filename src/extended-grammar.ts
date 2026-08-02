import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { findIana } from "windows-iana";
import {
  parse as dateParse,
  add as dateAdd,
  format as dateFormat,
} from "date-fns";

import { v4 as uuidv4 } from "uuid";
import { Jexl } from "jexl";

/**
 * Lazy reference to the default JexlExtended instance, injected by index.ts.
 *
 * A static import of the instance here would create a module-init cycle
 * between this file and index.ts (index.ts imports the grammar functions from
 * this file, this file imports the default instance from index.ts). Native ESM
 * resolves such cycles with uninitialized bindings, so whenever this file is
 * the entry point (e.g. `import { arrayMap } from 'jexl-extended/extended-grammar'`),
 * the constructor in index.ts would read grammar functions before they are
 * initialized (ReferenceError: Cannot access 'X' before initialization).
 * index.ts calls {@link __setJexlInstance} once the default instance exists.
 * @internal
 */
type JexlInstance = InstanceType<typeof Jexl>;

let jexlInstance: JexlInstance | null = null;

/** @internal */
export function __setJexlInstance(instance: JexlInstance): void {
  jexlInstance = instance;
}

function getJexl(): JexlInstance {
  if (!jexlInstance) {
    // Only reachable when this module is used standalone (without importing
    // 'jexl-extended'). Degrade gracefully to a plain Jexl instance.
    jexlInstance = new Jexl();
  }
  return jexlInstance;
}

/**
 * Casts the input to a string.
 *
 * @example
 * string(123) // "123"
 * 123|string // "123"
 * @group Conversion
 *
 * @param input The input can be any type.
 * @param prettify If true, the output will be pretty-printed.
 * @returns The input converted to a JSON string representation.
 */
export const toString = (input: unknown, prettify = false) => {
  return JSON.stringify(input, null, prettify ? 2 : 0);
};

/**
 * Parses the string and returns a JSON object.
 *
 * @example
 * toJson('{"key": "value"}') // { key: "value" }
 * '{"name": "John", "age": 30}'|toJson // { name: "John", age: 30 }
 * @group Conversion
 *
 * @param input The JSON string to parse.
 * @returns The parsed JSON object or value.
 * @throws {SyntaxError} If the string is not valid JSON.
 */
export const toJson = (input: string) => {
  return JSON.parse(input);
};

/**
 * Returns the number of characters in a string, or the length of an array.
 *
 * @example
 * length("hello") // 5
 * length([1, 2, 3]) // 3
 * @group Utility
 *
 * @param input The input can be a string, an array, or an object.
 * @returns The number of characters in a string, or the length of an array.
 */
export const length = (input: unknown) => {
  if (typeof input === "string") {
    return input.length;
  }
  if (Array.isArray(input)) {
    return input.length;
  }
  if (typeof input === "object" && input !== null) {
    return Object.keys(input).length;
  }
  return 0;
};

/**
 * Gets a substring of a string.
 *
 * @example
 * substring("hello world", 0, 5) // "hello"
 * @group String
 *
 * @param input The input string.
 * @param start The starting index of the substring.
 * @param length The length of the substring.
 * @returns The substring of the input string.
 */
export const substring = (
  input: unknown,
  start: number,
  length: number | undefined,
) => {
  let str = input;
  if (typeof str !== "string") {
    str = JSON.stringify(str);
  }
  if (typeof str === "string") {
    let startNum = start;
    let len = length ?? str.length;

    if (startNum < 0) {
      startNum = str.length + start;
      if (startNum < 0) {
        startNum = 0;
      }
    }
    if (startNum + len > str.length) {
      len = str.length - startNum;
    }
    if (len < 0) {
      len = 0;
    }
    return str.substring(startNum, startNum + len);
  }
  return "";
};

/**
 * Returns the substring before the first occurrence of the character sequence chars in str.
 *
 * @example substringBefore("hello world", " ") // "hello"
 * @group String
 * @param input The input string.
 * @param chars The character sequence to search for.
 * @returns The substring before the first occurrence of the character sequence chars in str.
 */
export const substringBefore = (input: unknown, chars: unknown) => {
  const str = typeof input === "string" ? input : JSON.stringify(input);
  const charsStr = typeof chars === "string" ? chars : JSON.stringify(chars);
  const index = str.indexOf(charsStr);
  if (index === -1) {
    return str;
  }
  return str.substring(0, index);
};

/**
 * Returns the substring after the first occurrence of the character sequence chars in str.
 *
 * @example
 * substringAfter("hello world", " ") // "world"
 * @group String
 *
 * @param input The input string.
 * @param chars The character sequence to search for.
 * @returns The substring after the first occurrence of the character sequence chars in str.
 */
export const substringAfter = (input: unknown, chars: unknown) => {
  const str = typeof input === "string" ? input : JSON.stringify(input);
  const charsStr = typeof chars === "string" ? chars : JSON.stringify(chars);
  const index = str.indexOf(charsStr);
  if (index === -1) {
    return "";
  }
  return str.substring(index + charsStr.length);
};

/**
 * Converts the input string to uppercase.
 *
 * @example
 * uppercase("hello") // "HELLO"
 * "hello world"|uppercase // "HELLO WORLD"
 * @group String
 *
 * @param input The input to convert to uppercase. Non-string inputs are converted to JSON string first.
 * @returns The uppercase string.
 */
export const uppercase = (input: unknown) => {
  const str = typeof input === "string" ? input : JSON.stringify(input);
  return str.toUpperCase();
};

/**
 * Converts the input string to lowercase.
 *
 * @example
 * lowercase("HELLO") // "hello"
 * "HELLO WORLD"|lowercase // "hello world"
 * @group String
 *
 * @param input The input to convert to lowercase. Non-string inputs are converted to JSON string first.
 * @returns The lowercase string.
 */
export const lowercase = (input: unknown) => {
  const str = typeof input === "string" ? input : JSON.stringify(input);
  return str.toLowerCase();
};
const splitRegex = /(?<!^)(?=[A-Z])|[`~!@#%^&*()|+\\\-=?;:'.,\s_']+/;

/**
 * Converts the input string to camel case.
 *
 * @example
 * camelCase("foo bar") // "fooBar"
 * "hello-world"|camelCase // "helloWorld"
 * camelCase("HELLO_WORLD") // "helloWorld"
 * @group String
 *
 * @param input The input string to convert to camel case.
 * @returns The camel case string, or empty string if input is not a string.
 */
export const camelCase = (input: unknown) => {
  if (typeof input !== "string") return "";
  return input
    .split(splitRegex)
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
};

/**
 * Converts the input string to pascal case.
 *
 * @example
 * pascalCase("foo bar") // "FooBar"
 * "hello-world"|pascalCase // "HelloWorld"
 * pascalCase("HELLO_WORLD") // "HelloWorld"
 * @group String
 *
 * @param input The input string to convert to pascal case.
 * @returns The pascal case string, or empty string if input is not a string.
 */
export const pascalCase = (input: unknown) => {
  if (typeof input !== "string") return "";
  return input
    .split(splitRegex)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
};

/**
 * Trims whitespace from both ends of a string.
 *
 * @example
 * trim("  hello  ") // "hello"
 * "  world  "|trim // "world"
 * trim("__hello__", "_") // "hello"
 * @group String
 *
 * @param input The input string to trim.
 * @param trimChar Optional character to trim instead of whitespace.
 * @returns The trimmed string, or empty string if input is not a string.
 */
export const trim = (input: unknown, trimChar?: string) => {
  if (typeof input === "string") {
    if (trimChar) {
      return input.replace(new RegExp(`^${trimChar}+|${trimChar}+$`, "g"), "");
    }
    return input.trim();
  }
  return "";
};

/**
 * Pads the input string to the specified width.
 *
 * @example
 * pad("hello", 10) // "hello     "
 * pad("world", -8, "0") // "000world"
 * "foo"|pad(5, ".") // "foo.."
 * @group String
 *
 * @param input The input to pad. Non-string inputs are converted to JSON string first.
 * @param width The target width. Positive values pad to the right, negative values pad to the left.
 * @param char The character to use for padding. Defaults to space.
 * @returns The padded string.
 */
export const pad = (input: unknown, width: number, char: string = " ") => {
  const str = typeof input !== "string" ? JSON.stringify(input) : input;
  if (width > 0) {
    return str.padEnd(width, char);
  } else {
    return str.padStart(-width, char);
  }
};

/**
 * Checks if the input string or array contains the specified value.
 *
 * @example
 * contains("hello world", "world") // true
 * "foo-bar"|contains("bar") // true
 * contains([1, 2, 3], 2) // true
 * @group String
 *
 * @param input The input string or array to search in.
 * @param search The value to search for.
 * @returns True if the input contains the search value, false otherwise.
 */
export const contains = (input: unknown, search: string) => {
  if (typeof input === "string" || Array.isArray(input)) {
    return input.includes(search);
  }
  return false;
};

/**
 * Checks if the input string starts with the specified substring.
 *
 * @example
 * startsWith("hello world", "hello") // true
 * "foo-bar"|startsWith("foo") // true
 * startsWith("test", "xyz") // false
 * @group String
 *
 * @param input The input string to check.
 * @param search The substring to search for at the beginning.
 * @returns True if the input starts with the search string, false otherwise.
 */
export const startsWith = (input: unknown, search: string) => {
  if (typeof input === "string") {
    return input.startsWith(search);
  }
  return false;
};

/**
 * Checks if the input string ends with the specified substring.
 *
 * @example
 * endsWith("hello world", "world") // true
 * "foo-bar"|endsWith("bar") // true
 * endsWith("test", "xyz") // false
 * @group String
 *
 * @param input The input string to check.
 * @param search The substring to search for at the end.
 * @returns True if the input ends with the search string, false otherwise.
 */
export const endsWith = (input: unknown, search: string) => {
  if (typeof input === "string") {
    return input.endsWith(search);
  }
  return false;
};

/**
 * Splits the input string into an array of substrings.
 *
 * @example
 * split("foo,bar,baz", ",") // ["foo", "bar", "baz"]
 * "one-two-three"|split("-") // ["one", "two", "three"]
 * split("hello world", " ") // ["hello", "world"]
 * @group String
 *
 * @param input The input string to split.
 * @param separator The separator string to split on.
 * @returns An array of substrings, or empty array if input is not a string.
 */
export const split = (input: unknown, separator: string) => {
  if (typeof input === "string") {
    return input.split(separator);
  }
  return [];
};

/**
 * Joins elements of an array into a string.
 *
 * @example
 * arrayJoin(["foo", "bar", "baz"], ",") // "foo,bar,baz"
 * ["one", "two", "three"]|arrayJoin("-") // "one-two-three"
 * arrayJoin([1, 2, 3]) // "1,2,3"
 * @group Array
 *
 * @param input The input array to join.
 * @param separator The separator string to use between elements. Defaults to comma.
 * @returns The joined string, or undefined if input is not an array.
 */
export const arrayJoin = (input: unknown, separator?: string) => {
  if (Array.isArray(input)) {
    return input.join(separator);
  }
  return undefined;
};

/**
 * Replaces occurrences of a specified string with a replacement string.
 *
 * @example
 * replace("foo-bar-baz", "-", "_") // "foo_bar_baz"
 * "hello world"|replace("world", "there") // "hello there"
 * replace("test test test", "test", "demo") // "demo demo demo"
 * @group String
 *
 * @param input The input string to perform replacements on.
 * @param search The string to search for and replace.
 * @param replacement The string to replace matches with. Defaults to empty string.
 * @returns The string with replacements made, or undefined if input is not a string.
 */
export const replace = (
  input: unknown,
  search: string,
  replacement: string,
) => {
  if (typeof input === "string" && typeof search === "string") {
    const _replacement = replacement === undefined ? "" : replacement;
    return input.replace(new RegExp(search, "g"), _replacement);
  }
  return undefined;
};

/**
 * Encodes a string to Base64.
 *
 * @example
 * base64Encode("hello") // "aGVsbG8="
 * "hello world"|base64Encode // "aGVsbG8gd29ybGQ="
 * base64Encode("test") // "dGVzdA=="
 * @group Encoding
 *
 * @param input The input string to encode.
 * @returns The Base64 encoded string, or empty string if input is not a string or encoding fails.
 */
export const base64Encode = (input: unknown) => {
  if (typeof input === "string") {
    try {
      encodeURIComponent(input);
      const bytes = new TextEncoder().encode(input);
      const binString = String.fromCodePoint(...bytes);
      return btoa(binString);
    } catch (error) {
      return "";
    }
  }
  return "";
};

/**
 * Decodes a Base64 encoded string.
 *
 * @example
 * base64Decode("aGVsbG8=") // "hello"
 * "aGVsbG8gd29ybGQ="|base64Decode // "hello world"
 * base64Decode("dGVzdA==") // "test"
 * @group Encoding
 *
 * @param input The Base64 encoded string to decode.
 * @returns The decoded string, or empty string if input is not a string.
 */
export const base64Decode = (input: unknown) => {
  if (typeof input === "string") {
    let sanitized = input.replace(/-/g, "+").replace(/_/g, "/");
    if (sanitized.length % 4 !== 0) {
      sanitized += "=".repeat(4 - (sanitized.length % 4));
    }
    const binString = atob(sanitized);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
    return new TextDecoder().decode(bytes);
  }
  return "";
};

/**
 * Encodes a string or object to URI component format.
 *
 * @example
 * formUrlEncoded("hello world") // "hello%20world"
 * formUrlEncoded({name: "John", age: 30}) // "name=John&age=30"
 * "hello & world"|formUrlEncoded // "hello%20%26%20world"
 * @group Encoding
 *
 * @param input The input string or object to encode.
 * @returns The URL encoded string, or empty string if input is not a string or object.
 */
export const formUrlEncoded = (input: unknown) => {
  if (typeof input === "string") {
    return encodeURIComponent(input);
  } else if (typeof input === "object") {
    return Object.keys(input)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(input[key])}`,
      )
      .join("&");
  }
  return "";
};

/**
 * Converts the input to a number.
 *
 * @example
 * toNumber("123") // 123
 * "45.67"|toNumber // 45.67
 * toNumber("abc") // NaN
 * @group Conversion
 *
 * @param input The input to convert to a number.
 * @returns The numeric value, or NaN if conversion fails.
 */
export const toNumber = (input: unknown) => {
  if (typeof input === "number") return input;
  if (typeof input === "string") return parseFloat(input);
  return NaN;
};

/**
 * Parses a string and returns an integer.
 *
 * @example
 * parseInteger("123") // 123
 * "45.67"|parseInteger // 45
 * parseInteger(123.89) // 123
 * @group Conversion
 *
 * @param input The input to parse as an integer.
 * @returns The integer value, or NaN if parsing fails.
 */
export const parseInteger = (input: unknown) => {
  if (typeof input === "string") {
    return parseInt(input, 10);
  } else if (typeof input === "number") {
    return Math.floor(input);
  }
  return NaN;
};

/**
 * Returns the absolute value of a number.
 *
 * @example
 * absoluteValue(-5) // 5
 * (-10)|absoluteValue // 10
 * absoluteValue(3.14) // 3.14
 * @group Math
 *
 * @param input The input number to get the absolute value of.
 * @returns The absolute value, or NaN if input cannot be converted to a number.
 */
export const absoluteValue = (input: unknown) => {
  const num = toNumber(input);
  return isNaN(num) ? NaN : Math.abs(num);
};

/**
 * Rounds a number down to the nearest integer.
 *
 * @example
 * floor(3.7) // 3
 * (3.14)|floor // 3
 * floor(-2.8) // -3
 * @group Math
 *
 * @param input The input number to round down.
 * @returns The rounded down integer, or NaN if input cannot be converted to a number.
 */
export const floor = (input: unknown) => {
  const num = toNumber(input);
  return isNaN(num) ? NaN : Math.floor(num);
};

/**
 * Rounds a number up to the nearest integer.
 *
 * @example
 * ceil(3.2) // 4
 * (3.14)|ceil // 4
 * ceil(-2.8) // -2
 * @group Math
 *
 * @param input The input number to round up.
 * @returns The rounded up integer, or NaN if input cannot be converted to a number.
 */
export const ceil = (input: unknown) => {
  const num = toNumber(input);
  return isNaN(num) ? NaN : Math.ceil(num);
};

/**
 * Rounds a number to the nearest integer or to specified decimal places.
 *
 * @example
 * round(3.7) // 4
 * round(3.14159, 2) // 3.14
 * (2.567)|round // 3
 * @group Math
 *
 * @param input The input number to round.
 * @param decimals Optional number of decimal places to round to.
 * @returns The rounded number, or NaN if input cannot be converted to a number.
 */
export const round = (input: unknown, decimals?: number) => {
  const num = toNumber(input);
  return isNaN(num)
    ? NaN
    : decimals
      ? Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
      : Math.round(num);
};

/**
 * Returns the value of a number raised to a power.
 *
 * @example
 * power(2, 3) // 8
 * (2)|power(4) // 16
 * power(9) // 81 (defaults to power of 2)
 * @group Math
 *
 * @param input The base number.
 * @param exponent The exponent to raise the base to. Defaults to 2.
 * @returns The result of base raised to the exponent, or NaN if input cannot be converted to a number.
 */
export const power = (input: unknown, exponent?: number) => {
  const num = toNumber(input);
  const exp = exponent === undefined ? 2 : exponent;
  return isNaN(num) ? NaN : Math.pow(num, exp);
};

/**
 * Returns the square root of a number.
 *
 * @example
 * sqrt(16) // 4
 * (25)|sqrt // 5
 * sqrt(2) // 1.4142135623730951
 * @group Math
 *
 * @param input The input number to get the square root of.
 * @returns The square root of the input, or NaN if input cannot be converted to a number.
 */
export const sqrt = (input: unknown) => {
  const num = toNumber(input);
  return isNaN(num) ? NaN : Math.sqrt(num);
};

/**
 * Generates a random number between 0 (inclusive) and 1 (exclusive).
 *
 * @example
 * randomNumber() // 0.123456789 (example output)
 * randomNumber() // 0.987654321 (different each time)
 * @group Math
 *
 * @returns A random floating-point number between 0 and 1.
 */
export const randomNumber = () => {
  return Math.random();
};

/**
 * Formats a number to a decimal representation as specified by the format string.
 *
 * @example
 * formatNumber(1234.567, "#,##0.00") // "1,234.57"
 * (1000)|formatNumber("0.00") // "1000.00"
 * formatNumber(42, "#,###") // "42"
 * @group Conversion
 *
 * @param input The input number to format.
 * @param format The format string specifying decimal places and grouping.
 * @returns The formatted number string, or empty string if input cannot be converted to a number.
 */
export const formatNumber = (input: unknown, format: string) => {
  const num =
    typeof input === "number"
      ? input
      : parseInt(toNumber(input).toString(), 10);
  return isNaN(num)
    ? ""
    : num.toLocaleString("en-us", {
        minimumFractionDigits: format.split(".")[1]?.length,
        maximumFractionDigits: format.split(".")[1]?.length,
        useGrouping: format.split(".")[0]?.includes(","),
      });
};

/**
 * Formats a number as a string in the specified base.
 *
 * @example
 * formatBase(255, 16) // "ff"
 * (10)|formatBase(2) // "1010"
 * formatBase(64, 8) // "100"
 * @group Conversion
 *
 * @param input The input number to format.
 * @param base The numeric base to convert to (2-36).
 * @returns The number formatted in the specified base, or empty string if input cannot be converted to a number.
 */
export const formatBase = (input: unknown, base: number) => {
  const num =
    typeof input === "number"
      ? input
      : parseInt(toNumber(input).toString(), 10);
  return isNaN(num) ? "" : num.toString(base);
};

/**
 * Formats a number as an integer with zero padding.
 *
 * @example
 * formatInteger(42, "000") // "042"
 * (7)|formatInteger("0000") // "0007"
 * formatInteger(123, "00") // "123"
 * @group Conversion
 *
 * @param input The input number to format.
 * @param format The format string indicating the minimum number of digits.
 * @returns The zero-padded integer string, or empty string if input cannot be converted to a number.
 */
export const formatInteger = (input: unknown, format: string) => {
  const num = toNumber(input);
  return isNaN(num) ? "" : pad(Math.floor(num).toString(), -format.length, "0");
};

/**
 * Calculates the sum of an array of numbers.
 *
 * @example
 * sum([1, 2, 3, 4]) // 10
 * [1.5, 2.5, 3.0]|sum // 7
 * sum(1, 2, 3, 4) // 10
 * @group Math
 *
 * @param input The input array of numbers or individual number arguments.
 * @returns The sum of all numbers, or NaN if input is not an array.
 */
export const sum = (...input: unknown[]) => {
  if (!Array.isArray(input)) return NaN;
  return input.flat().reduce<number>((acc, val) => acc + toNumber(val), 0);
};

/**
 * Finds the maximum value in an array of numbers.
 *
 * @example
 * max([1, 5, 3, 2]) // 5
 * [10, 20, 15]|max // 20
 * max(1, 5, 3, 2) // 5
 * @group Math
 *
 * @param input The input array of numbers or individual number arguments.
 * @returns The maximum value, or NaN if input is not an array.
 */
export const max = (...input: unknown[]) => {
  if (!Array.isArray(input)) return NaN;
  return Math.max(...input.flat().map(toNumber));
};

/**
 * Finds the minimum value in an array of numbers.
 *
 * @example
 * min([1, 5, 3, 2]) // 1
 * [10, 20, 15]|min // 10
 * min(1, 5, 3, 2) // 1
 * @group Math
 *
 * @param input The input array of numbers or individual number arguments.
 * @returns The minimum value, or NaN if input is not an array.
 */
export const min = (...input: unknown[]) => {
  if (!Array.isArray(input)) return NaN;
  return Math.min(...input.flat().map(toNumber));
};

/**
 * Calculates the average of an array of numbers.
 *
 * @example
 * average([1, 2, 3, 4]) // 2.5
 * [10, 20, 30]|average // 20
 * average(1, 2, 3, 4) // 2.5
 * @group Math
 *
 * @param input The input array of numbers or individual number arguments.
 * @returns The average value, or NaN if input is not an array.
 */
export const average = (...input: unknown[]) => {
  if (!Array.isArray(input)) return NaN;
  const total = sum(...input);
  return total / input.flat().length;
};

/**
 * Converts the input to a boolean.
 *
 * @example
 * toBoolean("true") // true
 * "false"|toBoolean // false
 * toBoolean(1) // true
 * toBoolean(0) // false
 * @group Conversion
 *
 * @param input The input to convert to a boolean.
 * @returns The boolean value, or undefined for ambiguous string values.
 */
export const toBoolean = (input: unknown) => {
  if (typeof input === "boolean") return input;
  if (typeof input === "number") return input !== 0;
  if (typeof input === "string") {
    if (input.trim().toLowerCase() === "true" || input.trim() === "1")
      return true;
    if (input.trim().toLowerCase() === "false" || input.trim() === "0")
      return false;
    else return undefined;
  }
  return Boolean(input);
};

/**
 * Returns the logical NOT of the input.
 *
 * @example
 * not(true) // false
 * false|not // true
 * not(0) // true
 * not("") // true
 * @group Utility
 *
 * @param input The input to apply logical NOT to.
 * @returns The logical NOT of the input converted to boolean.
 */
export const not = (input: unknown) => {
  return !toBoolean(input);
};

/**
 * Evaluates a list of predicates and returns the first result expression whose predicate is satisfied.
 *
 * @example
 * switch(expression, case1, result1, case2, result2, ..., default)
 * @group Utility
 *
 * @param args The arguments array where the first element is the expression to evaluate, followed by pairs of case and result, and optionally a default value.
 * @returns The result of the first case whose predicate is satisfied, or the default value if no case is satisfied.
 */
export const switchCase = (...args: unknown[]) => {
  if (args.length < 3) return null;

  const expressionResult = args[0];

  for (let i = 1; i < args.length - 1; i += 2) {
    const caseResult = args[i];
    if (JSON.stringify(expressionResult) === JSON.stringify(caseResult)) {
      return args[i + 1];
    }
  }
  // Return default
  if (args.length % 2 === 0) {
    const defaultResult = args[args.length - 1];
    return defaultResult;
  }
  // Return null if no default specified
  return null;
};

/**
 * Returns a sub-array from start index to end index.
 *
 * @example
 * range([1, 2, 3, 4, 5], 1, 4) // [2, 3, 4]
 * [10, 20, 30, 40]|range(0, 2) // [10, 20]
 * range(["a", "b", "c", "d"], 2) // ["c", "d"]
 * @group Array
 *
 * @param array The input array.
 * @param start The starting index (inclusive).
 * @param end The ending index (exclusive). If not provided, slices to the end of the array.
 * @returns The sub-array from start to end, or empty array if input is not an array.
 */
export const arrayRange = (array: unknown[], start: number, end?: number) => {
  if (!Array.isArray(array)) return [];
  return array.slice(start, end);
};

/**
 * Appends elements to an array.
 *
 * @example
 * append([1, 2], 3) // [1, 2, 3]
 * [1, 2]|append(3, 4) // [1, 2, 3, 4]
 * append([], 1, 2, 3) // [1, 2, 3]
 * @group Array
 *
 * @param input The input values to append to an array.
 * @returns A new array with all inputs flattened and appended, or empty array if no valid input.
 */
export const arrayAppend = (...input: unknown[]) => {
  if (!Array.isArray(input)) return [];
  return [...input.flat()];
};

/**
 * Reverses the elements of an array.
 *
 * @example
 * reverse([1, 2, 3]) // [3, 2, 1]
 * [1, 2, 3]|reverse // [3, 2, 1]
 * reverse(["a", "b", "c"]) // ["c", "b", "a"]
 * @group Array
 *
 * @param input The input values to reverse.
 * @returns A new array with elements in reverse order, or empty array if no valid input.
 */
export const arrayReverse = (...input: unknown[]) => {
  if (!Array.isArray(input)) return [];
  return [...input.flat()].reverse();
};

/**
 * Shuffles the elements of an array randomly.
 *
 * @example
 * shuffle([1, 2, 3]) // [2, 1, 3] (random order)
 * [1, 2, 3]|shuffle // [3, 1, 2] (random order)
 * shuffle(["a", "b", "c"]) // ["c", "a", "b"] (random order)
 * @group Array
 *
 * @param input The input array to shuffle.
 * @returns The same array with elements randomly shuffled, or empty array if input is not an array.
 */
export const arrayShuffle = (input: unknown[]) => {
  if (!Array.isArray(input)) return [];
  for (let i = input.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [input[i], input[j]] = [input[j], input[i]];
  }
  return input;
};

/**
 * Sorts the elements of an array.
 *
 * @example
 * sort([3, 1, 2]) // [1, 2, 3]
 * [3, 1, 2]|sort // [1, 2, 3]
 * sort([{age: 30}, {age: 20}], "age") // [{age: 20}, {age: 30}]
 * sort([{age: 30}, {age: 20}], "age", true) // [{age: 30}, {age: 20}]
 * @group Array
 *
 * @param input The input array to sort.
 * @param expression Optional JEXL expression to determine sort value for objects.
 * @param descending Optional flag to sort in descending order.
 * @returns A new sorted array, or empty array if input is not an array.
 */
export const arraySort = (
  input: unknown[],
  expression?: string,
  descending?: boolean,
) => {
  if (!Array.isArray(input)) return [];
  if (!expression) return [...input].sort();
  const expr = getJexl().compile(expression);
  const compareFunction = (a: unknown, b: unknown) => {
    const aValue = expr.evalSync(a);
    const bValue = expr.evalSync(b);
    if (aValue < bValue) return descending ? -1 : 1;
    if (aValue > bValue) return descending ? 1 : -1;
    return 0;
  };
  return [...input].sort(compareFunction);
};

/**
 * Returns a new array with duplicate elements removed.
 *
 * @example
 * distinct([1, 2, 2, 3, 1]) // [1, 2, 3]
 * [1, 2, 2, 3]|distinct // [1, 2, 3]
 * distinct(["a", "b", "a", "c"]) // ["a", "b", "c"]
 * @group Array
 *
 * @param input The input array to remove duplicates from.
 * @returns A new array with duplicates removed, or empty array if input is not an array.
 */
export const arrayDistinct = (input: unknown[]) => {
  if (!Array.isArray(input)) return [];
  return [...new Set(input)];
};

/**
 * Creates a new object based on key-value pairs or string keys.
 *
 * @example
 * toObject([["name", "John"], ["age", 30]]) // {name: "John", age: 30}
 * toObject("name", "John") // {name: "John"}
 * toObject(["key1", "key2"], "defaultValue") // {key1: "defaultValue", key2: "defaultValue"}
 *
 * @group Array
 *
 * @param input The input string key or array of key-value pairs.
 * @param val Optional default value for string keys or when array elements are strings.
 * @returns A new object created from the input, or empty object if input is invalid.
 */
export const arrayToObject = (input: unknown, val?: unknown) => {
  if (typeof input === "string") return { [input]: val };
  if (!Array.isArray(input)) return {};
  return input.reduce((acc, kv) => {
    if (Array.isArray(kv) && kv.length === 2) {
      acc[kv[0]] = kv[1];
      return acc;
    } else if (typeof kv === "string") {
      acc[kv] = val;
      return acc;
    }
    return acc;
  }, {});
};

/**
 * Returns a new array with elements transformed by extracting a specific field.
 *
 * @example
 * mapField([{name: "John"}, {name: "Jane"}], "name") // ["John", "Jane"]
 * [{age: 30}, {age: 25}]|mapField("age") // [30, 25]
 * mapField([{x: 1, y: 2}, {x: 3, y: 4}], "x") // [1, 3]
 * @group Array
 *
 * @param input The input array of objects to extract fields from.
 * @param field The field name to extract from each object.
 * @returns A new array with extracted field values, or empty array if input is not an array.
 */
export const mapField = (input: unknown[], field: string) => {
  if (!Array.isArray(input)) return [];
  return input.map((item) => item[field]);
};

/**
 * Returns an array containing the results of applying the expression parameter to each value in the array parameter.
 * The expression must be a valid JEXL expression string, which is applied to each element of the array.
 * The relative context provided to the expression is an object with the properties value, index and array (the original array).
 *
 * @example
 * map([1, 2, 3], "value * 2") // [2, 4, 6]
 * [{name: "John"}, {name: "Jane"}]|map("value.name") // ["John", "Jane"]
 * map([1, 2, 3], "value + index") // [1, 3, 5]
 * @group Array
 *
 * @param input The input array to transform.
 * @param expression The JEXL expression to apply to each element.
 * @returns A new array with transformed elements, or undefined if input is not an array.
 */
export const arrayMap = (input: unknown[], expression: string) => {
  if (!Array.isArray(input)) return undefined;
  const expr = getJexl().compile(expression);
  return input.map((value, index, array) => {
    return expr.evalSync({ value, index, array });
  });
};

/**
 * Checks whether the provided array has any elements that match the specified expression.
 * The expression must be a valid JEXL expression string, and is applied to each element of the array.
 * The relative context provided to the expression is an object with the properties value, index and array (the original array).
 *
 * @example
 * any([1, 2, 3], "value > 2") // true
 * [{age: 25}, {age: 35}]|any("value.age > 30") // true
 * any([1, 2, 3], "value > 5") // false
 * @group Array
 *
 * @param input The input array to test.
 * @param expression The JEXL expression to test against each element  (supports value, index and array as context).
 * @returns True if any element matches the expression, false otherwise or if input is not an array.
 */
export const arrayAny = (input: unknown[], expression: string) => {
  if (!Array.isArray(input)) return false;
  const expr = getJexl().compile(expression);
  return input.some((value, index, array) => {
    return expr.evalSync({ value, index, array });
  });
};

/**
 * Checks whether the provided array has all elements that match the specified expression.
 * The expression must be a valid JEXL expression string, and is applied to each element of the array.
 * The relative context provided to the expression is an object with the properties value, index and array (the original array).
 *
 * @example
 * every([2, 4, 6], "value % 2 == 0") // true
 * [{age: 25}, {age: 35}]|every("value.age > 20") // true
 * every([1, 2, 3], "value > 2") // false
 * @group Array
 *
 * @param input The input array to test.
 * @param expression The JEXL expression to test against each element  (supports value, index and array as context).
 * @returns True if all elements match the expression, false otherwise or if input is not an array.
 */
export const arrayEvery = (input: unknown[], expression: string) => {
  if (!Array.isArray(input)) return false;
  const expr = getJexl().compile(expression);
  return input.every((value, index, array) => {
    return expr.evalSync({ value, index, array });
  });
};

/**
 * Returns a new array with the elements of the input array that match the specified expression.
 * The expression must be a valid JEXL expression string, and is applied to each element of the array.
 * The relative context provided to the expression is an object with the properties value, index and array (the original array).
 *
 * @example
 * filter([1, 2, 3, 4], "value > 2") // [3, 4]
 * [{age: 25}, {age: 35}]|filter("value.age > 30") // [{age: 35}]
 * filter([1, 2, 3, 4], "value % 2 == 0") // [2, 4]
 * @group Array
 *
 * @param input The input array to filter.
 * @param expression The JEXL expression to test against each element (supports value, index and array as context).
 * @returns A new array containing only elements that match the expression, or empty array if input is not an array.
 */
export const arrayFilter = (input: unknown[], expression: string) => {
  if (!Array.isArray(input)) return [];
  const expr = getJexl().compile(expression);
  return input.filter((value, index, array) => {
    return expr.evalSync({ value, index, array });
  });
};

/**
 * Finds the first element in an array that matches the specified expression.
 * The expression must be a valid JEXL expression string, and is applied to each element of the array.
 * The relative context provided to the expression is an object with the properties value, index and array (the original array).
 *
 * @example
 * find([1, 2, 3, 4], "value > 2") // 3
 * [{name: "John"}, {name: "Jane"}]|find("value.name == 'Jane'") // {name: "Jane"}
 * find([1, 2, 3], "value > 5") // undefined
 * @group Array
 *
 * @param input The input array to search.
 * @param expression The JEXL expression to test against each element  (supports value, index and array as context).
 * @returns The first element that matches the expression, or undefined if no match found or input is not an array.
 */
export const arrayFind = (input: unknown[], expression: string) => {
  if (!Array.isArray(input)) return undefined;
  const expr = getJexl().compile(expression);
  return input.find((value, index, array) => {
    return expr.evalSync({ value, index, array });
  });
};

/**
 *
 * Finds the index of the first element in the input array that satisfies the given Jexl expression.
 *
 * @example
 * [1, 2, 3, 4]|findIndex('value > 2'); // returns 2
 * @group Array
 *
 * @param input - The array to search through.
 * @param expression - A Jexl expression string to evaluate for each element. The expression has access to `value`, `index`, and `array`.
 * @returns The index of the first matching element, or `-1` if no element matches, or `undefined` if the input is not an array.
 */
export const arrayFindIndex = (input: unknown[], expression: string) => {
  if (!Array.isArray(input)) return undefined;
  const expr = getJexl().compile(expression);
  return input.findIndex((value, index, array) => {
    return expr.evalSync({ value, index, array });
  });
};

/**
 * Returns an aggregated value derived from applying the function parameter successively to each value in array in combination with the result of the previous application of the function.
 * The expression must be a valid JEXL expression string, and behaves like an infix operator between each value within the array.
 * The relative context provided to the expression is an object with the properties accumulator, value, index and array (the original array).
 *
 * @example
 * reduce([1, 2, 3, 4], "accumulator + value", 0) // 10
 * [1, 2, 3]|reduce("accumulator * value", 1) // 6
 * reduce(["a", "b", "c"], "accumulator + value", "") // "abc"
 * @group Array
 *
 * @param input The input array to reduce.
 * @param expression The JEXL expression to apply for each reduction step.
 * @param initialValue The initial value for the accumulator.
 * @returns The final accumulated value, or undefined if input is not an array.
 */
export const arrayReduce = (
  input: unknown[],
  expression: string,
  initialValue: unknown,
) => {
  if (!Array.isArray(input)) return undefined;
  const expr = getJexl().compile(expression);
  return input.reduce((accumulator, value, index, array) => {
    return expr.evalSync({ accumulator, value, index, array });
  }, initialValue);
};

/**
 * Returns the keys of an object as an array.
 *
 * @example
 * keys({name: "John", age: 30}) // ["name", "age"]
 * {a: 1, b: 2}|keys // ["a", "b"]
 * keys({}) // []
 * @group Array
 *
 * @param input The input object to get keys from.
 * @returns An array of object keys, or undefined if input is not an object.
 */
export const objectKeys = (input: unknown) => {
  if (typeof input === "object" && input !== null) {
    return Object.keys(input);
  }
  return undefined;
};

/**
 * Returns the values of an object as an array.
 *
 * @example
 * values({name: "John", age: 30}) // ["John", 30]
 * {a: 1, b: 2}|values // [1, 2]
 * values({}) // []
 * @group Object
 *
 * @param input The input object to get values from.
 * @returns An array of object values, or undefined if input is not an object.
 */
export const objectValues = (input: unknown) => {
  if (typeof input === "object" && input !== null) {
    return Object.values(input);
  }
  return undefined;
};

/**
 * Returns an array of key-value pairs from the input object.
 *
 * @example
 * entries({name: "John", age: 30}) // [["name", "John"], ["age", 30]]
 * {a: 1, b: 2}|entries // [["a", 1], ["b", 2]]
 * entries({}) // []
 * @group Object
 *
 * @param input The input object to get entries from.
 * @returns An array of [key, value] pairs, or undefined if input is not an object.
 */
export const objectEntries = (input: unknown) => {
  if (typeof input === "object" && input !== null) {
    return Object.entries(input);
  }
  return undefined;
};

/**
 * Returns a new object with the properties of the input objects merged together.
 *
 * @example
 * merge({a: 1}, {b: 2}) // {a: 1, b: 2}
 * {a: 1}|merge({b: 2}, {c: 3}) // {a: 1, b: 2, c: 3}
 * merge({a: 1}, {a: 2}) // {a: 2} (later values override)
 * @group Object
 *
 * @param args The input objects to merge.
 * @returns A new object with all properties merged together.
 */
export const objectMerge = (...args: unknown[]) => {
  return args.reduce<Record<string, unknown>>((acc, obj) => {
    if (!Array.isArray(obj) && typeof obj === "object" && obj !== null) {
      return { ...acc, ...obj };
    }
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === "object" && item !== null) {
          acc = { ...acc, ...item };
        }
      }
    }
    return acc;
  }, {});
};

/**
 * Returns the current date and time in the ISO 8601 format.
 *
 * @example
 * now() // "2023-12-25T10:30:00.000Z"
 * now() // "2023-12-25T14:45:30.123Z" (different time)
 * @group DateTime
 *
 * @returns The current date and time as an ISO 8601 string.
 */
export const now = () => {
  return new Date().toISOString();
};

/**
 * Returns the current date and time in milliseconds since the Unix epoch.
 *
 * @example
 * millis() // 1703505000000
 * millis() // 1703505123456 (different time)
 * @group DateTime
 *
 * @returns The current timestamp in milliseconds.
 */
export const millis = () => {
  return Date.now();
};

/**
 * Parses the number of milliseconds since the Unix epoch or parses a string (with or without specified format) and returns the date and time in the ISO 8601 format.
 *
 * @example
 * toDateTime(1703505000000) // "2023-12-25T10:30:00.000Z"
 * toDateTime("2023-12-25") // "2023-12-25T00:00:00.000Z"
 * toDateTime("25/12/2023", "dd/MM/yyyy") // "2023-12-25T00:00:00.000Z"
 * toDateTime() // Current date/time (same as now())
 * @group DateTime
 *
 * @param input Optional timestamp in milliseconds or date string.
 * @param format Optional format string for parsing date strings.
 * @returns The date and time as an ISO 8601 string, or undefined if parsing fails.
 */
export const toDateTime = (input?: number | string, format?: string) => {
  if (typeof input === "number") {
    return new Date(input).toISOString();
  }
  if (typeof input === "string") {
    if (format) {
      // Add UTC as timezone if not provided
      const _format =
        format.includes("x") || format.includes("X") ? format : `${format} X`;
      const _input =
        format.includes("x") || format.includes("X") ? input : `${input} Z`;
      return dateParse(_input, _format, new Date()).toISOString();
    }
    return new Date(input).toISOString();
  }
  if (input === undefined) {
    return new Date().toISOString();
  }
  return undefined;
};

/**
 * Converts a date and time to a provided format.
 *
 * @example
 * dateTimeFormat(datetime, format)
 * datetime|dateTimeFormat(format)
 * @group DateTime
 *
 * @param input The input date and time, either as a string or number.
 * @param format The format to convert the date and time to.
 * @returns The date and time in the specified format.
 */
export const dateTimeFormat = (
  input: number | string,
  format: string,
): string | null => {
  let dateTime: Date;
  if (typeof input === "string") {
    dateTime = new Date(input);
  } else if (typeof input === "number") {
    dateTime = new Date(input);
  } else {
    return null;
  }

  // Convert to UTC
  const utcDateTime = new Date(
    dateTime.getTime() + dateTime.getTimezoneOffset() * 60000,
  );

  // Format the date
  return dateFormat(utcDateTime, format);
};

/**
 * Parses the date and time in the ISO 8601 format and returns the number of milliseconds since the Unix epoch.
 *
 * @example
 * dateTimeToMillis("2023-12-25T10:30:00.000Z") // 1703505000000
 * "2023-01-01T00:00:00.000Z"|dateTimeToMillis // 1672531200000
 * dateTimeToMillis("2023-12-25") // 1703462400000
 * @group DateTime
 *
 * @param input The date and time string to parse.
 * @returns The timestamp in milliseconds since Unix epoch.
 */
export const dateTimeToMillis = (input: string) => {
  return new Date(input).getTime();
};

/**
 * Adds a time range to a date and time in the ISO 8601 format.
 *
 * @example
 * dateTimeAdd("2023-12-25T10:30:00.000Z", "day", 1) // "2023-12-26T10:30:00.000Z"
 * now()|dateTimeAdd("hour", -2) // Two hours ago
 * dateTimeAdd("2023-01-01T00:00:00.000Z", "month", 3) // "2023-04-01T00:00:00.000Z"
 * @group DateTime
 *
 * @param input The input date and time string in ISO 8601 format.
 * @param unit The time unit to add ("day", "hour", "minute", "second", "month", "year", etc.).
 * @param value The amount to add (can be negative to subtract).
 * @returns The new date and time as an ISO 8601 string.
 */
export const dateTimeAdd = (input: string, unit: string, value: number) => {
  // if unit doesn't end with 's' add it
  const _unit = unit.toLowerCase().endsWith("s")
    ? unit.toLowerCase()
    : `${unit.toLowerCase()}s`;
  const returnDate = dateAdd(new Date(input), { [_unit]: value });
  return returnDate.toISOString();
  // dateAdd(new Date(input), { [unit]: value });
};

/**
 * Converts an ISO datetime string to a target timezone, handling daylight savings, and returns an ISO string with the correct offset.
 *
 * @example
 * convertTimeZone('2025-06-26T12:00:00Z', 'Europe/Amsterdam') // 2025-06-26T14:00:00.0000000+02:00
 * '2025-06-26T12:00:00Z'|convertTimeZone('Pacific Standard Time') // '2025-06-26T05:00:00.0000000-07:00'
 * @group DateTime
 *
 * @param input ISO datetime string
 * @param targetTimeZone Target timezone (IANA or Windows ID or fixed offset)
 * @returns ISO datetime string with correct offset
 */
export const convertTimeZone = (
  input: unknown,
  targetTimeZone: unknown,
): string | null => {
  if (typeof input !== "string" || typeof targetTimeZone !== "string")
    return null;
  try {
    const date = new Date(input);
    if (isNaN(date.getTime())) return null;
    const tzStr = targetTimeZone.trim();

    // Fixed offset: e.g. +02:00 or -08:00
    const offsetMatch = /^([+-])(\d{2}):(\d{2})$/.exec(tzStr);
    if (offsetMatch) {
      const sign = offsetMatch[1] === "+" ? 1 : -1;
      const hours = parseInt(offsetMatch[2], 10);
      const minutes = parseInt(offsetMatch[3], 10);
      const offset = sign * (hours * 60 + minutes);
      const utcMillis = date.getTime();
      const offsetMillis = offset * 60 * 1000;
      const converted = new Date(utcMillis + offsetMillis);
      const pad = (n: number, l = 2) => n.toString().padStart(l, "0");
      const offsetStr = `${offsetMatch[1]}${pad(hours)}:${pad(minutes)}`;
      let iso = converted.toISOString().replace("Z", "");
      const isoMatch = iso.match(/^(.*\.(\d+))/);
      if (isoMatch) {
        const frac = isoMatch[2].padEnd(7, "0").slice(0, 7);
        iso = iso.replace(/\.(\d+)/, `.${frac}`);
      }
      return iso + offsetStr;
    }

    // Windows timezone mapping
    let ianaTz = tzStr;
    if (!tzStr.includes("/") && tzStr.toLowerCase() !== "utc") {
      try {
        const iana = findIana(tzStr);
        if (iana && iana.length > 0 && typeof iana[0] === "string") {
          ianaTz = iana[0];
        }
      } catch {}
    }
    if (tzStr.toLowerCase() === "utc" || tzStr === "Etc/UTC") {
      ianaTz = "UTC";
    }

    // Use formatInTimeZone for robust formatting
    // yyyy-MM-dd'T'HH:mm:ss.SSSSSSSXXX for ISO with 7 fractional digits and offset
    // SSSSSSS is not a standard token, so pad manually after formatting
    // Use SSS for milliseconds, then pad to 7 digits
    // formatInTimeZone is already imported at module level
    let formatted = formatInTimeZone(
      date,
      ianaTz,
      "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
    );
    // Patch to 7 digits for fractional seconds
    formatted = formatted.replace(
      /\.(\d{3})/,
      (m, ms) => `.${ms.padEnd(7, "0")}`,
    );
    // Patch UTC output to use +00:00 instead of Z
    if (ianaTz === "UTC" && formatted.endsWith("Z")) {
      formatted = formatted.slice(0, -1) + "+00:00";
    }
    return formatted;
  } catch {
    return null;
  }
};

/**
 * Converts a local time string in a specified timezone to an ISO datetime string with the correct offset.
 *
 * @example
 * localTimeToIsoWithOffset('2025-06-26 14:00:00', 'Europe/Amsterdam') // '2025-06-26T14:00:00.0000000+02:00'
 * '2025-06-26 05:00:00'|localTimeToIsoWithOffset('Pacific Standard Time') // '2025-06-26T05:00:00.0000000-08:00'
 * @group DateTime
 *
 * @param localTime Local time string
 * @param timeZone Timezone (IANA or Windows ID or fixed offset)
 * @returns ISO datetime string with correct offset
 */
export const localTimeToIsoWithOffset = (
  localTime: string,
  timeZone: string,
): string | null => {
  try {
    const utcDate = fromZonedTime(localTime, timeZone);
    let formatted = formatInTimeZone(
      utcDate,
      timeZone,
      "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
    );
    formatted = formatted.replace(
      /\.(\d{3})/,
      (m, ms) => `.${ms.padEnd(7, "0")}`,
    );
    return formatted;
  } catch {
    return null;
  }
};

/**
 * Evaluates a JEXL expression and returns the result.
 * If only one argument is provided, it is expected that the first argument is a JEXL expression.
 * If two arguments are provided, the first argument is the context (must be an object) and the second argument is the JEXL expression.
 * The expression uses the default JEXL extended grammar and can't use any custom defined functions or transforms.
 *
 * @example
 * _eval("1 + 2") // 3
 * _eval({x: 5, y: 10}, "x + y") // 15
 * "2 * 3"|_eval // 6
 * _eval({name: "John"}, "name") // "John"
 * @group Utility
 *
 * @param input Either a JEXL expression string or a context object.
 * @param expression Optional JEXL expression when first argument is context.
 * @returns The result of evaluating the expression, or undefined if evaluation fails.
 */
export const _eval = (input: unknown, expression: string) => {
  if (expression === undefined) {
    const _input = typeof input === "string" ? input : JSON.stringify(input);
    return getJexl().evalSync(_input);
  }
  if (typeof input === "object") {
    return getJexl().evalSync(expression, input);
  }
  return undefined;
};

/**
 * Generates a new UUID (Universally Unique Identifier).
 *
 * @example
 * uuid() // "123e4567-e89b-12d3-a456-426614174000"
 * uuid() // "987fcdeb-51a2-43d7-b123-456789abcdef" (different each time)
 * @group Utility
 *
 * @returns A new UUID v4 string.
 */
export const uuid = () => {
  return uuidv4();
};

/**
 * Returns the type of the input value as a string.
 *
 * Supported return values:
 * - "string", "number", "boolean", "undefined", "array", "object"
 * - Only for JS: "function", "symbol", "bigint"
 *
 * @param input - The value to check the type of.
 * @returns {string} The type of the input value.
 *
 * @example
 * type(5); // "number"
 * foo|type; // "string"
 * type(true); // "boolean"
 * [1,2,3]|type; // "array"
 * {foo:1}|type; // "object"
 * undefined|type; // "undefined"
 */
export const getType = (input: unknown): string => {
  if (input === null) return "null";
  if (Array.isArray(input)) return "array";
  return typeof input;
};
