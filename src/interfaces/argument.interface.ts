import { BaseOptionArgumentInterface } from "./base-option-argument.interface";

export interface ArgumentType extends BaseOptionArgumentInterface {
  type?: "string" | "number" | "float" | "date";
}
