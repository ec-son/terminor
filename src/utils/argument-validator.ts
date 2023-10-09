import { green } from "ansi-colors";
import { KsError } from "../exceptions/ks-error";
import { checkValueType } from "./check-value-type";
import { terExit } from "../tools";
import { ValidType } from "../types/valid.type";
import { OptionValueType } from "../types/option.type";
import { ArgumentValueType } from "../types/argument.type";
import { isEqual } from "./is-equal";

/**
 * used for validation of value
 * @param argument metadata of argument to be used when checking
 * @returns
 */
export function argumentValidator(
  value: any,
  argument: OptionValueType | ArgumentValueType
): any {
  if (argument.treated) return argument.value;
  if (argument["flag"] && argument.type === "boolean") return !!value;

  if (argument.trim) value = value?.trim();

  if (!value) {
    if (argument.default)
      return argument.variadic ? [argument.default] : argument.default;
    if (argument.required)
      throw new KsError(
        (argument.onError && argument.onError(value, "MissingValueError")) ||
          `Missing value for required ${
            argument["flag"] ? "option" : "argument"
          } '${argument["argumentName"] || argument["optionName"]}'`,
        {
          errorType: "MissingValueError",
        }
      );
    return undefined;
  }

  if (argument.validator) {
    const result = argument.validator(value, () => {
      validator(value, argument);
    });

    if (typeof result === "boolean" && !result) terExit();
  } else validator(value, argument);

  if (argument.transform) {
    return argument.transform(value, () => {
      return transform(value, argument.type);
    });
  } else return transform(value, argument.type);
}

function validator(
  value: any,
  argument: OptionValueType | ArgumentValueType
): void {
  const flag = argument["flag"] ? "opt" : "arg";
  const _name = argument["argumentName"] || argument["optionName"];

  if (!checkValueType(argument.type, value)) {
    throw new KsError(
      (argument.onError && argument.onError(value, "InvalidTypeError")) ||
        `The ${green("'" + _name + "'")} ${
          flag && flag === "opt" ? "option" : "argument"
        } must be a ${argument.type}`,
      {
        type: "error",
        errorType: "InvalidTypeError",
      }
    );
  }

  if (argument.type === "number") value = parseFloat(value);
  else if (argument.type === "date") value = new Date(value);

  if (argument.choices && !argument.choices.find((el) => isEqual(el, value))) {
    throw new KsError(
      (argument.onError && argument.onError(value, "InvalidChoiceError")) ||
        `The value provided for ${green("'" + _name + "'")} ${
          flag && flag === "opt" ? "option" : "argument"
        } is not valid. Valid choices are: ${argument.choices
          .map((el) => JSON.stringify(el))
          .join(", ")}`,
      { type: "error", errorType: "InvalidChoiceError" }
    );
  }
}

function transform(value: any, type: ValidType): any {
  if (type === "number") value = parseFloat(value);
  else if (type === "date") value = new Date(value);

  return value;
}
