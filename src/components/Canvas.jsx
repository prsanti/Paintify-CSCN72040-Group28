import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  Stage,
  Layer,
  Rect as KonvaRect,
  Image as KonvaImage,
  Circle as KonvaCircle,
  Line as KonvaLine,
  Arrow as KonvaArrow,
  Transformer,
} from "react-konva";
import { SketchPicker } from "react-color";
// for random id generation
import { v4 as uuidv4 } from "uuid";
import {
  ArrowsMove,
  ArrowUpLeft,
  ArrowUpLeftSquareFill,
  Circle,
  Pencil,
  Square,
} from "react-bootstrap-icons";

// import memento design pattern files
import Caretaker from "../memento/caretaker";
import Originator from "../memento/originator";

// import command design pattern files
import Copy from "../command/copy";
import Paste from "../command/paste";

// css
import "./Canvas.scss";

// height and width of canvas
const WIDTH = 1000;
const HEIGHT = 500;

// all different draw actions
const DrawAction = {
  Select: "select",
  Rectangle: "rectangle",
  Circle: "circle",
  Scribble: "freedraw",
  Arrow: "arrow",
};

// select button icons and options
const PAINT_OPTIONS = [
  {
    id: DrawAction.Select,
    label: "Select Shapes",
    icon: <ArrowUpLeftSquareFill />,
  },
  { id: DrawAction.Rectangle, label: "Draw Rectangle Shape", icon: <Square /> },
  { id: DrawAction.Circle, label: "Draw Circle Shape", icon: <Circle /> },
  { id: DrawAction.Arrow, label: "Draw Arrow Shape", icon: <ArrowUpLeft /> },
  { id: DrawAction.Scribble, label: "Scribble", icon: <Pencil /> },
];

