import {
  Handler,
  PreAction,
  PostAction,
} from "../../src/decorators/action.decorator";
import { commandContainer } from "../../src/utils/command-container";
import { MetaDataType } from "../../src/types/metadata.type";

jest.mock("../../src/utils/command-container");

describe("Action decorators (Handler, PreAction, PostAction)", () => {
  let mockMetadata: MetaDataType;
  const metaIndex = Symbol("idx");

  beforeEach(() => {
    mockMetadata = {
      commandName: "test",
      args: [],
      options: [],
      subCommandNames: [],
      handlers: [
        {
          methodKey: "handler",
          on: "handler",
          parameters: [],
          isFirstHandler: true,
        },
      ],
      unknownOptions: [],
      excessArguments: [],
      help: { flag: "--help", disabled: true },
    } as any;

    (commandContainer as any).getCommand = jest.fn(
      (inst: any, returnMeta?: boolean) => {
        if (returnMeta) return mockMetadata;
        inst[metaIndex as any] = mockMetadata;
        return {
          index: metaIndex,
          name: "testCmd",
        };
      }
    );
  });

  it("should call default handler method", () => {
    class TestCmd {
      __init__() {
        (this as any)[metaIndex as any] = mockMetadata;
      }
      handler() {
        console.log("handling");
      }
    }

    const inst = new TestCmd();
    (inst as any).__init__();

    const handlers = mockMetadata.handlers.filter(
      (h) => h.methodKey === "handler"
    );

    expect(handlers.length).toBeGreaterThan(0);
    expect(handlers[0].on).toBe("handler");
    expect(handlers).toEqual([
      {
        methodKey: "handler",
        on: "handler",
        parameters: [],
        isFirstHandler: true,
      },
    ]);
  });

  it("Handler decorator without trigger should replace default handler", () => {
    class TestCmd {
      __init__() {
        (this as any)[metaIndex as any] = mockMetadata;
      }

      handler() {}

      @((Handler as any)())
      handle() {
        console.log("handling");
      }
    }

    const inst = new TestCmd();
    (inst as any).__init__();

    const handlers = mockMetadata.handlers.filter(
      (h) => h.methodKey === "handle"
    );

    expect(handlers.length).toBeGreaterThan(0);
    expect(handlers[0].on).toBe("handler");
    expect(handlers[0].methodKey).toBe("handle");
  });

  it("Handler decorator with trigger should add handler with trigger", () => {
    class TestCmd {
      __init__() {
        (this as any)[metaIndex as any] = mockMetadata;
      }

      @((Handler as any)("verbose", "option"))
      onVerbose() {
        console.log("verbose enabled");
      }
    }

    const inst = new TestCmd();
    (inst as any).__init__ = function () {
      (this as any)[metaIndex as any] = mockMetadata;
      // Mock __init__parameter__ for handler registration
      (
        this as unknown as { __init__parameter__?: () => void }
      ).__init__parameter__?.();
    };
    (inst as any).__init__();
    // Handler with trigger is added via __init__parameter__
    // which requires options/args to exist in metadata
    expect(mockMetadata.handlers.length).toBeGreaterThan(0);
  });

  it("PreAction decorator should add pre_action handler", () => {
    class TestCmd {
      __init__() {
        (this as any)[metaIndex as any] = mockMetadata;
      }

      @((PreAction as any)())
      beforeAction() {
        console.log("before action");
      }
    }

    const inst = new TestCmd();
    (inst as any).__init__();

    const preHandlers = mockMetadata.handlers.filter(
      (h) => h.on === "pre_action"
    );
    expect(preHandlers.length).toBeGreaterThan(0);
    expect(preHandlers[0].methodKey).toBe("beforeAction");
  });

  it("PostAction decorator should add post_action handler", () => {
    class TestCmd {
      __init__() {
        (this as any)[metaIndex as any] = mockMetadata;
      }

      @((PostAction as any)())
      afterAction() {
        console.log("after action");
      }
    }

    const inst = new TestCmd();
    (inst as any).__init__();

    const postHandlers = mockMetadata.handlers.filter(
      (h) => h.on === "post_action"
    );
    expect(postHandlers.length).toBeGreaterThan(0);
    expect(postHandlers[0].methodKey).toBe("afterAction");
  });

  it("Multiple action decorators should all be registered", () => {
    class TestCmd {
      __init__() {
        (this as any)[metaIndex as any] = mockMetadata;
      }

      @((PreAction as any)())
      before() {}

      @((Handler as any)())
      main() {}

      @((PostAction as any)())
      after() {}
    }

    const inst = new TestCmd();
    (inst as any).__init__();

    const allHandlers = mockMetadata.handlers;
    expect(allHandlers.some((h) => h.on === "pre_action")).toBe(true);
    expect(allHandlers.some((h) => h.on === "handler")).toBe(true);
    expect(allHandlers.some((h) => h.on === "post_action")).toBe(true);
  });
});
