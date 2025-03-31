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

    // handle position shifting
    if (copiedShape.type === "Line") {
      // Shift every pair of points by 20 pixels
      copiedShape.points = copiedShape.points.map((val, i) =>
        i % 2 === 0 ? val + 20 : val + 20
      );
    } else {
      // For shapes with x/y position
      copiedShape.x = (copiedShape.x || 0) + 20;
      copiedShape.y = (copiedShape.y || 0) + 20;
    }

    // set state of clip board to copied shape
    this.setClipboard(copiedShape);
  }
}
