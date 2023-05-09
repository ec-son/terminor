import { Command as _C } from "commander";
import { KsError } from "../exceptions/ks-error";
import { CommandType } from "../types";
import { commandContainer } from "../utils/command-container";
import { processArgument } from "../utils/process-argument";
import { processHandler } from "../utils/process-handler";
import { initSubCommand } from "../types/sub-command-init";

export function Command(context: CommandType) {
  return function (target: Function) {
    const originalInitFunction: Function =
      target.prototype.init || function () {};

    target.prototype.init = function (program: _C) {
      if (program instanceof _C == false)
        throw new KsError(
          `Command class is expected but got ${typeof program}`,
          { type: "error" }
        );

      program.name(context.commandName);

      const commandNameIndex = commandContainer.getCommand(
        target.name
      )?.commandNameIndex;

      if (!commandNameIndex)
        throw new KsError(
          `An error occurred during the initialization of the '${target.name}' command. Please check your code and try again.`,
          { type: "error", typeError: "CommandInitializationError" }
        );
      this[commandNameIndex] = context.commandName;

      if (context.description) program.description(context.description);
      if (context.usage) program.usage(context.usage);
      if (context.alias) program.alias(context.alias);

      if (context?.helpOption)
        program.helpOption(
          context.helpOption.flag,
          context.helpOption.description
        );

      const args = processArgument(context?.arguments, program);
      program.action((...arg: any) => processHandler(args, program, this));

      const subCommands = [...new Set(context?.subCommands)];
      if (subCommands.length > 0) {
        const subCommandIndex = commandContainer.getCommand(
          target.name
        )?.subCommandIndex;

        if (!subCommandIndex)
          throw new KsError(
            `An error occurred during the initialization of the '${target.name}' command. Please check your code and try again.`,
            { type: "error", typeError: "CommandInitializationError" }
          );

        this[subCommandIndex] = subCommands;
      }

      // processCommand(context?.commands, program, target);

      if (!this._opts || Array.isArray(this._opts)) this._opts = [];
      originalInitFunction.call(this, program);
    };

    target.prototype.initSubCommand = initSubCommand;
  };
}
