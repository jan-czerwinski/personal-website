import { useEffect, useRef, useState } from "react";
import ReactSlider from "react-slider";
import { map2D } from "../map2D";

type CellState = "active" | "visited" | "default";
type Cell = {
  edges: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
  distance: number;
  state: CellState;
};

const generateEmptyMaze = (rows: number, cols: number): Cell[][] => {
  const grid = [...Array(rows)].map((e) => Array(cols));

  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[0].length; y++) {
      const newCell = {
        edges: { top: true, bottom: true, right: true, left: true },
        visited: false,
        state: "default",
        distance: Infinity,
      };
      grid[x][y] = newCell;
    }
  }
  return grid;
};

type Coords = { x: number; y: number };
const coordsEqual = (A: Coords, B: Coords) => A.x === B.x && A.y === B.y;
const getUnvisitedNeighbourIdxs = (
  coords: Coords,
  maze: Cell[][],
  cell?: Cell
): Coords[] => {
  let diffs = [
    { dx: 0, dy: 1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: -1, dy: 0 },
  ];

  if (cell) {
    diffs = [];
    if (!cell.edges.top) diffs.push({ dx: 0, dy: -1 });
    if (!cell.edges.bottom) diffs.push({ dx: 0, dy: 1 });
    if (!cell.edges.right) diffs.push({ dx: 1, dy: 0 });
    if (!cell.edges.left) diffs.push({ dx: -1, dy: 0 });
  }

  const neighboursIdxs = diffs
    .map(({ dx, dy }) => ({ x: coords.x + dx, y: coords.y + dy })) //calculate position of potential neighbours
    .filter(
      ({ x, y }) => 0 <= x && x < maze[0].length && 0 <= y && y < maze.length
    ) //filter cells out of bounds
    .filter((coords) => !maze[coords.y][coords.x].visited);

  return neighboursIdxs;
};

