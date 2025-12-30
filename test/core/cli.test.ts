import { Cli } from "../../src/core/cli";
import { commandContainer } from "../../src/utils/command-container";
import { terExit } from "../../src/tools";
import { KsError } from "../../src/exceptions/ks-error";
import { OptionValueType } from "../../src/types/option.type";

jest.mock("../../src/utils/command-container");
jest.mock("../../src/tools", () => ({ terExit: jest.fn() }));
jest.mock("../../src/utils/suggest-similar", () => ({ suggestSimilar: jest.fn() }));

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

  it("constructor should set appMetadata", () => {
    class DummyApp {
      __init__() {}
    }
    const cli = new Cli(DummyApp as any);
    expect((cli as any).appMetadata).toBe(mockMetadata);
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

    it("should handle string option with value", () => {
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
        version: { flag: "--version", disabled: false },
      };

      const spyVersion = jest
        .spyOn(cli, "displayVersion")
        .mockImplementation(() => {});

      cli.parse({
        argv: { data: ["node", "prog", "--version"], from: "user" },
      } as any);

      expect(spyVersion).toHaveBeenCalled();

      spyVersion.mockRestore();
    });
  });

  describe("errors and suggestions", () => {
    beforeEach(() => {
      // ensure getCommandByCommandName returns something
      (commandContainer as any).getCommandByCommandName = jest.fn().mockReturnValue({
        commandInstance: {},
      });
    });

    it("should suggest unknown option", () => {
      const suggest = require("../../src/utils/suggest-similar").suggestSimilar as jest.Mock;
      suggest.mockReturnValue(["config"]);

      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;
      (cli as any).appMetadata = { ...mockMetadata, options: [], help: { flag: "--help", disabled: true }, version: { flag: "--version", disabled: true } };

      expect(() =>
        cli.parse({ argv: { data: ["node", "prog", "--unkn"], from: "user" } } as any)
      ).toThrowError(/Did you mean/);
    });

    it("should suggest unknown command", () => {
      const suggest = require("../../src/utils/suggest-similar").suggestSimilar as jest.Mock;
      suggest.mockReturnValue(["subcmd"]);

      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      (cli as any).appMetadata = {
        ...mockMetadata,
        args: [],
        subCommandNames: ["subcmd"],
        help: { flag: "--help", disabled: true },
        version: { flag: "--version", disabled: true },
      };

      expect(() =>
        cli.parse({ argv: { data: ["node", "prog", "badcmd"], from: "user" } } as any)
      ).toThrowError(/Did you mean/);
    });

    it("should record unknown option when allowUnknownOption is true", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;
      (cli as any).appMetadata = { ...mockMetadata, unknownOptions: [] };

      cli.parse({ argv: { data: ["node", "prog", "--unkn", "val"], from: "user" }, allowUnknownOption: true } as any);

      expect((cli as any).appMetadata.unknownOptions).toContainEqual({ optionName: "unkn", value: "val" });
    });

    it("should display addHelpText before and after", () => {
      class DummyApp {
        __init__() {}
      }
      const cli = new Cli(DummyApp as any) as any;

      // Mock process.stdout.getWindowSize for Help constructor
      (process.stdout as any).getWindowSize = jest.fn(() => [120, 40]);

      const helpDisplaySpy = jest.spyOn(require("../../src/core/help").Help.prototype, "display").mockImplementation(() => {});
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      // ensure commandContainer returns proper metadata for displayHelp
      (commandContainer as any).getCommandByCommandName = jest.fn().mockReturnValue({
        commandName: "app",
        args: [],
        options: [],
        subCommandNames: [],
        handlers: [],
        unknownOptions: [],
        excessArguments: [],
        help: { flag: "--help", disabled: false, addHelpText: { position: "before", text: "BEFORE" } },
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
  });
});
