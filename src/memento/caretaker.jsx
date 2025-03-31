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
    // history stack is empty
    if (this.history.length === 0) return;

    // remove the top of the stack
    const memento = this.history.pop();
    // restore memento
    this.originator.restore(memento);
    // return memento state
    return this.originator.getState();
  }
}