import Memento from './memento';

export default class Originator {
  constructor() {
    this.state = null;
  }

  setState(state) {
    this.state = state;
  }

  getState() {
    return this.state;
  }

  save() {
    return new Memento(this.state);
  }

  restore(memento) {
    this.state = memento.getState();
  }
}