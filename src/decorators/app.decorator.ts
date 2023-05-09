import { Command } from "commander";
import { KsError } from "../exceptions/ks-error";
import { appInfo } from "../helpers";
import { ArgumentType } from "../types";
import { initSubCommand } from "../types/sub-command-init";
import { commandContainer } from "../utils/command-container";
import { processArgument } from "../utils/process-argument";
import { processHandler } from "../utils/process-handler";

export function App(context?: {
  commands?: Array<any>;
  subCommands?: Array<string>;
  arguments?: Array<ArgumentType>;
  usage?: string;
  description?: string;
  commandName?: string;
  helpOption?: {
    flag?: string;
    description?: string;
  };
  versionOption?: {
    version?: string;
    flag?: string;
    description?: string;
  };
}) {
  return function (target: Function) {
    const originalInitFunction: Function =
      target.prototype.init || function () {};

    target.prototype.init = function (program: Command) {
      if (program instanceof Command == false)
        throw new KsError(
          `Command class is expected but got ${typeof program}`,
          { type: "error" }
        );

      const appName = context?.commandName || appInfo("name");
      const version = context?.versionOption?.version || appInfo("version");
      const description = context?.description || appInfo("description");

      if (appName) {
        program.name(appName);

        const commandNameIndex = commandContainer.getCommand(
          target.name
        )?.commandNameIndex;

        if (!commandNameIndex)
          throw new KsError(
            `An error occurred during the initialization of the 'app' command : '${target.name}'. Please check your code and try again.`,
            { type: "error", typeError: "CommandInitializationError" }
          );

        this[commandNameIndex] = appName;
      }

      if (version)
        program.version(
          version,
          context?.versionOption?.flag,
          context?.versionOption?.description
        );
      if (context?.helpOption)
        program.helpOption(
          context.helpOption.flag,
          context.helpOption.description
        );
      if (description) program.description(description);
      if (context?.usage) program.usage(context?.usage);

      const args = processArgument(context?.arguments, program);
      program.action((...arg: any) => processHandler(args, program, this));

      const subCommands = [...new Set(context?.subCommands)];
      const commands = [...new Set(context?.commands)];

      if (subCommands.length > 0) {
        const subCommandIndex = commandContainer.getCommand(
          target.name
        )?.subCommandIndex;

        if (!subCommandIndex)
          throw new KsError(
            `An error occurred during the initialization of the 'app' command : '${target.name}'. Please check your code and try again.`,
            { type: "error", typeError: "CommandInitializationError" }
          );

        this[subCommandIndex] = subCommands;
      }

      commands?.forEach((command) => {
        const commandInstance = new Command();
        const controllerInstance = new command();

        commandContainer.setCommand({
          commandInstance: commandInstance,
          controllerInstance: controllerInstance,
          name: command.name,
          subCommandIndex: Symbol(),
          commandNameIndex: Symbol(),
        });
      });

      if (!this._opts || Array.isArray(this._opts)) this._opts = [];
      originalInitFunction.call(this, program);
    };

    target.prototype.initSubCommand = initSubCommand;
  };
}