const Maze = () => {
  const rows = 20;
  const cols = 20;
  const [maze, setMaze] = useState<Cell[][]>(generateEmptyMaze(rows, cols));
  const [active, setActive] = useState(false);
  const [delay, setDelay] = useState(100); // ms

  type PathPoints = { A: Coords | null; B: Coords | null };
  const [pathPoints, setPathPoints] = useState<PathPoints>({
    A: null,
    B: null,
  });

  const pickPathPoint = (coords: Coords): void => {
    const { A, B } = pathPoints;

    const coordsAtA = A && coordsEqual(coords, A);
    const coordsAtB = B && coordsEqual(coords, B);

    if (coordsAtA && coordsAtB) return setPathPoints({ A: null, B: null });

    if (coordsAtA) return setPathPoints({ A: null, B });
    if (coordsAtB) return setPathPoints({ A, B: null });

    if (!A) return setPathPoints({ A: coords, B });
    if (!B) return setPathPoints({ A, B: coords });
  };

  const timer = useRef(() => new Promise((res) => setTimeout(res, delay)));
  useEffect(() => {
    timer.current = () => new Promise((res) => setTimeout(res, delay));
  }, [delay]);

  const generateMaze = async () => {
    //randomized DFS algorithm
    setActive(true);

    const newMaze = generateEmptyMaze(rows, cols);
    const stack: Coords[] = [];

    let curr: Coords | undefined = { x: 0, y: 0 };
    newMaze[curr.y][curr.x].visited = true;
    newMaze[curr.y][curr.x].state = "active";

    stack.push(curr);

    while (true) {
      setMaze([...newMaze]);

      if (delay > 0) await timer.current();

      newMaze[curr.y][curr.x].state = "visited";
      curr = stack.pop();
      if (!curr) break;

      newMaze[curr.y][curr.x].state = "active";

      const unvisitedNeighboursIdxs = getUnvisitedNeighbourIdxs(curr, newMaze);
      if (unvisitedNeighboursIdxs.length > 0) {
        stack.push(curr);

        const nextCell =
          unvisitedNeighboursIdxs[
            Math.floor(Math.random() * unvisitedNeighboursIdxs.length)
          ];

        //probably could be more compact an nicer but im leaving this as is
        if (nextCell.x > curr.x) {
          newMaze[curr.y][curr.x].edges.right = false;
          newMaze[nextCell.y][nextCell.x].edges.left = false;
        } else if (nextCell.x < curr.x) {
          newMaze[curr.y][curr.x].edges.left = false;
          newMaze[nextCell.y][nextCell.x].edges.right = false;
        } else if (nextCell.y > curr.y) {
          newMaze[curr.y][curr.x].edges.bottom = false;
          newMaze[nextCell.y][nextCell.x].edges.top = false;
        } else if (nextCell.y < curr.y) {
          newMaze[curr.y][curr.x].edges.top = false;
          newMaze[nextCell.y][nextCell.x].edges.bottom = false;
        }
        newMaze[nextCell.y][nextCell.x].visited = true;

        stack.push(nextCell);
      }
    }

    setMaze(
      map2D(newMaze, (cell) => ({
        ...cell,
        visited: false,
        state: "default",
      })) as Cell[][]
    );
    setActive(false);
  };

  const solveMaze = async () => {
    //dijkstra algorithm
    const { A, B } = pathPoints;
    if (!A || !B)
      //TODO make it nicer than alert
      return alert("You have to pick points A and B by clicking on the maze");

    setActive(true);
    let newMaze = map2D(maze, (cell) => ({
      ...cell,
      visited: false,
      distance: Infinity,
      state: "default",
    })) as Cell[][];

    setMaze([...newMaze]);

    let currentCoords = A;
    newMaze[currentCoords.y][currentCoords.x].distance = 0;

    while (true) {
      if (delay > 0) await timer.current();
      const neighbourIdxs = getUnvisitedNeighbourIdxs(
        currentCoords,
        newMaze,
        newMaze[currentCoords.y][currentCoords.x]
      );
      // console.log(newMaze[currentCoords.y][currentCoords.x]);

      for (const coords of neighbourIdxs) {
        const neighbour = newMaze[coords.y][coords.x];
        const newDistance =
          newMaze[currentCoords.y][currentCoords.x].distance + 1;
        const distanceToSet =
          neighbour.distance < newDistance ? neighbour.distance : newDistance;
        // console.log(coords, newDistance);
        newMaze[coords.y][coords.x].distance = distanceToSet;
      }
      newMaze[currentCoords.y][currentCoords.x].visited = true;

      let min = Infinity;
      let minCoords: Coords = { x: -1, y: -1 };
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          if (!newMaze[y][x].visited && newMaze[y][x].distance < min) {
            min = newMaze[y][x].distance;
            minCoords = { x, y };
          }
        }
      }
      if (min === Infinity) {
        alert("There is no valid path.");
        setActive(false);
        return;
      }

      currentCoords = minCoords;

      setMaze([...newMaze]);

      if (coordsEqual(currentCoords, B)) break;
    }

    newMaze = map2D(newMaze, (cell) => ({
      ...cell,
      visited: false,
    })) as Cell[][];

    setMaze(newMaze);

    setActive(false);
    while (!coordsEqual(currentCoords, A)) {
      if (delay > 0) await timer.current();

      const neighbourIdxs = getUnvisitedNeighbourIdxs(
        currentCoords,
        newMaze,
        newMaze[currentCoords.y][currentCoords.x]
      );
      let min = Infinity;
      let minCoords: Coords = { x: -1, y: -1 };
      for (let coords of neighbourIdxs) {
        console.log(newMaze[coords.y][coords.x]);
        if (newMaze[coords.y][coords.x].distance < min) {
          min = newMaze[coords.y][coords.x].distance;
          minCoords = coords;
        }
      }

      currentCoords = minCoords;
      newMaze[currentCoords.y][currentCoords.x].state = "active";
      setMaze([...newMaze]);
    }
  };
  const getOpacityFromDistance = (distance: number) => {
    if (distance === Infinity) return 1;
    const arbitraryMaxDistance = (rows * cols) / 2; //2 was chosen to look good in most cases
    const opacity = (arbitraryMaxDistance - distance) / arbitraryMaxDistance;
    return opacity < 0.1 ? 0.1 : opacity;
  };

  const getCellColor = (cellState: CellState, coords: Coords) => {
    if (
      (pathPoints.A && coordsEqual(coords, pathPoints.A)) ||
      (pathPoints.B && coordsEqual(coords, pathPoints.B))
    )
      return "bg-green-300";

    if (active && maze[coords.y][coords.x].distance !== Infinity)
      return "bg-blue-700";

    switch (cellState) {
      case "active":
        return "bg-pink-300";
      case "visited":
        return "bg-blue-400";
      case "default":
        return "bg-white";
      default:
        console.error("undefined cell state");
        return "bg-white";
    }
  };

  return (
    <div>
      <div className="square-70">
        <div
          className="grid gap-0 w-full h-full place-items-stretch bg-white"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {map2D(maze, (cell, [x, y]) => (
            <div
              className={`
          border-black
          hover:bg-yellow-600
          text-center
          ${cell.edges.top && "border-t"} 
          ${cell.edges.bottom && "border-b"} 
          ${cell.edges.right && "border-r"} 
          ${cell.edges.left && "border-l"} 
          ${getCellColor(cell.state, { x, y })}`}
              style={{
                opacity: active ? getOpacityFromDistance(cell.distance) : 1,
              }}
              key={`${x}-${y}`}
              onClick={() => {
                pickPathPoint({ x, y });
                console.log(x, y);
              }}
            >
              <div className="object-scale-down tracking-tighter">
                {pathPoints.A && coordsEqual({ x, y }, pathPoints.A) && "A"}
                {pathPoints.B && coordsEqual({ x, y }, pathPoints.B) && "B"}
                {/* {cell.distance !== Infinity && cell.distance} */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between my-2 items-center">
          <div className="text-white text-xl mr-2">speed:</div>
          <ReactSlider
            invert={true}
            min={0}
            max={200}
            onChange={setDelay}
            value={delay}
            className="mx-auto w-full"
            thumbClassName="w-5 h-5 transform -translate-y-2  bg-white rounded-full "
            trackClassName="h-1 bg-white rounded-full"
          />
        </div>

        <div className="py-2 flex justify-between">
          <button
            className="text-white text-xl"
            disabled={active}
            onClick={() => generateMaze()}
          >
            generate
          </button>
          <button
            className="text-white text-xl"
            disabled={active}
            onClick={() => solveMaze()}
          >
            solve
          </button>
        </div>
      </div>
    </div>
  );
};

export default Maze;
