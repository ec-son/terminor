import { Argument, Command } from "commander";
import { ArgumentOption } from "../interfaces";
import { argumentValidator } from "../helpers";

export const processArgument = (
  args: Array<ArgumentOption> | undefined,
  command: Command
): Array<ArgumentOption> => {
  if (!args?.length) args = [];
  args.forEach((argument) => {
    const dateDesc =
      argument.type === "date" ? "  (e.g. YYYY-MM-DD = 2015-02-31)." : "";
    const newArg = new Argument(argument.name, argument.description + dateDesc);
    if (argument.defeault) newArg.default(argument.defeault);
    newArg.required = argument.required || false;

    newArg.argParser((value: any) => argumentValidator(value, argument));
    command.addArgument(newArg);
  });

  return args;
};
