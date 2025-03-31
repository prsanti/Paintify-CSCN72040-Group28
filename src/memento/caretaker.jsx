// caretaker class
export default class Caretaker {
  // constructor
  constructor(originator) {
    this.originator = originator;
    // history of shapes
    this.history = [];
  }

  backup() {
    // add memento to stack
    this.history.push(this.originator.save());
  }

  undo() {
    if (this.history.length === 0) return;

    // remove the top of the stack
    const memento = this.history.pop();
    this.originator.restore(memento);
    return this.originator.getState();
  }
}