export interface WebSocketMessageEvent extends MessageEvent {
  data: string;
}
/* interface for data - ResultData<T> {
 *  action: WSResponseAction;
 *   payload: T;  // type AllPayloads
 *   pong?: number;
 *   error_message?: string;
 * }
 *
 * type AllPayloads = XpathMultipleGenerationPayload | CssSelectorsGenerationPayload | { id: string[] };
 * */

export const enum WSResponseAction {
  PONG = 'pong',
  RESULT_READY = 'result_ready',
  STATUS_CHANGED = 'status_changed',
  TASKS_REVOKED = 'tasks_revoked',
}

export interface XpathMultipleGenerationPayload {
  id: string; // JDN-hash
  result: string;
}

export interface CssSelectorsGenerationPayload {
  id: string;
  result: {
    id: string; // JDN-hash
    result: string;
  }[];
}
