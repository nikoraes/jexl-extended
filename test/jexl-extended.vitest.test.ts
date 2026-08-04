import { expect, test } from "vitest";
import jexl from "../src";

test("convert to string", () => {
  expect(jexl.evalSync("string(123)")).toBe("123");
  expect(jexl.evalSync("123456|string")).toBe("123456");
  expect(jexl.evalSync(`{a:123456}|string`)).toBe('{"a":123456}');
});

test("length", () => {
  expect(jexl.evalSync("'test123'|length")).toBe(7);
  expect(jexl.evalSync('["a",1,"b"]|length')).toBe(3);
  expect(jexl.evalSync('$length(["a",1,"b"])')).toBe(3);
  expect(jexl.evalSync("{a:1,b:2,c:3}|length")).toBe(3);
});

test("substring", () => {
  expect(jexl.evalSync("substring(123456,2,2)")).toBe("34");
  expect(jexl.evalSync("$substring('test',(-2))")).toBe("st");
  expect(jexl.evalSync("$substring($string({a:123456}, true),0,1)")).toBe("{");
});

test("substringBefore", () => {
  expect(jexl.evalSync('"hello world"|substringBefore(" ")')).toBe("hello");
  expect(jexl.evalSync('substringBefore("hello world", "o")')).toBe("hell");
  expect(jexl.evalSync('substringBefore("hello world", "x")')).toBe(
    "hello world",
  );
  expect(jexl.evalSync("substringBefore(123456,2)")).toBe("1");
});

test("substringAfter", () => {
  expect(jexl.evalSync('"hello world"|substringAfter(" ")')).toBe("world");
  expect(jexl.evalSync('substringAfter("hello world", "o")')).toBe(" world");
  expect(jexl.evalSync('substringAfter("hello world", "x")')).toBe("");
  expect(jexl.evalSync("substringAfter(123456,2)")).toBe("3456");
});

test("uppercase", () => {
  expect(jexl.evalSync('uppercase("hello world")')).toBe("HELLO WORLD");
  expect(jexl.evalSync("uppercase(123456)")).toBe("123456");
  expect(jexl.evalSync("'baz'|uppercase")).toBe("BAZ");
});

test("lowercase", () => {
  expect(jexl.evalSync('lowercase("HELLO WORLD")')).toBe("hello world");
  expect(jexl.evalSync("lowercase(123456)")).toBe("123456");
  expect(jexl.evalSync("$lowercase('FOObar')")).toBe("foobar");
  expect(jexl.evalSync('"FOObar"|lower')).toBe("foobar");
});

test("camelPascalCase", () => {
  expect(jexl.evalSync("'foo bar '|camelCase")).toBe("fooBar");
  expect(jexl.evalSync("$camelCase('Foo_bar')")).toBe("fooBar");
  expect(jexl.evalSync("'FooBar'|toCamelCase")).toBe("fooBar");
  expect(jexl.evalSync("'Foo-bar'|toCamelCase")).toBe("fooBar");
  expect(jexl.evalSync("'foo bar'|toPascalCase")).toBe("FooBar");
  expect(jexl.evalSync("'fooBar'|toPascalCase")).toBe("FooBar");
  expect(jexl.evalSync("'Foo_bar'|toPascalCase")).toBe("FooBar");
});

test("trimPad", () => {
  expect(jexl.evalSync('trim(" baz  ")')).toBe("baz");
  expect(jexl.evalSync('trim("  baz  ")')).toBe("baz");
  expect(jexl.evalSync('trim("__baz--","--")')).toBe("__baz");
  expect(jexl.evalSync('pad("foo",5)')).toBe("foo  ");
  expect(jexl.evalSync('pad("foo",(-5),0)')).toBe("00foo");
});

test("contains", () => {
  expect(jexl.evalSync("'foo-bar'|contains('bar')")).toBe(true);
  expect(jexl.evalSync("'foo-bar'|contains('baz')")).toBe(false);
  expect(jexl.evalSync('["foo-bar"]|contains("bar")')).toBe(false);
  expect(jexl.evalSync('["foo-bar"]|contains("foo-bar")')).toBe(true);
  expect(jexl.evalSync('["baz", "foo", "bar"]|contains("bar")')).toBe(true);
});

