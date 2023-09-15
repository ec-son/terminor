import { ArgumentType } from "./argument.type";
import { HelpType } from "./option.type";

export type CommandType = {
  commandName: string;
  alias?: string;
  subCommands?: Array<string>;
  arguments?: Array<
    Omit<ArgumentType, "type"> & Partial<Pick<ArgumentType, "type">>
  >;
  usage?: string;
  description?: string;
  helpOption?: HelpType;

  /**
   * Indicates whether all required arguments must precede all optional arguments in the command line order.
   */
  requiredArgsFirst?: boolean;
};
