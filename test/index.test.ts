import * as root from "../src";

describe("library entrypoint", () => {
  it("should load the package entrypoint without throwing", () => {
    expect(root).toBeDefined();
  });
});
