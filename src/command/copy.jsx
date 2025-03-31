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

     // set copied shape
    const copiedShape = {
      ...this.selectedShape,
      // create new id for copied shape
      id: crypto.randomUUID(),
      // move copied shape by (20,20)
      x: this.selectedShape.x + 20,
      y: this.selectedShape.y + 20,
    };

    // set state of clip board to copied shape
    this.setClipboard(copiedShape);
  }
}
