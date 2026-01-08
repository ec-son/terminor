import {
  ArgumentData,
  ExcessArgumentData,
} from "../../src/decorators/argument-data.decorator";
import {
  OptionData,
  UnknownOptionData,
} from "../../src/decorators/option-data.decorator";
import * as paramInitModule from "../../src/utils/parameter_init";

jest.mock("../../src/utils/parameter_init");

describe("Data decorators (ArgumentData, OptionData, ExcessArgumentData, UnknownOptionData)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("ArgumentData should call parameterInit with 'args' flag", () => {
    // Manually invoke the decorator as it would be called by TypeScript
    const descriptor = Object.getOwnPropertyDescriptor(
      class {
        handler(name: string) {}
      }.prototype,
      "handler"
    );

    (paramInitModule as unknown as { parameterInit: jest.Mock }).parameterInit =
      jest.fn();

    ArgumentData("name")(
      class {
        handler() {}
      }.prototype,
      "handler",
      0
    );

    expect((paramInitModule as any).parameterInit).toHaveBeenCalledWith(
      "args",
      expect.any(Object),
      "handler",
      0,
      "name"
    );
  });

  it("ArgumentData without name should call parameterInit with undefined", () => {
    (paramInitModule as unknown as { parameterInit: jest.Mock }).parameterInit =
      jest.fn();

    ArgumentData()(
      class {
        handler() {}
      }.prototype,
      "handler",
      0
    );

    expect((paramInitModule as any).parameterInit).toHaveBeenCalledWith(
      "args",
      expect.any(Object),
      "handler",
      0,
      undefined
    );
  });

  it("OptionData should call parameterInit with 'options' flag", () => {
    (paramInitModule as unknown as { parameterInit: jest.Mock }).parameterInit =
      jest.fn();

    OptionData("verbose")(
      class {
        handler() {}
      }.prototype,
      "handler",
      0
    );

    expect((paramInitModule as any).parameterInit).toHaveBeenCalledWith(
      "options",
      expect.any(Object),
      "handler",
      0,
      "verbose"
    );
  });

  it("OptionData with multiple names should pass array", () => {
    (paramInitModule as unknown as { parameterInit: jest.Mock }).parameterInit =
      jest.fn();

    OptionData(["v", "verbose"])(
      class {
        handler() {}
      }.prototype,
      "handler",
      0
    );

    expect((paramInitModule as any).parameterInit).toHaveBeenCalledWith(
      "options",
      expect.any(Object),
      "handler",
      0,
      ["v", "verbose"]
    );
  });

  it("ExcessArgumentData should call parameterInit with 'excess_argument' flag", () => {
    (paramInitModule as unknown as { parameterInit: jest.Mock }).parameterInit =
      jest.fn();

    ExcessArgumentData()(
      class {
        handler() {}
      }.prototype,
      "handler",
      0
    );

    const callsExcess = (paramInitModule as any).parameterInit.mock.calls;
    expect(callsExcess.length).toBeGreaterThan(0);
    expect(callsExcess[0][0]).toBe("excess_argument");
    expect(callsExcess[0][1]).toEqual(expect.any(Object));
    expect(callsExcess[0][2]).toBe("handler");
    expect(callsExcess[0][3]).toBe(0);
  });
  it("UnknownOptionData should call parameterInit with 'unknown_option' flag", () => {
    (paramInitModule as unknown as { parameterInit: jest.Mock }).parameterInit =
      jest.fn();

    // Avoid using parameter decorator syntax in tests (some TS configs/linters
    // flag decorators on parameters). Manually invoke the decorator as TS
    // would at compile time.
    const proto = class {
      handler() {}
    }.prototype;

    UnknownOptionData()(proto, "handler", 0);

    const callsUnknown = (
      paramInitModule as unknown as { parameterInit: jest.Mock }
    ).parameterInit.mock.calls;
    expect(callsUnknown.length).toBeGreaterThan(0);
    expect(callsUnknown[0][0]).toBe("unknown_option");
    expect(callsUnknown[0][1]).toEqual(expect.any(Object));
    expect(callsUnknown[0][2]).toBe("handler");
    expect(callsUnknown[0][3]).toBe(0);
  });

  it("Multiple data decorators on same method should register all", () => {
    (paramInitModule as unknown as { parameterInit: jest.Mock }).parameterInit =
      jest.fn();

    const proto = class {
      handler() {}
    }.prototype;

    // Manually invoke parameter decorators for indices 0,1,2
    ArgumentData("file")(proto, "handler", 0);
    OptionData("verbose")(proto, "handler", 1);
    ExcessArgumentData()(proto, "handler", 2);

    expect(
      (paramInitModule as unknown as { parameterInit: jest.Mock }).parameterInit
    ).toHaveBeenCalledTimes(3);
  });
});
