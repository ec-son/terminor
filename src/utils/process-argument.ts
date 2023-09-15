import { Argument, Command } from "commander";
import { KsError } from "../exceptions/ks-error";
import { argumentValidator } from "./argument-validator";
import { choiceVerifing } from "./choice-verification";
import { ArgumentType } from "../types/argument.type";

export const processArgument = (
  args: Array<ArgumentType> | undefined,
  command: Command,
  commandName: string
): Array<ArgumentType> => {
  if (!args?.length) args = [];
  args.forEach((argument) => {
    choiceVerifing(
      argument.type,
      argument.choices || [],
      "choice",
      commandName
    );

    const dateDesc =
      argument.type === Date ? "  (e.g. YYYY-MM-DD = 2015-03-31)" : "";
    const newArg = new Argument(
      argument.argumentName,
      (argument.description || "") + dateDesc
    );

    if (argument.default) {
      if (
        argument?.choices &&
        argument?.choices?.length > 0 &&
        !argument.choices.includes(argument.default)
      ) {
        throw new KsError(
          `The default value provided is not valid according to the available choices. Valid choices are: ${argument.choices.join(
            ", "
          )}`,
          {
            type: "error",
            errorType: "InvalidDefaultValueError",
            commandName,
          }
        );
      }
      choiceVerifing(argument.type, [argument.default], "default", commandName);
      // newArg.default(argument.default);
    }

    // newArg.required = argument.required || false;
    newArg.required = false;

    newArg.argParser((value: any) => argumentValidator(value, argument));
    command.addArgument(newArg);
  });

  return args;
};
