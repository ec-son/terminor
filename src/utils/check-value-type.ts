import { ValidType } from "../types/utilities.type";

export function checkValueType(type: ValidType, value: any, isSys?: boolean) {
  if (type === Number) {
    if (isSys) return typeof value === "number";
    else return Number.isInteger(parseInt(value));
  } else if (type === String) return typeof value === "string";
  else if (type === Boolean) return typeof value === "boolean";
  else if (type === Date) {
    if (isSys) return value instanceof Date;
    else if (typeof value === "string")
      return (
        /^\d{1,4}[\/|\-]\d{1,4}[\/|\-]\d{1,4}$/.test(value) &&
        !Number.isNaN(Date.parse(value))
      );
  }
  return false;
}

export function getValueType(type: ValidType) {
  if (type === Number) return "number";
  else if (type === Boolean) return "boolean";
  else if (type === Date) return "date";
  else return "string";
}
