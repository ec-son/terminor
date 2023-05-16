import { green } from "ansi-colors";
import { KsError } from "../exceptions/ks-error";
import { BaseOptionArgumentInterface } from "../types/base-option-argument.type";
import { ValidType } from "../types";
import { checkValueType, getValueType } from "./check-value-type";

export const argumentValidator = (
  value: any,
  argument: BaseOptionArgumentInterface & {
    type: ValidType;
  },
  flag?: "opt" | "arg"
) => {
  if (!checkValueType(argument.type, value))
    throw new KsError(
      `The ${green("'" + argument.name + "'")} ${
        flag && flag === "opt" ? "option" : "argument"
      } must be a ${getValueType(argument.type)}`,
      {
        type: "error",
        errorType: "InvalidTypeError",
      }
    );

  if (argument.type === Number) value = parseFloat(value);
  else if (argument.type === Date) value = new Date(value);

  if (argument.choices && !argument.choices.includes(value)) {
    throw new KsError(
      `The value provided for ${green("'" + argument.name + "'")} ${
        flag && flag === "opt" ? "option" : "argument"
      } is not valid. Valid choices are: ${argument.choices.join(", ")}`,
      { type: "error", errorType: "InvalidChoiceError" }
    );
  }

  if (argument.argParse) return argument.argParse(value);
  return value;
};
