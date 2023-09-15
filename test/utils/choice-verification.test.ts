import { ValidType } from "../../src/types/valid.type";
import { choiceVerifing } from "../../src/utils/choice-verification";

/**
 * choiceVerifing
 */

describe("verifying a valid choice", () => {
  const table1: Array<{
    type: ValidType;
    choices: Array<number | string | boolean | Date>;
    flag?: "default" | "choice";
    expected: string;
  }> = [
    {
      type: "number",
      choices: ["text"],
      expected:
        "The value 'text' in the choices array is of an invalid type. Expected a number, but instead, a string was provided.",
    },
    {
      type: "string",
      choices: [1],
      expected:
        "The value '1' in the choices array is of an invalid type. Expected a string, but instead, a number was provided.",
    },
    {
      type: "boolean",
      choices: ["text"],
      expected:
        "The value 'text' in the choices array is of an invalid type. Expected a boolean, but instead, a string was provided.",
    },
    {
      type: "date",
      choices: ["text"],
      expected:
        "The value 'text' in the choices array is of an invalid type. Expected a date, but instead, a string was provided.",
    },
  ];
  it.each(table1)(
    "should throw a valid error when one or more values in array choices do not match the expected type",
    ({ type, choices, flag, expected }) => {
      expect(() => choiceVerifing(type, choices, flag)).toThrowError(expected);
    }
  );

  const table2: Array<{
    type: ValidType;
    choices: Array<number | string | boolean | Date>;
    flag?: "default" | "choice";
    expected: string;
  }> = [
    {
      type: "number",
      choices: ["text"],
      flag: "default",
      expected:
        "The default value 'text' is of an invalid type. Expected a number, but instead, a string was provided.",
    },
    {
      type: "string",
      choices: [1],
      flag: "default",
      expected:
        "The default value '1' is of an invalid type. Expected a string, but instead, a number was provided.",
    },
    {
      type: "boolean",
      choices: ["text"],
      flag: "default",
      expected:
        "The default value 'text' is of an invalid type. Expected a boolean, but instead, a string was provided.",
    },
    {
      type: "date",
      choices: ["text"],
      flag: "default",
      expected:
        "The default value 'text' is of an invalid type. Expected a date, but instead, a string was provided.",
    },
  ];
  it.each(table2)(
    "should throw a valid error when a default value doesn't not match the expected type",
    ({ type, choices, flag, expected }) => {
      expect(() => choiceVerifing(type, choices, flag)).toThrowError(expected);
    }
  );

  const table3: Array<{
    type: ValidType;
    choices: Array<number | string | boolean | Date>;
  }> = [
    { type: "number", choices: [1] },
    { type: "string", choices: ["text"] },
    { type: "boolean", choices: [true] },
    { type: "date", choices: [new Date()] },
  ];
  it.each(table3)(
    "should not throw an error when all values match the expected type",
    ({ type, choices }) => {
      expect(() => choiceVerifing(type, choices)).not.toThrow();
    }
  );
});