test("startsWithEndsWith", () => {
  expect(jexl.evalSync("'foo-bar'|startsWith('foo')")).toBe(true);
  expect(jexl.evalSync("'foo-bar'|startsWith('baz')")).toBe(false);
  expect(jexl.evalSync("'foo-bar'|endsWith('bar')")).toBe(true);
  expect(jexl.evalSync("'foo-bar'|startsWith('baz')")).toBe(false);
});

test("split", () => {
  expect(jexl.evalSync('split("foo-bar", "-")')).toEqual(["foo", "bar"]);
});

test("join", () => {
  expect(jexl.evalSync('join(["foo", "bar"], "-")')).toBe("foo-bar");
  expect(jexl.evalSync('join(["foo", "bar"], "")')).toBe("foobar");
  expect(jexl.evalSync('"f,b,a,d,e,c"|split(",")|sort|join')).toEqual(
    "a,b,c,d,e,f",
  );
  expect(jexl.evalSync('"f,b,a,d,e,c"|split(",")|sort|join("")')).toEqual(
    "abcdef",
  );
});

test("replace", () => {
  expect(jexl.evalSync('replace("foo-bar", "-", "_")')).toBe("foo_bar");
  expect(jexl.evalSync('replace("foo-bar---", "-", "")')).toBe("foobar");
  expect(jexl.evalSync('"123ab123ab123ab"|replace("123")')).toEqual("ababab");
});

test("convertBase64", () => {
  expect(jexl.evalSync("'foobar'|base64Encode")).toBe("Zm9vYmFy");
  expect(jexl.evalSync("'Zm9vYmFy'|base64Decode")).toBe("foobar");
  expect(jexl.evalSync("'hello⛳❤️🧀'|base64Encode|base64Decode")).toBe(
    "hello⛳❤️🧀",
  );
});

test("formUrlEncoded", () => {
  expect(jexl.evalSync('{foo:"bar",baz:"tek"}|formUrlEncoded')).toBe(
    "foo=bar&baz=tek",
  );
});

test("number", () => {
  expect(jexl.evalSync('$number("1")')).toBe(1);
  expect(jexl.evalSync('$number("1.1")')).toBe(1.1);
  expect(jexl.evalSync('$number("-1.1")')).toBe(-1.1);
  expect(jexl.evalSync("$number(-1.1)")).toBe(-1.1);
  expect(jexl.evalSync("$number(-1.1)|floor")).toBe(-2);
  expect(jexl.evalSync('$number("10.6")|ceil')).toBe(11);
  expect(jexl.evalSync("10.123456|round(2)")).toBe(10.12);
  expect(jexl.evalSync("10.123456|toInt")).toBe(10);
  expect(jexl.evalSync('"10.123456"|toInt')).toBe(10);
  expect(jexl.evalSync("3|power(2)")).toBe(9);
  expect(jexl.evalSync("3|power")).toBe(9);
  expect(jexl.evalSync("9|sqrt")).toBe(3);
  expect(jexl.evalSync("random() < 1")).toBe(true);
});

test("formatting", () => {
  expect(jexl.evalSync('16325.62|formatNumber("0,0.000")')).toBe("16,325.620");
  expect(jexl.evalSync('16325.62|formatNumber("0.000")')).toBe("16325.620");
  expect(jexl.evalSync("12|formatBase(16)")).toBe("c");
  expect(jexl.evalSync('16325.62|formatInteger("0000000")')).toBe("0016325");
});

test("integers", () => {
  expect(jexl.evalSync("'16325'|toInt")).toBe(16325);
  expect(jexl.evalSync("(9/2)|toInt")).toBe(4);
});

