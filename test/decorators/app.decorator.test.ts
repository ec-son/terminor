import { App } from "../../src/decorators/app.decorator";
import { commandContainer } from "../../src/utils/command-container";
import * as commandInitModule from "../../src/utils/command-init";
import * as helpers from "../../src/helpers";
import * as checkingModule from "../../src/utils/command-init";

jest.mock("../../src/utils/command-init");
jest.mock("../../src/utils/command-container");
jest.mock("../../src/helpers");

describe("App decorator", () => {
  let originalCommandInit: any;

  beforeEach(() => {
    jest.clearAllMocks();
    originalCommandInit = (commandInitModule as any).commandInit;
  });

  afterEach(() => {
    (commandInitModule as any).commandInit = originalCommandInit;
  });

  it("should attach metadata to instance and register subcommands", () => {
    const index = Symbol("idx");
    const metadata = {
      commandName: "mycmd",
      subCommandNames: ["sub"],
      options: [],
      args: [],
      handlers: [],
      unknownOptions: [],
      excessArguments: [],
    } as any;

    // mock commandInit to return our metadata and index
    (commandInitModule as any).commandInit = jest.fn().mockReturnValue({
      metadata,
      index,
    });

    // mock checkingSubCommand to just return the same array
    (checkingModule as any).checkingSubCommand = jest.fn((arr: any) => arr);

    // mock appInfo
    (helpers as any).appInfo = jest.fn((key: string) => `app-${key}`);

    // prepare a subcommand class to be registered
    class SubCommand {
      __init__ = jest.fn();
    }

    @App({ commands: [SubCommand], commandName: "mycmd", versionOption: false, globalRequiredArgsFirst: true })
    class TestApp {}

    const instance: any = new TestApp();

    // call the generated __init__
    instance.__init__();

    // metadata should be attached on the instance at the returned index
    expect(instance[index]).toBe(metadata);

    // commandContainer.setCommand should be called for the subcommand
    expect((commandContainer as any).setCommand).toHaveBeenCalled();

    // subcommand __init__ should have been called with globalRequiredArgsFirst option
    const subInstance = (commandContainer as any).setCommand.mock.calls[0][0].commandInstance;
    expect(subInstance.__init__).toHaveBeenCalledWith({ globalRequiredArgsFirst: true });

    // checkingSubCommand should have been called
    expect((checkingModule as any).checkingSubCommand).toHaveBeenCalledWith(metadata.subCommandNames);
  });

  it("should override version options when provided as object", () => {
    const index = Symbol("idx2");
    const metadata = {
      commandName: "mycmd2",
      subCommandNames: [],
      options: [],
      args: [],
      handlers: [],
      unknownOptions: [],
      excessArguments: [],
    } as any;

    (commandInitModule as any).commandInit = jest.fn().mockReturnValue({
      metadata,
      index,
    });

    (helpers as any).appInfo = jest.fn((key: string) => `app-${key}`);

    @App({ commandName: "mycmd2", versionOption: { flag: "--ver", description: "custom" } })
    class TestApp2 {}

    const instance: any = new TestApp2();
    instance.__init__();

    // after init, metadata.version should exist and include overridden flag
    const md = instance[index];
    expect(md.version).toBeDefined();
    expect(md.version.flag).toBe("--ver");
    expect(md.version.description).toBe("custom");
  });

  it("should disable version when versionOption is false", () => {
    const index = Symbol("idx3");
    const metadata = {
      commandName: "mycmd3",
      subCommandNames: [],
      options: [],
      args: [],
      handlers: [],
      unknownOptions: [],
      excessArguments: [],
    } as any;

    (commandInitModule as any).commandInit = jest.fn().mockReturnValue({
      metadata,
      index,
    });

    (helpers as any).appInfo = jest.fn((key: string) => `app-${key}`);

    @App({ commandName: "mycmd3", versionOption: false })
    class TestApp3 {}

    const instance: any = new TestApp3();
    instance.__init__();

    const md = instance[index];
    expect(md.version.disabled).toBe(true);
  });

  it("should pass helpOption through context", () => {
    const index = Symbol("idx4");
    const metadata = {
      commandName: "mycmd4",
      subCommandNames: [],
      options: [],
      args: [],
      handlers: [],
      unknownOptions: [],
      excessArguments: [],
    } as any;

    (commandInitModule as any).commandInit = jest.fn().mockReturnValue({
      metadata,
      index,
    });

    (helpers as any).appInfo = jest.fn((key: string) => `app-${key}`);

    @App({ commandName: "mycmd4", helpOption: { flag: "--assist", alias: "-a" } })
    class TestApp4 {}

    const instance: any = new TestApp4();
    instance.__init__();

    // commandInit should have been called with helpOption in context
    const callArgs = (commandInitModule as any).commandInit.mock.calls;
    const lastCall = callArgs[callArgs.length - 1][1];
    expect(lastCall.helpOption).toEqual({ flag: "--assist", alias: "-a" });
  });
});
