// concret command
import Command from "./command";

export default class Copy extends Command {
  constructor(selectedShape, setClipboard) {
    // init command
    super();
    this.selectedShape = selectedShape;
    this.setClipboard = setClipboard;
  }

  execute() {
    if (this.selectedShape) {
      // set copied shape
      const copiedShape = { ...this.selectedShape, id: crypto.randomUUID(), x: this.selectedShape.x + 10, y: this.selectedShape.y + 10 };
      // set state of clip board to copied shape
      this.setClipboard(copiedShape);
    }
  }
}
