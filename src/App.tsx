import TetrisGameContainer from "./containers/TetrisGameContainer";

function App() {
  return (
    <>
      {/* <div className="fixed bottom-5 left-5 rounded-2xl bg-slate-300 p-6">
        <h5 className="text-center font-bold">Dev Menu</h5>
      </div> */}
      <div className="flex h-full flex-col justify-center">
        <div className="flex justify-center">
          <TetrisGameContainer />
        </div>
      </div>
      <div className="fixed bottom-5 right-5 rounded-2xl bg-slate-300 p-6">
        <h3 className="pb-2 text-center font-bold">Controls</h3>
        <ul>
          <li>Bump Left: Arrow Left</li>
          <li>Bump Right: Arrow Right</li>
          <li>Bump Down: Arrow Down</li>
          <li>Drop Piece: Space</li>
          <li>Rotate Left: Z</li>
          <li>Rotate Right: X</li>
          <li>Save/Hold: S</li>
          <li>Pause/Resume: P</li>
        </ul>
      </div>
    </>
  );
}

export default App;
