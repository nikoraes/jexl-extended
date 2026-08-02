import { Jexl } from 'jexl';
import {
  toString,
  length,
  substring,
  substringBefore,
  substringAfter,
  absoluteValue,
  arrayAppend,
  arrayReverse,
  arrayShuffle,
  arraySort,
  average,
  base64Decode,
  base64Encode,
  camelCase,
  ceil,
  contains,
  floor,
  formatBase,
  formatInteger,
  formatNumber,
  lowercase,
  max,
  min,
  not,
  switchCase,
  pad,
  parseInteger,
  pascalCase,
  power,
  randomNumber,
  replace,
  round,
  split,
  sqrt,
  sum,
  toBoolean,
  toNumber,
  trim,
  uppercase,
  arrayDistinct,
  arrayToObject,
  mapField,
  arrayMap,
  arrayAny,
  arrayEvery,
  arrayFilter,
  arrayReduce,
  objectKeys,
  _eval,
  dateTimeAdd,
  dateTimeToMillis,
  objectEntries,
  objectMerge,
  objectValues,
  toDateTime,
  uuid,
  now,
  millis,
  arrayJoin,
  arrayFind,
  arrayFindIndex,
  startsWith,
  endsWith,
  dateTimeFormat,
  formUrlEncoded,
  toJson,
  arrayRange,
  convertTimeZone,
  localTimeToIsoWithOffset,
  getType,
  __setJexlInstance,
} from "./extended-grammar.js";

