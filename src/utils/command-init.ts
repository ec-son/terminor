import { KsError } from "../exceptions/ks-error";
import { ArgumentType } from "../types/argument.type";
import { CommandType } from "../types/command.type";
import { MetaDataType } from "../types/metadata.type";
import { HelpType } from "../types/option.type";
import { commandContainer } from "./command-container";
import { processArgument } from "./process-argument";

export function commandInit(
  name: string,
  context: CommandType
): { metadata: MetaDataType; index: Symbol } {
  const index = commandContainer.getCommand(name)?.index;

  if (!index)
    throw new KsError(
      `An error occurred during the initialization of the '${name}' command. Please check your code and try again.`,
      { type: "error", errorType: "CommandInitializationError" }
    );

  // help
  const help: HelpType = {
    description: "display help for command",
    disabled: false,
    flag: "--help",
    alias: "-h",
  };

  if (context?.helpOption) {
    const helpOption = context.helpOption;
    const keys = Object.keys(helpOption) as Array<keyof HelpType>;

    for (const key of keys) {
      (help[key] as any) = helpOption[key];
    }
  } else if (typeof context.helpOption === "boolean") help.disabled = true;

  // sub command names
  const subCommandNames = [...new Set(context?.subCommands)];

  // arguments
  let args = processArgument(context?.arguments as Array<ArgumentType>, name);
  if (context.requiredArgsFirst)
    args = args.sort((a, b) => {
      if (a.required && !b.required) return -1;
      else if (!a.required && b.required) return 1;
      else return 0;
    });

  const metadata: MetaDataType = {
    alias: context.alias,
    args,
    commandName: context.commandName,
    excessArguments: [],
    help,
    handlers: [
      {
        methodKey: "handler",
        on: "handler",
        parameters: [],
      },
    ],
    options: [],
    subCommandNames,
    description: context.description,
    unknownOptions: [],
    usage: context.usage,
  };

  return { metadata, index };
}
