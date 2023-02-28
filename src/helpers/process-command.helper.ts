import { Command } from "commander";
export const processCommand = (
  commands: Array<any> | undefined,
  program: Command
) => {
  if (!commands?.length) commands = [];

  commands.forEach((command) => {
    const commandInstance = new Command();

    const _commandInstance = new command();

    _commandInstance.init(commandInstance);
    program.addCommand(commandInstance);
  });
};
