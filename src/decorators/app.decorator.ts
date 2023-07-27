import { Command } from "commander";
import { KsError } from "../exceptions/ks-error";
import { appInfo } from "../helpers";
import { initSubCommand } from "../utils/sub-command-init";
import { commandContainer } from "../utils/command-container";
import { processArgument } from "../utils/process-argument";
import { processHandler } from "../utils/process-handler";
import { ArgumentType } from "../types/argument.type";

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
    addHelpText?: {
      position: "after" | "before";
      text: string;
    };
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
      if (this["postAction"])
        program.hook("postAction", () => {
          this.postAction();
        });

      if (program instanceof Command == false)
        throw new KsError(
          `Expected a command class, but received a different type: ${typeof program}`,
          { type: "error", errorType: "InvalidTypeError" }
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
            { type: "error", errorType: "CommandInitializationError" }
          );

        this[commandNameIndex] = appName;
      }

      if (version)
        program.version(
          version,
          context?.versionOption?.flag,
          context?.versionOption?.description
        );

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

      if (description) program.description(description);
      if (context?.usage) program.usage(context?.usage);

      const args = processArgument(context?.arguments, program, target.name);
      program.action((...arg: any) =>
        processHandler(args, program, this, target.name)
      );

      const subCommands = [...new Set(context?.subCommands)];
      const commands = [...new Set(context?.commands)];
      const commandInfo = commandContainer.getCommand(target.name);

      if (!commandInfo)
        throw new KsError(
          `An error occurred during the initialization of the '${target.name}' command. Please check your code and try again.`,
          { type: "error", errorType: "CommandInitializationError" }
        );

      this[commandInfo.subCommandIndex] = subCommands || [];
      this[commandInfo.optionIndex] = [];

      commands?.forEach((command) => {
        const commandInstance = new Command();
        const controllerInstance = new command();

        commandContainer.setCommand({
          commandInstance: commandInstance,
          controllerInstance: controllerInstance,
          name: command.name,
          subCommandIndex: Symbol(),
          commandNameIndex: Symbol(),
          optionIndex: Symbol(),
        });
      });

      originalInitFunction.call(this, program);
    };

    target.prototype.initSubCommand = initSubCommand;
  };
}
