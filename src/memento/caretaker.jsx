export default class Caretaker {
  constructor(originator) {
    this.originator = originator;
    this.history = [];
  }

  backup() {
    this.history.push(this.originator.save());
  }

  undo() {
    if (this.history.length === 0) return;

    const memento = this.history.pop();
    this.originator.restore(memento);
    return this.originator.getState();
  }
}