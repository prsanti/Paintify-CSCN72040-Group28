import Memento from './memento';

export default class Originator {
  constructor() {
    this.state = null;
  }

  // set memento state
  setState(state) {
    this.state = state;
  }

  // return memento state
  getState() {
    return this.state;
  }

  // create new memento
  save() {
    return new Memento(this.state);
  }

  // get previous memento
  restore(memento) {
    this.state = memento.getState();
  }
}