import { appInfo } from "../helpers";
import { commandContainer } from "../utils/command-container";
import { ArgumentType } from "../types/argument.type";
import { HelpType, VersionType } from "../types/option.type";
import { AppCommandType } from "../types/app-command.type";
import { CommandInfoType } from "../types/command-info.type";
import { commandInit } from "../utils/command-init";
import { CommandType } from "../types/command.type";

export function App(context?: {
  commands?: Array<AppCommandType>;
  subCommands?: Array<string>;
  arguments?: Array<
    Omit<ArgumentType, "type"> & Partial<Pick<ArgumentType, "type">>
  >;
  usage?: string;
  description?: string;
  commandName?: string;
  helpOption?: boolean | HelpType;
  versionOption?: boolean | VersionType;

  /**
   * Indicates whether all required arguments must precede all optional arguments in the command line order.
   */
  requiredArgsFirst?: boolean;

  /**
   * Indicates whether all required arguments must precede all optional arguments in the command line order.
   */
  globalRequiredArgsFirst?: boolean;
}) {
  return function (target: Function) {
    const originalInitFunction: Function =
      target.prototype.init || function () {};

    target.prototype.init = function () {
      context = context || {};
      context["commandName"] = context?.commandName || appInfo("name");
      context["description"] = context?.description || appInfo("description");

      // if (
      //   context.requiredArgsFirst === undefined &&
      //   context?.globalRequiredArgsFirst
      // )
      //   context.requiredArgsFirst = config.globalRequiredArgsFirst;

      const { metadata, index } = commandInit(
        target.name,
        context as CommandType
      );

      const version: VersionType = {
        description: "output the version number",
        disabled: false,
        flag: "--version",
        alias: "-v",
        version: appInfo("version"),
      };

      if (context?.versionOption) {
        const versionOption = context.versionOption;
        const keys = Object.keys(versionOption) as Array<keyof VersionType>;

        for (const key of keys) {
          (version[key] as any) = versionOption[key];
        }
      } else if (typeof context.versionOption === "boolean")
        version.disabled = true;

      metadata.version = version;
      this[index as any] = metadata;

      for (const command of [...new Set(context?.commands)]) {
        const commandInstance = new command();
        const commandInfo: CommandInfoType = {
          commandInstance,
          index: Symbol(),
          name: command.name,
        };

        commandContainer.setCommand(commandInfo);
        commandInstance["init"]({
          globalRequiredArgsFirst: context.globalRequiredArgsFirst,
        });
      }

      originalInitFunction.call(this);

      // if (this["postAction"])
      //   program.hook("postAction", () => {
      //     this.postAction();
      //   });

      // if (program instanceof Command == false)
      //   throw new KsError(
      //     `Expected a command class, but received a different type: ${typeof program}`,
      //     { type: "error", errorType: "InvalidTypeError" }
      //   );

      // const appName = context?.commandName || appInfo("name");
      // const version = context?.versionOption?.version || appInfo("version");
      // const description = context?.description || appInfo("description");

      // if (appName) {
      //   program.name(appName);

      /* encapsulate

      const version: VersionType = {
        description: "output the version number",
        disabled: false,
        flag: "--version",
        alias: "-V",
        version: appInfo("version"),
      };

      if (context?.versionOption) {
        const versionOption = context.versionOption;
        const keys = Object.keys(versionOption) as Array<keyof VersionType>;

        for (const key of keys) {
          (version[key] as any) = versionOption[key];
        }
      }

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
        args: processArgument(context?.arguments, target.name),
        commandName: (context?.commandName || appInfo("name"))!,
        options: [],
        subCommandName: [...new Set(context?.subCommands)],
        description: context?.description || appInfo("description"),
        help,
        version,
        usage: context?.usage,
      };

      const index = commandContainer.getCommand(target.name)?.index;

      if (!index)
        throw new KsError(
          `An error occurred during the initialization of the 'app' command : '${target.name}'. Please check your code and try again.`,
          { type: "error", errorType: "CommandInitializationError" }
        );
*/
      // this[index] = appName;
      // }

      // if (version)
      //   program.version(
      //     version,
      //     context?.versionOption?.flag,
      //     context?.versionOption?.description
      //   );

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

      // if (description) program.description(description);
      // if (context?.usage) program.usage(context?.usage);

      // metadata.args = processArgument(context?.arguments, target.name);
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

      // metadata.subCommandName = subCommands || [];
      // this[commandInfo.index] = subCommands || [];
      // this[commandInfo.optionIndex] = [];

      // for (const command of [...new Set(context?.commands)]) {
      //   const commandInfo: CommandInfoType = {
      //     commandInstance: new command(),
      //     index: Symbol(),
      //     name: command.name,
      //   };

      //   commandContainer.setCommand(commandInfo);
      // }

      // commands?.forEach((command) => {
      //   const commandInstance = new Command();
      //   const controllerInstance = new command();

      //   commandContainer.setCommand({
      //     commandInstance: commandInstance,
      //     commandInstance: controllerInstance,
      //     name: command.name,
      //     subCommandIndex: Symbol(),
      //     commandNameIndex: Symbol(),
      //     optionIndex: Symbol(),
      //   });
      // });

      // originalInitFunction.call(this);
    };

    // target.prototype.initSubCommand = initSubCommand; // todo
  };
}
