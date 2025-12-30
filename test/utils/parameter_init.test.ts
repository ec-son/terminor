import { parameterInit } from "../../src/utils/parameter_init";

describe("parameterInit utility", () => {
  it("should attach __init__parameter__ to target object", () => {
    const proto: any = {};
    parameterInit("args", proto, "handler", 0, "name");
    expect(typeof proto.__init__parameter__).toBe("function");
  });
});
