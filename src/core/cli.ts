import { MetaDataType } from "../types/metadata.type";
import { commandContainer } from "../utils/command-container";
import { OptionValueType, VersionType } from "../types/option.type";
import { terExit } from "../tools";
import { KsError } from "../exceptions/ks-error";
import { argumentValidator } from "../utils/argument-validator";
import { ArgumentValueType } from "../types/argument.type";
import { suggestSimilar } from "../utils/suggest-similar";
import { ConfigCli } from "../types/config-cli.type";
import { Help } from "./help";
import { checkValueType } from "../utils/check-value-type";

export class Cli {
  appMetadata: MetaDataType;
  args: Array<string>;
  isArg: boolean = true;
  configCli: ConfigCli = {
    argv: {
      data: process.argv.slice(),
    },
    allowExcessArguments: true,
    allowUnknownOption: false,
    showSuggestionForUnknownCommand: true,
    showSuggestionForUnknownOption: true,
  };
  commands: string[] = [];

  constructor(AppComponent: any) {
    const commandInstance = new AppComponent();
    const index = Symbol();

    commandContainer.setCommand({
      commandInstance,
      name: AppComponent.name,
      index,
    });

    commandInstance.init();
    this.appMetadata =
      commandInstance[
        commandContainer.getCommand(commandInstance)?.index as any
      ];
  }

  parse(configCli?: ConfigCli) {
    for (const key of Object.keys(configCli || {})) {
      this.configCli[key] = configCli![key] || this.configCli[key];
    }

    this.args =
      this.configCli!.argv!.from === "user"
        ? this.configCli!.argv!.data.slice()
        : this.configCli!.argv!.data.slice().splice(2);

    this.process(this.args.slice(), this.appMetadata);
  }

  private process(args: Array<string>, metadata: MetaDataType) {
    const command = commandContainer.getCommandByCommandName(
      metadata.commandName
    )?.commandInstance;
    if (!command)
      throw new KsError(`Command not found:`, {
        errorType: "CommandNotFoundError",
      });

    if (args.length > 0) {
      // checking if help option exists
      if (
        !metadata.help.disabled &&
        (args.includes(metadata.help.flag!) ||
          args.includes(metadata.help.alias!))
      )
        return this.displayHelp();

      // checking if version option exists
      if (
        metadata.version &&
        !metadata.version.disabled &&
        (args.includes(metadata.version.flag!) ||
          args.includes(metadata.version.alias!))
      )
        return this.displayVersion(metadata.version);

      // checking if other options
      const index = metadata.options.findIndex(
        (opt) => opt.flag === args[0] || opt.alias === args[0]
      );

      if (index >= 0)
        return this.process(
          this.optionHandler(metadata.options[index], args, command),
          metadata
        );
      else {
        // sub command
        if (
          !this.commands.includes("--finished--") &&
          !args[0].startsWith("-")
        ) {
          if (isExistSubCommand(metadata.subCommandNames, args[0])) {
            const commandInfo = commandContainer.getCommandByCommandName(
              args[0]
            );

            args.shift();
            this.commands.push(metadata.commandName);
            return this.process(
              args,
              commandInfo?.commandInstance[commandInfo.index]
            );
          }
          this.commands.push("--finished--");
        }

        // unknown option
        if (args[0].startsWith("--") || args[0].startsWith("-")) {
          if (
            args[0].startsWith("--") &&
            this.configCli.showSuggestionForUnknownOption
          ) {
            let similarWords: string[];

            let suggestSimilarMethod = suggestSimilar;
            let showSuggestionMessage = (similarWords: string[]): void => {
              let suggestionMessage = `Did you mean one of ${similarWords.join(
                ", "
              )}?`;
              if (similarWords.length === 1)
                suggestionMessage = `Did you mean ${similarWords[0]}?`;

              throw new KsError(
                [`Unknown option: '${args[0]}'`, "\n" + suggestionMessage],
                { errorType: "UnknownOptionError" }
              );
            };

            if (
              typeof this.configCli.showSuggestionForUnknownOption === "object"
            ) {
              suggestSimilarMethod =
                this.configCli.showSuggestionForUnknownOption
                  .custormFunctionSimilar || suggestSimilarMethod;

              showSuggestionMessage =
                this.configCli.showSuggestionForUnknownOption
                  .showSuggestionMessage || showSuggestionMessage;
            }

            const helpAndVersion: string[] = [];
            if (!metadata.version?.disabled && metadata.version?.flag)
              helpAndVersion.push(metadata.version.flag);
            if (!metadata.help.disabled && metadata.help.flag)
              helpAndVersion.push(metadata.help.flag);

            similarWords = suggestSimilarMethod(
              args[0].slice(2),
              [
                ...metadata.options.map((opt) => opt.flag!),
                ...helpAndVersion,
              ].map((opt) => opt.slice(2))
            );

            if (similarWords.length > 0) {
              showSuggestionMessage(similarWords.map((opt) => "--" + opt));
              terExit();
            }
          } else if (args[0].startsWith("-") && args[0].length > 2) {
            // For boolean values
            let optFind = metadata.options.find(
              (el) =>
                "-" + [...args[0].replace("-", "")][0] === el.alias &&
                el.type !== "boolean"
            );

            if (optFind) {
              args.splice(
                0,
                1,
                "-" + [...args[0].replace("-", "")][0],
                args[0].replace("-", "").substring(1)
              );
              return this.process(args, metadata);
            }

            // For other type

            optFind = metadata.options.find(
              (el) =>
                "-" + [...args[0].replace("-", "")][0] === el.alias &&
                el.type === "boolean"
            );

            if (optFind) {
              args.splice(
                0,
                1,
                "-" + [...args[0].replace("-", "")][0],
                "-" + args[0].replace("-", "").substring(1)
              );
              return this.process(args, metadata);
            }
          }
          throw new KsError(`Unknown option: '${args[0]}'`, {
            errorType: "UnknownOptionError",
          });
        }

        if (this.isArg) {
          const result = this.argumentHandler(metadata.args, args, command);
          args = Array.isArray(result) ? result : args;
          if (!Array.isArray(result) || result.length < 1) this.isArg = false;
          return this.process(args, metadata);
        } else if (args.length > 0) {
          if (!this.configCli.allowExcessArguments)
            throw new KsError(`Unknown arg '${args}'`);
          args.shift();
          return this.process(args, metadata);
        }
      }
    }

    console.log("--------------- finished processing ------------------");

    [...metadata.options, ...metadata.args].forEach((el) => {
      el.value = argumentValidator(undefined, el);
      if (el.value === undefined && el.variadic) el.value = [];
      el.treated = true;
    });

    console.log(
      "options:",
      metadata.options.map((el) => ({ [el.optionName]: el.value }))
    );
    console.log(
      "arguments:",
      metadata.args.map((el) => ({ [el.argumentName]: el.value }))
    );

    // check required arguments and options
    // execute the command
  }

