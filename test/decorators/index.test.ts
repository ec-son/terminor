import * as dec from "../../src/decorators";

describe("decorators index exports", () => {
  it("should export decorator factories", () => {
    expect(dec).toBeDefined();
  });
});
