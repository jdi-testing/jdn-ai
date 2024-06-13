import { isNull } from 'lodash';
import { request, WebSocketMessage } from './backend';
import { CONNECTION_TIMEOUT, NETWORK_ERROR } from '../features/locators/utils/constants';

const thirtySeconds = 30000;

class WebSocketController {
  pingInterval = null;

  pingTimeout = null;

  readyState = null;

  messageListener;

  async init() {
    return this.openWebSocket();
  }

  updateMessageListener(callback) {
    if (this.socket) {
      this.socket.removeEventListener('message', this.messageListener);
      this.messageListener = (event) => {
        const response = event === NETWORK_ERROR ? event : JSON.parse(event.data || event);
        if (response.pong) {
          this.pong();
        }
        callback(event);
      };
      this.socket.addEventListener('message', this.messageListener);
    }
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
      this.socket = new WebSocket(`${request.baseUrl.replace('http', 'ws')}/ws`);
      this.readyState = this.socket.readyState;

      this.socket.addEventListener('open', () => {
        this.readyState = this.socket.readyState;
        resolve(this.socket);
      });

      this.socket.addEventListener('error', (event) => {
        console.error('error', event);
        this.readyState = event.target.readyState;
        this.messageListener(NETWORK_ERROR);
        this.stopPing();
        reject(NETWORK_ERROR);
      });

      this.socket.addEventListener('close', (event) => {
        this.readyState = event.target.readyState;
      });
    });
  }

  ping() {
    this.sendSocket(
      JSON.stringify({
        action: WebSocketMessage.PING,
        payload: Date.now(),
      }),
    );
  }

  pong() {
    clearTimeout(this.pingTimeout);
    this.pingTimeout = null;
  }

  startPing() {
    if (this.pingInterval) return;
    this.pingInterval = setInterval(() => {
      this.ping();
      if (this.pingTimeout) return;
      this.pingTimeout = setTimeout(() => {
        this.messageListener(CONNECTION_TIMEOUT);
      }, thirtySeconds);
    }, 5000);
  }

  stopPing() {
    clearInterval(this.pingInterval);
    clearTimeout(this.pingTimeout);
    this.pingInterval = null;
    this.pingTimeout = null;
  }
}

export const webSocketController = new WebSocketController();