// download image
const downloadURI = (uri, name) => {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri || "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const Canvas = () => {
  // refs
  const currentShapeRef = useRef();
  const isPaintRef = useRef(false);
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const diagramRef = useRef(null);
  const fileRef = useRef(null);

  // states
  const [scribbles, setScribbles] = useState([]);
  const [rectangles, setRectangles] = useState([]);
  const [circles, setCircles] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [image, setImage] = useState();
  const [color, setColor] = useState("#000");
  const [drawAction, setDrawAction] = useState(DrawAction.Scribble);
  // states for command design pattern
  const [clipboard, setClipboard] = useState(null);
  const [selectedShape, setSelectedShape] = useState(null);

  // memento objects
  const originator = useRef(new Originator());
  const caretaker = useRef(new Caretaker(originator.current));
  const redoStack = useRef([]);

  // if items are dragagble
  const isDraggable = drawAction === DrawAction.Select;

  // get states
  const getCanvasState = () => ({
    rectangles,
    circles,
    scribbles,
    arrows,
    image,
  });

  const setCanvasState = (state) => {
    setRectangles(state.rectangles || []);
    setCircles(state.circles || []);
    setScribbles(state.scribbles || []);
    setArrows(state.arrows || []);
    setImage(state.image);
  };

  // press undo button
  const handleUndo = () => {
    const prevState = caretaker.current.undo();
    if (prevState !== undefined && prevState !== null) {
      redoStack.current.push(getCanvasState());
      setCanvasState(prevState);
    }
  };

  // redo for memento
  // press redo button
  const handleRedo = () => {
    if (redoStack.current.length > 0) {
      const nextState = redoStack.current.pop();
      originator.current.setState(nextState);
      caretaker.current.backup();
      setCanvasState(nextState);
    }
  };

  // command design pattern
  // press copy button
  const handleCopy = () => {
    console.log("handle copy");
    const command = new Copy(selectedShape, setClipboard);
    // console.log("selected shape: " + selectedShape)
    console.log("Copied shape:", selectedShape);

    command.execute();
  };

  // press paste button
  const handlePaste = () => {
    const command = new Paste(clipboard, (shape) => {
      // Backup current state before pasting for memento
      originator.current.setState(getCanvasState());
      caretaker.current.backup();
      redoStack.current = [];

      // check type of shape for copied shape
      // push memento state to stack for shape object
      switch (shape.type) {
        case "Rect":
          setRectangles((prev) => [...prev, shape]);
          break;
        case "Circle":
          setCircles((prev) => [...prev, shape]);
          break;
        case "Line":
          setScribbles((prev) => [...prev, shape]);
          break;
        case "Arrow":
          setArrows((prev) => [...prev, shape]);
          break;
        default:
          console.warn("Unknown shape type during paste:", shape);
      }
    });

    command.execute();
  };

  // deselect shape
  const checkDeselect = useCallback((e) => {
    const clickedOnEmpty = e.target === stageRef?.current?.find("#bg")?.[0];
    if (clickedOnEmpty) {
      transformerRef?.current?.nodes([]);
    }
  }, []);

  // for mouse down
  const onStageMouseDown = useCallback((e) => {
    checkDeselect(e);
    if (drawAction === DrawAction.Select) return;
    originator.current.setState(getCanvasState());
    caretaker.current.backup();
    redoStack.current = [];

    isPaintRef.current = true;
    const stage = stageRef?.current;
    const pos = stage?.getPointerPosition();
    const x = pos?.x || 0;
    const y = pos?.y || 0;
    const id = uuidv4();
    currentShapeRef.current = id;

    // get position of mouse for drawing shapes
    switch (drawAction) {
      case DrawAction.Scribble:
        setScribbles((prev) => [...prev, { id, points: [x, y], color }]);
        break;
      case DrawAction.Circle:
        setCircles((prev) => [...prev, { id, radius: 1, x, y, color }]);
        break;
      case DrawAction.Rectangle:
        setRectangles((prev) => [...prev, { id, width: 1, height: 1, x, y, color }]);
        break;
      case DrawAction.Arrow:
        setArrows((prev) => [...prev, { id, points: [x, y, x, y], color }]);
        break;
      default:
        console.warn("Unknown drawAction on mouse down:", drawAction);
        break;
    }
  }, [checkDeselect, drawAction, color]);

  // on mouse move
  const onStageMouseMove = useCallback(() => {
    // update coordinates for shape
    if (drawAction === DrawAction.Select || !isPaintRef.current) return;
    const stage = stageRef?.current;
    const id = currentShapeRef.current;
    const pos = stage?.getPointerPosition();
    const x = pos?.x || 0;
    const y = pos?.y || 0;

    switch (drawAction) {
      case DrawAction.Scribble:
        setScribbles((prev) => prev.map((s) => s.id === id ? { ...s, points: [...s.points, x, y] } : s));
        break;
      case DrawAction.Circle:
        setCircles((prev) => prev.map((c) => c.id === id ? { ...c, radius: Math.sqrt((x - c.x) ** 2 + (y - c.y) ** 2) } : c));
        break;
      case DrawAction.Rectangle:
        setRectangles((prev) => prev.map((r) => r.id === id ? { ...r, width: x - r.x, height: y - r.y } : r));
        break;
      case DrawAction.Arrow:
        setArrows((prev) => prev.map((a) => a.id === id ? { ...a, points: [a.points[0], a.points[1], x, y] } : a));
        break;
      default:
        console.warn("Unknown drawAction on mouse move:", drawAction);
        break;
    }
  }, [drawAction]);

  // on mouse move up
  const onStageMouseUp = useCallback(() => {
    isPaintRef.current = false;
  }, []);

  // on shape click
  const onShapeClick = useCallback((e) => {
    if (drawAction !== DrawAction.Select) return;
    transformerRef?.current?.node(e.currentTarget);
    const shapeProps = e.target.attrs;
    // get shape information
    setSelectedShape({ ...shapeProps, type: e.target.name() });
  }, [drawAction]);  

  // import image
  const onImportImageSelect = useCallback((e) => {
    if (e.target.files?.[0]) {
      const imageURL = URL.createObjectURL(e.target.files[0]);
      const img = new Image(WIDTH / 2, HEIGHT / 2);
      img.src = imageURL;
      setImage(img);
    }
    e.target.files = null;
  }, []);

  const onImportImageClick = () => fileRef?.current?.click();

  // export image
  const onExportClick = () => downloadURI(stageRef?.current?.toDataURL({ pixelRatio: 3 }), "image.png");
  const onClear = () => {
    setScribbles([]);
    setCircles([]);
    setRectangles([]);
    setArrows([]);
    setImage(undefined);
  };

  // on load
  useEffect(() => {
    originator.current.setState(getCanvasState());
    caretaker.current.backup();
  }, []);

  return (
    <div style={{ margin: 16, width: WIDTH }}>
      <div style={{ zIndex: 1, position: 'relative' }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            {PAINT_OPTIONS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setDrawAction(id)}
                style={{ marginRight: 4, padding: 4, backgroundColor: drawAction === id ? "#90ee90" : "#e0e0e0", border: "1px solid #ccc" }}
                title={label}
              >
                {icon}
              </button>
            ))}
            <button onClick={onClear} title="Clear">❌</button>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input type="file" ref={fileRef} onChange={onImportImageSelect} style={{ display: "none" }} />
            <button onClick={onImportImageClick}>📥 Import</button>
            <button onClick={onExportClick}>📤 Export</button>
          </div>
          <div>
            <button onClick={handleUndo}>↩️ Undo</button>
            <button onClick={handleRedo}>↪️ Redo</button>
          </div>
          <div>
            <button onClick={handleCopy}>Copy</button>
            <button onClick={handlePaste}>Paste</button>
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <SketchPicker color={color} onChangeComplete={(c) => setColor(c.hex)} />
        </div>
      </div>

      <div style={{ border: "1px solid black" }} className="canvas">
        <Stage
          width={WIDTH}
          height={HEIGHT}
          ref={stageRef}
          onMouseDown={onStageMouseDown}
          onMouseMove={onStageMouseMove}
          onMouseUp={onStageMouseUp}
        >
          <Layer>
            <KonvaRect x={0} y={0} width={WIDTH} height={HEIGHT} fill="white" id="bg" />
            {image && <KonvaImage ref={diagramRef} image={image} x={0} y={0} width={WIDTH / 2} height={HEIGHT / 2} draggable={isDraggable} onClick={onShapeClick} />}
            {rectangles.map((r) => <KonvaRect key={r.id} name="Rect" x={r.x} y={r.y} width={r.width} height={r.height} stroke={r.color} strokeWidth={4} draggable={isDraggable} onClick={onShapeClick} />)}
            {circles.map((c) => <KonvaCircle key={c.id} name="Circle" x={c.x} y={c.y} radius={c.radius} stroke={c.color} strokeWidth={4} draggable={isDraggable} onClick={onShapeClick} />)}
            {scribbles.map((s) => <KonvaLine key={s.id} name="Line" points={s.points} stroke={s.color} strokeWidth={4} lineCap="round" lineJoin="round" draggable={isDraggable} onClick={onShapeClick} />)}
            {arrows.map((a) => <KonvaArrow key={a.id} name="Arrow" points={a.points} fill={a.color} stroke={a.color} strokeWidth={4} draggable={isDraggable} onClick={onShapeClick} />)}
            <Transformer ref={transformerRef} />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Canvas;
