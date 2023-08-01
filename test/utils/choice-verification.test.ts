import { ValidType } from "../../src/types/utilities.type";
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
      type: Number,
      choices: ["text"],
      expected:
        "The value 'text' in the choices array is of an invalid type. Expected a number, but instead, a string was provided.",
    },
    {
      type: String,
      choices: [1],
      expected:
        "The value '1' in the choices array is of an invalid type. Expected a string, but instead, a number was provided.",
    },
    {
      type: Boolean,
      choices: ["text"],
      expected:
        "The value 'text' in the choices array is of an invalid type. Expected a boolean, but instead, a string was provided.",
    },
    {
      type: Date,
      choices: ["text"],
      expected:
        "The value 'text' in the choices array is of an invalid type. Expected a Date, but instead, a string was provided.",
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
      type: Number,
      choices: ["text"],
      flag: "default",
      expected:
        "The default value 'text' is of an invalid type. Expected a number, but instead, a string was provided.",
    },
    {
      type: String,
      choices: [1],
      flag: "default",
      expected:
        "The default value '1' is of an invalid type. Expected a string, but instead, a number was provided.",
    },
    {
      type: Boolean,
      choices: ["text"],
      flag: "default",
      expected:
        "The default value 'text' is of an invalid type. Expected a boolean, but instead, a string was provided.",
    },
    {
      type: Date,
      choices: ["text"],
      flag: "default",
      expected:
        "The default value 'text' is of an invalid type. Expected a Date, but instead, a string was provided.",
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
    { type: Number, choices: [1] },
    { type: String, choices: ["text"] },
    { type: Boolean, choices: [true] },
    { type: Date, choices: [new Date()] },
  ];
  it.each(table3)(
    "should not throw an error when all values match the expected type",
    ({ type, choices }) => {
      expect(() => choiceVerifing(type, choices)).not.toThrow();
    }
  );
});
