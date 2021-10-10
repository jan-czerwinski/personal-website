export function map2D<T>(
  grid2D: T[][],
  callback: (element: T, coords: [x: number, y: number]) => unknown
) {
  return grid2D.map((col, y) =>
    col.map((element, x) => callback(element, [x, y]))
  );
}
