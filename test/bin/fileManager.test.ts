import * as fs from "fs";
import * as path from "path";
import { FileManager } from "../../src/bin/fileManager";
import { terExit } from "../../src/tools";

jest.mock("../../src/tools", () => ({
  terExit: jest.fn(() => {
    throw new Error("terExit called");
  }),
}));

describe("FileManager", () => {
  const testDir = path.join(__dirname, "../../.tmp-for-test");
  const testFile = path.join(testDir, "test.command.ts");

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe("toClassName", () => {
    it("should convert kebab-case to PascalCase with Command suffix", () => {
      expect(FileManager.toClassName("my-command")).toBe("MyCommandCommand");
    });

    it("should handle single word", () => {
      expect(FileManager.toClassName("test")).toBe("TestCommand");
    });

    it("should handle multiple hyphens", () => {
      expect(FileManager.toClassName("my-long-command")).toBe(
        "MyLongCommandCommand"
      );
    });

    it("should convert lowercase to PascalCase with Command suffix", () => {
      expect(FileManager.toClassName("list")).toBe("ListCommand");
    });
  });

  describe("findFileByCommandName", () => {
    it("should find a file with @Command decorator with commandName property", () => {
      const content = `
import { Command } from 'terminor';

@Command({
  commandName: 'test',
  description: 'Test command'
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      const result = FileManager.findFileByCommandName(testDir, "test");
      expect(result).toBe(testFile);
    });

    it("should find a file with @App decorator with commandName property", () => {
      const content = `
import { App } from 'terminor';

@App({
  commandName: 'app',
  description: 'Main app'
})
export class AppCommand {}
`;
      fs.writeFileSync(testFile, content);

      const result = FileManager.findFileByCommandName(testDir, "app");
      expect(result).toBe(testFile);
    });

    it("should handle double quotes", () => {
      const content = `
@Command({
  commandName: "mycommand",
  description: "Test"
})
export class MyCommand {}
`;
      fs.writeFileSync(testFile, content);

      const result = FileManager.findFileByCommandName(testDir, "mycommand");
      expect(result).toBe(testFile);
    });

    it("should handle multiline decorators", () => {
      const content = `
@Command({
  description: 'Test',
  arguments: [],
  commandName: 'test'
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      const result = FileManager.findFileByCommandName(testDir, "test");
      expect(result).toBe(testFile);
    });

    it("should ignore commandName outisde of @Command", () => {
      const content = `
commandName: 'ignored'

@Command({
  description: 'Test'
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      const result = FileManager.findFileByCommandName(testDir, "test");
      expect(result).toBeNull();
    });

    it("should ignore commandName in comments", () => {
      const content = `

@Command({
  //commandName: 'test',
  description: 'Test'
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      const result = FileManager.findFileByCommandName(testDir, "test");
      expect(result).toBeNull();
    });

    it("should ignore @Command in comments", () => {
      const content = `
// This has commandName: 'ignored'

/*@Command({
  commandName: 'test',
  description: 'Test'
})*/
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      const result = FileManager.findFileByCommandName(testDir, "test");
      expect(result).toBeNull();
    });

    it("should return null if commandName not found", () => {
      const content = `
@Command({
  commandName: 'other',
  description: 'Test'
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      const result = FileManager.findFileByCommandName(testDir, "notfound");
      expect(result).toBeNull();
    });

    it("should handle special characters in commandName", () => {
      const content = `
@Command({
  commandName: 'test-command',
  description: 'Test'
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      const result = FileManager.findFileByCommandName(testDir, "test-command");
      expect(result).toBe(testFile);
    });
  });

  describe("addImport", () => {
    it("should add import after the last import statement", () => {
      const content = `import { Command } from 'terminor';
import { Handler } from 'terminor';

@Command({})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addImport(testFile, "NewClass", "new.class");

      const result = fs.readFileSync(testFile, "utf-8");
      expect(result).toContain("import { NewClass } from './new.class';");
      expect(
        result.indexOf("import { NewClass }") >
          result.indexOf("import { Handler }")
      ).toBe(true);
    });

    it("should add import at the beginning if no imports exist", () => {
      const content = `const x = 'import this should not be matched';

export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addImport(testFile, "NewClass", "new.class");

      const result = fs.readFileSync(testFile, "utf-8");
      expect(result.startsWith("import { NewClass }")).toBe(true);
    });

    it("should not add import if class name already exists", () => {
      const content = `import { NewClass } from './old.path';

export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addImport(testFile, "NewClass", "new.class");

      const result = fs.readFileSync(testFile, "utf-8");
      expect(result).toContain("from './old.path'");
      expect(result).not.toContain("from './new.class'");
    });

    it("should ignore import strings inside comments", () => {
      const content = `import { Command } from 'terminor';
// import { FakeClass } from 'fake';

export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addImport(testFile, "NewClass", "new.class");

      const result = fs.readFileSync(testFile, "utf-8");
      const importLines = result
        .split("\n")
        .filter((line) => line.match(/^import\s*{/));

      expect(importLines.length).toBe(2);
    });

    it("should handle imports with different quote styles", () => {
      const content = `import { A } from "module1";
import { B } from 'module2';

export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addImport(testFile, "NewClass", "new.class");

      const result = fs.readFileSync(testFile, "utf-8");
      expect(result).toContain("import { NewClass } from './new.class';");
    });
  });

  describe("addToDecoratorArray", () => {
    it("should add string to subCommands array", () => {
      const content = `
@Command({
  commandName: 'test',
  subCommands: [ ]
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addToDecoratorArray(testFile, "subCommands", "sub1", true);

      const result = fs.readFileSync(testFile, "utf-8");
      expect(result).toContain("subCommands: [");
      expect(result).toContain("'sub1'");
    });

    it("should add class to commands array", () => {
      const content = `
@App({
  commandName: 'app',
  commands: [ ]
})
export class AppCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addToDecoratorArray(
        testFile,
        "commands",
        "TestCommand",
        false
      );

      const result = fs.readFileSync(testFile, "utf-8");
      expect(result).toContain("commands: [");
      expect(result).toContain("TestCommand");
    });

    it("should append to existing array with trailing comma", () => {
      const content = `
@Command({
  commandName: 'test',
  subCommands: [ 'sub1', ]
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addToDecoratorArray(testFile, "subCommands", "sub2", true);

      const result = fs.readFileSync(testFile, "utf-8");
      expect(result).toContain("'sub1'");
      expect(result).toContain("'sub2'");
      expect(result.indexOf("'sub1'") < result.indexOf("'sub2'")).toBe(true);
    });

    it("should append to existing array without trailing comma", () => {
      const content = `
@Command({
  commandName: 'test',
  subCommands: [ 'sub1' ]
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addToDecoratorArray(testFile, "subCommands", "sub2", true);

      const result = fs.readFileSync(testFile, "utf-8");
      expect(result).toContain("'sub1'");
      expect(result).toContain("'sub2'");
      expect(result.indexOf("'sub1'") < result.indexOf("'sub2'")).toBe(true);
    });

    it("should not add duplicate with single quotes", () => {
      const content = `
@Command({
  commandName: 'test',
  subCommands: [ 'sub1' ]
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addToDecoratorArray(testFile, "subCommands", "sub1", true);

      const result = fs.readFileSync(testFile, "utf-8");
      const matches = result.match(/'sub1'/g) || [];
      expect(matches.length).toBe(1);
    });

    it("should not add duplicate with different quote styles", () => {
      const content = `
@Command({
  commandName: 'test',
  subCommands: [ 'sub1' ]
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addToDecoratorArray(testFile, "subCommands", "sub1", true);

      const result = fs.readFileSync(testFile, "utf-8");
      const matches = result.match(/['"]sub1['"]/g) || [];
      expect(matches.length).toBe(1);
    });

    it("should not add duplicate class name", () => {
      const content = `
@App({
  commandName: 'app',
  commands: [ TestCommand ]
})
export class AppCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addToDecoratorArray(
        testFile,
        "commands",
        "TestCommand",
        false
      );

      const result = fs.readFileSync(testFile, "utf-8");
      const matches = (result.match(/commands:\s*\[\s*TestCommand/g) || [])
        .length;
      expect(matches).toBe(1);
    });

    it("should create property if it doesn't exist", () => {
      const content = `
@Command({
  commandName: 'test'
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addToDecoratorArray(testFile, "subCommands", "sub1", true);

      const result = fs.readFileSync(testFile, "utf-8");
      expect(result).toContain("subCommands: [");
      expect(result).toContain("'sub1'");
      expect(result).toContain("commandName: 'test'");
    });

    it("should handle multiline decorator arrays", () => {
      const content = `
@Command({
  commandName: 'test',
  subCommands: [
    'sub1',
    'sub2'
  ]
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addToDecoratorArray(testFile, "subCommands", "sub3", true);

      const result = fs.readFileSync(testFile, "utf-8");
      expect(result).toContain("'sub3'");
    });

    it("should ignore comments inside arrays", () => {
      const content = `
@Command({
  commandName: 'test',
  subCommands: [
    'sub1', // first
    // 'sub2'
  ]
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addToDecoratorArray(testFile, "subCommands", "sub2", true);

      const result = fs.readFileSync(testFile, "utf-8");
      expect(result).toContain("'sub2'");
    });

    it("should handle only @App decorator", () => {
      const content = `
@App({
  commandName: 'app',
  commands: [ ]
})
export class AppCommand {}

@Command({
  commandName: 'test'
})
export class TestCommand {}
`;
      fs.writeFileSync(testFile, content);

      FileManager.addToDecoratorArray(
        testFile,
        "commands",
        "NewCommand",
        false
      );

      const result = fs.readFileSync(testFile, "utf-8");
      expect(result).toContain("@App({");
      expect(result).toContain("commands: [");
      expect(result).toContain("NewCommand");
    });
  });

  describe("createCommandFile", () => {
    it("should create a new command file with the given content", () => {
      const commandName = "test-command";
      const content = "export class TestCommandCommand {}";

      FileManager.createCommandFile(testDir, commandName, content);

      const filePath = path.join(testDir, `${commandName}.command.ts`);
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, "utf-8")).toBe(content);
    });

    it("should fail if the file already exists", () => {
      const commandName = "test-command";
      const content = "export class TestCommandCommand {}";

      FileManager.createCommandFile(testDir, commandName, content);

      const consoleSpy = jest.spyOn(console, "error");
      try {
        FileManager.createCommandFile(testDir, commandName, content);
        fail("Should have thrown an error");
      } catch (e) {
        // Expected to throw
        expect(consoleSpy).toHaveBeenCalled();
      }
      consoleSpy.mockRestore();
    });
  });

  describe("commandTemplate", () => {
    it("should generate a valid command template", () => {
      const template = FileManager.commandTemplate(
        "TestCommand",
        "test",
        "A test command"
      );

      expect(template).toContain("@Command({");
      expect(template).toContain("commandName: 'test'");
      expect(template).toContain("description: 'A test command'");
      expect(template).toContain("export class TestCommand");
      expect(template).toContain("handler()");
    });

    it("should include alias in the template", () => {
      const template = FileManager.commandTemplate(
        "TestCommand",
        "test",
        "A test command",
        [],
        "t"
      );

      expect(template).toContain("alias: 't'");
    });

    it("should include subcommands in the template", () => {
      const template = FileManager.commandTemplate(
        "TestCommand",
        "test",
        "A test command",
        ["sub1", "sub2"]
      );

      expect(template).toContain("subCommands:");
    });
  });

  describe("getRegisteredCommands", () => {
    it("should return registered and unregistered commands", () => {
      const commandFile = path.join(testDir, "test.command.ts");
      const appFile = path.join(testDir, "app.command.ts");

      const commandContent = `
import { Command } from 'terminor';

@Command({
  commandName: 'test',
  description: 'Test command'
})
export class TestCommand {
  handler() {}
}
`;

      const appContent = `
import { Command } from 'terminor';
import { TestCommand } from './test.command';

@App({
  commandName: 'app',
  commands: [ TestCommand ]
})
export class AppCommand {
  handler() {}
}
`;

      fs.writeFileSync(commandFile, commandContent);
      fs.writeFileSync(appFile, appContent);

      const result = FileManager.getRegisteredCommands(testDir);

      expect(result.registered.length).toBeGreaterThan(0);
      expect(result.registered.some((cmd) => cmd.name === "test")).toBe(true);
    });

    it("should ignore comments when finding commands", () => {
      const commandFile = path.join(testDir, "test.command.ts");
      const appFile = path.join(testDir, "app.command.ts");

      const commandContent = `
import { Command } from 'terminor';

// This is commented out: commandName: 'commented'
/* Multi-line comment: commandName: 'also-commented' */

@Command({
  commandName: 'test',
  description: 'Test command'
})
export class TestCommand {
  handler() {}
}
`;

      const appContent = `
import { TestCommand } from './test.command';

@App({
  commandName: 'app',
  commands: [ TestCommand ]
  // This is commented: [ UnusedCommand ]
})
export class AppCommand {
  handler() {}
}
`;

      fs.writeFileSync(commandFile, commandContent);
      fs.writeFileSync(appFile, appContent);

      const result = FileManager.getRegisteredCommands(testDir);

      // Should only find 'test', not 'commented' or 'also-commented'
      const testCommand = result.registered.find((cmd) => cmd.name === "test");
      expect(testCommand).toBeDefined();
    });
  });

  describe("getCommandSubcommands", () => {
    it("should return registered and unregistered subcommands", () => {
      const commandFile = path.join(testDir, "test.command.ts");
      const appFile = path.join(testDir, "app.command.ts");

      const commandContent = `
import { Command } from 'terminor';

@Command({
  commandName: 'test',
  subCommands: ['sub1', 'sub2']
})
export class TestCommand {
  handler() {}
}
`;

      const appContent = `
import { TestCommand } from './test.command';

@App({
  commandName: 'app',
  subCommands: ['sub1'],
  commands: [ TestCommand ]
})
export class AppCommand {
  handler() {}
}
`;

      fs.writeFileSync(commandFile, commandContent);
      fs.writeFileSync(appFile, appContent);

      const result = FileManager.getCommandSubcommands("test", testDir);

      expect(result.registered).toContain("sub1");
      expect(result.unregistered).toContain("sub2");
    });

    it("should handle comments in subcommands", () => {
      const commandFile = path.join(testDir, "test.command.ts");
      const appFile = path.join(testDir, "app.command.ts");

      const commandContent = `
import { Command } from 'terminor';

@Command({
  commandName: 'test',
  subCommands: [
    'sub1', // first subcommand
    /* 'sub2', */ // commented out
    'sub3'
  ]
})
export class TestCommand {
  handler() {}
}
`;

      const appContent = `
import { TestCommand } from './test.command';

@App({
  commandName: 'app',
  subCommands: ['sub1', 'sub3'],
  commands: [ TestCommand ]
})
export class AppCommand {
  handler() {}
}
`;

      fs.writeFileSync(commandFile, commandContent);
      fs.writeFileSync(appFile, appContent);

      const result = FileManager.getCommandSubcommands("test", testDir);

      expect(result.registered.length).toBeGreaterThan(0);
    });

    it("should return empty arrays if command not found", () => {
      const appFile = path.join(testDir, "app.command.ts");
      const appContent = `
@App({
  commandName: 'app'
})
export class AppCommand {}
`;

      fs.writeFileSync(appFile, appContent);

      const result = FileManager.getCommandSubcommands("nonexistent", testDir);

      expect(result.registered.length).toBe(0);
      expect(result.unregistered.length).toBe(0);
    });
  });
});
