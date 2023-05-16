import { KsError } from "../exceptions/ks-error";
import { Command } from "commander";
import { ArgumentType, OptionType, ValidType } from "../types";

export const processHandler = (
  args: Array<ArgumentType>,
  command: Command,
  _command: any
) => {
  const opts: Array<OptionType & { propertyName: string }> = _command._opts;
  const optsData = command.opts();

  opts.forEach((opt) => {
    const key = Object.keys(optsData).find((key) => opt.name.includes(key));

    if (
      !opt.required &&
      opt.type &&
      ([Number, String, Date] as Array<ValidType>).includes(opt.type) &&
      (!key || typeof optsData[key] === "boolean")
    ) {
      if (key && typeof optsData[key] === "boolean" && opt.default)
        _command[opt.propertyName] = opt.default;
      else _command[opt.propertyName] = undefined;
    } else if (
      opt.required &&
      opt.type &&
      ([Number, String, Date] as Array<ValidType>).includes(opt.type) &&
      (!key || typeof optsData[key] === "boolean")
    )
      throw new KsError(`option ${opt.name} argument missing`, {
        type: "error",
      });
    else _command[opt.propertyName] = optsData[key!];
  });

  const objs: Array<{
    name: string;
    value: any;
  }> = [];
  let i = 0;

  command.processedArgs.forEach((value) => {
    if (i < args.length) {
      const arg = args[i];
      if (arg.required || value) objs.push({ name: arg.name, value });
    }
    i++;
  });

  _command.handler(objs);
};
