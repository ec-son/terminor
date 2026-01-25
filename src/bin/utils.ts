import { join } from "path";
import { FileManager } from "./fileManager";
import { terExit } from "../tools";

/**
 * Transforms a string of comma-separated command names to an array of file paths.
 * This function will search for each command name in the src/commands directory.
 * If a command name is not found, an error will be logged and the program will exit.
 * @param value - The string of comma-separated command names
 * @returns An array of file paths
 */
export const transformParentNames = (value: string) => {
  const commandsFilesPaths: string[] = [];
  const commandNames = value
    .split(",")
    .map((key) => key.trim())
    .filter((key) => key);

  for (const commandName of commandNames) {
    const parentFile = FileManager.findFileByCommandName(
      // join(process.cwd(), "src", "test"),
      join(process.cwd(), "src", "commands"),
      commandName
    );
    if (!parentFile) {
      console.error(`Error: No command found with the name '${commandName}'`);
      terExit();
    }

    commandsFilesPaths.push(parentFile as string);
  }
  return commandsFilesPaths;
};
