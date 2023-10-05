import { KsError } from "../exceptions/ks-error";
import { CommandInfoType } from "../types/command-info.type";
import { MetaDataType } from "../types/metadata.type";

class CommandContainer {
  private commands: Array<CommandInfoType> = [];

  get length(): number {
    return this.commands.length;
  }

  setCommand(command: CommandInfoType) {
    if (
      this.getCommand(command.name) ||
      this.getCommand(command.commandInstance)
    )
      throw new KsError(`${command.name} instance already exists.`, {
        errorType: "DuplicateItemError",
      });
    this.commands.push(command);
  }

  getCommand(name: string | Object): CommandInfoType | undefined;
  getCommand(
    name: string | Object,
    isMetadata: boolean
  ): CommandInfoType | MetaDataType | undefined;

  getCommand(
    name: string | Object,
    isMetadata?: boolean
  ): CommandInfoType | MetaDataType | undefined {
    const commandInfo =
      typeof name === "string"
        ? this.commands.find((command) => command.name === name)
        : this.commands.find((command) => command.commandInstance === name);

    if (!isMetadata) return commandInfo;
    return commandInfo?.commandInstance[commandInfo.index];
  }

  getCommandByCommandName(commandName: string): CommandInfoType | undefined;

  getCommandByCommandName(
    commandName: string,
    isMetadata?: boolean
  ): CommandInfoType | MetaDataType | undefined;

  getCommandByCommandName(
    commandName: string,
    isMetadata?: boolean
  ): CommandInfoType | MetaDataType | undefined {
    if (!commandName) return undefined;

    let commandInfo = this.commands.find(
      (command) =>
        command.commandInstance[command.index] &&
        (command.commandInstance[command.index] as MetaDataType).commandName ===
          commandName
    );

    if (!commandInfo)
      commandInfo = this.commands.find(
        (command) =>
          command.commandInstance[command.index] &&
          (command.commandInstance[command.index] as MetaDataType).alias ===
            commandName
      );

    if (!isMetadata) return commandInfo;
    return commandInfo?.commandInstance[commandInfo.index];
  }

  forEach(
    callbackfn: (
      value: CommandInfoType,
      index: number,
      array: CommandInfoType[]
    ) => void,
    thisArg?: any
  ): void {
    this.commands.forEach(callbackfn, thisArg);
  }
}

export const commandContainer = new CommandContainer();
