import { BaseOptionArgumentInterface } from "./base-option-argument.type";
import { ValidType } from "./valid.type";

export type OptionType = BaseOptionArgumentInterface & {
  type: ValidType;
  optionName: string;
  alias?: string;
  flag?: string;
};

export type HelpType = {
  alias?: string;
  description?: string;
  flag?: string;
  text?: string;
  disabled?: boolean;
  addHelpText?: {
    position: "after" | "before";
    text: string;
  };
};

export type VersionType = {
  alias?: string;
  description?: string;
  disabled?: boolean;
  flag?: string;
  text?: string;
  version?: string;
  addVersionText?: {
    position: "after" | "before";
    text: string;
  };
};

export type OptionValueType = OptionType & {
  value: any;
  treated?: boolean;
};