test("numericAggregations", () => {
  expect(jexl.evalSync("[1,2,3]|sum")).toBe(6);
  expect(jexl.evalSync("sum(1,2,3,4,5)")).toBe(15);
  expect(jexl.evalSync("[1,3]|sum(1,2,3,4,5)")).toBe(19);
  expect(jexl.evalSync("[1,3]|sum([1,2,3,4,5])")).toBe(19);
  expect(jexl.evalSync("[1,3]|max([1,2,3,4,5])")).toBe(5);
  expect(jexl.evalSync("[2,3]|min([1,2,3,4,5])")).toBe(1);
  expect(jexl.evalSync("[4,5,6]|avg")).toBe(5);
});

test("booleans", () => {
  expect(jexl.evalSync("1|toBoolean")).toBe(true);
  expect(jexl.evalSync("3|toBoolean")).toBe(true);
  expect(jexl.evalSync("'1'|toBoolean")).toBe(true);
  expect(jexl.evalSync("'2'|toBoolean")).toBe(undefined);
  expect(jexl.evalSync("'a'|toBool")).toBe(undefined);
  expect(jexl.evalSync("''|toBool")).toBe(undefined);
  expect(jexl.evalSync("0|toBool")).toBe(false);
  expect(jexl.evalSync("0.0|toBool")).toBe(false);
  expect(jexl.evalSync("'false'|toBool")).toBe(false);
  expect(jexl.evalSync("'False'|toBool")).toBe(false);
  expect(jexl.evalSync("'fALSE'|toBool")).toBe(false);
  expect(jexl.evalSync("'tRUE       '|toBoolean")).toBe(true);
  expect(jexl.evalSync("'False'|toBool|not")).toBe(true);
  expect(jexl.evalSync("'TRUE'|toBool|not")).toBe(false);
});

test("case", () => {
  expect(jexl.evalSync('2|case(1,"a",2,"b",3,"c")')).toBe("b");
  expect(jexl.evalSync('$case("bar","foo","a","bar","b","baz","c")')).toBe("b");
  expect(
    jexl.evalSync(
      "'notfound'|case('bar','foo','a','bar','b','baz','c','b','b')",
    ),
  ).toBe("b");
});

test("arrays", () => {
  expect(jexl.evalSync('["foo", "bar", "baz"]|append("tek")')).toEqual([
    "foo",
    "bar",
    "baz",
    "tek",
  ]);
  expect(jexl.evalSync('["foo", "bar"]|append(["baz","tek"])')).toEqual([
    "foo",
    "bar",
    "baz",
    "tek",
  ]);
  expect(jexl.evalSync('"foo"|append(["bar", "baz","tek"])')).toEqual([
    "foo",
    "bar",
    "baz",
    "tek",
  ]);
  expect(jexl.evalSync('"foo"|append("bar", "baz","tek")')).toEqual([
    "foo",
    "bar",
    "baz",
    "tek",
  ]);
  expect(jexl.evalSync('["tek", "baz", "bar", "foo"]|reverse')).toEqual([
    "foo",
    "bar",
    "baz",
    "tek",
  ]);
  expect(
    jexl.evalSync('["tek", "baz", "bar", "foo", "foo"]|reverse|distinct'),
  ).toEqual(["foo", "bar", "baz", "tek"]);
  expect(jexl.evalSync("{foo:0, bar:1, baz:2, tek:3}|keys")).toEqual([
    "foo",
    "bar",
    "baz",
    "tek",
  ]);
  expect(jexl.evalSync('{a:"foo", b:"bar", c:"baz", d:"tek"}|values')).toEqual([
    "foo",
    "bar",
    "baz",
    "tek",
  ]);
  expect(
    jexl.evalSync(
      '[{name:"foo"}, {name:"bar"}, {name:"baz"}, {name:"tek"}]|mapField("name")',
    ),
  ).toEqual(["foo", "bar", "baz", "tek"]);
  expect(
    jexl.evalSync(
      '[{name:"tek",age:32}, {name:"bar",age:34}, {name:"baz",age:33}, {name:"foo",age:35}]|sort("age",true)|mapField("name")',
    ),
  ).toEqual(["foo", "bar", "baz", "tek"]);
  expect(
    jexl.evalSync(
      '[{name:"tek",age:32}, {name:"bar",age:34}, {name:"baz",age:33}, {name:"foo",age:35}]|sort("age",false)|mapField("name")',
    ),
  ).toEqual(["tek", "baz", "bar", "foo"]);
  expect(jexl.evalSync('["foo"]|append(["tek","baz","bar"]|sort)')).toEqual([
    "foo",
    "bar",
    "baz",
    "tek",
  ]);
  expect(
    jexl.evalSync(
      '["foo"]|append(["tek", "baz", "bar", "foo", "foo"]|filter("value != \'foo\'")|sort)',
    ),
  ).toEqual(["foo", "bar", "baz", "tek"]);
});

