import * as fs from "fs";
import * as path from "path";
import { FileManager } from "../../src/bin/fileManager";

jest.mock("../../src/tools", () => ({
  terExit: jest.fn(() => {
    throw new Error("terExit called");
  }),
}));

describe("command.ts - CreateCommand", () => {
  const testDir = path.join(__dirname, "../../.tmp-for-test-command");
  const appFile = path.join(testDir, "app.command.ts");
  const commandFile = path.join(testDir, "test.command.ts");

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    jest.clearAllMocks();

    // Create a mock app.command.ts
    const appContent = `
import { App } from 'terminor';

@App({
  commandName: 'app',
  commands: [],
  subCommands: []
})
export class AppCommand {}
`;
    fs.writeFileSync(appFile, appContent);
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe("CreateCommand flow", () => {
    it("should create a command file with the correct structure", () => {
      const className = FileManager.toClassName("test");
      const template = FileManager.commandTemplate(
        className,
        "test",
        "A test command",
        ["sub1"],
        "t"
      );

      expect(template).toContain(`@Command({`);
      expect(template).toContain(`commandName: 'test'`);
      expect(template).toContain(`alias: 't'`);
      expect(template).toContain(`description: 'A test command'`);
      expect(template).toContain(`export class ${className}`);
      expect(template).toContain(`handler() {`);
    });

    it("should handle creating a command with no description", () => {
      const className = FileManager.toClassName("simple");
      const template = FileManager.commandTemplate(className, "simple");

      expect(template).toContain("commandName: 'simple'");
      expect(template).toContain("description: ''");
    });

    it("should handle creating a command with multiple subcommands", () => {
      const className = FileManager.toClassName("parent");
      const subCommands = ["sub1", "sub2", "sub3"];
      const template = FileManager.commandTemplate(
        className,
        "parent",
        "Parent command",
        subCommands
      );

      expect(template).toContain("subCommands:");
    });

    it("should create a command file in the correct directory", () => {
      const commandName = "integration-test";
      const className = FileManager.toClassName(commandName);
      const content = FileManager.commandTemplate(
        className,
        commandName,
        "Integration test"
      );

      FileManager.createCommandFile(testDir, commandName, content);

      const filePath = path.join(testDir, `${commandName}.command.ts`);
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, "utf-8")).toContain(className);
    });

    it("should add import to app.command.ts", () => {
      const className = "TestCommand";
      const fileName = "test.command";

      FileManager.addImport(appFile, className, fileName);

      const content = fs.readFileSync(appFile, "utf-8");
      expect(content).toContain(
        `import { ${className} } from './${fileName}';`
      );
    });

    it("should add command to @App commands array", () => {
      const className = "TestCommand";

      FileManager.addToDecoratorArray(appFile, "commands", className, false);

      const content = fs.readFileSync(appFile, "utf-8");
      expect(content).toContain("commands: [");
      expect(content).toContain(className);
    });

    it("should add subcommand to parent command", () => {
      const parentContent = `
import { Command } from 'terminor';

@Command({
  commandName: 'parent',
  subCommands: []
})
export class ParentCommand {}
`;
      const parentFile = path.join(testDir, "parent.command.ts");
      fs.writeFileSync(parentFile, parentContent);

      const subcommandName = "child";
      FileManager.addToDecoratorArray(
        parentFile,
        "subCommands",
        subcommandName,
        true
      );

      const updatedContent = fs.readFileSync(parentFile, "utf-8");
      expect(updatedContent).toContain("subCommands: [");
      expect(updatedContent).toContain(`'${subcommandName}'`);
    });

    it("should handle command creation with special characters", () => {
      const commandName = "my-special-cmd";
      const className = FileManager.toClassName(commandName);

      expect(className).toBe("MySpecialCmdCommand");

      const template = FileManager.commandTemplate(
        className,
        commandName,
        "Special command"
      );

      expect(template).toContain(`commandName: '${commandName}'`);
    });
  });

  describe("CreateCommand with comments", () => {
    it("should handle command files with single-line comments", () => {
      const commandContent = `
import { Command } from 'terminor';

// This is a comment with commandName: 'fake'
@Command({
  commandName: 'real-command',
  description: 'Real command'
})
export class RealCommand {}
`;
      fs.writeFileSync(commandFile, commandContent);

      const result = FileManager.findFileByCommandName(testDir, "real-command");
      expect(result).toBe(commandFile);

      const fakeResult = FileManager.findFileByCommandName(testDir, "fake");
      expect(fakeResult).toBeNull();
    });

    it("should handle command files with multi-line comments", () => {
      const commandContent = `
import { Command } from 'terminor';

/*
  This is a multi-line comment
  commandName: 'commented-out'
*/

@Command({
  commandName: 'actual-command',
  description: 'Actual command'
})
export class ActualCommand {}
`;
      fs.writeFileSync(commandFile, commandContent);

      const result = FileManager.findFileByCommandName(
        testDir,
        "actual-command"
      );
      expect(result).toBe(commandFile);

      const commentedResult = FileManager.findFileByCommandName(
        testDir,
        "commented-out"
      );
      expect(commentedResult).toBeNull();
    });

    it("should add subcommand ignoring commented properties", () => {
      const commandContent = `
import { Command } from 'terminor';

@Command({
  commandName: 'test',
  subCommands: []
})
export class TestCommand {}
`;
      fs.writeFileSync(commandFile, commandContent);

      FileManager.addToDecoratorArray(
        commandFile,
        "subCommands",
        "new-sub",
        true
      );

      const updatedContent = fs.readFileSync(commandFile, "utf-8");
      expect(updatedContent).toContain("'new-sub'");
      // Verify the new-sub was added to the decorator, not the comment
      expect(updatedContent).toContain("subCommands: [ 'new-sub'");
    });

    it("should not add duplicate subcommand when present in comments", () => {
      const commandContent = `
import { Command } from 'terminor';

@Command({
  commandName: 'test',
  subCommands: [ 'sub1' ] // First sub: 'sub2'
})
export class TestCommand {}
`;
      fs.writeFileSync(commandFile, commandContent);

      FileManager.addToDecoratorArray(commandFile, "subCommands", "sub1", true);

      const updatedContent = fs.readFileSync(commandFile, "utf-8");
      const matches = (updatedContent.match(/'sub1'/g) || []).length;
      expect(matches).toBe(1); // Should not add duplicate
    });
  });
});