  private optionHandler(
    opt: OptionValueType,
    args: string[],
    command: Object
  ): Array<string> {
    if (opt.type === "boolean") {
      opt.value = true;
      opt.treated = true;
      args.shift();
      return args;
    }

    if (!args[1] || args[1].startsWith("-"))
      throw new KsError(
        (opt.onError && opt.onError(args[1], "MissingValueError")) ||
          `Missing value for option '${opt.optionName}'`,
        {
          errorType: "MissingValueError",
          type: "error",
        }
      );

    args.shift(); // Removes option

    if (opt.variadic) {
      const v: any[] = [];
      v.push(argumentValidator(args[0], opt));
      args.shift(); // Removes value of option

      for (const value of args) {
        if (
          value &&
          !value.startsWith("-") &&
          checkValueType(opt.type, value)
        ) {
          {
            v.push(argumentValidator(value, opt));
            args.shift(); // Removes value of option
          }
        } else break;
      }
      opt.value = v;
    } else {
      args.shift(); // Removes value of option
      opt.value = argumentValidator(args[1], opt);
    }

    command[opt.optionName] = opt.value;
    opt.treated = true;
    return args;
  }

  private argumentHandler(
    argsOpt: Array<ArgumentValueType>,
    args: string[],
    command: Object
  ): Array<string> | null {
    const arg = argsOpt.find((el) => !el.value);
    if (!arg) return null;

    arg.value = argumentValidator(args[0], arg);
    arg.treated = true;

    if (args) args.shift();
    return args;
  }

  private displayVersion(v: VersionType) {
    if (v.addVersionText && v.addVersionText.text) {
      if (v.addVersionText.position === "before") {
        console.log(v.addVersionText.text);
        console.log(v.text || v.version);
      } else {
        console.log(v.text || v.version);
        console.log(v.addVersionText.text);
      }
    } else console.log(v.text || v.version);

    terExit();
  }

  private displayHelp() {
    const subcommand: string[] = [this.appMetadata.commandName];

    for (const arg of this.args) {
      if (arg.startsWith("-")) continue;

      const metadata: MetaDataType = commandContainer.getCommandByCommandName(
        subcommand[subcommand.length - 1],
        true
      ) as MetaDataType;

      if (
        !isExistSubCommand(metadata.subCommandNames, arg) ||
        arg === metadata.commandName
      )
        break;
      subcommand.push(arg);
    }

    const metadata = commandContainer.getCommandByCommandName(
      subcommand.pop()!,
      true
    ) as MetaDataType;

    if (!metadata.help.disabled && metadata.help.text) {
      console.log(metadata.help.text);
      return;
    }

    const help = new Help(metadata, subcommand);

    if (metadata.help.addHelpText && metadata.help.addHelpText.text) {
      if (metadata.help.addHelpText.position === "before") {
        console.log(metadata.help.addHelpText.text);
        help.display();
      } else {
        help.display();
        console.log(metadata.help.addHelpText.text);
      }
    } else help.display();

    terExit();
  }
}

function isExistSubCommand(
  subCommandNames: Array<string>,
  command: string
): boolean {
  const isExist = subCommandNames.includes(command);

  if (isExist) return true;

  const metadata = commandContainer.getCommandByCommandName(
    command,
    true
  ) as MetaDataType;

  if (!metadata) return false;

  return (
    metadata.alias === command && subCommandNames.includes(metadata.commandName)
  );
}
