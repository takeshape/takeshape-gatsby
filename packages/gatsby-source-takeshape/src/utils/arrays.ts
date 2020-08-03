// Thanks! https://gist.github.com/karol-majewski/e1a53b9abd39f3b7c3f4bf150546168a
export function flatMap<T, U>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => U[],
): U[] {
  return Array.prototype.concat(...array.map(callbackfn))
}
