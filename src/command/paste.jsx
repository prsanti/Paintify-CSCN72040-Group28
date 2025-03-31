// concret command
import Command from "./command";

export default class Paste extends Command {
  constructor(clipboard, addShape) {
    // init command
    super();
    this.clipboard = clipboard;
    this.addShape = addShape;
  }

  execute() {
    if (this.clipboard) {
      // get copied shape
      const pastedShape = { ...this.clipboard, id: crypto.randomUUID(), x: this.clipboard.x + 10, y: this.clipboard.y + 10 };
      // set state of clip board to copied shape
      this.addShape(pastedShape);
    }
  }
}