test("map", () => {
  const context = {
    assoc: [
      { lastName: "Archer", age: 32 },
      { lastName: "Poovey", age: 34 },
      { lastName: "Figgis", age: 45 },
    ],
  };
  expect(
    jexl.evalSync(
      '[{name:"foo"}, {name:"bar"}, {name:"baz"}, {name:"tek"}]|map("value.name")',
    ),
  ).toEqual(["foo", "bar", "baz", "tek"]);
  expect(
    jexl.evalSync(
      '[{name:"tek",age:32}, {name:"bar",age:34}, {name:"baz",age:33}, {name:"foo",age:35}]|map("value.age")',
    ),
  ).toEqual([32, 34, 33, 35]);
  expect(jexl.evalSync("assoc|map('value.age')", context)).toEqual([
    32, 34, 45,
  ]);
  expect(jexl.evalSync("assoc|map('value.lastName')", context)).toEqual([
    "Archer",
    "Poovey",
    "Figgis",
  ]);
  expect(jexl.evalSync("assoc|map('value.age + index')", context)).toEqual([
    32, 35, 47,
  ]);
  expect(
    jexl.evalSync(
      "assoc|map('value.age + array[.age <= value.age][0].age + index')",
      context,
    ),
  ).toEqual([64, 67, 79]);
  expect(jexl.evalSync("assoc|map('value.age')|avg", context)).toBe(37);
});

test("anyAll", () => {
  const context = {
    assoc: [
      { lastName: "Archer", age: 32 },
      { lastName: "Poovey", age: 34 },
      { lastName: "Figgis", age: 45 },
    ],
  };
  expect(
    jexl.evalSync(
      '[{name:"foo"}, {name:"bar"}, {name:"baz"}, {name:"tek"}]|any("value.name==\'foo\'")',
    ),
  ).toBe(true);
  expect(jexl.evalSync('assoc|every("value.age>30")', context)).toBe(true);
  expect(jexl.evalSync('assoc|every("value.age>40")', context)).toBe(false);
  expect(jexl.evalSync('assoc|some("value.age>40")', context)).toBe(true);
  expect(
    jexl.evalSync("assoc|some(\"value.lastName=='Figgis'\")", context),
  ).toBe(true);
  expect(
    jexl.evalSync('assoc|map("value.age")|some("value>30")', context),
  ).toBe(true);
});

test("reduce", () => {
  const context = {
    assoc: [
      { lastName: "Archer", age: 32 },
      { lastName: "Poovey", age: 34 },
      { lastName: "Figgis", age: 45 },
    ],
  };
  expect(
    jexl.evalSync("assoc|reduce('accumulator + value.age', 0)", context),
  ).toBe(111);
  expect(
    jexl.evalSync(
      "assoc|reduce('(value.age > array|map(\\'value.age\\')|avg) ? accumulator|append(value.age) : accumulator', [])",
      context,
    ),
  ).toEqual([45]);
  expect(
    jexl.evalSync(
      "assoc|reduce('(value.age < array|map(\\'value.age\\')|avg) ? accumulator|append(value.age) : accumulator', [])[1]",
      context,
    ),
  ).toBe(34);
});

