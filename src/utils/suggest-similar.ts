function damerauLevenshteinDistance(a: string, b: string): number {
  const d: number[][] = [];

  for (let i = 0; i <= a.length; i++) {
    d[i] = [i];
  }

  for (let j = 0; j <= b.length; j++) {
    d[0][j] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      let cost = 1;
      if (a[i - 1] === b[j - 1]) {
        cost = 0;
      } else {
        cost = 1;
      }
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );

      // transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[a.length][b.length];
}

export function suggestSimilar(
  word: string,
  candidates: string[],
  similarityThreshold: number = 3
): string[] {
  if (!candidates || candidates.length === 0) return [];
  candidates = Array.from(new Set(candidates));

  let similar: string[] = [];
  let bestDistance = similarityThreshold;
  const minSimilarity = 0.4;
  candidates.forEach((candidate) => {
    if (candidate.length <= 1) return;

    const distance =
      Math.abs(word.length - candidate.length) > similarityThreshold
        ? Math.max(word.length, candidate.length)
        : damerauLevenshteinDistance(word, candidate);

    const length = Math.max(word.length, candidate.length);
    const similarity = (length - distance) / length;
    if (similarity > minSimilarity) {
      if (distance < bestDistance) {
        bestDistance = distance;
        similar = [candidate];
      } else if (distance === bestDistance) {
        similar.push(candidate);
      }
    }
  });

  similar.sort((a, b) => a.localeCompare(b));
  return similar;
}
