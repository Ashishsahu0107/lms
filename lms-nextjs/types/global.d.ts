import { Server as SocketIOServer } from "socket.io";

declare global {
  /* eslint-disable no-var */
  var io: SocketIOServer | undefined;
}

export {};
