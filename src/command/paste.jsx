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

    // get copied shape
    const shape = {
      ...this.clipboard,
      id: crypto.randomUUID(),
      // // move copied shape by (20,20)
      x: this.clipboard.x + 20,
      y: this.clipboard.y + 20,
    };

    // set state of clip board to copied shape
    this.addShape(shape);
  }
}
