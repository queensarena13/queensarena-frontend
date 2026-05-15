import { io } from "socket.io-client";

export const socket = io("https://queensarena-backend.onrender.com", {
  transports: ["websocket"]
});