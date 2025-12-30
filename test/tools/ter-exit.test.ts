import { terExit } from "../../src/tools/ter-exit";

describe("terExit tool", () => {
  it("should call process.exit when invoked", () => {
    const spy = jest
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    try {
      terExit();
      expect(spy).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
});
