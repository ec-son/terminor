import { commandContainer } from "./../tools/command-container";
import { KsError } from "./../exceptions/ks-error";
import { Command } from "commander";
export const processCommand = (
  commands: Array<any> | undefined,
  program: Command,
  target: Function
) => {
  if (!commands?.length) commands = [];
  console.log("-------------------------------------");
  console.log(target.name);
  console.log(commands);

  commands.forEach((command) => {
    if (typeof command !== "function") {
      console.log(command);

      throw new KsError(
        `We got anexpected Class in array of ${target.name} subcommands.`,
        { type: "error" }
      );
    }

    if (command === target)
      throw new KsError(`${target.name} command calls itself.`, {
        type: "error",
      });

    if ((target["_commandList"] as Array<any>).find((el) => el === command)) {
      // console.log("++++++++++++++++++++++++++++++++");

      // console.log(target);
      // console.log(command);
      // console.log(commands);

      // console.log("++++++++++++++++++++++++++++++++");
      console.log(commandContainer);

      throw new KsError(
        `Thow commands called each other several times. '${target.name}' => '${
          (command as Function).name
        }'`,
        { type: "warning" }
      );
    }

    (target["_commandList"] as Array<any>).push(command);
  });

  commands.forEach((command) => {
    const controllerInstances = commandContainer.getCommand(command.name);

    if (controllerInstances)
      program.addCommand(controllerInstances.commandInstance);
    else {
      const commandInstance = new Command();
      const controllerInstance = new command();
      commandContainer.setCommand({
        commandInstance: commandInstance,
        controllerInstance: controllerInstance,
        name: command.name,
      });
      controllerInstance.init(commandInstance);
      program.addCommand(commandInstance);
    }
  });
};
