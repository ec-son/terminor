import { ArgumentType } from "./argument.interface";

export interface CommandType {
  commandName: string; // Set the name of the command
  alias?: string;
  subCommands?: Array<string>;
  arguments?: Array<ArgumentType>;
  usage?: string;
  description?: string;
  helpOption?: {
    flag?: string;
    description?: string;
  };
}
