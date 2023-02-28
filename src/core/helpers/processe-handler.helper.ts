import { Command } from "commander";
import { ArgumentOption } from "../interfaces";

export const processHandler = (
  args: Array<ArgumentOption>,
  command: Command,
  _command: any
) => {
  console.log(command.opts());

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
