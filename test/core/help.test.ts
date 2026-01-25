import { Help } from "../../src/core/help";
import { MetaDataType } from "../../src/types/metadata.type";
import { HelpConfig } from "../../src/types/config-cli.type";
import * as commandContainerModule from "../../src/utils/command-container";
import { formatOptionFlag } from "../../src/utils/format-option-flag";

jest.mock("../../src/utils/command-container");

describe("Help", () => {
  let mockMetadata: MetaDataType;
  let help: Help;

  beforeEach(() => {
    mockMetadata = {
      commandName: "test",
      alias: undefined,
      description: "Test command",
      args: [
        {
          argumentName: "file",
          required: true,
          variadic: false,
          type: "string",
          description: "Input file",
        },
        {
          argumentName: "output",
          required: false,
          variadic: false,
          type: "string",
          description: "Output file",
        },
      ],
      options: [
        {
          optionName: "verbose",
          flag: "verbose",
          alias: "v",
          type: "boolean",
          description: "Verbose output",
          value: false,
          propertyName: "verbose",
        },
        {
          optionName: "config",
          flag: "config",
          alias: "c",
          type: "string",
          default: "config.json",
          description: "Configuration file",
          value: "config.json",
          propertyName: "config",
        },
      ],
      subCommandNames: [],
      version: {
        flag: "version",
        disabled: false,
        showInHelp: true,
        description: "Show version",
      },
      help: {
        flag: "help",
        disabled: false,
        showInHelp: true,
        description: "Show help",
      },
      handlers: [],
      unknownOptions: [],
      excessArguments: [],
    };

    // Mock process.stdout.getWindowSize
    (process.stdout as any).getWindowSize = jest.fn(() => [120, 40]);

    help = new Help(mockMetadata, ["app"]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with default values", () => {
      const helpInstance = new Help(mockMetadata, ["app"]);

      expect(helpInstance).toMatchObject({
        metadata: mockMetadata,
        parentCommandNames: ["app"],
        isChangedTermWidth: false,
        windowSize: 120,
        termWidth: 30,
        itemIndentWidth: 2,
        itemSeparatorWidth: 2,
        _extraInfo: {
          showType: true,
          showDefaultValue: true,
          showChoice: true,
        },
      });
    });

    it("should apply values from helpConfig", () => {
      const config: HelpConfig = {
        termWidth: 50,
        itemIndentWidth: 3,
        itemSeparatorWidth: 3,
        windowSize: 400,
      };
      const helpInstance = new Help(mockMetadata, ["app"], config);
      expect(helpInstance as any).toMatchObject(config);
    });

    it("should apply helpConfig with extraInfo as boolean false", () => {
      const config: HelpConfig = {
        extraInfo: false,
      };
      const helpInstance = new Help(mockMetadata, ["app"], config);
      expect(helpInstance._extraInfo).toEqual({
        showChoice: false,
        showDefaultValue: false,
        showType: false,
      });
    });

    it("should apply helpConfig with extraInfo as object", () => {
      const config: HelpConfig = {
        extraInfo: {
          showType: false,
          showChoice: true,
        },
      };
      const helpInstance = new Help(mockMetadata, ["app"], config);
      expect(helpInstance._extraInfo.showType).toBe(false);
      expect(helpInstance._extraInfo.showChoice).toBe(true);
    });

    it("should apply isChangedTermWidth to true when termWidth is provided from helpConfigshould", () => {
      const config: HelpConfig = {
        termWidth: 50,
      };
      const helpInstance = new Help(mockMetadata, ["app"], config);
      expect((helpInstance as any).isChangedTermWidth).toBeTruthy();
    });

    it("should not apply isChangedTermWidth to true when termWidth is not provided from helpConfigshould", () => {
      const config: HelpConfig = {};
      const helpInstance = new Help(mockMetadata, ["app"], config);
      expect((helpInstance as any).isChangedTermWidth).toBeFalsy();
    });
  });

  describe("width", () => {
    it("should return an array with [termWith, desc]", () => {
      const config: HelpConfig = { termWidth: 30, windowSize: 550 };
      const helpInstance = new Help(mockMetadata, ["app"], config);
      expect((helpInstance as any).width()).toEqual([165, 385]);
    });
  });

  describe("splitText", () => {
    it("should trim text when isItem is false", () => {
      const result = (help as any).splitText("  hello world  ", 20, false);
      expect(result[0]).toBe("hello world");
    });

    it("should not trim text when isItem is true", () => {
      const result = (help as any).splitText("  hello  ", 20, true);
      expect(result[0]).toMatch(/^\s+hello/);
    });

    it("should not split text with length <= limit", () => {
      const text = "This is a very short text that doesn't needs to be split";
      const result = (help as any).splitText(text, text.length);
      expect(result.length).toBe(1);
    });

    it("should split long text", () => {
      const result = (help as any).splitText(
        "This is a very long text that needs to be split",
        15
      );
      expect(result.length).toBeGreaterThan(1);
      result.forEach((line: string) => {
        expect(line.length).toBeLessThanOrEqual(15);
      });
    });

    it("should return single element for short text", () => {
      const result = (help as any).splitText("hello world", 20);
      expect(result).toEqual(["hello world"]);
    });

    it("should handle newline breaks", () => {
      const result = (help as any).splitText("line1\nline2", 20);
      expect(result.join(" ")).toContain("line1");
    });
  });

  describe("formatItem", () => {
    type ArgumentValueType = {
      type?: any;
      default?: any;
      choices?: any[];
      description?: string;
    };
    it("should format item with description", () => {
      const result = (help as any).formatItem(
        "--verbose",
        "Enable verbose output"
      );

      expect(result).toContain("--verbose");
      expect(result).toContain("Enable verbose output");
    });

    it("should format item with long description", () => {
      const result = (help as any).formatItem(
        "--verbose",
        "Enable verbose output mode on terminal with this command. This option is not enable by default."
      );

      expect(result).toEqual(
        "  --verbose                         Enable verbose output mode on terminal with this command. This option is not enable \n                                    by default."
      );
    });

    it("should format item with long description", () => {
      let description =
        "Enable verbose output 78bbbbbbbbbbbb bbbbbbbbbbbbb bbbbbbbbbbbb bbbbbbbbbbbb";
      const extraInfo = (help as any).extraInfo({
        type: "boolean",
        description,
      } as ArgumentValueType);
      description = description ? description + extraInfo : extraInfo;
      const result = (help as any).formatItem("--verbose", description, true);

      expect(result).toEqual(
        "  --verbose                         Enable verbose output 78bbbbbbbbbbbb bbbbbbbbbbbbb bbbbbbbbbbbb bbbbbbbbbbbb \n                                                                                                              [boolean]"
      );
    });

    it("should handle item without description", () => {
      const result = (help as any).formatItem("--verbose");
      expect(result).toEqual("  --verbose");
    });

    it("should align columns properly", () => {
      const result = (help as any).formatItem("--verbose", "Description");
      const lines = result.split("\n");
      expect(lines.length).toBeGreaterThan(0);
      lines.forEach((line: string) => {
        expect(line.length).toBeGreaterThan(0);
      });
    });
  });

  describe("humanReadableArgumentName", () => {
    it("should format required argument with angle brackets", () => {
      const result = (help as any).humanReadableArgumentName({
        argumentName: "file",
        required: true,
        variadic: false,
      });
      expect(result).toBe("<file>");
    });

    it("should format optional argument with square brackets", () => {
      const result = (help as any).humanReadableArgumentName({
        argumentName: "output",
        required: false,
        variadic: false,
      });
      expect(result).toBe("[output]");
    });

    it("should format variadic argument with ellipsis", () => {
      const result = (help as any).humanReadableArgumentName({
        argumentName: "files",
        required: true,
        variadic: true,
      });
      expect(result).toBe("<files...>");
    });

    it("should format optional variadic argument", () => {
      const result = (help as any).humanReadableArgumentName({
        argumentName: "files",
        required: false,
        variadic: true,
      });
      expect(result).toBe("[files...]");
    });
  });

  describe("hasHelpOption and hasHelpVersion", () => {
    it("should return the value of metadata.help.disabled", () => {
      expect((help as any).hasHelpOption()).toEqual(
        mockMetadata.help.showInHelp && !mockMetadata.help.disabled
      );

      expect((help as any).hasHelpOption()).not.toEqual(false);
    });
    it("should return the value of metadata.version?.disabled", () => {
      expect((help as any).hasHelpVersion()).toEqual(
        mockMetadata.version?.showInHelp && !mockMetadata.version?.disabled
      );

      expect((help as any).hasHelpVersion()).not.toEqual(false);
    });
  });

  describe("visibleOptions", () => {
    it("should return custom options", () => {
      const result = (help as any).visibleOptions();
      const expectObjected = [
        {
          optionName: "verbose",
          flag: "verbose",
          alias: "v",
          type: "boolean",
          description: "Verbose output",
          value: false,
          propertyName: "verbose",
        },
        {
          optionName: "config",
          flag: "config",
          alias: "c",
          type: "string",
          default: "config.json",
          description: "Configuration file",
          value: "config.json",
          propertyName: "config",
        },
        {
          flag: "version",
          disabled: false,
          showInHelp: true,
          description: "Show version",
        },
        {
          flag: "help",
          disabled: false,
          showInHelp: true,
          description: "Show help",
        },
      ];
      // Should contain the custom options defined in metadata
      expect(result).toEqual(expectObjected);
    });

    it("should return exact custom options", () => {
      const helpWithDisabledVersion = new Help(
        {
          ...mockMetadata,
          version: {
            ...mockMetadata.version!,
            disabled: true,
            showInHelp: true,
          },
          help: { ...mockMetadata.help!, disabled: true, showInHelp: true },
        },
        ["app"]
      );

      const result = (helpWithDisabledVersion as any).visibleOptions();
      const expectObjected = [
        {
          optionName: "verbose",
          flag: "verbose",
          alias: "v",
          type: "boolean",
          description: "Verbose output",
          value: false,
          propertyName: "verbose",
        },
        {
          optionName: "config",
          flag: "config",
          alias: "c",
          type: "string",
          default: "config.json",
          description: "Configuration file",
          value: "config.json",
          propertyName: "config",
        },
      ];

      expect(result).toEqual(expectObjected);
    });

    it("should not show version option in help", () => {
      const helpWithDisabledVersion = new Help(
        {
          ...mockMetadata,
          version: {
            ...mockMetadata.version!,
            disabled: false,
            showInHelp: false,
          },
        },
        ["app"]
      );

      const result = (helpWithDisabledVersion as any).visibleOptions();
      // When disabled is false and showInHelp is false, hasHelpVersion returns false, so version is not included
      expect(result).not.toContainEqual(
        expect.objectContaining({ flag: "version" })
      );
    });

    it("should not show help option in help", () => {
      const helpWithDisabledHelp = new Help(
        {
          ...mockMetadata,
          help: { ...mockMetadata.help, disabled: false, showInHelp: false },
        },
        ["app"]
      );
      const result = (helpWithDisabledHelp as any).visibleOptions();
      // When disabled is false and showInHelp is false, hasHelpOption returns false, so help is not included
      expect(result).not.toContainEqual(
        expect.objectContaining({ flag: "help" })
      );
    });
  });

  describe("formatFlag", () => {
    it("should return a formated flag", () => {
      const result = (help as any).formatFlag({ flag: "version", alias: "v" });
      expect(result).toEqual("-v, --version");
    });

    it("should return a formated flag even if alias doesn't exist", () => {
      const result = (help as any).formatFlag({ flag: "config" });
      expect(result).toEqual("   --config");
    });

    it("should return a formated flag with blank space egal to long alias even if alias doesn't exist", () => {
      const helpInstance = new Help(
        {
          ...mockMetadata,
          help: { ...mockMetadata.help!, alias: "hel" },
        },
        ["app"]
      );
      const result = (helpInstance as any).formatFlag({ flag: "config" });
      expect(result).toEqual("     --config");
    });
  });

  describe("extraInfo", () => {
    it("should include choices in extra info", () => {
      const result = (help as any).extraInfo({
        choices: ["a", "b", "c"],
        description: "Test",
      });

      expect(result).toEqual(' (choices: "a", "b", "c")');
    });

    it("should include default value in extra info", () => {
      const result = (help as any).extraInfo({
        default: "value",
        description: "Test",
      });

      expect(result).toEqual(" (default: value)");
    });

    it("should include type in extra info", () => {
      const result = (help as any).extraInfo({
        type: "string",
        description: "Test",
      });

      expect(result).toEqual(
        "                                                                       [string]"
      );
    });

    it("should handle date default value", () => {
      const date = new Date("2023-01-01");
      const result = (help as any).extraInfo({
        default: date,
        description: "Test",
      });
      expect(result).toEqual(' (default: "2023-01-01T00:00:00.000Z")');
    });

    it("should include all extra info", () => {
      const result = (help as any).extraInfo({
        choices: ["a", "b", "c"],
        default: "a",
        type: "string",
        description: "Test",
      });
      expect(result).toEqual(
        ' (choices: "a", "b", "c", default: a)                                  [string]'
      );
    });

    it("should return empty string for element without extra info", () => {
      const result = (help as any).extraInfo({
        description: "Test",
      });
      expect(result).toBe("");
    });
  });

  describe("commandUsage", () => {
    it("should generate usage string with parent command names", () => {
      const result = (help as any).commandUsage();
      expect(result).toContain("app");
      expect(result).toContain("test");
    });

    it("should include arguments in usage", () => {
      const result = (help as any).commandUsage();
      expect(result).toContain("<file>");
      expect(result).toContain("[output]");
    });

    it("should include [options] when options exist", () => {
      const result = (help as any).commandUsage();
      expect(result).toContain("[options]");
    });

    it("should use custom usage from metadata if provided", () => {
      const metadataWithCustomUsage = {
        ...mockMetadata,
        usage: "custom usage string",
      };
      const helpInstance = new Help(metadataWithCustomUsage, ["app"]);
      const result = (helpInstance as any).commandUsage();
      expect(result).toBe("custom usage string");
    });

    it("should handle metadata with alias", () => {
      const metadataWithAlias = {
        ...mockMetadata,
        alias: "t",
      };
      const helpInstance = new Help(metadataWithAlias, ["app"]);
      const result = (helpInstance as any).commandUsage();
      expect(result).toEqual("app test|t [options] <file> [output]");
    });
  });

  describe("argumentsDescription", () => {
    it("should return array of formatted arguments", () => {
      const result = (help as any).argumentsDescription();

      expect(result).toEqual([
        "  file                              Input file                                                                 [string]",
        "  output                            Output file                                                                [string]",
      ]);
    });

    it("should include argument names", () => {
      const result = (help as any).argumentsDescription();
      const combined = result.join("\n");
      expect(combined).toContain("file");
      expect(combined).toContain("output");
    });

    it("should return an arg with not description", () => {
      const helpInstance = new Help(
        {
          ...mockMetadata,
          args: [
            {
              argumentName: "name",
              type: "string",
              default: "John",
            },
          ],
        },
        ["app"]
      );
      const result = (helpInstance as any).argumentsDescription();
      expect(result).toEqual([
        "  name                              (default: John)                                                            [string]",
      ]);
    });
  });

  describe("optionsDescription", () => {
    it("should return array of formatted options", () => {
      const result = (help as any).optionsDescription();
      expect(result).toEqual([
        "  -v, --verbose                     Verbose output                                                            [boolean]",
        "  -c, --config                      Configuration file (default: config.json)                                  [string]",
        "     --version                      Show version",
        "     --help                         Show help",
      ]);
    });

    it("should include option flags", () => {
      const result = (help as any).optionsDescription();
      const combined = result.join("\n");
      expect(combined).toContain("verbose");
      expect(combined).toContain("config");
    });

    it("should return an arg with not description", () => {
      const helpInstance = new Help(
        {
          ...mockMetadata,
          options: [
            {
              optionName: "config",
              propertyName: "config",
              value: "true",
              type: "boolean",
              flag: "--config",
              alias: "-c",
            },
          ],
        },
        ["app"]
      );
      const result = (helpInstance as any).optionsDescription();
      expect(result).toEqual([
        "  -c, --config                                                                                                [boolean]",
        "      --version                     Show version",
        "      --help                        Show help",
      ]);
    });
  });

  describe("formatHelp", () => {
    it("should return array of strings", () => {
      const result = help.formatHelp();
      expect(Array.isArray(result)).toBe(true);
      result.forEach((line) => {
        expect(typeof line).toBe("string");
      });
    });

    it("should return array of help", () => {
      const result = help.formatHelp();
      const expectArray = [
        "Usage: app test [options] <file> [output]",
        "",
        "Test command",
        "",
        "Arguments:",
        "  file            Input file                                                                                   [string]",
        "  output          Output file                                                                                  [string]",
        "",
        "Options:",
        "  -v, --verbose   Verbose output                                                                              [boolean]",
        "  -c, --config    Configuration file (default: config.json)                                                    [string]",
        "     --version    Show version",
        "     --help       Show help",
        "",
      ];

      expect(result).toEqual(expectArray);
    });

    it("should return array of help", () => {
      const helpInstance = new Help(
        {
          ...mockMetadata,
          args: [
            {
              argumentName: "name",
              type: "string",
              default: "John",
            },
          ],
        },
        ["app"],
        { termWidth: 30 }
      );
      const result = helpInstance.formatHelp();
      const expectArray = [
        "Usage: app test [options] [name]",
        "",
        "Test command",
        "",
        "Arguments:",
        "  name                              (default: John)                                                            [string]",
        "",
        "Options:",
        "  -v, --verbose                     Verbose output                                                            [boolean]",
        "  -c, --config                      Configuration file (default: config.json)                                  [string]",
        "     --version                      Show version",
        "     --help                         Show help",
        "",
      ];

      expect(result).toEqual(expectArray);
    });

    it("should include Usage section", () => {
      const result = help.formatHelp();
      expect(result.join("\n")).toContain("Usage:");
    });

    it("should include Arguments section when arguments exist", () => {
      const result = help.formatHelp();
      expect(result.join("\n")).toContain("Arguments:");
    });

    it("should include Options section when options exist", () => {
      const result = help.formatHelp();
      expect(result.join("\n")).toContain("Options:");
    });

    it("should include description if provided", () => {
      const result = help.formatHelp();
      expect(result.join("\n")).toContain("Test command");
    });

    it("should include Commands section when subcommands exist", () => {
      const metadataWithSubcommands = {
        ...mockMetadata,
        subCommandNames: ["subcommand"],
      };

      const mockCommandContainer =
        commandContainerModule.commandContainer as jest.Mocked<any>;
      mockCommandContainer.getCommandByCommandName.mockReturnValue({
        ...mockMetadata,
        commandName: "subcommand",
        description: "Subcommand description",
      });

      const helpInstance = new Help(metadataWithSubcommands, ["app"]);
      const result = helpInstance.formatHelp();
      expect(result.join("\n")).toContain("Commands:");
    });

    it("should handle no arguments", () => {
      const metadataNoArgs = {
        ...mockMetadata,
        args: [],
      };
      const helpInstance = new Help(metadataNoArgs, ["app"]);
      const result = helpInstance.formatHelp();
      expect(result.join("\n")).not.toContain("Arguments:");
    });

    it("should handle no options", () => {
      const metadataNoOptions = {
        ...mockMetadata,
        options: [],
        version: {
          ...mockMetadata.version!,
          disabled: false,
          showInHelp: true,
        },
        help: { ...mockMetadata.help, disabled: false, showInHelp: true },
      };
      const helpInstance = new Help(metadataNoOptions, ["app"]);
      const result = helpInstance.formatHelp();
      // Even with no custom options, help and version are shown when disabled is false and showInHelp is true
      expect(result.join("\n")).toContain("Options:");
    });
  });

  describe("display", () => {
    it("should write to stdout", () => {
      const stdoutSpy = jest
        .spyOn(process.stdout, "write")
        .mockImplementation();
      help.display();
      expect(stdoutSpy).toHaveBeenCalled();
      stdoutSpy.mockRestore();
    });

    it("should output formatted help", () => {
      const stdoutSpy = jest
        .spyOn(process.stdout, "write")
        .mockImplementation();
      help.display();
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain("Usage:");
      stdoutSpy.mockRestore();
    });
  });
});
