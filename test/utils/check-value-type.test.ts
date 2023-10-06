import { ValidType } from "../../src/types/valid.type";
import { checkValueType } from "../../src/utils/check-value-type";

/**
 * checkValueType
 */

describe("check if value has a valid type", () => {
  const table1 = [
    { type: "number", value: 1, isSys: true },
    { type: "number", value: "1" },
    { type: "string", value: "text" },
    { type: "boolean", value: true },
    { type: "date", value: new Date("2015-03-31"), isSys: true },
    { type: "date", value: "2015-03-31" },
  ];

  it.each(table1)("should return true", ({ type, value, isSys }) => {
    expect(checkValueType(type as ValidType, value, isSys)).toBeTruthy();
  });

  const table2 = [
    { type: "number", value: "text", isSys: true },
    { type: "number", value: "text" },
    { type: "string", value: 1 },
    { type: "boolean", value: "text" },
    { type: "date", value: "2015-03-31", isSys: true },
    { type: "date", value: "text" },
  ];

  it.each(table2)("should return false", ({ type, value, isSys }) => {
    expect(checkValueType(type as ValidType, value, isSys)).toBeFalsy();
  });
});
