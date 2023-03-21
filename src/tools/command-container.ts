import { Command } from "commander";
type CommandType = {
  commandInstance: Command;
  controllerInstance: Object;
  name: string;
};
class CommandContainer {
  private _commands: Array<CommandType> = [];

  setCommand(command: CommandType) {
    this._commands.push(command);
  }

  getCommand(name: string): CommandType | undefined {
    return this._commands.find((command) => command.name === name);
  }
}

export const commandContainer = new CommandContainer();
