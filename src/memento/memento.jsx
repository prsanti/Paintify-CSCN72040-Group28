// memento class
export default class Memento {
  constructor(canvasState) {
    // set state to canvas board
    this.state = canvasState;
  }

  // get state of memento
  getState() {
    return this.state;
  }
}