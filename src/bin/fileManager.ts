import * as fs from "fs";
import * as path from "path";
import { terExit } from "../tools";

type RegisterdCommandType = { name: string; file: string; class: string };

/**
 * Utility function to remove single-line and multi-line comments from TypeScript code
 * Used to avoid matching patterns inside comments
 *
 * @param content - The content to clean
 * @returns The content with comments removed
 */
function removeComments(content: string): string {
  // Remove multi-line comments /* ... */
  let cleaned = content.replace(/\/\*[\s\S]*?\*\//g, " ");
  // Remove single-line comments // ...
  cleaned = cleaned.replace(/\/\/.*?$/gm, " ");
  return cleaned;
}

export class FileManager {
  /**
   * Converts a command name like "my-command" to a class name like "MyCommandCommand"
   *
   * @param name - The command name to convert
   * @returns The converted class name
   */
  static toClassName(name: string): string {
    // Convert kebab-case to PascalCase
    const pascalCase = name
      .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      .replace(/^[a-z]/, (g) => g.toUpperCase());

    // Add "Command" suffix
    return `${pascalCase}Command`;
  }

  /**
   * Crée un fichier pour une nouvelle commande
   * @param dir - Le répertoire où créer le fichier
   * @param name - Le nom de la commande
   * @param content - Le contenu du fichier
   */
  static createCommandFile(dir: string, name: string, content: string): void {
    const filePath = path.join(dir, `${name}.command.ts`);

    if (fs.existsSync(filePath)) {
      console.error(`The file ${filePath} already exists.`);
      terExit();
    }

    fs.writeFileSync(filePath, content);

    console.log(`CREATE ${filePath}`);
  }

  /**
   * Find a file containing @Command({ name: 'target' }) or @App
   *
   * @param dir - The directory to search in
   * @param targetName - The target name to search for
   * @returns The path of the file containing the target name, or null if not found
   */
  static findFileByCommandName(dir: string, targetName: string): string | null {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts"));

    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), "utf-8");
      const cleanedContent = removeComments(content);

      // Regex to find commandName: 'target' in @Command or @App
      // Handles spaces and single or double quotes
      // Escapes the targetName to handle special regex characters
      const escapedTargetName = targetName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      const regex = new RegExp(
        `@(Command|App)\\s*\\(\\{\\s*[\\s\\S]*?commandName:\\s*['"]${escapedTargetName}['"]`,
        "m"
      );

      if (regex.test(cleanedContent)) {
        return path.join(dir, file);
      }
    }
    return null;
  }

  /**
   * Reads the content of a file, adds an import statement for a class, and writes the updated content back to the file
   *
   * Searches for the LAST valid import statement (not in strings/comments) and adds the new import after it.
   * Regex matches only valid TypeScript/ES6 import declarations at line start.
   *
   * @param filePath - The path of the file to add the import to
   * @param className - The class name to import
   * @param fileName - The file name to import from
   */
  static addImport(
    filePath: string,
    className: string,
    fileName: string
  ): void {
    // Read the content of the file
    let content = fs.readFileSync(filePath, "utf-8");

    // Check if the import already exists
    if (content.includes(className)) return;

    // Create the import statement
    const importStatement = `import { ${className} } from './${fileName}';\n`;

    // Regex to find ALL valid import statements
    // Matches: import ... from '...'; or import ... from "...";
    // Only matches at the beginning of a line (after newline or at file start)
    // This ensures we don't match "import" in comments or strings
    const importRegex = /^import\s+.*?from\s+['"].*?['"];?$/gm;

    const matches = Array.from(content.matchAll(importRegex));

    if (matches.length > 0) {
      // Get the last import statement match
      const lastMatch = matches[matches.length - 1];
      const lastImportEnd = lastMatch.index! + lastMatch[0].length;

      // Find the end of the line (newline character after the last import)
      const nextNewlineIndex = content.indexOf("\n", lastImportEnd);

      if (nextNewlineIndex !== -1) {
        // Insert after the last import line
        content =
          content.slice(0, nextNewlineIndex + 1) +
          importStatement +
          content.slice(nextNewlineIndex + 1);
      } else {
        // Last import is at the end of file (no trailing newline)
        content = content + "\n" + importStatement;
      }
    } else {
      // No import statements found, add at the beginning of the file
      content = importStatement + content;
    }

    // Write the updated content back to the file
    fs.writeFileSync(filePath, content);
    console.log(`UPDATE ${filePath} (Import added)`);
  }

  /**
   * Add a value to an existing decorator array property (commands or subCommands).
   *
   * This function will automatically detect if the value already exists in the array to avoid duplicates.
   *
   * If the value doesn't exist, it will be added to the array.
   *
   * @param filePath - The path to the file to update
   * @param property - The property to add the value to (commands or subCommands)
   * @param item - The value to add to the array
   * @param isString - If the value is a string or a class name
   */
  static addToDecoratorArray(
    filePath: string,
    property: "commands" | "subCommands",
    item: string,
    isString: boolean
  ): void {
    let content = fs.readFileSync(filePath, "utf-8");
    const cleanedContent = removeComments(content);
    const valueToAdd = isString ? `'${item}'` : item;

    // First, find the @App or @Command decorator (from @ to closing } ))
    // Regex: @(App|Command)\s*\(\s*\{[\s\S]*?\}\s*\)
    // This captures the entire decorator block
    const decoratorRegex = new RegExp(
      `@(App|Command)\\s*\\(\\s*\\{[\\s\\S]*?\\}\\s*\\)`,
      "m"
    );
    const decoratorMatch = decoratorRegex.exec(cleanedContent);

    if (!decoratorMatch) {
      console.warn(
        `WARNING: Unable to find the decorator @App or @Command in ${filePath}.`
      );

      return;
    }

    // Get the position from cleaned content to apply to original content
    const decoratorStart = decoratorMatch.index;
    let decoratorEnd = decoratorMatch.index! + decoratorMatch[0].length;

    // Find corresponding position in original content
    let cleanedPos = 0;
    let originalPos = 0;
    while (cleanedPos < decoratorStart && originalPos < content.length) {
      cleanedPos += 1;
      originalPos += 1;
    }

    decoratorStart;
    const decoratorContent = content.slice(
      originalPos,
      originalPos + (decoratorEnd - decoratorStart)
    );

    // Now search for the property ONLY within the decorator content
    const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const propertyRegex = new RegExp(
      `(${escapedProperty}\\s*:\\s*\\[)([\\s\\S]*?)(\\])`,
      "m"
    );

    const propertyMatch = propertyRegex.exec(decoratorContent);

    if (propertyMatch) {
      // Property exists within decorator, check for duplicates first
      const arrayContent = propertyMatch[2]; // Content between [ and ]

      // Remove comments from array content for accurate duplicate detection
      const contentWithoutComments = removeComments(arrayContent);

      // Check if the value already exists in the array
      // For strings: match 'item', "item", or item (bare word)
      // For classes: match ClassName (bare word)
      const escapedItem = item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      let duplicatePattern;
      if (isString) {
        // For strings: match 'item', "item", or 'item' with any surrounding whitespace/commas
        // Handles: 'item', "item", 'item', "item"
        duplicatePattern = new RegExp(
          `(^|[,\\s])(['"]?)${escapedItem}\\2([,\\s]|$)`,
          "m"
        );
      } else {
        // For classes: match ClassName as a complete word (with word boundaries)
        // Handles: ClassName, ClassName,
        duplicatePattern = new RegExp(
          `(^|[,\\s])${escapedItem}(?=[,\\s]|$)`,
          "m"
        );
      }

      if (duplicatePattern.test(contentWithoutComments)) {
        // Value already exists, do not add to avoid duplicates
        console.log(`SKIP ${filePath} (${item} already exists in ${property})`);
        return;
      }

      // Value doesn't exist, add it to the array
      const newDecoratorContent = decoratorContent.replace(
        propertyRegex,
        (match, start, existingContent, end) => {
          const trimContent = existingContent.trim();

          let separator = " ";

          if (trimContent.length > 0 && !trimContent.endsWith(",")) {
            // No trailing comma: [ item ] -> [ item, value ]
            separator = ", ";
          }

          return `${start}${existingContent}${separator}${valueToAdd}${end}`;
        }
      );

      // Replace only the decorator in content
      content =
        content.slice(0, originalPos) +
        newDecoratorContent +
        content.slice(originalPos + decoratorContent.length);
      fs.writeFileSync(filePath, content);
      console.log(
        `UPDATE ${filePath} (Added to ${
          property === "commands" ? "App" : "parent"
        })`
      );
    } else {
      // Property doesn't exist within decorator, create it before } )
      // Regex to find the closing } ) of the decorator
      const closingRegex = new RegExp(`(\\}\\s*\\))$`, "m");

      if (closingRegex.test(decoratorContent)) {
        const newProperty = `  ${property}: [ ${valueToAdd} ],\n`;
        const newDecoratorContent = decoratorContent.replace(
          closingRegex,
          (match) => {
            // Insert before } )
            const closingBracketIndex = match.lastIndexOf("}");
            return (
              match.slice(0, closingBracketIndex) +
              newProperty +
              match.slice(closingBracketIndex)
            );
          }
        );

        // Replace only the decorator in content
        content =
          content.slice(0, originalPos) +
          newDecoratorContent +
          content.slice(originalPos + decoratorContent.length);
        fs.writeFileSync(filePath, content);
        console.log(
          `UPDATE ${filePath} (Added to  ${
            property === "commands" ? "App" : "parent"
          })`
        );
      } else {
        console.warn(
          `WARNING: Unable to find the decorator @App or @Command in  ${filePath}. Add it manually.`
        );
      }
    }
  }

  /**
   * Generates a command template for a new command class
   *
   * @param className - The name of the command class
   * @param commandName - The name of the command
   * @param description - The description of the command (optional)
   * @param subCommand - The subcommands of the command (optional)
   * @returns The generated command template
   */
  static commandTemplate(
    className: string,
    commandName: string,
    description: string = "",
    subCommand: string[] = [],
    alias: string = ""
  ): string {
    const subCommands =
      subCommand.length > 0 ? subCommand.map((v) => `"${v}"`).join(" ,") : "[]";
    return `import { Command } from 'terminor';

@Command({
  commandName: '${commandName}',
  alias: '${alias}',
  description: '${description}',
  arguments: [],
  subCommands: [${subCommand}]
})
export class ${className} {
  handler() {
    console.log('Hello from ${commandName}!');
  }
}
`;
  }

  /**
   * Get all command names from files in the commands directory and verify they are registered in @App
   * Returns a list of command names that are properly registered.
   *
   * @param commandsDir - The directory containing command files
   * @param appFilePath - The path to the app.command.ts file
   * @returns An object containing registered commands and unregistered commands
   */
  static getRegisteredCommands(commandsDir: string): {
    registered: Array<RegisterdCommandType>;
    unregistered: Array<RegisterdCommandType>;
  } {
    const registered: Array<RegisterdCommandType> = [];
    const unregistered: Array<RegisterdCommandType> = [];
    const appFilePath = path.join(commandsDir, "app.command.ts");

    // Read all .ts files in the commands directory
    const files = fs.readdirSync(commandsDir).filter((f) => f.endsWith(".ts"));

    // Read app file to get registered commands
    const appContent = fs.readFileSync(appFilePath, "utf-8");
    const appCleanedContent = removeComments(appContent);

    // Extract the @App decorator first
    const appDecoratorRegex = new RegExp(
      `@App\\s*\\(\\s*\\{[\\s\\S]*?\\}\\s*\\)`,
      "m"
    );
    const appDecoratorMatch = appDecoratorRegex.exec(appCleanedContent);
    const registeredCommandClasses = new Set<string>();

    if (appDecoratorMatch) {
      // Extract class names from commands array within @App decorator
      const commandsArrayRegex = /commands:\s*\[\s*([^\]]*)\]/;
      const commandsArrayMatch = commandsArrayRegex.exec(appDecoratorMatch[0]);

      if (commandsArrayMatch) {
        const classNames = commandsArrayMatch[1]
          .split(",")
          .map((name) => name.trim())
          .filter((name) => name.length > 0);
        classNames.forEach((name) => registeredCommandClasses.add(name));
      }
    }

    // For each command file, extract commandName and verify it's in @App
    for (const file of files) {
      const filePath = path.join(commandsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const cleanedContent = removeComments(content);

      // Extract commandName from @Command or @App
      const commandNameRegex =
        /@(Command|App)\s*\(\s*\{[^}]*?commandName:\s*['"]([^'"]+)['"]/;
      const commandNameMatch = commandNameRegex.exec(cleanedContent);

      if (commandNameMatch) {
        const commandName = commandNameMatch[2];
        // Extract class name from file
        const classNameRegex = /export\s+class\s+(\w+)/;
        const classNameMatch = classNameRegex.exec(cleanedContent);

        if (classNameMatch) {
          const className = classNameMatch[1];
          if (registeredCommandClasses.has(className)) {
            registered.push({ name: commandName, file, class: className });
          } else if (file === "app.command.ts")
            registered.push({ name: commandName, file, class: className });
          else unregistered.push({ name: commandName, file, class: className });
        }
      }
    }

    return { registered, unregistered };
  }

  /**
   * Get all subcommands for a given command and verify they are registered in @App
   * Returns a list of subcommand names that are properly registered.
   *
   * @param commandName - The name of the command to search for
   * @param commandsDir - The directory containing command files
   * @param appFilePath - The path to the app.command.ts file
   * @returns An object containing registered subcommands and unregistered subcommands
   */
  static getCommandSubcommands(
    commandName: string,
    commandsDir: string
  ): {
    registered: string[];
    unregistered: string[];
  } {
    const registered: string[] = [];
    const unregistered: string[] = [];
    const appFilePath = path.join(commandsDir, "app.command.ts");

    // Find the command file
    const commandFile = this.findFileByCommandName(commandsDir, commandName);
    if (!commandFile) {
      console.warn(`Command '${commandName}' not found in ${commandsDir}`);
      return { registered, unregistered };
    }

    // Read the command file and extract subcommands
    const commandContent = fs.readFileSync(commandFile, "utf-8");
    const cleanedCommandContent = removeComments(commandContent);

    // Extract the @Command or @App decorator first
    const commandDecoratorRegex = new RegExp(
      `@(Command|App)\\s*\\(\\s*\\{[\\s\\S]*?\\}\\s*\\)`,
      "m"
    );
    const commandDecoratorMatch = commandDecoratorRegex.exec(
      cleanedCommandContent
    );
    const subcommands: string[] = [];

    if (commandDecoratorMatch) {
      // Extract subCommands array within decorator
      const subcommandRegex = /subCommands:\s*\[\s*([^\]]*)\]/;
      const subcommandMatch = subcommandRegex.exec(commandDecoratorMatch[0]);

      if (subcommandMatch) {
        const items = subcommandMatch[1]
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        subcommands.push(...items.map((item) => item.replace(/['"\s]/g, "")));
      }
    }

    const commandLists = FileManager.getRegisteredCommands(commandsDir);
    for (const subcommand of subcommands) {
      if (commandLists.registered.find((el) => el.name === subcommand))
        registered.push(subcommand);
      else if (commandLists.unregistered.find((el) => el.name === subcommand))
        unregistered.push(subcommand);
    }

    return { registered, unregistered };
  }
}
