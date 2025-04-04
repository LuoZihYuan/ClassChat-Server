import { randomUUID } from "node:crypto";

export interface User {
  userid: string;
  username: string;
}

export class RegistrationList {
  #registered: Record<string, User> = {};

  registerAnonymousUser(socketid: string): User {
    const newUser = {
      userid: randomUUID(),
      username: this.#getRandomUsername(),
    };
    this.#registered[socketid] = newUser;
    return newUser;
  }

  getUserFromSocket(socketid: string): User {
    return this.#registered[socketid];
  }

  #getRandomUsername(): string {
    const adjectives = [
      "Happy",
      "Silly",
      "Brave",
      "Clever",
      "Lazy",
      "Quick",
      "Charming",
    ];
    const animals = [
      "Panda",
      "Tiger",
      "Eagle",
      "Fox",
      "Koala",
      "Penguin",
      "Elephant",
    ];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${adjective} ${animal}`;
  }
}
