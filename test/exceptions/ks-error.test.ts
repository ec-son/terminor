import { KsError } from "../../src/exceptions/ks-error";

describe("KsError", () => {
  it("should expose type, typeError and commandName getters", () => {
    const err = new KsError("oops", {
      type: "warning",
      errorType: "MethodNotFoundError",
      commandName: "cmd",
    });
    expect(err.message).toContain("oops");
    expect(err.type).toBe("warning");
    expect(err.typeError).toBe("MethodNotFoundError");
    expect(err.commandName).toBe("cmd");
  });
});
