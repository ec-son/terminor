import { BaseOptionArgumentInterface } from "./base-option-argument.interface";

export interface OptionType extends BaseOptionArgumentInterface {
  type?: "string" | "number" | "float" | "boolean" | "date";
}
