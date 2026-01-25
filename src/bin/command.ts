import { join } from "path";
import {
  App,
  ArgumentData,
  Command,
  Handler,
  Option,
  PreAction,
  terExit,
} from "../";
import { existsSync } from "fs";
import { FileManager } from "./fileManager";
import { transformParentNames } from "./utils";

@Command({
  commandName: "create",
  description: "Creates a command.",
  alias: "c",
  arguments: [
    {
      argumentName: "commandName",
      description: "Name of the command",
      required: true,
      trim: true,
    },
  ],
})
class CreateCommand {
  // commandDir = join(process.cwd(), "src", "test");
  commandDir = join(process.cwd(), "src", "commands");
  appFile = join(this.commandDir, "app.command.ts");
  @Option({
    flag: "parentCommand",
    alias: "p",
    description:
      'Define the parent commands of this command. (comma-separated, e.g., "create,generate"): ',
    trim: true,
    type: "string",
    transform: transformParentNames,
  })
  parentFiles: string[];

  @Option({
    alias: "s",
    flag: "subcommand",
    description:
      'Define the subcommands of this command. (comma-separated, e.g., "create,generate"): ',
    type: "string",
    transform: transformParentNames,
  })
  subCommand: string[];

  @Option({
    alias: "d",
    description: "Description of the command",
    trim: true,
    type: "string",
  })
  description: string;

  @Option({
    flag: "alias",
    alias: "a",
    description: "Alias of the command",
    trim: true,
    type: "string",
  })
  alias: string;

  @PreAction()
  test() {
    if (!existsSync(this.commandDir)) {
      console.error("Error: The src/commands directory does not exist.");
      terExit();
    }

    if (!existsSync(this.appFile)) {
      console.error("Error: The app.command.ts file cannot be found.");
      terExit();
    }
  }

  @Handler("parentFiles", "option")
  setParent(@ArgumentData("commandName") commandName: string) {
    try {
      for (const parentFile of this.parentFiles) {
        FileManager.addToDecoratorArray(
          parentFile,
          "subCommands",
          commandName,
          true
        );
      }
    } catch (e: any) {
      console.error(e.message);
      terExit();
    }
  }

  @Handler("commandName", "argument")
  /**
   * Crée une nouvelle commande en générant un fichier et en l'ajoutant à l'application.
   *
   * @param commandName - Le nom de la commande à créer
   */
  createCommand(@ArgumentData("commandName") commandName: string) {
    // Génération du fichier
    const className = FileManager.toClassName(commandName);
    const fileContent = FileManager.commandTemplate(
      className,
      commandName,
      this.description,
      this.subCommand,
      this.alias
    );

    try {
      FileManager.createCommandFile(this.commandDir, commandName, fileContent);
      FileManager.addImport(this.appFile, className, `${commandName}.command`);

      FileManager.addToDecoratorArray(
        this.appFile,
        "commands",
        className,
        false
      );
    } catch (e: any) {
      console.error(e.message);
      terExit();
    }
  }
}

@Command({
  commandName: "list",
  alias: "l",
  arguments: [
    {
      argumentName: "command",
      description: "Command name to show its sub command.",
      trim: true,
    },
  ],
})
class ListCommand {
  commandDir = join(process.cwd(), "src", "commands");
  @Handler()
  list() {
    const commandList = FileManager.getRegisteredCommands(this.commandDir);

    if (commandList.registered.length < 1)
      console.log("\nNo registered command found.");
    else console.log("\nREGISTERED COMMANDS\n");

    const showCommand = (commandLists: typeof commandList.registered) => {
      for (const index in commandLists) {
        const command = commandLists[index];
        console.log(`${parseInt(index) + 1}. ${command.name}`);
        console.log(` - class name: ${command.class}`);
        console.log(` - file name: ${command.file}\n`);
      }
    };

    showCommand(commandList.registered);
    if (commandList.unregistered.length > 0) {
      console.log("UNREGISTERED COMMANDS\n");
      showCommand(commandList.unregistered);
    }
  }

  @Handler("command", "argument")
  subCommand(@ArgumentData("command") command: string) {
    const commandList = FileManager.getCommandSubcommands(
      command,
      this.commandDir
    );

    if (commandList.registered.length < 1)
      console.log("\nNo sub command found.");
    else console.log("\nREGISTERED SUB COMMANDS\n");

    const showCommand = (commandLists: typeof commandList.registered) => {
      for (const index in commandLists) {
        const commandName = commandLists[index];
        console.log(`${parseInt(index) + 1}. ${commandName}`);
      }
      console.log("");
    };

    showCommand(commandList.registered);
    if (commandList.unregistered.length > 0) {
      console.log("UNREGISTERED SUB COMMANDS\n");
      showCommand(commandList.unregistered);
    }

    terExit();
  }
}
@App({
  commands: [CreateCommand, ListCommand],
  subCommands: ["create", "list"],
})
export class AppCommand {}
