import { BaseOptionArgumentInterface } from "./base-option-argument.type";
import { ValidType } from "./valid.type";

export type ArgumentType = BaseOptionArgumentInterface & {
  /**
   * Type of the argument.
   */
  type: Exclude<ValidType, "boolean">;

  /**
   * Name of the argument.
   */
  argumentName: string;
};

export type ArgumentValueType = ArgumentType & {
  /**
   * Value of the argument.
   */
  value?: any;

  /**
   * Indicates if the argument has been treated.
   */
  treated?: boolean;
};
