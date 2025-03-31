// concret command
import Command from "./command";

export default class Paste extends Command {
  constructor(clipboard, addShape) {
    // init command object
    super();
    this.clipboard = clipboard;
    this.addShape = addShape;
  }

  execute() {
    if (!this.clipboard) return;

    const shape = { ...this.clipboard };
    shape.id = crypto.randomUUID();

    // Standardize color prop for all shapes
    if (!shape.color && shape.stroke) {
      shape.color = shape.stroke;
    }

    // Shift position for line shape
    if (shape.type === "Line") {
      // add points of line to array but add 20 to x and y
      shape.points = shape.points.map((val) => val + 20);
    } else {
      // add 20 to x and y from original shape
      shape.x = (shape.x || 0) + 20;
      shape.y = (shape.y || 0) + 20;
    }

    // set state of clip board to copied shape
    this.addShape(shape);
  }
}
