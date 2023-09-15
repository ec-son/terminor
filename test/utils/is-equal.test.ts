import { isEqual } from "../../src/utils/is-equal";
describe("isEqual function", () => {
  const table1 = [
    { a: 1, b: 2, expected: false },
    { a: 1, b: 1, expected: true },
    { a: "yes", b: "no", expected: false },
    { a: new Date("2013/05/12"), b: new Date("2013/05/12"), expected: true },
    { a: [1, 2, 3], b: [1, 2, 3], expected: true },
    { a: [1, 2, 3], b: [3, 2, 1], expected: false },
    { a: [1, 2, [3]], b: [1, 2, [3]], expected: true },
  ];

  it.each(table1)(
    "should return boolean showing equality",
    ({ a, b, expected }) => {
      expect(isEqual(a, b)).toBe(expected);
    }
  );
});
