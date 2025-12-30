import { Command } from "../../src/decorators/command.decorator";
import * as commandInitModule from "../../src/utils/command-init";

jest.mock("../../src/utils/command-init");

describe("Command decorator", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should set requiredArgsFirst from config.globalRequiredArgsFirst", () => {
    let capturedContext: any = null;
    const fakeIndex = Symbol("i");

    (commandInitModule as any).commandInit = jest.fn((name: string, ctx: any) => {
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
    });

    @Command({ commandName: "c" as any })
    class T {}

    const inst: any = new (T as any)();

    inst.__init__({ globalRequiredArgsFirst: true });

    expect(capturedContext.requiredArgsFirst).toBe(true);
  });

  it("should pass helpOption to commandInit", () => {
    let capturedContext: any = null;
    const fakeIndex = Symbol("i2");

    (commandInitModule as any).commandInit = jest.fn((name: string, ctx: any) => {
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
    });

    @Command({ commandName: "c2" as any, helpOption: { flag: "--assist" } })
    class T2 {}

    const inst: any = new (T2 as any)();
    inst.__init__();

    expect(capturedContext.helpOption).toEqual({ flag: "--assist" });
  });
});
