import { BaseOptionArgumentInterface } from "./base-option-argument.type";
import { ValidType } from "./valid.type";

export type OptionType = BaseOptionArgumentInterface & {
  /**
   * The type of the option value.
   */
  type: ValidType;

  /**
   * The name of the option.
   */
  optionName: string;

  /**
   * An optional alias for the option.
   */
  alias?: string;

  /**
   * An optional flag for the option.
   */
  flag?: string;
};

export type HelpType = {
  /**
   * The alias for the help.
   */
  alias?: string;
  /**
   * The description for the help.
   */
  description?: string;
  /**
   * The flag for the help.
   */
  flag?: string;
  /**
   * The text for the help.
   */
  text?: string;
  /**
   * Indicates if the help is disabled.
   */
  disabled?: boolean;
  /**
   * Additional help text.
   */
  addHelpText?: {
    /**
     * The position of the additional help text.
     * Possible values: "after" or "before".
     */
    position: "after" | "before";
    /**
     * The text of the additional help.
     */
    text: string;
  };
};

export type VersionType = {
  /**
   * An alias for the version type.
   */
  alias?: string;

  /**
   * A description of the version type.
   */
  description?: string;

  /**
   * Indicates whether the version type is disabled or not.
   */
  disabled?: boolean;

  /**
   * A flag associated with the version type.
   */
  flag?: string;

  /**
   * The text to display instead of the version number.
   * If provided, this text will be displayed instead of the version number.
   */
  text?: string;

  /**
   * The version number.
   */
  version?: string;

  /**
   * Additional version text configuration.
   */
  addVersionText?: {
    /**
     * The position of the additional version text.
     */
    position: "after" | "before";

    /**
     * The text to be added.
     */
    text: string;
  };
};

export type OptionValueType = OptionType & {
  value: any;
  treated?: boolean;
  propertyName: string;
};
