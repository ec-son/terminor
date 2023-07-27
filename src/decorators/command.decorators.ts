import { Command as _C } from "commander";
import { KsError } from "../exceptions/ks-error";
import { commandContainer } from "../utils/command-container";
import { processArgument } from "../utils/process-argument";
import { processHandler } from "../utils/process-handler";
import { initSubCommand } from "../utils/sub-command-init";
import { CommandType } from "../types/command.type";

export function Command(context: CommandType) {
  return function (target: Function) {
    const originalInitFunction: Function =
      target.prototype.init || function () {};

    target.prototype.init = function (program: _C) {
      if (this["postAction"])
        program.hook("postAction", () => {
          this.postAction();
        });

      if (program instanceof _C == false)
        throw new KsError(
          `Expected a command class, but received a different type: ${typeof program}`,
          { type: "error", errorType: "InvalidTypeError" }
        );

      program.name(context.commandName);

      const commandNameIndex = commandContainer.getCommand(
        target.name
      )?.commandNameIndex;

      if (!commandNameIndex)
        throw new KsError(
          `An error occurred during the initialization of the '${target.name}' command. Please check your code and try again.`,
          { type: "error", errorType: "CommandInitializationError" }
        );
      this[commandNameIndex] = context.commandName;

      if (context.description) program.description(context.description);
      if (context.usage) program.usage(context.usage);
      if (context.alias) program.alias(context.alias);

      if (context?.helpOption) {
        program.helpOption(
          context.helpOption.flag,
          context.helpOption.description
        );

        if (context.helpOption.addHelpText)
          program.addHelpText(
            context.helpOption.addHelpText.position,
            context.helpOption.addHelpText.text
          );
      }

      const args = processArgument(context?.arguments, program, target.name);
      program.action((...arg: any) =>
        processHandler(args, program, this, target.name)
      );

      const subCommands = [...new Set(context?.subCommands)];
      const commandInfo = commandContainer.getCommand(target.name);

      if (!commandInfo)
        throw new KsError(
          `An error occurred during the initialization of the '${target.name}' command. Please check your code and try again.`,
          { type: "error", errorType: "CommandInitializationError" }
        );

      this[commandInfo.subCommandIndex] = subCommands || [];
      this[commandInfo.optionIndex] = [];

      originalInitFunction.call(this, program);
    };

    target.prototype.initSubCommand = initSubCommand;
  };
}
