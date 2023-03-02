import { KsError } from "../exceptions/ks-error";
import { BaseOptionArgumentInterface } from "../interfaces/base-option-argument.interface";

export const argumentValidator = (
  value: any,
  argument: BaseOptionArgumentInterface & {
    type?: "string" | "number" | "float" | "boolean" | "date";
  },
  flag?: "opt" | "arg"
) => {
  switch (argument.type) {
    case "number":
      if (!Number.isInteger(parseInt(value)))
        throw new KsError(`'${argument.name}' argument must be a number`, {
          type: "error",
        });
      value = parseInt(value);
      break;
    case "float":
      if (!Number.isInteger(parseInt(value)))
        throw new KsError(`'${argument.name}' argument must be a float`, {
          type: "error",
        });
      value = parseFloat(value);
      break;
    case "date":
      if (!/^.+[\/|\-].+$/.test(value) || Number.isNaN(Date.parse(value)))
        throw new KsError(`'${argument.name}' argument must be a date`, {
          type: "error",
        });
      value = new Date(value);
      break;
  }

  if (argument.choices && !argument.choices.includes(value)) {
    const choices = argument.choices.join(", ");
    const _name = argument.name;
    let msg = `command-argument value '${value}' is invalid for argument '${_name}'. Allowed choices are ${choices}.`;
    if (flag && flag === "opt")
      msg = `option '${_name}' argument '${value}' is invalid. Allowed choices are ${choices}.`;
    throw new KsError(msg, { type: "error" });
  }

  if (argument.argParse) return argument.argParse(value);
  return value;
};
