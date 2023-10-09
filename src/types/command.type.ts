import { ArgumentType } from "./argument.type";
import { HelpType } from "./option.type";

export type CommandType = {
  /**
   * The name of the command.
   */
  commandName: string;

  /**
   * An optional alias for the command.
   */
  alias?: string;

  /**
   * An array of sub-commands associated with the command.
   */
  subCommands?: Array<string>;

  /**
   * An array of arguments associated with the command.
   */
  arguments?: Array<
    Omit<ArgumentType, "type"> & Partial<Pick<ArgumentType, "type">>
  >;

  /**
   * A usage example for the command.
   */
  usage?: string;

  /**
   * A description of the command.
   */
  description?: string;

  /**
   * An optional help option for the command.
   */
  helpOption?: boolean | HelpType;

  /**
   * Indicates whether all required arguments must precede all optional arguments in the command line order.
   */
  requiredArgsFirst?: boolean;
};
