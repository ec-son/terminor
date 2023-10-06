/**
 * compare two values
 * @param a
 * @param b
 * @returns returns true if they are equal, false otherwise
 * @example
 *  console.log(isEqual(1, 2)); // true
 *  console.log(isEqual("hello", "hello")); // true
 *  console.log(isEqual(new Date(), new Date())); // true
 *  console.log(isEqual([1, 3, 2], [2, 1, 3])); // true
 */
export function isEqual(a: any, b: any) {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length || !a.every((v, i) => isEqual(v, b[i])))
      return false;
    return true;
  }

  return false;
}
