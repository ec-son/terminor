import { suggestSimilar } from "../../src/utils/suggest-similar";

/**
 * suggestSimilar
 */

describe("suggest similar", () => {
  const candidates = ["snake", "snack", "cat", "car", "tank", "tree", "three"];
  const table = [
    { word: "case", expected: ["car", "cat"] },
    { word: "tee", expected: ["tree"] },
    { word: "snak", expected: ["snack", "snake"] },
    { word: "tankk", expected: ["tank"] },
  ];

  it.each(table)("should return suggestions", ({ word, expected }) => {
    expect(suggestSimilar(word, candidates)).toEqual(expected);
  });
});
