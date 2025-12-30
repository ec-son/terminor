import { Command } from "../../src/decorators/command.decorator";
import * as commandInitModule from "../../src/utils/command-init";

jest.mock("../../src/utils/command-init");

describe("Command decorator", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should set requiredArgsFirst from config.globalRequiredArgsFirst", () => {
    let capturedContext: any = null;
    const fakeIndex = Symbol("i");

    (commandInitModule as any).commandInit = jest.fn(
      (name: string, ctx: any) => {
        capturedContext = ctx;
        return {
          metadata: {
            commandName: name,
            args: [],
            options: [],
            subCommandNames: [],
            handlers: [],
            unknownOptions: [],
            excessArguments: [],
            help: { flag: "--help", disabled: true },
          },
          index: fakeIndex,
        };
      }
    );

    @Command({ commandName: "c" as any })
    class T {}

    const inst: any = new (T as any)();

    inst.__init__({ globalRequiredArgsFirst: true });

    expect(capturedContext.requiredArgsFirst).toBe(true);
  });

  it("should pass helpOption to commandInit", () => {
    let capturedContext: any = null;
    const fakeIndex = Symbol("i2");

    (commandInitModule as any).commandInit = jest.fn(
      (name: string, ctx: any) => {
        capturedContext = ctx;
        return {
          metadata: {
            commandName: name,
            args: [],
            options: [],
            subCommandNames: [],
            handlers: [],
            unknownOptions: [],
            excessArguments: [],
            help: { flag: "--help", disabled: true },
          },
          index: fakeIndex,
        };
      }
    );

    @Command({ commandName: "c2" as any, helpOption: { flag: "--assist" } })
    class T2 {}

    const inst: any = new (T2 as any)();
    inst.__init__();

    expect(capturedContext.helpOption).toEqual({ flag: "--assist" });
  });

  it("should use checkingSubCommand result for metadata.subCommandNames and attach metadata at index", () => {
    const fakeIndex = Symbol("idx3");
    const metadata: any = {
      commandName: "c3",
      args: [],
      options: [],
      subCommandNames: ["sub1", "sub2"],
      handlers: [],
      unknownOptions: [],
      excessArguments: [],
      help: { flag: "--help", disabled: true },
    };

    (commandInitModule as any).commandInit = jest.fn(() => ({
      metadata,
      index: fakeIndex,
    }));
    (commandInitModule as any).checkingSubCommand = jest.fn(() => ["sub1"]);

    @Command({ commandName: "c3" as any })
    class T3 {}

    const inst: any = new (T3 as any)();
    inst.__init__();

    expect((commandInitModule as any).checkingSubCommand).toHaveBeenCalledWith([
      "sub1",
      "sub2",
    ]);
    expect((inst as any)[fakeIndex].subCommandNames).toEqual(["sub1"]);
  });

  it("should call original __init__ and then __init__parameter__ if created by original init", () => {
    const fakeIndex = Symbol("idx4");
    const metadata: any = {
      commandName: "c4",
      args: [],
      options: [],
      subCommandNames: [],
      handlers: [],
      unknownOptions: [],
      excessArguments: [],
      help: { flag: "--help", disabled: true },
    };

    (commandInitModule as any).commandInit = jest.fn(() => ({
      metadata,
      index: fakeIndex,
    }));

    @Command({ commandName: "c4" as any })
    class T4 {
      __init__() {
        // original init creates __init__parameter__ on the instance
        (this as any).__init__parameter__ = jest.fn();
      }
    }

    const inst: any = new (T4 as any)();
    (inst as any).__init__();

    expect(typeof (inst as any).__init__parameter__).toBe("function");
    expect((inst as any).__init__parameter__).toHaveBeenCalled();
  });
});
