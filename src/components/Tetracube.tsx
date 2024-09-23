import { TetrominoColor } from "../types/Tetromino";

export default function Tetracube(props: {
  color: TetrominoColor | "clear";
  faded?: boolean;
}) {
  const colorVariants = {
    cyan: "bg-cyan-500 border-t-cyan-300 border-l-cyan-300 border-r-cyan-700 border-b-cyan-700",
    blue: "bg-blue-500 border-t-blue-300 border-l-blue-300 border-r-blue-700 border-b-blue-700",
    orange:
      "bg-orange-500 border-t-orange-300 border-l-orange-300 border-r-orange-700 border-b-orange-700",
    yellow:
      "bg-yellow-500 border-t-yellow-300 border-l-yellow-300 border-r-yellow-700 border-b-yellow-700",
    green:
      "bg-green-500 border-t-green-300 border-l-green-300 border-r-green-700 border-b-green-700",
    purple:
      "bg-purple-500 border-t-purple-300 border-l-purple-300 border-r-purple-700 border-b-purple-700",
    red: "bg-red-500 border-t-red-300 border-l-red-300 border-r-red-700 border-b-red-700",
    clear: "border-white",
  };

  const fadedStyle = props.faded ? "opacity-50" : "";

  return (
    <div className="h-6 w-6 border-white bg-white">
      <div
        className={`h-6 w-6 border-4 ${fadedStyle} ${colorVariants[props.color]}`}
      />
    </div>
  );
}
