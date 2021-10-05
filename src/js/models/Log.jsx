import { observable, action } from "mobx";

export default class Log {
  @observable log;

  constructor() {
    this.log = [];
  }

  isEmpty() {
    this.log.length ? false : true;
  }

  @action
  addToLog({ message, type }) {
    const date = new Date();
    this.log.push({ message, type, time: date });
  }
 
  @action
  clearLog() {
    this.log = [];
  }
}
