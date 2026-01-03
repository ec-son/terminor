import { Cli } from "../../src/core/cli";
import { commandContainer } from "../../src/utils/command-container";
import { terExit } from "../../src/tools";
import { KsError } from "../../src/exceptions/ks-error";
import { OptionValueType } from "../../src/types/option.type";

jest.mock("../../src/utils/command-container");
jest.mock("../../src/tools", () => ({ terExit: jest.fn() }));
jest.mock("../../src/utils/suggest-similar", () => ({
  suggestSimilar: jest.fn(),
}));

describe("Cli", () => {
  let mockMetadata: any;
  let metaIndex: symbol;

  beforeEach(() => {
    metaIndex = Symbol("metaIndex");

    mockMetadata = {
      commandName: "app",
      args: [],
      options: [],
      subCommandNames: [],
      handlers: [],
      unknownOptions: [],
      excessArguments: [],
      help: { flag: "--help", disabled: true },
      version: { flag: "--version", disabled: true },
    };

    // Make mock commandContainer.getCommand attach metadata to the instance
    (commandContainer as any).getCommand = jest.fn((inst: any) => {
      inst[metaIndex] = mockMetadata;
      return { index: metaIndex };
    });

    (commandContainer as any).setCommand = jest.fn();
    (commandContainer as any).getCommandByCommandName = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // clean any keys on global objects if created
  });

  function createMockMetadata(overrides?: any) {
    return {
      commandName: "app",
      args: [],
      options: [],
      subCommandNames: [],
      handlers: [],
      unknownOptions: [],
      excessArguments: [],
      help: { flag: "--help", disabled: true },
      version: { flag: "--version", disabled: true },
      ...overrides,
    };
  }

  describe("constructor", () => {
    it("constructor should set appMetadata", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any);
      expect((cli as any).appMetadata).toBe(mockMetadata);
    });

    it("should call commandContainer.setCommand method with a correct parameters", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any);

      expect(
        Object.keys(
          ((commandContainer as any).setCommand as jest.Mock).mock
            .calls[0][0] as object
        )
      ).toEqual(["commandInstance", "name", "index"]);

      expect(
        (
          ((commandContainer as any).setCommand as jest.Mock).mock
            .calls[0][0] as any
        ).name
      ).toEqual("DummyApp");
    });
  });

  describe("parse", () => {
    it("should parse with default config when no config provided", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandInstance: {},
        });

      (cli as any).appMetadata = createMockMetadata();

      const processSpy = jest
        .spyOn(cli, "process" as any)
        .mockImplementation(() => {});

      cli.parse();

      expect(processSpy).toHaveBeenCalled();
      expect(processSpy.mock.calls[0].length).toBe(2);
      expect((cli as any).configCli).toEqual({
        allowExcessArguments: true,
        allowUnknownOption: false,
        argv: {
          data: [
            "/home/ecson/.nvm/versions/node/v24.11.1/bin/node",
            "/home/ecson/project/terminor/node_modules/.pnpm/jest-worker@29.7.0/node_modules/jest-worker/build/workers/processChild.js",
          ],
        },
        showSuggestionForUnknownCommand: true,
        showSuggestionForUnknownOption: true,
      });

      processSpy.mockRestore();
    });

    it("should parse with custom config", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandInstance: {},
        });

      (cli as any).appMetadata = createMockMetadata();

      const processSpy = jest
        .spyOn(cli, "process" as any)
        .mockImplementation(() => {});

      const customConfig = {
        argv: { data: ["node", "script.js", "arg1"], from: "user" as const },
        allowExcessArguments: false,
        allowUnknownOption: true,
        showSuggestionForUnknownCommand: false,
        showSuggestionForUnknownOption: false,
      };

      cli.parse(customConfig);

      expect(processSpy).toHaveBeenCalled();
      expect((process.env as any).TERMINOR_CONFIG_CLI).toBeDefined();
      expect((cli as any).configCli).toEqual(customConfig);

      processSpy.mockRestore();
    });

    it("should handle argv from node process when from is not specified", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandInstance: {},
        });

      (cli as any).appMetadata = createMockMetadata();

      const processSpy = jest
        .spyOn(cli, "process" as any)
        .mockImplementation(() => {});

      cli.parse({
        argv: { data: ["node", "script.js", "arg1"] },
      } as any);

      expect(processSpy).toHaveBeenCalled();

      processSpy.mockRestore();
    });
  });

  describe("process", () => {
    it("should call displayHelp when help flag present", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      // Ensure command lookup returns something so process doesn't throw
      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandInstance: {},
        });

      // make appMetadata include help flag
      (cli as any).appMetadata = {
        ...mockMetadata,
        help: { flag: "--help", disabled: false },
      };

      const spyHelp = jest
        .spyOn(cli, "displayHelp")
        .mockImplementation(() => {});

      cli.parse({
        argv: { data: ["node", "prog", "--help"], from: "user" },
      } as any);

      expect(spyHelp).toHaveBeenCalled();

      spyHelp.mockRestore();
    });

    it("should call displayVersion when version flag present", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandInstance: {},
        });

      (cli as any).appMetadata = {
        ...mockMetadata,
        version: { flag: "--version", alias: "-v", disabled: false },
      };

      const spyVersion = jest
        .spyOn(cli, "displayVersion")
        .mockImplementation(() => {});

      cli.parse({
        argv: { data: ["node", "prog", "-v"], from: "user" },
      } as any);

      expect(spyVersion).toHaveBeenCalled();

      spyVersion.mockRestore();
    });

    it("should throw CommandNotFoundError when command not found", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue(null);

      (cli as any).appMetadata = createMockMetadata();

      expect(() => {
        (cli as any).process([], createMockMetadata());
      }).toThrow(KsError);
    });

    it("should handle process with empty args", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;
      const mockCommand = {};

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandInstance: mockCommand,
        });

      const metaData = {
        ...createMockMetadata(),
        handlers: [],
        options: [],
        args: [],
      };

      (cli as any).process([], metaData);

      // Should not throw
      expect(true).toBe(true);
    });

    it("should handle single-character short option with boolean value", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;
      const mockCommand: any = {};

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandInstance: mockCommand,
        });

      const metaData = {
        ...createMockMetadata(),
        handlers: [],
        options: [
          {
            optionName: "verbose",
            alias: "-v",
            flag: "--verbose",
            type: "boolean",
            propertyName: "verbose",
            treated: false,
          },
        ],
        args: [],
      };

      (cli as any).process(["-v"], metaData);

      expect(mockCommand.verbose).toBe(true);
    });

    it("should set false value to an boolean option is not provided.", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;
      const mockCommand: any = {};

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandInstance: mockCommand,
        });

      const metaData = {
        ...createMockMetadata(),
        handlers: [],
        options: [
          {
            optionName: "verbose",
            alias: "-v",
            flag: "--verbose",
            type: "boolean",
            propertyName: "verbose",
            treated: false,
          },
        ],
        args: [],
      };

      // verbose option is not provided here
      (cli as any).process([], metaData);

      expect(mockCommand.verbose).toBe(false);
    });

    it("should handle excess arguments when allowExcessArguments is true", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;
      const mockCommand = {};

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandInstance: mockCommand,
        });

      const metaData = {
        ...createMockMetadata(),
        handlers: [],
        options: [],
        args: [],
        excessArguments: [],
      };

      (cli as any).configCli.allowExcessArguments = true;

      (cli as any).process(["excess1", "excess2"], metaData);

      expect(metaData.excessArguments.length).toBe(2);
    });

    it("should throw error for excess arguments when allowExcessArguments is false", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;
      const mockCommand = {};

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandInstance: mockCommand,
        });

      const metaData = {
        ...createMockMetadata(),
        handlers: [],
        options: [],
        args: [],
        excessArguments: [],
      };

      (cli as any).configCli.allowExcessArguments = false;

      expect(() => {
        (cli as any).process(["excess1"], metaData);
      }).toThrow(KsError);
    });
  });

  describe("optionHandler", () => {
    let cli: any;
    beforeEach(() => {
      class DummyApp {
        __init__() {}
      }
      cli = new Cli(DummyApp as any) as any;
    });

    it("should handle boolean option", () => {
      const command: any = {};
      const opt: OptionValueType = {
        optionName: "verbose",
        flag: "--verbose",
        type: "boolean",
        propertyName: "verbose",
        value: undefined,
      } as any;

      const args = ["--verbose"];
      const remaining = cli.optionHandler(opt, args, command);
      expect(opt.value).toBe(true);
      expect(command.verbose).toBe(true);
      expect(remaining.length).toBe(0);
    });

    it("should handle option with value", () => {
      const command: any = {};
      const opt: OptionValueType = {
        optionName: "config",
        flag: "--config",
        type: "string",
        propertyName: "config",
        value: undefined,
      } as any;

      const args = ["--config", "file.json"];
      const remaining = cli.optionHandler(opt, args, command);
      expect(opt.value).toBe("file.json");
      expect(command.config).toBe("file.json");
      expect(remaining.length).toBe(0);
    });

    it("should throw MissingValueError when missing value for non-boolean option", () => {
      const command: any = {};
      const opt: OptionValueType = {
        optionName: "config",
        flag: "--config",
        type: "string",
        propertyName: "config",
        value: undefined,
      } as any;

      const args = ["--config"];
      expect(() => cli.optionHandler(opt, args, command)).toThrow(KsError);
    });

    it("should throw MissingValueError when next arg starts with dash", () => {
      const command: any = {};
      const opt: OptionValueType = {
        optionName: "config",
        flag: "--config",
        type: "string",
        propertyName: "config",
        value: undefined,
      } as any;

      const args = ["--config", "--other"];
      expect(() => cli.optionHandler(opt, args, command)).toThrow(KsError);
    });

    it("should handle variadic option", () => {
      const command: any = {};
      const opt: OptionValueType = {
        optionName: "files",
        flag: "--files",
        type: "string",
        propertyName: "files",
        value: undefined,
        variadic: true,
      } as any;

      const args = ["--files", "file1.txt", "file2.txt", "--other"];
      const remaining = cli.optionHandler(opt, args, command);
      expect(Array.isArray(opt.value)).toBe(true);
      expect(opt.value.length).toBeGreaterThan(0);
      expect(command.files).toEqual(["file1.txt", "file2.txt"]);
    });

    it("should use custom onError handler", () => {
      const command: any = {};
      const customError = "Custom error message";
      const opt: OptionValueType = {
        optionName: "config",
        flag: "--config",
        type: "string",
        propertyName: "config",
        value: undefined,
        onError: jest.fn(() => customError),
      } as any;

      const args = ["--config"];
      expect(() => cli.optionHandler(opt, args, command)).toThrow(customError);
      expect(opt.onError).toHaveBeenCalledWith(undefined, "MissingValueError");
    });
  });

  describe("argumentHandler", () => {
    let cli: any;
    beforeEach(() => {
      class DummyApp {
        __init__() {}
      }
      cli = new Cli(DummyApp as any) as any;
    });

    it("should consume an argument and set value", () => {
      const argsOpt = [
        {
          argumentName: "file",
          type: "string",
          value: undefined,
          treated: false,
        },
      ];
      const args = ["input.txt"];
      const remaining = cli.argumentHandler(argsOpt, args);
      expect(argsOpt[0].value).toBe("input.txt");
      expect(remaining.length).toBe(0);
    });

    it("should return null when no args to consume", () => {
      const argsOpt: any[] = [];
      const args: string[] = [];
      const res = cli.argumentHandler(argsOpt, args);
      expect(res).toBeNull();
    });

    it("should handle variadic argument", () => {
      const argsOpt = [
        {
          argumentName: "files",
          type: "string",
          value: undefined,
          variadic: true,
          treated: false,
        },
      ];
      const args = ["file1.txt", "file2.txt"];
      const remaining = cli.argumentHandler(argsOpt, args);
      expect(Array.isArray(argsOpt[0].value)).toBe(true);
      expect((argsOpt[0] as any).value).toEqual(["file1.txt", "file2.txt"]);
    });

    it("should return null when all args are already treated", () => {
      const argsOpt = [
        {
          argumentName: "file",
          type: "string",
          value: "input.txt",
          treated: true,
        },
      ];
      const args = ["extra.txt"];
      const res = cli.argumentHandler(argsOpt, args);
      expect(res).toBeNull();
    });

    it("should return null when no untreated args exist", () => {
      const argsOpt: any[] = [];
      const args = ["something.txt"];
      const res = cli.argumentHandler(argsOpt, args);
      expect(res).toBeNull();
    });
  });

  describe("displayHelp", () => {
    it("should display help with custom help text when disabled is false and text is set", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandName: "app",
          help: {
            disabled: false,
            text: "Custom help text",
          },
        });

      (cli as any).appMetadata = { commandName: "app" };
      (cli as any).args = ["--help"];

      cli.displayHelp();

      expect(logSpy).toHaveBeenCalledWith("Custom help text");
      // expect(terExit as jest.Mock).toHaveBeenCalled();

      logSpy.mockRestore();
    });

    it("should display help with addHelpText before", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (process.stdout as any).getWindowSize = jest.fn(() => [120, 40]);
      const helpDisplaySpy = jest
        .spyOn(require("../../src/core/help").Help.prototype, "display")
        .mockImplementation(() => {});
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandName: "app",
          args: [],
          options: [],
          subCommandNames: [],
          handlers: [],
          unknownOptions: [],
          excessArguments: [],
          help: {
            flag: "--help",
            disabled: false,
            addHelpText: { position: "before", text: "BEFORE" },
          },
          version: { flag: "--version", disabled: true },
        });

      (cli as any).appMetadata = { commandName: "app" };
      (cli as any).args = ["--help"];

      cli.displayHelp();

      expect(logSpy).toHaveBeenCalledWith("BEFORE");
      expect(helpDisplaySpy).toHaveBeenCalled();

      logSpy.mockRestore();
      helpDisplaySpy.mockRestore();
    });

    it("should display help with addHelpText after", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (process.stdout as any).getWindowSize = jest.fn(() => [120, 40]);
      const helpDisplaySpy = jest
        .spyOn(require("../../src/core/help").Help.prototype, "display")
        .mockImplementation(() => {});
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandName: "app",
          args: [],
          options: [],
          subCommandNames: [],
          handlers: [],
          unknownOptions: [],
          excessArguments: [],
          help: {
            flag: "--help",
            disabled: false,
            addHelpText: { position: "after", text: "AFTER" },
          },
          version: { flag: "--version", disabled: true },
        });

      (cli as any).appMetadata = { commandName: "app" };
      (cli as any).args = ["--help"];

      cli.displayHelp();

      expect(logSpy).toHaveBeenCalledWith("AFTER");
      expect(helpDisplaySpy).toHaveBeenCalled();

      logSpy.mockRestore();
      helpDisplaySpy.mockRestore();
    });

    it("should handle help for subcommands", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (process.stdout as any).getWindowSize = jest.fn(() => [120, 40]);
      jest
        .spyOn(require("../../src/core/help").Help.prototype, "display")
        .mockImplementation(() => {});
      jest.spyOn(console, "log").mockImplementation(() => {});

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockImplementation((name: string, isMetadata?: boolean) => {
          if (isMetadata) {
            return {
              commandName: name,
              args: [],
              options: [],
              subCommandNames: [],
              handlers: [],
              unknownOptions: [],
              excessArguments: [],
              help: {
                flag: "--help",
                disabled: false,
              },
              version: { flag: "--version", disabled: true },
            };
          }
          return { commandInstance: {} };
        });

      (cli as any).appMetadata = {
        commandName: "app",
        subCommandNames: ["sub"],
      };
      (cli as any).args = ["sub", "--help"];

      cli.displayHelp();

      expect(terExit as jest.Mock).toHaveBeenCalled();
    });
  });

  describe("displayVersion", () => {
    it("should log version and call terExit", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;
      const spyLog = jest.spyOn(console, "log").mockImplementation(() => {});

      cli.displayVersion({ version: "1.2.3" } as any);
      expect(spyLog).toHaveBeenCalledWith("1.2.3");
      expect((terExit as jest.Mock).mock.calls.length).toBeGreaterThan(0);

      spyLog.mockRestore();
    });

    it("should log text property if it exists", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;
      const spyLog = jest.spyOn(console, "log").mockImplementation(() => {});

      cli.displayVersion({ version: "1.2.3", text: "Version 1.2.3" } as any);
      expect(spyLog).toHaveBeenCalledWith("Version 1.2.3");

      spyLog.mockRestore();
    });

    it("should add version text before version", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;
      const spyLog = jest.spyOn(console, "log").mockImplementation(() => {});

      cli.displayVersion({
        version: "1.2.3",
        addVersionText: { position: "before", text: "Before text" },
      } as any);

      const calls = spyLog.mock.calls;
      expect(calls[0][0]).toBe("Before text");
      expect(calls[1][0]).toBe("1.2.3");

      spyLog.mockRestore();
    });

    it("should add version text after version", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;
      const spyLog = jest.spyOn(console, "log").mockImplementation(() => {});

      cli.displayVersion({
        version: "1.2.3",
        addVersionText: { position: "after", text: "After text" },
      } as any);

      const calls = spyLog.mock.calls;
      expect(calls[0][0]).toBe("1.2.3");
      expect(calls[1][0]).toBe("After text");

      spyLog.mockRestore();
    });
  });

  describe("errors and suggestions", () => {
    beforeEach(() => {
      // ensure getCommandByCommandName returns something
      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandInstance: {},
        });
    });

    it("should suggest unknown option", () => {
      const suggest = require("../../src/utils/suggest-similar")
        .suggestSimilar as jest.Mock;
      suggest.mockReturnValue(["config"]);

      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;
      (cli as any).appMetadata = {
        ...createMockMetadata(),
        options: [],
        help: { flag: "--help", disabled: true },
        version: { flag: "--version", disabled: true },
      };

      expect(() =>
        cli.parse({
          argv: { data: ["prog", "--confi"], from: "user" },
        } as any)
      ).toThrow("Did you mean --config?");
    });

    it("should suggest unknown command", () => {
      const suggest = require("../../src/utils/suggest-similar")
        .suggestSimilar as jest.Mock;
      suggest.mockReturnValue(["subcmd"]);

      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (cli as any).appMetadata = {
        ...createMockMetadata(),
        args: [],
        subCommandNames: ["subcmd"],
        help: { flag: "--help", disabled: true },
        version: { flag: "--version", disabled: true },
      };

      expect(() =>
        cli.parse({
          argv: { data: ["badcmd"], from: "user" },
        } as any)
      ).toThrow("Did you mean subcmd?");
    });

    it("should record unknown option when allowUnknownOption is true", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;
      (cli as any).appMetadata = {
        ...createMockMetadata(),
        unknownOptions: [],
      };

      cli.parse({
        argv: { data: ["prog", "--unkn", "val"], from: "user" },
        allowUnknownOption: true,
      } as any);

      expect((cli as any).appMetadata.unknownOptions).toEqual([
        { optionName: "unkn", value: "val" },
      ]);
    });

    it("should display addHelpText before and after", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      // Mock process.stdout.getWindowSize for Help constructor
      (process.stdout as any).getWindowSize = jest.fn(() => [120, 40]);

      const helpDisplaySpy = jest
        .spyOn(require("../../src/core/help").Help.prototype, "display")
        .mockImplementation(() => {});
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      // ensure commandContainer returns proper metadata for displayHelp
      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandName: "app",
          args: [],
          options: [],
          subCommandNames: [],
          handlers: [],
          unknownOptions: [],
          excessArguments: [],
          help: {
            flag: "--help",
            disabled: false,
            addHelpText: { position: "before", text: "BEFORE" },
          },
          version: { flag: "--version", disabled: true },
        });

      (cli as any).appMetadata = { commandName: "app" };
      (cli as any).args = ["--help"];

      // call displayHelp directly to avoid process path differences
      cli.displayHelp();

      expect(logSpy).toHaveBeenCalledWith("BEFORE");
      expect(helpDisplaySpy).toHaveBeenCalled();

      logSpy.mockRestore();
      helpDisplaySpy.mockRestore();
    });

    it("should not suggest unknown option when showSuggestionForUnknownOption is false", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (cli as any).appMetadata = {
        ...createMockMetadata(),
        options: [],
        help: { flag: "--help", disabled: true },
        version: { flag: "--version", disabled: true },
      };

      expect(() =>
        cli.parse({
          argv: { data: ["prog", "--unkn"], from: "user" },
          showSuggestionForUnknownOption: false,
        } as any)
      ).toThrow("Unknown option: '--unkn'");
    });

    it("should use custom suggestion function for unknown options", () => {
      const customSuggest = jest.fn().mockReturnValue(["config"]);
      const customMessage = jest.fn((suggestions) => {
        throw new KsError(
          "Custom error with suggestions: " + suggestions.join(", "),
          {
            errorType: "UnknownOptionError",
          }
        );
      });

      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (cli as any).appMetadata = {
        ...createMockMetadata(),
        options: [{ optionName: "config", flag: "--config" }],
        help: { flag: "--help", disabled: true },
        version: { flag: "--version", disabled: true },
      };

      expect(() =>
        cli.parse({
          argv: { data: ["prog", "--unkn"], from: "user" },
          showSuggestionForUnknownOption: {
            custormFunctionSimilar: customSuggest,
            showSuggestionMessage: customMessage,
          },
        } as any)
      ).toThrow(KsError);
      expect(customMessage).toHaveBeenCalledWith(["--config"]);
      expect(customSuggest).toHaveBeenCalledWith("unkn", ["config"]);
    });

    it("should not suggest unknown command when showSuggestionForUnknownCommand is false", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (cli as any).appMetadata = {
        ...createMockMetadata(),
        args: [],
        subCommandNames: ["subcmd"],
        help: { flag: "--help", disabled: true },
        version: { flag: "--version", disabled: true },
      };

      expect(() =>
        cli.parse({
          argv: { data: ["badcmd"], from: "user" },
          showSuggestionForUnknownCommand: false,
        } as any)
      ).toThrow("Unknown command: 'badcmd'");
    });

    it("should use custom suggestion function for unknown commands", () => {
      const customSuggest = jest.fn().mockReturnValue(["subcmd"]);
      const customMessage = jest.fn((suggestions) => {
        throw new KsError("Custom command error: " + suggestions.join(", "), {
          errorType: "UnknownCommandError",
        });
      });

      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (cli as any).appMetadata = {
        ...createMockMetadata(),
        args: [],
        subCommandNames: ["subcmd"],
        help: { flag: "--help", disabled: true },
        version: { flag: "--version", disabled: true },
      };

      expect(() =>
        cli.parse({
          argv: { data: ["badcmd"], from: "user" },
          showSuggestionForUnknownCommand: {
            custormFunctionSimilar: customSuggest,
            showSuggestionMessage: customMessage,
          },
        } as any)
      ).toThrow(KsError);

      expect(customMessage).toHaveBeenCalledWith(["subcmd"]);
      expect(customSuggest).toHaveBeenCalledWith("badcmd", ["subcmd"]);
    });
  });

  describe("Complex scenarios", () => {
    // it("should handle subcommand processing", () => {
    //   class DummyApp {
    //     __init__() {}
    //   }
    //   const cli = new Cli(DummyApp as any) as any;
    //   const mockCommand: any = {};

    //   (commandContainer as any).getCommandByCommandName = jest
    //     .fn()
    //     .mockImplementation((name: string) => {
    //       console.log(name);

    //       if (name === "subcmd") {
    //         return { commandInstance: mockCommand, index: Symbol() };
    //       }
    //       return { commandInstance: mockCommand };
    //     });

    //   const subMetadata = {
    //     ...createMockMetadata(),
    //     commandName: "subcmd",
    //     handlers: [],
    //   };

    //   const mainMetadata = {
    //     ...createMockMetadata(),
    //     commandName: "app",
    //     subCommandNames: ["subcmd"],
    //   };

    //   // Mock the getCommand to return different metadata for subcommand
    //   (commandContainer as any).getCommand = jest.fn((inst: any) => {
    //     inst[Symbol.for("meta")] = mainMetadata;
    //     return { index: Symbol.for("meta") };
    //   });

    //   (cli as any).appMetadata = mainMetadata;

    //   // Verify subcommand is recognized
    // expect(mainMetadata.subCommandNames).toContain("sub");

    // });

    // it("should handle multiple options and arguments in sequence", () => {
    //   class DummyApp {
    //     __init__() {}
    //   }
    //   const cli = new Cli(DummyApp as any) as any;
    //   const mockCommand: any = {};

    //   (commandContainer as any).getCommandByCommandName = jest
    //     .fn()
    //     .mockReturnValue({
    //       commandInstance: mockCommand,
    //     });

    //   const metaData = {
    //     ...createMockMetadata(),
    //     handlers: [],
    //     options: [
    //       {
    //         optionName: "verbose",
    //         flag: "--verbose",
    //         alias: "-v",
    //         type: "boolean",
    //         propertyName: "verbose",
    //         treated: false,
    //       },
    //       {
    //         optionName: "config",
    //         flag: "--config",
    //         type: "string",
    //         propertyName: "config",
    //         treated: false,
    //       },
    //     ],
    //     args: [
    //       {
    //         argumentName: "file",
    //         type: "string",
    //         propertyName: "file",
    //         treated: false,
    //       },
    //     ],
    //   };

    //   // The test verifies the structure supports multiple options
    //   expect(metaData.options.length).toBe(2);
    //   expect(metaData.args.length).toBe(1);
    // });

    it("should handle numeric and other typed arguments", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      const command: any = {};
      const opt: OptionValueType = {
        optionName: "count",
        flag: "--count",
        type: "number",
        propertyName: "count",
        value: undefined,
      } as any;

      const args = ["--count", "42"];
      const remaining = cli.optionHandler(opt, args, command);

      expect(opt.value).toBeDefined();
      expect(command.count).toBeDefined();
      expect(remaining.length).toBe(0);
    });

    // it("should handle option with alias", () => {
    //   class DummyApp {
    //     __init__() {}
    //   }
    //   const cli = new Cli(DummyApp as any) as any;

    //   const command: any = {};
    //   const opt: OptionValueType = {
    //     optionName: "verbose",
    //     flag: "--verbose",
    //     alias: "-v",
    //     type: "boolean",
    //     propertyName: "verbose",
    //     value: undefined,
    //   } as any;

    //   const args = ["-v"];
    //   // Simulate finding the option by alias
    //   expect(opt.alias).toBe("-v");
    // });
  });

  describe("Edge cases and error handling", () => {
    it("should handle help flag with alias", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandInstance: {},
        });

      (cli as any).appMetadata = {
        ...createMockMetadata(),
        help: { flag: "--help", alias: "-h", disabled: false },
      };

      const spyHelp = jest
        .spyOn(cli, "displayHelp")
        .mockImplementation(() => {});

      cli.parse({
        argv: { data: ["node", "prog", "-h"], from: "user" },
      } as any);

      expect(spyHelp).toHaveBeenCalled();

      spyHelp.mockRestore();
    });

    it("should handle version flag with alias", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandInstance: {},
        });

      (cli as any).appMetadata = {
        ...createMockMetadata(),
        version: { flag: "--version", alias: "-v", disabled: false },
      };

      const spyVersion = jest
        .spyOn(cli, "displayVersion")
        .mockImplementation(() => {});

      cli.parse({
        argv: { data: ["node", "prog", "-v"], from: "user" },
      } as any);

      expect(spyVersion).toHaveBeenCalled();

      spyVersion.mockRestore();
    });

    it("should handle unknown option in allowUnknownOption mode without value", () => {
      class DummyApp {
        __init__() {}
      }

      (commandContainer as any).getCommandByCommandName = jest
        .fn()
        .mockReturnValue({
          commandInstance: {},
        });

      const cli = new Cli(DummyApp as any) as any;
      (cli as any).appMetadata = {
        ...createMockMetadata(),
        unknownOptions: [],
      };

      cli.parse({
        argv: { data: ["node", "prog", "--unkn"], from: "user" },
        allowUnknownOption: true,
      } as any);

      expect((cli as any).appMetadata.unknownOptions).toContainEqual({
        optionName: "unkn",
        value: true,
      });
    });

    // it("should handle combined short options", () => {
    //   class DummyApp {
    //     __init__() {}
    //   }
    //   const cli = new Cli(DummyApp as any) as any;
    //   const mockCommand: any = {};

    //   (commandContainer as any).getCommandByCommandName = jest
    //     .fn()
    //     .mockReturnValue({
    //       commandInstance: mockCommand,
    //     });

    //   const metaData = {
    //     ...createMockMetadata(),
    //     handlers: [],
    //     options: [
    //       {
    //         optionName: "verbose",
    //         alias: "-v",
    //         flag: "--verbose",
    //         type: "boolean",
    //         propertyName: "verbose",
    //         treated: false,
    //       },
    //     ],
    //     args: [],
    //   };

    //   // Test structure supports combined short options
    //   expect(metaData.options[0].alias).toBe("-v");
    // });
  });
});