test("objects", () => {
  const expected = { foo: "bar", baz: "tek" };
  expect(jexl.evalSync("$merge({foo:'bar'},{baz:'tek'})")).toEqual(expected);
  expect(jexl.evalSync('{foo:"bar"}|merge({baz:"tek"})')).toEqual(expected);
  expect(jexl.evalSync('[{foo:"bar"},{baz:"tek"}]|merge')).toEqual(expected);
  expect(jexl.evalSync('[{foo:"bar"}]|merge([{baz:"tek"}])')).toEqual(expected);
  expect(jexl.evalSync('[["foo","bar"],["baz","tek"]]|toObject')).toEqual(
    expected,
  );
  expect(jexl.evalSync('["foo","bar"]|toObject(true)')).toEqual({
    foo: true,
    bar: true,
  });
  expect(jexl.evalSync('["a","b","c"]|toObject(true)')).toEqual({
    a: true,
    b: true,
    c: true,
  });
  expect(jexl.evalSync('\'{"foo":"bar"}\'|toJson')).toEqual({ foo: "bar" });
});

test("time", () => {
  expect(
    jexl.evalSync("(now()|toMillis / 1000)|ceil == (millis() / 1000)|ceil"),
  ).toBe(true);
  expect(
    jexl.evalSync(
      "(((millis() / 1000) | ceil) * 1000) | toDateTime == ((now()|toMillis / 1000) | ceil * 1000) | toDateTime",
    ),
  ).toBe(true);
  expect(
    jexl.evalSync(
      "(((millis() / 1000) | ceil) * 1000) | toDateTime | dateTimeAdd('second',5)",
    ),
  ).toBe(
    jexl.evalSync("(((now()|toMillis / 1000) + 5) | ceil * 1000) | toDateTime"),
  );
  expect(
    jexl.evalSync(
      "(((millis() / 1000) | ceil) * 1000) | toDateTime | dateTimeAdd('second',5) == (((now()|toMillis / 1000) + 5) | ceil * 1000) | toDateTime",
    ),
  ).toBe(true);
  expect(
    jexl.evalSync(
      "'02-22-24 00:00:00'|toDateTime('MM-dd-yy HH:mm:ss') == '2024-02-22T00:00:00Z'|toDateTime",
    ),
  ).toBe(true);
  expect(
    jexl.evalSync("'02-22-24 00:00:00'|toDateTime('MM-dd-yy HH:mm:ss')"),
  ).toBe(jexl.evalSync("'2024-02-22T00:00:00.0000000+00:00'|toDateTime"));
  expect(
    jexl.evalSync("'2024-02-22T00:00:00.000000Z'|dateTimeFormat('dd.MM.yyyy')"),
  ).toBe("22.02.2024");
  expect(jexl.evalSync('1740445200000|dateTimeFormat("yyyyMMdd-HHmmss")')).toBe(
    "20250225-010000",
  );
});

test("convertTimeZone: IANA and Windows timezones", () => {
  expect(
    jexl.evalSync(
      "'2025-11-26T12:00:00Z'|convertTimeZone('Pacific Standard Time')",
    ),
  ).toBe("2025-11-26T04:00:00.0000000-08:00");
  expect(
    jexl.evalSync(
      "'2025-06-26T12:00:00Z'|convertTimeZone('Pacific Standard Time')",
    ),
  ).toBe("2025-06-26T05:00:00.0000000-07:00");
  expect(
    jexl.evalSync("'2025-06-26T12:00:00Z'|convertTimeZone('Europe/Amsterdam')"),
  ).toBe("2025-06-26T14:00:00.0000000+02:00");
  expect(jexl.evalSync("'2025-11-26T12:00:00Z'|convertTimeZone('UTC')")).toBe(
    "2025-11-26T12:00:00.0000000+00:00",
  );
});

test("convertTimeZone: fixed offsets", () => {
  // UTC to UTC (no offset change)
  expect(jexl.evalSync("'2025-11-26T12:00:00Z'|convertTimeZone('UTC')")).toBe(
    "2025-11-26T12:00:00.0000000+00:00",
  );
  // UTC to fixed offset +02:00
  expect(
    jexl.evalSync("'2025-11-26T12:00:00Z'|convertTimeZone('+02:00')"),
  ).toBe("2025-11-26T14:00:00.0000000+02:00");
  // UTC to fixed offset -08:00
  expect(
    jexl.evalSync("'2025-06-26T12:00:00Z'|convertTimeZone('-08:00')"),
  ).toBe("2025-06-26T04:00:00.0000000-08:00");
  // UTC to fixed offset -08:00 (winter)
  expect(
    jexl.evalSync("'2025-12-26T12:00:00Z'|convertTimeZone('-08:00')"),
  ).toBe("2025-12-26T04:00:00.0000000-08:00");
});

