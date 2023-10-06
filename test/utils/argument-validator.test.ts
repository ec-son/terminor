import { ArgumentType, ArgumentValueType } from "../../src/types/argument.type";
import { argumentValidator } from "../../src/utils/argument-validator";
import * as tools from "../../src/tools/ter-exit";

const mockTerExit = jest.spyOn(tools, "terExit");

/**
 * argumentValidator
 */

describe("argument validation and transform", () => {
  const table1: Array<
    { expected: any } & Pick<ArgumentValueType, "type" | "transform" | "value">
  > = [
    { value: "1", type: "number", expected: 1 },
    {
      value: "7",
      type: "number",
      transform(value, transform) {
        const age = transform() as number;
        return age + 3;
      },
      expected: 10,
    },
    { value: "2000/3/5", type: "date", expected: new Date("2000/3/5") },
    { value: "text", type: "string", expected: "text" },
  ];

  it.each(table1)(
    "should a valid value",
    ({ value, type, transform, expected }) => {
      if (type === "number")
        expect(
          argumentValidator(value, { type, transform, argumentName: "" })
        ).toBe(expected);
      else if (type === "date")
        expect(argumentValidator(value, { type, argumentName: "" })).toEqual(
          expected
        );
      else
        expect(argumentValidator(value, { type, argumentName: "" })).toMatch(
          expected
        );
    }
  );

  it("should call terExit function", () => {
    mockTerExit.mockImplementationOnce(jest.fn());
    argumentValidator("text", {
      argumentName: "",
      type: "number",
      validator(value, validator) {
        return typeof value === "number";
      },
    });

    expect(mockTerExit).toBeCalled();
  });

  const table2 = [
    { flag: undefined, expected: "argument" },
    { flag: "opt" as const, expected: "option" },
  ];
  it.each(table2)(
    "should throw with expected error (argument or option)",
    ({ flag, expected }) => {
      const regExp = new RegExp(`The .*age.* ${expected} .* number`);
      expect(() =>
        argumentValidator("text", {
          type: "number",
          argumentName: "age",
          flag,
        })
      ).toThrow(regExp);
    }
  );

  it("should throw with personalized error", () => {
    expect(() =>
      argumentValidator("text", {
        argumentName: "",
        type: "number",
        onError(value, errorType) {
          return "error of value";
        },
      })
    ).toThrow(/^error of value$/);
  });

  const table3: Array<
    { value: any } & Pick<ArgumentType, "type" | "transform">
  > = [
    { value: "text", type: "number" },
    { value: "text", type: "date" },
  ];

  it.each(table3)(
    "should throw when value is not a expected type",
    ({ value, type }) => {
      expect(() =>
        argumentValidator(value, { type, argumentName: "" })
      ).toThrow();
    }
  );

  // it("should treat default values", () => {
  //   expect(
  //     transformDefaultValue({ type: "date", default: "2000/3/5" })
  //   ).toEqual(new Date("2000/3/5"));
  // });
});
