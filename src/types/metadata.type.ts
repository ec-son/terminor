import { ArgumentValueType } from "./argument.type";
import { EventType } from "./config-cli.type";
import { HelpType, OptionValueType, VersionType } from "./option.type";

export type MetaDataType = {
  alias?: string;
  args: Array<ArgumentValueType>;
  commandName: string;
  description?: string;
  help: HelpType;
  handlers: Array<{
    methodKey: string | symbol;
    on: EventType;
    trigger?: string | string[];
    parameters: Array<{
      argOpt?:
        | ArgumentValueType
        | OptionValueType
        | Array<string>
        | Array<ArgumentValueType | OptionValueType>
        | Array<{ optionName: string; value: any }>;
      index: number;
      flag: "args" | "options" | "unknown_option" | "excess_argument";
    }>;
  }>;
  options: Array<OptionValueType>;
  subCommandNames: Array<string>;
  version?: VersionType;
  usage?: string;
  unknownOptions: Array<{ optionName: string; value: any }>;
  excessArguments: string[];
};
