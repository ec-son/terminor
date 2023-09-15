import { ArgumentValueType } from "./argument.type";
import { HelpType, OptionValueType, VersionType } from "./option.type";

export type MetaDataType = {
  alias?: string;
  args: Array<ArgumentValueType>;
  commandName: string;
  description?: string;
  help: HelpType;
  options: Array<OptionValueType>;
  subCommandNames: Array<string>;
  version?: VersionType;
  usage?: string;
};
