import React from "react";
import GameOfLife from "./GameOfLife/GameOfLife";
import Maze from "./Maze/Maze";

type HeadlineProps = { text: string };
const Headline = ({ text }: HeadlineProps) => (
  <h1 className="w-4/5 mx-auto mb-8 text-6xl font-bold text-white">{text}</h1>
);

function App() {
  return (
    <div className="overflow-y-scroll snap snap-y snap-mandatory h-screen bg-pink-300">
      <div className="grid place-content-center snap-start transform w-full  h-screen ">
        <h1 className="italic font-bold text-7xl text-white">Jan Czerwiński</h1>
      </div>

      <div className="mt-10 snap-start h-screen transform skew-y-3   bg-green-300">
        <Headline text="Maze" />
        <div className=" grid place-content-center transform -skew-y-3">
          <Maze />
        </div>
      </div>

      <div className="snap-start h-screen transform skew-y-3 bg-blue-300">
        <Headline text="Game of Life" />
        <div className="grid place-content-center transform -skew-y-3">
          <GameOfLife />
        </div>
      </div>
    </div>
  );
}

export default App;
