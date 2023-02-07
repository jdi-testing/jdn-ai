import { isNull } from "lodash";
import { request } from "./backend";

class WebSocketController {
  constructor() {
    this.readyState = null;
    this.messageSubscribers = new Set();
  }

  async init() {
    return this.openWebSocket().then(() => {
      return this.setMessageListener();
    });
  }

  addSubscriber(callback) {
    this.messageSubscribers.add(callback);
  }

  removeSubscriber(callback) {
    this.messageSubscribers.delete(callback);
  }

  sendSocket(json) {
    if (isNull(this.readyState) || this.readyState === 2 || this.readyState === 3) {
      return this.init().then(() => {
        return this.socket.send(json);
      });
    } else {
      const send = () => {
        if (this.readyState === 0) {
          return new Promise((resolve) => resolve(setTimeout(() => send(), 10)));
        } else return new Promise((resolve) => resolve(this.socket.send(json)));
      };

      return send();
    }
  }

  openWebSocket() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(`${request.baseUrl.replace("http", "ws")}/ws`);
      this.readyState = this.socket.readyState;

      this.socket.addEventListener("open", () => {
        this.readyState = this.socket.readyState;
        resolve(this.socket);
      });

      this.socket.addEventListener("error", (event) => {
        this.readyState = event.target.readyState;
        reject(new Error(event));
      });

      this.socket.addEventListener("close", (event) => {
        this.readyState = event.target.readyState;
        this.messageObservers = [];
      });
    });
  }

  setMessageListener() {
    this.socket.addEventListener("message", (event) => {
      for (const callback of this.messageSubscribers) {
        callback(event);
      }
    });
  }
}

export const webSocketController = new WebSocketController();
