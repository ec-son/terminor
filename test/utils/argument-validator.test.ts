import { ArgumentType } from "../../src/types/argument.type";
import {
  argumentValidator,
  transformDefaultValue,
} from "../../src/utils/argument-validator";
import * as tools from "../../src/tools/ter-exit";

const mockTerExit = jest.spyOn(tools, "terExit");

/**
 * argumentValidator
 * transformDefaultValue
 */

describe("argument validation and transform", () => {
  const table1: Array<
    { value: any; expected: any } & Pick<ArgumentType, "type" | "transform">
  > = [
    { value: "1", type: Number, expected: 1 },
    {
      value: "7",
      type: Number,
      transform(value, transform) {
        const age = transform() as number;
        return age + 3;
      },
      expected: 10,
    },
    { value: "2000/3/5", type: Date, expected: new Date("2000/3/5") },
    { value: "text", type: String, expected: "text" },
  ];

  it.each(table1)(
    "should a valid value",
    ({ value, type, transform, expected }) => {
      if (type === Number)
        expect(argumentValidator(value, { type, transform })).toBe(expected);
      else if (type === Date)
        expect(argumentValidator(value, { type })).toEqual(expected);
      else expect(argumentValidator(value, { type })).toMatch(expected);
    }
  );

  it("should call terExit function", () => {
    mockTerExit.mockImplementationOnce(jest.fn());
    argumentValidator("text", {
      type: Number,
      validator(value, validator) {
        return typeof value === "number";
      },
    });

    expect(mockTerExit).toBeCalled();
  });

  const table2 = [
    { flag: "arg" as const, expected: "argument" },
    { flag: "opt" as const, expected: "option" },
  ];
  it.each(table2)(
    "should throw with expected error (argument or option)",
    ({ flag, expected }) => {
      const regExp = new RegExp(`The .*age.* ${expected} .* number`);
      expect(() =>
        argumentValidator(
          "text",
          {
            type: Number,
            argumentName: "age",
          },
          flag
        )
      ).toThrow(regExp);
    }
  );

  it("should throw with personalized error", () => {
    expect(() =>
      argumentValidator("text", {
        type: Number,
        onError(value, errorType) {
          return "error of value";
        },
      })
    ).toThrow(/^error of value$/);
  });

  const table3: Array<
    { value: any } & Pick<ArgumentType, "type" | "transform">
  > = [
    { value: "text", type: Number },
    { value: "text", type: Date },
  ];

  it.each(table3)(
    "should throw when value is not a expected type",
    ({ value, type }) => {
      expect(() => argumentValidator(value, { type })).toThrow();
    }
  );

  it("should treat default values", () => {
    expect(transformDefaultValue({ type: Date, default: "2000/3/5" })).toEqual(
      new Date("2000/3/5")
    );
  });
});
