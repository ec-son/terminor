import { checkValueType, getValueType } from "../../src/utils/check-value-type";

/**
 * checkValueType
 * getValueType
 */

describe("check if value has a valid type", () => {
  const table1 = [
    { type: Number, value: 1, isSys: true },
    { type: Number, value: "1" },
    { type: String, value: "text" },
    { type: Boolean, value: true },
    { type: Date, value: new Date("2015-03-31"), isSys: true },
    { type: Date, value: "2015-03-31" },
  ];

  it.each(table1)("should return true", ({ type, value, isSys }) => {
    expect(checkValueType(type, value, isSys)).toBeTruthy();
  });

  const table2 = [
    { type: Number, value: "text", isSys: true },
    { type: Number, value: "text" },
    { type: String, value: 1 },
    { type: Boolean, value: "text" },
    { type: Date, value: "2015-03-31", isSys: true },
    { type: Date, value: "text" },
  ];

  it.each(table2)("should return false", ({ type, value, isSys }) => {
    expect(checkValueType(type, value, isSys)).toBeFalsy();
  });
});

describe("getting value type", () => {
  const table1 = [
    { type: Number, expected: "number" },
    { type: String, expected: "string" },
    { type: Boolean, expected: "boolean" },
    { type: Date, expected: "date" },
  ];

  it.each(table1)("should return a correct type", ({ type, expected }) => {
    expect(getValueType(type)).toEqual(expected);
  });
});
