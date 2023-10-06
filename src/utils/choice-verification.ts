import { KsError } from "../exceptions/ks-error";
import { ValidType } from "../types/valid.type";

export function choiceVerifing(
  valueType: ValidType,
  choices: Array<number | string | boolean | Date>,
  flag: "default" | "choice" = "choice",
  commandName?: string
) {
  for (const value of choices) {
    if (
      typeof value === valueType ||
      (valueType === "date" && value instanceof Date)
    )
      break;
    throwException(value, flag, commandName, valueType);
    // if(valueType === 'date' && !(value instanceof Date))
    // if (valueType === "number") {
    //   if (typeof value !== "number")
    //     throwException(value, flag, commandName, "number");
    // } else if (valueType === "boolean") {
    //   if (typeof value !== "boolean")
    //     throwException(value, flag, commandName, "boolean");
    // } else if (valueType === "date") {
    //   if (!(value instanceof Date))
    //     throwException(value, flag, commandName, "Date");
    // } else if (valueType === "string") {
    //   if (typeof value !== "string")
    //     throwException(value, flag, commandName, "string");
    // } else {
    //   throwException(value, flag, commandName);
    // }
  }
}

function throwException(
  value: string | number | boolean | Date,
  flag: string,
  commandName?: string,
  type?: ValidType
) {
  const msg = `${
    flag === "choice"
      ? "value '" + value + "' in the choices array"
      : "default value '" + value + "'"
  } `;

  throw new KsError(
    `The ${msg}is of an invalid type. ${
      type
        ? "Expected a " +
          type +
          ", but instead, a " +
          typeof value +
          " was provided."
        : ""
    }`,
    { type: "error", errorType: "InvalidTypeError", commandName }
  );
}
