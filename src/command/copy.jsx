// concret command
import Command from "./command";

export default class Copy extends Command {
  constructor(selectedShape, setClipboard) {
    // init command object
    super();
    this.selectedShape = selectedShape;
    this.setClipboard = setClipboard;
  }

  execute() {
    if (!this.selectedShape) return;

    let copiedShape = { ...this.selectedShape };

    // generate a new ID
    copiedShape.id = crypto.randomUUID();

    // Normalize color for consistent rendering
    if (!copiedShape.color && copiedShape.stroke) {
      copiedShape.color = copiedShape.stroke;
    }

    // Shift shape position
    if (copiedShape.type === "Line") {
      // add 20 to x and y for line array points
      copiedShape.points = copiedShape.points.map((val) => val + 20);
    } else {
      // add 20 to x and y for shapes
      copiedShape.x = (copiedShape.x || 0) + 20;
      copiedShape.y = (copiedShape.y || 0) + 20;
    }

    // set state of clip board to copied shape
    this.setClipboard(copiedShape);
  }
}
