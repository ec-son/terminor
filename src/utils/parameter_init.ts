import { ArgumentValueType } from "../types/argument.type";
import { MetaDataType } from "../types/metadata.type";
import { OptionValueType } from "../types/option.type";
import { commandContainer } from "./command-container";

export function parameterInit(
  flag: "args" | "options" | "unknown_option" | "excess_argument",
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number,
  argumentName?: string
) {
  const originalInitFunction: Function =
    target["__init__parameter__"] || function () {};

  target["__init__parameter__"] = function () {
    const metadata = commandContainer.getCommand(this, true) as MetaDataType;

    let mtd = metadata.handlers.find((el) => el.methodKey === propertyKey);

    if (!mtd) return originalInitFunction.call(this);

    const arg: {
      argOpt?:
        | ArgumentValueType
        | OptionValueType
        | Array<string>
        | Array<ArgumentValueType | OptionValueType>
        | Array<{ optionName: string; value: any }>;
      index: number;
      flag: "args" | "options" | "unknown_option" | "excess_argument";
    } = { index: parameterIndex, flag };

    if (argumentName) {
      const _arg = (metadata[flag] as any).find((el) => {
        return "argumentName" in el
          ? el.argumentName === argumentName
          : el.optionName === argumentName;
      });
      if (!_arg) return;
      arg.argOpt = _arg;
    } else {
      if (flag === "args" || flag === "options") arg.argOpt = metadata[flag];
      else {
        arg.argOpt =
          flag === "excess_argument"
            ? metadata.excessArguments
            : metadata.unknownOptions;
      }
    }

    mtd.parameters.push(arg);

    originalInitFunction.call(this);
  };
}
