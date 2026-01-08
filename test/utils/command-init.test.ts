import { commandInit } from "../../src/utils/command-init";
import { commandContainer } from "../../src/utils/command-container";

jest.mock("../../src/utils/command-container");

describe("commandInit util", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should sort arguments when requiredArgsFirst is true", () => {
    const idx = Symbol("idx");
    (commandContainer as any).getCommand = jest
      .fn()
      .mockReturnValue({ index: idx });

    const context: any = {
      arguments: [
        { argumentName: "opt", required: false },
        { argumentName: "req", required: true },
      ],
      subCommands: [],
      helpOption: true,
      requiredArgsFirst: true,
    };

    const { metadata } = commandInit("mycmd", context);
    expect(metadata.args[0].required).toBe(true);
    expect(metadata.args[0].argumentName).toBe("req");
  });

  it("should honor helpOption boolean false and object override", () => {
    const idx = Symbol("idx2");
    (commandContainer as any).getCommand = jest
      .fn()
      .mockReturnValue({ index: idx });

    const ctxFalse: any = { helpOption: false, subCommands: [] };
    const { metadata: mdFalse } = commandInit("cmd2", ctxFalse);
    expect(mdFalse.help.disabled).toBe(true);

    const ctxObj: any = {
      helpOption: { flag: "--assist", alias: "-a" },
      subCommands: [],
    };
    const { metadata: mdObj } = commandInit("cmd3", ctxObj);

    expect(mdObj.help).toEqual({
      description: "display help for command",
      disabled: false,
      showInHelp: true,
      flag: "--assist",
      alias: "-a",
    });
  });

  it("should create metadata with description and usage", () => {
    const idx = Symbol("idx3");
    (commandContainer as any).getCommand = jest
      .fn()
      .mockReturnValue({ index: idx });

    const ctx: any = {
      description: "My command",
      usage: "cmd <file>",
      subCommands: [],
    };
    const { metadata } = commandInit("cmd4", ctx);
    expect(metadata.description).toBe("My command");
    expect(metadata.usage).toBe("cmd <file>");
  });

  it("should set handler with correct on type", () => {
    const idx = Symbol("idx4");
    (commandContainer as any).getCommand = jest
      .fn()
      .mockReturnValue({ index: idx });

    const ctx: any = { subCommands: [] };
    const { metadata } = commandInit("cmd5", ctx);
    expect(metadata.handlers.length).toBeGreaterThan(0);
    expect(metadata.handlers[0].on).toBe("handler");
    expect(metadata.handlers[0].methodKey).toBe("handler");
    expect(metadata.handlers[0].isFirstHandler).toBeTruthy();
  });

  it("should sort arguments when requiredArgsFirst is true", () => {
    const idx = Symbol("idx");
    (commandContainer as any).getCommand = jest
      .fn()
      .mockReturnValue({ index: idx });

    const context: any = {
      arguments: [
        { argumentName: "opt", required: false },
        { argumentName: "req", required: true },
      ],
      subCommands: [],
      helpOption: true,
      requiredArgsFirst: true,
      alias: "cmd",
    };

    const { metadata } = commandInit("mycmd", context);

    const expectedMetadata = {
      alias: "cmd",
      args: [
        {
          argumentName: "req",
          required: true,
          type: "string",
          description: undefined,
        },
        {
          argumentName: "opt",
          required: false,
          type: "string",
          description: undefined,
        },
      ],
      commandName: undefined,
      excessArguments: [],
      help: {
        description: "display help for command",
        disabled: false,
        showInHelp: true,
        flag: "--help",
        alias: "-h",
      },
      handlers: [
        {
          methodKey: "handler",
          on: "handler",
          parameters: [],
          isFirstHandler: true,
        },
      ],
      options: [],
      subCommandNames: [],
      description: undefined,
      unknownOptions: [],
      usage: undefined,
    };

    expect(metadata).toEqual(expectedMetadata);
  });
});
