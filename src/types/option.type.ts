import { BaseOptionArgumentInterface } from "./base-option-argument.type";
import { ValidType } from "./utilities.type";

export interface OptionType extends BaseOptionArgumentInterface {
  type: ValidType;
  long?: string;
  short?: string;
}
