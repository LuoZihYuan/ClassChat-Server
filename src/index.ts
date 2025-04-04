import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";
import type { User } from "./RegistrationList.ts";
import { RegistrationList } from "./RegistrationList.ts";

export interface Message {
  from: User;
  timestamp: Date;
  type: "notification" | "text" | "image";
}

export interface TextMessage extends Message {
  type: "text";
  text: string;
}

export interface ImageMessage extends Message {
  type: "image";
  imgsrc: string;
}

export interface NotificationMessage extends Message {
  type: "notification";
  content: string;
}

const list = new RegistrationList();

const app = express();
// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  socket.on(
    "register",
    (userid: string | undefined, callback: (usr: User) => void) => {
      if (userid) return;
      const newUser = list.registerAnonymousUser(socket.id);
      callback(newUser);
      const newMessage = {
        from: {
          userid: "system",
          username: "notification",
        },
        username: "notification",
        type: "notification",
        content: `${newUser.username} joined the chat.`,
      };
      io.emit("message.notification", newMessage);
    },
  );

  socket.on(
    "message.text",
    (msg: string, callback: (msg: TextMessage) => void) => {
      const newTextMessage: TextMessage = {
        from: list.getUserFromSocket(socket.id),
        timestamp: new Date(),
        type: "text",
        text: msg,
      };
      callback(newTextMessage);
      socket.broadcast.emit("message.text", newTextMessage);
    },
  );

  socket.on(
    "message.image",
    (imgsrc: string, callback: (msg: ImageMessage) => void) => {
      const newImageMessage: ImageMessage = {
        from: list.getUserFromSocket(socket.id),
        timestamp: new Date(),
        type: "image",
        imgsrc: imgsrc,
      };
      callback(newImageMessage);
      socket.broadcast.emit("message.image", newImageMessage);
    },
  );

  socket.on("disconnect", () => {
    const newMessage = {
      from: {
        userid: "system",
        username: "notification",
      },
      username: "notification",
      type: "notification",
      content: `${list.getUserFromSocket(socket.id).username} left the chat.`,
    };
    io.emit("message.notification", newMessage);
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
