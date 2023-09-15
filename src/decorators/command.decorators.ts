import { CommandType } from "../types/command.type";
import { commandInit } from "../utils/command-init";

export function Command(context: CommandType) {
  return function (target: Function) {
    const originalInitFunction: Function =
      target.prototype.init || function () {};

    target.prototype.init = function (config?: {
      globalRequiredArgsFirst?: boolean;
    }) {
      // if (
      //   context.requiredArgsFirst === undefined &&
      //   config?.globalRequiredArgsFirst
      // )
      //   context.requiredArgsFirst = config.globalRequiredArgsFirst;
      context.requiredArgsFirst ??= config?.globalRequiredArgsFirst;

      const { metadata, index } = commandInit(target.name, context);
      this[index as any] = metadata;
      originalInitFunction.call(this);

      // if (this["postAction"])
      //   program.hook("postAction", () => {
      //     this.postAction();
      //   });

      // if (program instanceof _C == false)
      //   throw new KsError(
      //     `Expected a command class, but received a different type: ${typeof program}`,
      //     { type: "error", errorType: "InvalidTypeError" }
      //   );

      // program.name(context.commandName);

      /* capsulate

      const index = commandContainer.getCommand(target.name)?.index;

      if (!index)
        throw new KsError(
          `An error occurred during the initialization of the '${target.name}' command. Please check your code and try again.`,
          { type: "error", errorType: "CommandInitializationError" }
        );

      const help: HelpType = {
        description: " display help for command",
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
      }

      const metadata: MetaDataType = {
        alias: context.alias,
        args: processArgument(context?.arguments, target.name),
        commandName: context.commandName,
        help,
        options: [],
        subCommandName: [...new Set(context?.subCommands)],
        description: context.description,
        usage: context.usage,
      };

**/

      // this[index] = context.commandName;

      // if (context.description) program.description(context.description);
      // if (context.usage) program.usage(context.usage);
      // if (context.alias) program.alias(context.alias);

      // if (context?.helpOption) {
      //   program.helpOption(
      //     context.helpOption.flag,
      //     context.helpOption.description
      //   );

      //   if (context.helpOption.addHelpText)
      //     program.addHelpText(
      //       context.helpOption.addHelpText.position,
      //       context.helpOption.addHelpText.text
      //     );
      // }

      // const args = processArgument(context?.arguments, target.name);
      // program.action((...arg: any) =>
      //   processHandler(args, program, this, target.name)
      // );

      // const subCommands = [...new Set(context?.subCommands)];
      // const commandInfo = commandContainer.getCommand(target.name);

      // if (!commandInfo)
      //   throw new KsError(
      //     `An error occurred during the initialization of the '${target.name}' command. Please check your code and try again.`,
      //     { type: "error", errorType: "CommandInitializationError" }
      //   );

      // this[commandInfo.subCommandIndex] = subCommands || [];
      // this[commandInfo.optionIndex] = [];

      // originalInitFunction.call(this);
    };

    // target.prototype.initSubCommand = initSubCommand;
  };
}
