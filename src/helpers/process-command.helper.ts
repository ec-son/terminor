import { KsError } from "./../exceptions/ks-error";
import { Command } from "commander";
export const processCommand = (
  commands: Array<any> | undefined,
  program: Command,
  target: Function
) => {
  if (!commands?.length) commands = [];

  commands.forEach((command) => {
    if (typeof command !== "function")
      throw new KsError(
        `We got anexpected Class in array of ${target.name} subcommands.`,
        { type: "error" }
      );

    if (command === target)
      throw new KsError(`${target.name} command calls itself.`, {
        type: "error",
      });

    if ((target["_commandList"] as Array<any>).find((el) => el === command)) {
      throw new KsError(
        `Thow commands called each other several times. '${target.name}' => '${
          (command as Function).name
        }'`,
        { type: "warning" }
      );
    }

    (target["_commandList"] as Array<any>).push(command);
  });
  console.log(target["_commandList"]);

  commands.forEach((command) => {
    const commandInstance = new Command();
    const _commandInstance = new command();

    _commandInstance.init(commandInstance);
    program.addCommand(commandInstance);
  });
};
