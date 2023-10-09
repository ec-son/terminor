import { ArgumentValueType } from "./argument.type";
import { EventType } from "./config-cli.type";
import { HelpType, OptionValueType, VersionType } from "./option.type";

/**
 * Type definition for metadata of a command
 */
export type MetaDataType = {
  /**
   * Alias for the command
   */
  alias?: string;
  /**
   * Arguments for the command
   */
  args: Array<ArgumentValueType>;
  /**
   * Name of the command
   */
  commandName: string;
  /**
   * Description of the command
   */
  description?: string;
  /**
   * Help information for the command
   */
  help: HelpType;
  /**
   * Handlers for the command
   */
  handlers: Array<{
    /**
     * Method key for the handler
     */
    methodKey: string | symbol;
    /**
     * Event on which the handler triggers
     */
    on: EventType;
    /**
     * Trigger for the handler
     */
    trigger?: string | string[];
    /**
     * Parameters for the handler
     */
    parameters: Array<{
      /**
       * Argument or option value
       */
      argOpt?:
        | ArgumentValueType
        | OptionValueType
        | Array<string>
        | Array<ArgumentValueType | OptionValueType>
        | Array<{ optionName: string; value: any }>;
      /**
       * Index of the parameter
       */
      index: number;
      /**
       * Flag for the parameter
       */
      flag: "args" | "options" | "unknown_option" | "excess_argument";
    }>;

    isFirstHandler?: boolean;
  }>;
  /**
   * Options for the command
   */
  options: Array<OptionValueType>;
  /**
   * Subcommand names for the command
   */
  subCommandNames: Array<string>;
  /**
   * Version information for the command
   */
  version?: VersionType;
  /**
   * Usage information for the command
   */
  usage?: string;
  /**
   * Unknown options for the command
   */
  unknownOptions: Array<{ optionName: string; value: any }>;
  /**
   * Excess arguments for the command
   */
  excessArguments: string[];
};