test("localTimeToIsoWithOffset", () => {
  expect(
    jexl.evalSync(
      "'2025-06-26 14:00:00'|localTimeToIsoWithOffset('Europe/Amsterdam')",
    ),
  ).toBe("2025-06-26T14:00:00.0000000+02:00");
});

test("eval", () => {
  const context = {
    assoc: [
      { lastName: "Archer", age: 32 },
      { lastName: "Poovey", age: 34 },
      { lastName: "Figgis", age: 45 },
    ],
    expression: "age",
  };
  expect(jexl.evalSync("eval(1+2)")).toBe(3);
  expect(jexl.evalSync("assoc[0]|eval('age')", context)).toBe(32);
  expect(jexl.evalSync("assoc[2]|eval(expression)", context)).toBe(45);
});

/* [Theory]
    [InlineData("5|type", "number")]
    [InlineData("'5'|type", "string")]
    [InlineData("true|type", "boolean")]
    // [InlineData("null|type", "null")]
    [InlineData("[1,2,3]|type", "array")]
    [InlineData("{foo:1}|type", "object")]
    [InlineData("undefined|type", "undefined")]
    public void TypeTransform(string expression, string expected)
    {
        var jexl = new Jexl(new ExtendedGrammar());
        var result = jexl.Eval(expression)?.ToString();
        Assert.Equal(expected, result);
    } */

test("typeCheck", () => {
  expect(jexl.evalSync("5|type")).toBe("number");
  expect(jexl.evalSync("'5'|type")).toBe("string");
  expect(jexl.evalSync("true|type")).toBe("boolean");
  // expect(jexl.evalSync("null|type")).toBe("null");
  expect(jexl.evalSync("[1,2,3]|type")).toBe("array");
  expect(jexl.evalSync("{foo:1}|type")).toBe("object");
  expect(jexl.evalSync("undefined|type")).toBe("undefined");
});

import jexl2 from "jexl";
import { arrayMap } from "../src/extended-grammar";

test("importSeparate", () => {
  jexl2.addTransform("map", arrayMap);
  expect(jexl2.evalSync('[1,2,3]|map("value+1")')).toEqual([2, 3, 4]);
});

test("complexTest1", () => {
  const context = {
    properties: [
      {
        attributeName: "osm_id",
        displayName: "osm_id",
        displayValue: 96188601,
      },
      {
        attributeName: "is_node",
        displayName: "is_node",
        displayValue: false,
      },
      {
        attributeName: "area",
        displayName: "area",
        displayValue: 21735,
      },
      {
        attributeName: "name",
        displayName: "name",
        displayValue: "San Giacomo 220",
      },
      {
        attributeName: "voltage",
        displayName: "voltage",
        displayValue: "220.0000000000000000",
      },
      {
        attributeName: "construction",
        displayName: "construction",
        displayValue: false,
      },
      {
        attributeName: "substation",
        displayName: "substation",
        displayValue: "transmission",
      },
    ],
  };
  expect(
    jexl.evalSync(`properties[.attributeName == 'voltage_2']|length`, context),
  ).toBeFalsy();
  expect(
    jexl.evalSync(
      `properties[.attributeName == 'voltage_2']|length > 0 ? ('; ' + properties[.attributeName == 'voltage_2'].displayValue|split('.')[0]) : ''`,
      context,
    ),
  ).toBe("");
  expect(
    jexl.evalSync(
      `properties[.attributeName=='voltage'].displayValue|split('.')[0] + 
    (properties[.attributeName == 'voltage_2']|length > 0 ? ('; ' + properties[.attributeName == 'voltage_2'].displayValue|split('.')[0]) : '') + 
    (properties[.attributeName == 'voltage_3']|length > 0 ? ('; ' + properties[.attributeName == 'voltage_3'].displayValue|split('.')[0]) : '')`,
      context,
    ),
  ).toBe("220");
});
