import { BaseOptionArgumentInterface } from "./base-option-argument.type";
import { ValidType } from "./valid.type";

export type ArgumentType = BaseOptionArgumentInterface & {
  type: Exclude<ValidType, "boolean">;
  argumentName: string;
};

export type ArgumentValueType = ArgumentType & {
  value?: any;
  treated?: boolean;
};
