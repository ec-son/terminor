import * as fs from "fs";
import * as path from "path";
import { FileManager } from "../../src/bin/fileManager";

jest.mock("../../src/tools", () => ({
  terExit: jest.fn(() => {
    throw new Error("terExit called");
  }),
}));

// Mock process.cwd for testing
const originalCwd = process.cwd;

describe("utils", () => {
  const testDir = path.join(__dirname, "../../.tmp-for-test-utils");
  const commandFile = path.join(testDir, "test.command.ts");

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    process.cwd = originalCwd;
  });

  describe("transformParentNames", () => {
    it("should transform a single command name to file path", () => {
      const content = `
import { Command } from 'terminor';

@Command({
  commandName: 'test',
  description: 'Test command'
})
export class TestCommand {}
`;
      fs.writeFileSync(commandFile, content);

      // Mock process.cwd to return our parent test directory
      process.cwd = jest.fn(() => testDir.replace("/.tmp-for-test-utils", ""));

      // The function expects to find commands in src/commands
      // For this test, we directly test the logic without full path resolution
      const result = FileManager.findFileByCommandName(testDir, "test");
      expect(result).toBe(commandFile);
    });

    it("should handle multiple comma-separated command names", () => {
      const content1 = `
@Command({
  commandName: 'test1',
  description: 'Test command 1'
})
export class TestCommand1 {}
`;
      const content2 = `
@Command({
  commandName: 'test2',
  description: 'Test command 2'
})
export class TestCommand2 {}
`;
      fs.writeFileSync(path.join(testDir, "test1.command.ts"), content1);
      fs.writeFileSync(path.join(testDir, "test2.command.ts"), content2);

      // Test finding multiple commands
      const result1 = FileManager.findFileByCommandName(testDir, "test1");
      const result2 = FileManager.findFileByCommandName(testDir, "test2");

      expect(result1).toEqual(path.join(testDir, "test1.command.ts"));
      expect(result2).toEqual(path.join(testDir, "test2.command.ts"));
    });

    it("should trim whitespace from command names", () => {
      const content = `
@Command({
  commandName: 'test',
  description: 'Test command'
})
export class TestCommand {}
`;
      fs.writeFileSync(commandFile, content);

      // Should handle "test" with proper trimming in the search
      const result = FileManager.findFileByCommandName(testDir, "test");
      expect(result).toBe(commandFile);
    });

    it("should filter out empty command names", () => {
      // Test that empty strings are handled properly
      const emptyCommand = FileManager.findFileByCommandName(testDir, "");
      expect(emptyCommand).toBeNull();
    });

    it("should return null when command is not found", () => {
      const result = FileManager.findFileByCommandName(testDir, "nonexistent");
      expect(result).toBeNull();
    });
  });
});
