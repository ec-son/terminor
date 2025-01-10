import { ArgumentValueType } from "../types/argument.type";
import { MetaDataType } from "../types/metadata.type";
import { OptionValueType } from "../types/option.type";
import { commandContainer } from "./command-container";

export function parameterInit(
  flag: "args" | "options" | "unknown_option" | "excess_argument",
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number,
  argumentName?: string | string[]
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
      if (Array.isArray(argumentName)) {
        const _arg: any[] = [];
        let __arg: any;
        for (const element of argumentName) {
          __arg = (metadata[flag] as any).find((el) => {
            return [el.argumentName, el.optionName].includes(element);
          });
          if (__arg) _arg.push(__arg);
        }

        arg.argOpt = _arg;
      } else {
        const _arg = (metadata[flag] as any).find((el) => {
          return [el.argumentName, el.optionName].includes(argumentName);
        });
        if (!_arg) arg.argOpt = undefined;
        arg.argOpt = _arg;
      }
    } else {
      if (flag === "args" || flag === "options") arg.argOpt = metadata[flag];
      else {
        arg.argOpt =
          flag === "excess_argument"
            ? metadata.excessArguments
            : metadata.unknownOptions;
      }
    }

    const findIndex = mtd.parameters.findIndex(
      (el) => el.index === parameterIndex
    );
    if (findIndex > -1) mtd.parameters.splice(findIndex, 1);
    mtd.parameters.push(arg);

    originalInitFunction.call(this);
  };
}
