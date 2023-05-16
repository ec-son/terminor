import { BaseOptionArgumentInterface } from "./base-option-argument.type";

export interface ArgumentType extends BaseOptionArgumentInterface {
  type: NumberConstructor | StringConstructor | DateConstructor;
}
