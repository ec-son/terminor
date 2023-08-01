import { KsError } from "../exceptions/ks-error";
import { Command } from "commander";
import { TerData } from "../tools/terData";
import { commandContainer } from "./command-container";
import { ArgumentType } from "../types/argument.type";
import { OptionType } from "../types/option.type";
import { transformDefaultValue } from "./argument-validator";

/**
 *
 * @param args argument supplied by user.
 * @param command instance of commander
 * @param _command instance of current command
 * @param commandName name of the command
 */
export function processHandler(
  args: Array<ArgumentType>,
  command: Command,
  _command: any,
  commandName: string
) {
  const optionIndex = commandContainer.getCommand(commandName)?.optionIndex;
  let opts: Array<OptionType & { propertyName: string }> = [];
  let optsData = {};

  if (optionIndex) {
    opts = _command[optionIndex];
    optsData = command.opts();
  }

  opts.forEach((opt) => {
    const key = Object.keys(optsData).find((key) =>
      opt.optionName.includes(key)
    );

    if (opt.type === Boolean) {
      if (key) _command[opt.propertyName] = true;
      else {
        _command[opt.propertyName] = false;
        optsData[opt.propertyName] = false;
      }
    } else {
      if (
        opt.required &&
        !opt.default &&
        (!key || typeof optsData[key] === "boolean")
      )
        throw new KsError(
          (opt.onError && opt.onError(undefined, "MissingValueError")) ||
            `Missing value for required option '${opt.optionName}'`,
          {
            errorType: "MissingValueError",
          }
        );
      else if (!opt.default && key && typeof optsData[key] === "boolean") {
        throw new KsError(
          (opt.onError && opt.onError(undefined, "MissingValueError")) ||
            `Missing value for option '${opt.optionName}'`,
          {
            errorType: "MissingValueError",
          }
        );
      }

      if (key && typeof optsData[key] !== "boolean") {
        if (key) _command[opt.propertyName] = optsData[key!];
        else if (opt.default) {
          const value = transformDefaultValue(opt);
          _command[opt.propertyName] = value;
          optsData[key] = value;
        }
      } else {
        if (opt.default) {
          const value = transformDefaultValue(opt);
          _command[opt.propertyName] = value;
          optsData[opt.optionName] = value;
        } else if (key) delete optsData[key];
      }
    }

    // if (
    //   !opt.required &&
    //   opt.type &&
    //   ([Number, String, Date] as Array<ValidType>).includes(opt.type) &&
    //   (!key || typeof optsData[key] === "boolean")
    // ) {
    //   if (key && typeof optsData[key] === "boolean" && opt.default) {
    //     console.log("on");

    //     _command[opt.propertyName] = opt.default;
    //   } else _command[opt.propertyName] = undefined;
    // } else if (
    //   opt.required &&
    //   opt.type &&
    //   ([Number, String, Date] as Array<ValidType>).includes(opt.type) &&
    //   (!key || typeof optsData[key] === "boolean")
    // )
    //   throw new KsError(
    //     (opt.onError && opt.onError(undefined, "MissingValueError")) ||
    //       `Missing value for required option '${opt.optionName}'`,
    //     {
    //       errorType: "MissingValueError",
    //     }
    //   );
    // else _command[opt.propertyName] = optsData[key!];
  });

  const objs: Array<{
    name: string;
    value: any;
  }> = [];
  let i = 0;

  command.processedArgs.forEach((value) => {
    if (i < args.length) {
      const arg = args[i];

      if (!value && arg.default) {
        value = transformDefaultValue(arg);
      }

      if (arg.required && !value)
        if (!value)
          throw new KsError(
            (arg.onError && arg.onError(value, "MissingValueError")) ||
              `Missing value for required argument '${arg.argumentName}'`,
            {
              errorType: "MissingValueError",
            }
          );

      objs.push({ name: arg.argumentName, value });
    }
    i++;
  });

  if (!_command.handler)
    throw new KsError("Undefined handler method", {
      errorType: "MethodNotFoundError",
      commandName,
    });

  const paramsObj = new TerData(objs, optsData);

  _command.handler(paramsObj);
}
