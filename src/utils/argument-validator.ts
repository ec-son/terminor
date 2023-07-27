import { green } from "ansi-colors";
import { KsError } from "../exceptions/ks-error";
import { checkValueType, getValueType } from "./check-value-type";
import { BaseOptionArgumentInterface } from "../types/base-option-argument.type";
import { terExit } from "../tools";
import { ValidType } from "../types/utilities.type";

/**
 * used for validation of value
 * @param value - The value to be checked
 * @param argument - metadata of argument to be used when checking
 * @param flag - used to check whether value is argument or option
 * @returns
 */
export function argumentValidator(
  value: any,
  argument: BaseOptionArgumentInterface & {
    type: ValidType;
    optionName?: string;
    argumentName?: string;
  },
  flag?: "opt" | "arg"
) {
  if (flag === "opt" && argument.type === Boolean) return value;

  if (argument.validator) {
    const result = argument.validator(value, () => {
      validator(value, argument, flag);
    });

    if (typeof result === "boolean" && !result) terExit();
  } else validator(value, argument, flag);

  if (argument.transform) {
    return argument.transform(value, () => {
      return transform(value, argument.type);
    });
  } else return transform(value, argument.type);
}

export function transformDefaultValue(
  argument: BaseOptionArgumentInterface & { type: ValidType }
) {
  if (argument.transform) {
    return argument.transform(argument.default, () => {
      return transform(argument.default, argument.type);
    });
  } else return transform(argument.default, argument.type);
}

function validator(
  value: any,
  argument: BaseOptionArgumentInterface & {
    type: ValidType;
    optionName?: string;
    argumentName?: string;
  },
  flag?: "opt" | "arg"
): void {
  const _name = argument.argumentName || argument.optionName;
  if (!checkValueType(argument.type, value)) {
    throw new KsError(
      (argument.onError && argument.onError(value, "InvalidTypeError")) ||
        `The ${green("'" + _name + "'")} ${
          flag && flag === "opt" ? "option" : "argument"
        } must be a ${getValueType(argument.type)}`,
      {
        type: "error",
        errorType: "InvalidTypeError",
      }
    );
  }

  if (argument.type === Number) value = parseFloat(value);
  else if (argument.type === Date) value = new Date(value);

  if (argument.choices && !argument.choices.includes(value)) {
    throw new KsError(
      (argument.onError && argument.onError(value, "InvalidChoiceError")) ||
        `The value provided for ${green("'" + _name + "'")} ${
          flag && flag === "opt" ? "option" : "argument"
        } is not valid. Valid choices are: ${argument.choices.join(", ")}`,
      { type: "error", errorType: "InvalidChoiceError" }
    );
  }
}

function transform(value: any, type: ValidType): any {
  if (type === Number) value = parseFloat(value);
  else if (type === Date) value = new Date(value);

  return value;
}