export class JexlExtended extends Jexl {
  constructor() {
    super();
    // String
    this.addFunction("string", toString);
    this.addFunction("$string", toString);
    this.addTransform("string", toString);
    // toString causes issues in javascript
    // this.addTransform('toString', toString);
    //Json
    this.addFunction("json", toJson);
    this.addFunction("$json", toJson);
    this.addTransform("toJson", toJson);
    this.addFunction("parseJson", toJson);
    this.addFunction("$parseJson", toJson);
    this.addTransform("parseJson", toJson);
    // Length
    this.addFunction("length", length);
    this.addFunction("$length", length);
    this.addTransform("length", length);
    this.addFunction("count", length);
    this.addFunction("$count", length);
    this.addTransform("count", length);
    this.addFunction("size", length);
    this.addFunction("$size", length);
    this.addTransform("size", length);
    // Substring
    this.addFunction("substring", substring);
    this.addFunction("$substring", substring);
    this.addTransform("substring", substring);
    // SubstringBefore
    this.addFunction("substringBefore", substringBefore);
    this.addFunction("$substringBefore", substringBefore);
    this.addTransform("substringBefore", substringBefore);
    // SubstringAfter
    this.addFunction("substringAfter", substringAfter);
    this.addFunction("$substringAfter", substringAfter);
    this.addTransform("substringAfter", substringAfter);
    // Uppercase
    this.addFunction("uppercase", uppercase);
    this.addFunction("$uppercase", uppercase);
    this.addTransform("uppercase", uppercase);
    this.addFunction("upper", uppercase);
    this.addFunction("$upper", uppercase);
    this.addTransform("upper", uppercase);
    // Lowercase
    this.addFunction("lowercase", lowercase);
    this.addFunction("$lowercase", lowercase);
    this.addTransform("lowercase", lowercase);
    this.addFunction("lower", lowercase);
    this.addFunction("$lower", lowercase);
    this.addTransform("lower", lowercase);
    // CamelCase
    this.addFunction("camelCase", camelCase);
    this.addFunction("$camelCase", camelCase);
    this.addTransform("camelcase", camelCase);
    this.addTransform("camelCase", camelCase);
    this.addTransform("toCamelCase", camelCase);
    // PascalCase
    this.addFunction("pascalCase", pascalCase);
    this.addFunction("$pascalCase", pascalCase);
    this.addTransform("pascalcase", pascalCase);
    this.addTransform("pascalCase", pascalCase);
    this.addTransform("toPascalCase", pascalCase);
    // Trim
    this.addFunction("trim", trim);
    this.addFunction("$trim", trim);
    this.addTransform("trim", trim);
    // Pad
    this.addFunction("pad", pad);
    this.addFunction("$pad", pad);
    this.addTransform("pad", pad);
    // Contains
    this.addFunction("contains", contains);
    this.addFunction("$contains", contains);
    this.addTransform("contains", contains);
    this.addFunction("includes", contains);
    this.addFunction("$includes", contains);
    this.addTransform("includes", contains);
    // StartsWith
    this.addFunction("startsWith", startsWith);
    this.addFunction("$startsWith", startsWith);
    this.addTransform("startsWith", startsWith);
    // EndsWith
    this.addFunction("endsWith", endsWith);
    this.addFunction("$endsWith", endsWith);
    this.addTransform("endsWith", endsWith);
    // Split
    this.addFunction("split", split);
    this.addFunction("$split", split);
    this.addTransform("split", split);
    // Join
    this.addFunction("join", arrayJoin);
    this.addFunction("$join", arrayJoin);
    this.addTransform("join", arrayJoin);
    // Replace
    this.addFunction("replace", replace);
    this.addFunction("$replace", replace);
    this.addTransform("replace", replace);
    // Base64Encode
    this.addFunction("base64Encode", base64Encode);
    this.addFunction("$base64Encode", base64Encode);
    this.addTransform("base64Encode", base64Encode);
    // Base64Decode
    this.addFunction("base64Decode", base64Decode);
    this.addFunction("$base64Decode", base64Decode);
    this.addTransform("base64Decode", base64Decode);
    // Form URL Encoded
    this.addFunction("formUrlEncoded", formUrlEncoded);
    this.addFunction("$formUrlEncoded", formUrlEncoded);
    this.addTransform("formUrlEncoded", formUrlEncoded);
    // Number
    this.addFunction("number", toNumber);
    this.addFunction("$number", toNumber);
    this.addTransform("number", toNumber);
    this.addTransform("toNumber", toNumber);
    this.addFunction("parseFloat", toNumber);
    this.addFunction("$parseFloat", toNumber);
    this.addTransform("float", toNumber);
    this.addTransform("toFloat", toNumber);
    // AbsoluteValue
    this.addFunction("abs", absoluteValue);
    this.addFunction("$abs", absoluteValue);
    this.addTransform("abs", absoluteValue);
    // Floor
    this.addFunction("floor", floor);
    this.addFunction("$floor", floor);
    this.addTransform("floor", floor);
    // Ceil
    this.addFunction("ceil", ceil);
    this.addFunction("$ceil", ceil);
    this.addTransform("ceil", ceil);
    // Round
    this.addFunction("round", round);
    this.addFunction("$round", round);
    this.addTransform("round", round);
    // Power
    this.addFunction("power", power);
    this.addFunction("$power", power);
    this.addTransform("power", power);
    // Sqrt
    this.addFunction("sqrt", sqrt);
    this.addFunction("$sqrt", sqrt);
    this.addTransform("sqrt", sqrt);
    // Random
    this.addFunction("random", randomNumber);
    this.addFunction("$random", randomNumber);
    // FormatNumber
    this.addFunction("formatNumber", formatNumber);
    this.addFunction("$formatNumber", formatNumber);
    this.addTransform("formatNumber", formatNumber);
    // FormatBase
    this.addFunction("formatBase", formatBase);
    this.addFunction("$formatBase", formatBase);
    this.addTransform("formatBase", formatBase);
    // FormatInteger
    this.addFunction("formatInteger", formatInteger);
    this.addFunction("$formatInteger", formatInteger);
    this.addTransform("formatInteger", formatInteger);
    // ParseInteger
    this.addFunction("parseInteger", parseInteger);
    this.addFunction("parseInt", parseInteger);
    this.addFunction("$parseInteger", parseInteger);
    this.addTransform("parseInteger", parseInteger);
    this.addTransform("parseInt", parseInteger);
    this.addTransform("toInt", parseInteger);
    this.addTransform("integer", parseInteger);
    // Sum
    this.addFunction("sum", sum);
    this.addFunction("$sum", sum);
    this.addTransform("sum", sum);
    // Max
    this.addFunction("max", max);
    this.addFunction("$max", max);
    this.addTransform("max", max);
    // Min
    this.addFunction("min", min);
    this.addFunction("$min", min);
    this.addTransform("min", min);
    // Average
    this.addFunction("average", average);
    this.addFunction("avg", average);
    this.addFunction("$average", average);
    this.addTransform("average", average);
    this.addTransform("avg", average);
    // Boolean
    this.addFunction("boolean", toBoolean);
    this.addFunction("$boolean", toBoolean);
    this.addTransform("boolean", toBoolean);
    this.addFunction("bool", toBoolean);
    this.addFunction("$bool", toBoolean);
    this.addTransform("bool", toBoolean);
    this.addTransform("toBoolean", toBoolean);
    this.addTransform("toBool", toBoolean);
    // Not
    this.addFunction("not", not);
    this.addFunction("$not", not);
    this.addTransform("not", not);
    // SwitchCase
    this.addFunction("case", switchCase);
    this.addFunction("$case", switchCase);
    this.addTransform("case", switchCase);
    this.addFunction("switch", switchCase);
    this.addFunction("$switch", switchCase);
    this.addTransform("switch", switchCase);
    // Array operations
    this.addFunction("range", arrayRange);
    this.addFunction("$range", arrayRange);
    this.addTransform("range", arrayRange);
    this.addFunction("append", arrayAppend);
    this.addFunction("$append", arrayAppend);
    this.addTransform("append", arrayAppend);
    this.addFunction("concat", arrayAppend);
    this.addFunction("$concat", arrayAppend);
    this.addTransform("concat", arrayAppend);
    this.addFunction("reverse", arrayReverse);
    this.addFunction("$reverse", arrayReverse);
    this.addTransform("reverse", arrayReverse);
    this.addFunction("shuffle", arrayShuffle);
    this.addFunction("$shuffle", arrayShuffle);
    this.addTransform("shuffle", arrayShuffle);
    this.addFunction("sort", arraySort);
    this.addFunction("$sort", arraySort);
    this.addTransform("sort", arraySort);
    this.addFunction("order", arraySort);
    this.addFunction("$order", arraySort);
    this.addTransform("order", arraySort);
    this.addFunction("distinct", arrayDistinct);
    this.addFunction("$distinct", arrayDistinct);
    this.addTransform("distinct", arrayDistinct);
    this.addFunction("toObject", arrayToObject);
    this.addFunction("$toObject", arrayToObject);
    this.addTransform("toObject", arrayToObject);
    this.addFunction("fromEntries", arrayToObject);
    this.addFunction("$fromEntries", arrayToObject);
    this.addTransform("fromEntries", arrayToObject);
    // Map and filter operations
    this.addFunction("mapField", mapField);
    this.addFunction("$mapField", mapField);
    this.addTransform("mapField", mapField);
    this.addFunction("map", arrayMap);
    this.addFunction("$map", arrayMap);
    this.addTransform("map", arrayMap);
    this.addFunction("any", arrayAny);
    this.addFunction("$any", arrayAny);
    this.addTransform("any", arrayAny);
    this.addFunction("some", arrayAny);
    this.addFunction("$some", arrayAny);
    this.addTransform("some", arrayAny);
    this.addFunction("all", arrayEvery);
    this.addFunction("$all", arrayEvery);
    this.addTransform("all", arrayEvery);
    this.addFunction("every", arrayEvery);
    this.addFunction("$every", arrayEvery);
    this.addTransform("every", arrayEvery);
    this.addFunction("filter", arrayFilter);
    this.addFunction("$filter", arrayFilter);
    this.addTransform("filter", arrayFilter);
    this.addFunction("find", arrayFind);
    this.addFunction("$find", arrayFind);
    this.addTransform("find", arrayFind);
    this.addFunction("findIndex", arrayFindIndex);
    this.addFunction("$findIndex", arrayFindIndex);
    this.addTransform("findIndex", arrayFindIndex);
    this.addFunction("reduce", arrayReduce);
    this.addFunction("$reduce", arrayReduce);
    this.addTransform("reduce", arrayReduce);
    // Object operations
    this.addFunction("keys", objectKeys);
    this.addFunction("$keys", objectKeys);
    this.addTransform("keys", objectKeys);
    this.addFunction("values", objectValues);
    this.addFunction("$values", objectValues);
    this.addTransform("values", objectValues);
    this.addFunction("entries", objectEntries);
    this.addFunction("$entries", objectEntries);
    this.addTransform("entries", objectEntries);
    this.addFunction("merge", objectMerge);
    this.addFunction("$merge", objectMerge);
    this.addTransform("merge", objectMerge);
    // Now
    this.addFunction("now", now);
    this.addFunction("$now", now);
    // Millis
    this.addFunction("millis", millis);
    this.addFunction("$millis", millis);
    // ToDateTime
    this.addFunction("millisToDateTime", toDateTime);
    this.addFunction("$millisToDateTime", toDateTime);
    this.addTransform("millisToDateTime", toDateTime);
    this.addFunction("fromMillis", toDateTime);
    this.addFunction("$fromMillis", toDateTime);
    this.addTransform("fromMillis", toDateTime);
    this.addFunction("toDateTime", toDateTime);
    this.addFunction("$toDateTime", toDateTime);
    this.addTransform("toDateTime", toDateTime);
    this.addFunction("dateTimeString", toDateTime);
    // DateTimeToMillis
    this.addFunction("dateTimeToMillis", dateTimeToMillis);
    this.addFunction("$dateTimeToMillis", dateTimeToMillis);
    this.addTransform("dateTimeToMillis", dateTimeToMillis);
    this.addFunction("toMillis", dateTimeToMillis);
    this.addFunction("$toMillis", dateTimeToMillis);
    this.addTransform("toMillis", dateTimeToMillis);
    // DateTimeFormat
    this.addFunction("dateTimeFormat", dateTimeFormat);
    this.addFunction("$dateTimeFormat", dateTimeFormat);
    this.addTransform("dateTimeFormat", dateTimeFormat);
    // DateTimeAdd
    this.addFunction("dateTimeAdd", dateTimeAdd);
    this.addFunction("$dateTimeAdd", dateTimeAdd);
    this.addTransform("dateTimeAdd", dateTimeAdd);
    // ConvertTimeZone
    this.addFunction("convertTimeZone", convertTimeZone);
    this.addFunction("$convertTimeZone", convertTimeZone);
    this.addTransform("convertTimeZone", convertTimeZone);
    // LocalTimeToIsoWithOffset
    this.addFunction("localTimeToIsoWithOffset", localTimeToIsoWithOffset);
    this.addFunction("$localTimeToIsoWithOffset", localTimeToIsoWithOffset);
    this.addTransform("localTimeToIsoWithOffset", localTimeToIsoWithOffset);
    // Eval
    this.addFunction("eval", _eval);
    this.addFunction("$eval", _eval);
    this.addTransform("eval", _eval);
    // Uuid
    this.addFunction("uuid", uuid);
    this.addFunction("$uuid", uuid);
    this.addFunction("uid", uuid);
    this.addFunction("$uid", uuid);
    // Types
    this.addFunction("type", getType);
    this.addFunction("$type", getType);
    this.addTransform("type", getType);
  }
}

export enum GrammarType {
    Function = 'Function',
    Transform = 'Transform'
}

// Monaco Editor support (optional)
export * as Monaco from './monaco/index.js';

// Create the default instance and make it available to the grammar module so
// functions like `eval` and `sort` can evaluate nested expressions with the
// extended grammar. Injected lazily to avoid a static circular import between
// index.ts and extended-grammar.ts (see extended-grammar.ts for details).
const jexlExtended = new JexlExtended();
__setJexlInstance(jexlExtended);

export default jexlExtended;