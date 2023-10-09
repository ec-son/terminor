import { ValidType } from "../types/valid.type";

/**
 * check if the type of the given value matches the specified type.
 * Optionally, you can specify if the data was provided by a user or developer
 *
 * @param {ValidType} type The valid type to check against.
 * @param {*} value The value to check its type.
 * @param {boolean} [isSys=false] A flag indicating whether the data was provided by a system (developer) or user
 * @returns {boolean} Returns true if the type of the value matches, false otherwise.
 */
export function checkValueType(type: ValidType, value: any, isSys?: boolean) {
  if (type === "number" && !isSys) return Number.isInteger(parseInt(value));
  else if (type === "date") {
    if (isSys) return value instanceof Date;
    else if (typeof value === "string")
      return (
        /^\d{1,4}([\/|\-]\d{1,4})?([\/|\-]\d{1,4})?$/.test(value) &&
        !Number.isNaN(Date.parse(value))
      );
  }
  return typeof value === type;
}
