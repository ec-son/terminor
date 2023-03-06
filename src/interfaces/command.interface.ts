import { ArgumentType } from "./argument.interface";

export interface CommandType {
  commandName: string; // Set the name of the command
  commands?: Array<any>;
  arguments?: Array<ArgumentType>;
  usage?: string;
  description?: string;
  helpOption?: {
    name?: string;
    alias?: string;
  };
  alias?: string;
}
