import type { NoteModel } from '@mx-space/api-client'

export const enum EventTypes {
  GATEWAY_CONNECT = 'GATEWAY_CONNECT',
  GATEWAY_DISCONNECT = 'GATEWAY_DISCONNECT',

  VISITOR_ONLINE = 'VISITOR_ONLINE',
  VISITOR_OFFLINE = 'VISITOR_OFFLINE',

  AUTH_FAILED = 'AUTH_FAILED',

  COMMENT_CREATE = 'COMMENT_CREATE',

  POST_CREATE = 'POST_CREATE',
  POST_UPDATE = 'POST_UPDATE',
  POST_DELETE = 'POST_DELETE',

  NOTE_CREATE = 'NOTE_CREATE',
  NOTE_UPDATE = 'NOTE_UPDATE',
  NOTE_DELETE = 'NOTE_DELETE',

  // NOTE 历史遗留
  PAGE_UPDATED = 'PAGE_UPDATED',
  PAGE_UPDATE = 'PAGE_UPDATE',

  SAY_CREATE = 'SAY_CREATE',
  SAY_DELETE = 'SAY_DELETE',
  SAY_UPDATE = 'SAY_UPDATE',

  RECENTLY_CREATE = 'RECENTLY_CREATE',
  RECENTLY_DELETE = 'RECENTLY_DELETE',

  ACTIVITY_UPDATE_PRESENCE = 'ACTIVITY_UPDATE_PRESENCE',
  ACTIVITY_LEAVE_PRESENCE = 'ACTIVITY_LEAVE_PRESENCE',
  ARTICLE_READ_COUNT_UPDATE = 'ARTICLE_READ_COUNT_UPDATE',
}

export interface EventTypesPayload {
  [EventTypes.VISITOR_ONLINE]: { online: number }
  [EventTypes.VISITOR_OFFLINE]: { online: number }
  [EventTypes.NOTE_UPDATE]: NoteModel
}

export enum SocketEmitEnum {
  Join = 'join',
  Leave = 'leave',
  UpdateSid = 'updateSid',
  Message = 'message',
}
