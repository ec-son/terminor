import { appInfo } from "../helpers";
import { commandContainer } from "../utils/command-container";
import { ArgumentType } from "../types/argument.type";
import { HelpType, VersionType } from "../types/option.type";
import { AppCommandType } from "../types/app-command.type";
import { CommandInfoType } from "../types/command-info.type";
import { checkingSubCommand, commandInit } from "../utils/command-init";
import { CommandType } from "../types/command.type";

export function App(context?: {
  /**
   *  Array of commands
   */
  commands?: Array<AppCommandType>;

  /**
   * An array of sub-commands associated with the command.
   */
  subCommands?: Array<string>;

  /**
   * An array of arguments associated with the command.
   */
  arguments?: Array<
    Omit<ArgumentType, "type"> & Partial<Pick<ArgumentType, "type">>
  >;

  /**
   * A usage example for the command.
   */
  usage?: string;

  /**
   * A description of the command.
   */
  description?: string;

  /**
   * The name of the command.
   */
  commandName?: string;

  /**
   * An optional help option for the command.
   */
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
      target.prototype.__init__ || function () {};

    target.prototype.__init__ = function () {
      context = context || {};
      context["commandName"] = context?.commandName || appInfo("name");
      context["description"] = context?.description || appInfo("description");

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
        commandInstance["__init__"]({
          globalRequiredArgsFirst: context.globalRequiredArgsFirst,
        });
      }
      metadata.subCommandNames = checkingSubCommand(metadata.subCommandNames);

      originalInitFunction.call(this);
      if ("__init__parameter__" in this) this.__init__parameter__();
    };
  };
}
