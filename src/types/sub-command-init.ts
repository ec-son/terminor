import { Command } from "commander";
import { commandContainer } from "../utils/command-container";

export function initSubCommand(commandInfo: {
  commandInstance: Command;
  controllerInstance: Object;
  name: string;
  subCommandIndex: symbol;
  commandNameIndex: symbol;
}) {
  const subCommands: Array<string> =
    commandInfo.controllerInstance[commandInfo.subCommandIndex] || [];
  const commantParent: Command = commandInfo.commandInstance;

  subCommands.forEach((commandName) => {
    const subCommand = commandContainer.getCommandByCommandName(commandName);

    if (subCommand) {
      const commandChild = subCommand.commandInstance;
      commantParent.addCommand(commandChild);
    }
  });
}
