import { BaseOptionArgumentInterface } from "./base-option-argument.type";
import { ValidType } from "./utilities.type";

export interface OptionType extends BaseOptionArgumentInterface {
  type: ValidType;
  optionName: string;
  alias?: string; // alias
}
