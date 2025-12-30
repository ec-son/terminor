import {
  OptionData,
  UnknownOptionData,
} from "../../src/decorators/option-data.decorator";
import * as paramInitModule from "../../src/utils/parameter_init";

jest.mock("../../src/utils/parameter_init");

describe("OptionData decorators (simple)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("OptionData should call parameterInit with 'options' flag", () => {
    (paramInitModule as unknown as { parameterInit: jest.Mock }).parameterInit =
      jest.fn();
    const proto = class {
      handler() {}
    }.prototype;

    OptionData("opt")(proto, "handler", 0);

    expect((paramInitModule as any).parameterInit).toHaveBeenCalledWith(
      "options",
      proto,
      "handler",
      0,
      "opt"
    );
  });

  it("UnknownOptionData should call parameterInit with 'unknown_option' flag", () => {
    (paramInitModule as unknown as { parameterInit: jest.Mock }).parameterInit =
      jest.fn();
    const proto = class {
      handler() {}
    }.prototype;

    UnknownOptionData()(proto, "handler", 0);

    expect((paramInitModule as any).parameterInit).toHaveBeenCalledWith(
      "unknown_option",
      proto,
      "handler",
      0
    );
  });
});
