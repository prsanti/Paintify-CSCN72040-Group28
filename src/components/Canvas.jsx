import React, { useCallback, useRef, useState } from "react";
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
import { v4 as uuidv4 } from "uuid";
import {
  ArrowsMove,
  ArrowUpLeft,
  ArrowUpLeftSquareFill,
  Circle,
  Pencil,
  Square,
} from "react-bootstrap-icons";

import "./Canvas.scss";

// ----- ENUMS & CONSTANTS -----
const WIDTH = 1000;
const HEIGHT = 500;

const DrawAction = {
  Select: "select",
  Rectangle: "rectangle",
  Circle: "circle",
  Scribble: "freedraw",
  Arrow: "arrow",
};

const PAINT_OPTIONS = [
  {
    id: DrawAction.Select,
    label: "Select Shapes",
    icon: <ArrowUpLeftSquareFill />,
  },
  { id: DrawAction.Rectangle, label: "Draw Rectangle Shape", icon: <Square /> },
  { id: DrawAction.Circle, label: "Draw Cirle Shape", icon: <Circle /> },
  { id: DrawAction.Arrow, label: "Draw Arrow Shape", icon: <ArrowUpLeft /> },
  { id: DrawAction.Scribble, label: "Scribble", icon: <Pencil /> },
];

// ----- UTILS -----
const downloadURI = (uri, name) => {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri || "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ----- MAIN COMPONENT -----
const Canvas = () => {
  const currentShapeRef = useRef();
  const isPaintRef = useRef(false);
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const diagramRef = useRef(null);
  const fileRef = useRef(null);

  const [scribbles, setScribbles] = useState([]);
  const [rectangles, setRectangles] = useState([]);
  const [circles, setCircles] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [image, setImage] = useState();
  const [color, setColor] = useState("#000");
  const [drawAction, setDrawAction] = useState(DrawAction.Scribble);

  const isDraggable = drawAction === DrawAction.Select;

  const checkDeselect = useCallback((e) => {
    const clickedOnEmpty = e.target === stageRef?.current?.find("#bg")?.[0];
    if (clickedOnEmpty) {
      transformerRef?.current?.nodes([]);
    }
  }, []);

  const onStageMouseDown = useCallback((e) => {
    checkDeselect(e);
    if (drawAction === DrawAction.Select) return;

    isPaintRef.current = true;
    const stage = stageRef?.current;
    const pos = stage?.getPointerPosition();
    const x = pos?.x || 0;
    const y = pos?.y || 0;
    const id = uuidv4();
    currentShapeRef.current = id;

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

  const onStageMouseMove = useCallback(() => {
    if (drawAction === DrawAction.Select || !isPaintRef.current) return;

    const stage = stageRef?.current;
    const id = currentShapeRef.current;
    const pos = stage?.getPointerPosition();
    const x = pos?.x || 0;
    const y = pos?.y || 0;

    switch (drawAction) {
      case DrawAction.Scribble:
        setScribbles((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, points: [...s.points, x, y] } : s
          )
        );
        break;
      case DrawAction.Circle:
        setCircles((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, radius: Math.sqrt((x - c.x) ** 2 + (y - c.y) ** 2) }
              : c
          )
        );
        break;
      case DrawAction.Rectangle:
        setRectangles((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, width: x - r.x, height: y - r.y } : r
          )
        );
        break;
      case DrawAction.Arrow:
        setArrows((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, points: [a.points[0], a.points[1], x, y] }
              : a
          )
        );
        break;
      default:
        console.warn("Unknown drawAction on mouse move:", drawAction);
        break;
    }
  }, [drawAction]);

  const onStageMouseUp = useCallback(() => {
    isPaintRef.current = false;
  }, []);

  const onShapeClick = useCallback(
    (e) => {
      if (drawAction !== DrawAction.Select) return;
      transformerRef?.current?.node(e.currentTarget);
    },
    [drawAction]
  );

  const onImportImageSelect = useCallback((e) => {
    if (e.target.files?.[0]) {
      const imageURL = URL.createObjectURL(e.target.files[0]);
      const img = new Image(WIDTH / 2, HEIGHT / 2);
      img.src = imageURL;
      setImage(img);
    }
    e.target.files = null;
  }, []);

  const onImportImageClick = () => {
    fileRef?.current?.click();
  };

  const onExportClick = () => {
    const dataURL = stageRef?.current?.toDataURL({ pixelRatio: 3 });
    downloadURI(dataURL, "image.png");
  };

  const onClear = () => {
    setScribbles([]);
    setCircles([]);
    setRectangles([]);
    setArrows([]);
    setImage(undefined);
  };

  return (
    <div style={{ margin: 16, width: WIDTH }}>
      {/* Toolbar */}
      <div style={{ zIndex: 1, position: 'relative' }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            {PAINT_OPTIONS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setDrawAction(id)}
                style={{
                  marginRight: 4,
                  padding: 4,
                  backgroundColor: drawAction === id ? "#90ee90" : "#e0e0e0",
                  border: "1px solid #ccc",
                }}
                title={label}
              >
                {icon}
              </button>
            ))}
            <button onClick={onClear} title="Clear">❌</button>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="file"
              ref={fileRef}
              onChange={onImportImageSelect}
              style={{ display: "none" }}
            />
            <button onClick={onImportImageClick}>📥 Import</button>
            <button onClick={onExportClick}>📤 Export</button>
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <SketchPicker color={color} onChangeComplete={(c) => setColor(c.hex)} />
        </div>
        <button onClick={() => alert('Hello!')}>Test Click</button>
      </div>
  
      {/* Canvas */}
      <div style={{border: "1px solid black"}} className="canvas">
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
            {image && (
              <KonvaImage
                ref={diagramRef}
                image={image}
                x={0}
                y={0}
                width={WIDTH / 2}
                height={HEIGHT / 2}
                draggable={isDraggable}
                onClick={onShapeClick}
              />
            )}
            {rectangles.map((r) => (
              <KonvaRect
                key={r.id}
                x={r.x}
                y={r.y}
                width={r.width}
                height={r.height}
                stroke={r.color}
                strokeWidth={4}
                draggable={isDraggable}
                onClick={onShapeClick}
              />
            ))}
            {circles.map((c) => (
              <KonvaCircle
                key={c.id}
                x={c.x}
                y={c.y}
                radius={c.radius}
                stroke={c.color}
                strokeWidth={4}
                draggable={isDraggable}
                onClick={onShapeClick}
              />
            ))}
            {scribbles.map((s) => (
              <KonvaLine
                key={s.id}
                points={s.points}
                stroke={s.color}
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
                draggable={isDraggable}
                onClick={onShapeClick}
              />
            ))}
            {arrows.map((a) => (
              <KonvaArrow
                key={a.id}
                points={a.points}
                fill={a.color}
                stroke={a.color}
                strokeWidth={4}
                draggable={isDraggable}
                onClick={onShapeClick}
              />
            ))}
            <Transformer ref={transformerRef} />
          </Layer>
        </Stage>
      </div>
    </div>
  );
  
};

export default Canvas;
