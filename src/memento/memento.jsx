export default class Memento {
  constructor(canvasState) {
    this.state = canvasState;
  }

  getState() {
    return this.state;
  }
}