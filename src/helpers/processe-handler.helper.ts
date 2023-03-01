import { Command } from "commander";
import { ArgumentType, OptionType } from "../interfaces";

export const processHandler = (
  args: Array<ArgumentType>,
  command: Command,
  _command: any
) => {
  const opts: Array<OptionType & { propertyName: string }> = _command.opts;
  const optsData = command.opts();

  Object.keys(optsData).forEach((key) => {
    const opt = opts.find((opt) => opt.name.includes(key));
    if (!opt) return;

    if (
      !opt.required &&
      opt.type &&
      ["string", "number", "float", "date"].includes(opt.type)
    )
      optsData[key] = undefined;
    _command[opt.propertyName] = optsData[key];
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
