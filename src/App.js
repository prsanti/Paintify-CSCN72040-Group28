import React from "react";
import './App.css';
// import Drawable from './components/Drawable';
// import { Stage, Layer, RegularPolygon, Text } from 'konva';
import Canvas from "./components/Canvas";

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
      </header> */}
      {/* <body> */}
      {/* <div style={{ textAlign: "center", padding: "20px" }}> */}
      <div>
        <h1>Paintify</h1>
        <Canvas />
      </div>
        
      {/* </body> */}
    </div>
  );
}

export default App;
