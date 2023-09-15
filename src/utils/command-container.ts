import { Command } from "commander";
import { KsError } from "../exceptions/ks-error";
type CommandInfoType = {
  commandInstance: Command;
  controllerInstance: Object;
  name: string;
  subCommandIndex: symbol;
  commandNameIndex: symbol;
  optionIndex: symbol;
};
class CommandContainer {
  private _commands: Array<CommandInfoType> = [];

  get length(): number {
    return this._commands.length;
  }

  setCommand(command: CommandInfoType) {
    if (
      this.getCommand(command.name) ||
      this.getCommand(command.controllerInstance)
    )
      throw new KsError(`${command.name} instance already exists.`, {
        errorType: "DuplicateItemError",
      });
    this._commands.push(command);
  }

  getCommand(name: string | Object): CommandInfoType | undefined {
    return typeof name === "string"
      ? this._commands.find((command) => command.name === name)
      : this._commands.find((command) => command.controllerInstance === name);
  }

  getCommandByCommandName(name: string): CommandInfoType | undefined {
    return this._commands.find(
      (command) => command.controllerInstance[command.commandNameIndex] === name
    );
  }

  forEach(
    callbackfn: (
      value: CommandInfoType,
      index: number,
      array: CommandInfoType[]
    ) => void,
    thisArg?: any
  ): void {
    this._commands.forEach(callbackfn, thisArg);
  }
}

export const commandContainer = new CommandContainer();
