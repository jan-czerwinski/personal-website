import { useEffect, useState } from "react";
// import ReactSlider from "react-slider";
import { setInterval, clearInterval } from "timers";
import { map2D } from "../map2D";

const GameOfLife = () => {
  const [rows, cols] = [20, 20];
  const [grid, setGrid] = useState<boolean[][]>(
    [...Array(cols)].map((e) => Array(rows).fill(false))
  );
  const [playing, setPlaying] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  useEffect(() => {
    const getCellAliveNeighbourCount = (
      cellX: number,
      cellY: number
    ): number => {
      //TODO opitmize by adding empty row and col on each edge
      const diffs = [
        [0, 1],
        [1, 1],
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, -1],
        [-1, 0],
        [-1, 1],
      ]
        .map(([dx, dy]) => [cellX + dx, cellY + dy]) //calculate position of potential neighbours
        .filter(([x, y]) => 0 <= x && x < cols && 0 <= y && y < rows) //filter cells out of bounds
        .filter(([x, y]) => grid[y][x]); //filter only for alive cells
      return diffs.length;
    };

    const isCellAliveNextGeneration = (x: number, y: number) => {
      const aliveNeighbourCount = getCellAliveNeighbourCount(x, y);

      //if a cell is dead and has exactly 3 neighbours it becomes alive
      //otherwise it remains dead
      if (!grid[y][x]) return aliveNeighbourCount === 3;

      //here we are sure the cell is alive
      //if it has 2 or 3 neighbours it lives on
      //otherwise it dies of over/under population
      return aliveNeighbourCount === 2 || aliveNeighbourCount === 3;
    };

    const nextGeneration = () => {
      if (playing) {
        setGrid(
          map2D(grid, (alive, [x, y]) =>
            isCellAliveNextGeneration(x, y)
          ) as boolean[][]
        );
        setGenerationCount(generationCount + 1);
      }
    };

    const interval = 1000;
    const intervalHandle = setInterval(() => nextGeneration(), interval);

    return () => {
      clearInterval(intervalHandle);
    };
  }, [cols, generationCount, grid, playing, rows]);

  const clearBoard = () => {
    setGrid(map2D(grid, (alive) => false) as boolean[][]);
    setGenerationCount(0);
    setPlaying(false);
  };

  return (
    <div>
      <div className="square-70">
        <div
          className="grid gap-0 w-full h-full place-items-stretch"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {map2D(grid, (alive, [x, y]) => (
            <div
              className={`border border-black ${
                alive ? "bg-blue-400" : "bg-white"
              }`}
              key={`${x}-${y}`}
              onClick={() => {
                const newGrid = grid;
                newGrid[y][x] = !alive;
                setGrid([...newGrid]);
              }}
            />
          ))}
        </div>
      </div>
      <div>
        {/* <div className="flex justify-between my-2 items-center">
          <div className="text-white text-xl mr-2">speed:</div>
          <ReactSlider
            invert={true}
            min={0}
            max={200}
            onChange={() => {}}
            value={2}
            className="mx-auto w-full"
            thumbClassName="w-5 h-5 transform -translate-y-2  bg-white rounded-full "
            trackClassName="h-1 bg-white rounded-full"
          />
        </div> */}

        <div className="py-2 flex justify-center">
          <button
            className="w-20 text-left text-white text-xl"
            disabled={false}
            onClick={() => setPlaying(!playing)}
          >
            {playing ? "pause" : "play"}
          </button>
          <div className="text-white text-2xl mx-auto">{generationCount}</div>
          <button
            className="w-20 text-right text-white text-xl"
            disabled={false}
            onClick={() => clearBoard()}
          >
            clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOfLife;
