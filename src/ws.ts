import { Socket, Server } from "socket.io";
import SuperHeroes from "./heroes";
const superHeroes = new SuperHeroes();

export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    io.to(socket.id).emit("on-connected", superHeroes.listOfSuperHeroes());

    // a user requests a super hero as a user
    socket.on("pick", (superHeroName: string) =>
      superHeroes.assignSuperHero(io, socket, superHeroName)
    );

    socket.on(
      "request",
      ({ superHeroName, data }: { superHeroName: string; data: any }) =>
        superHeroes.requestCall({ io, socket, callee: superHeroName, data })
    );

    socket.on("cancel-request", () => superHeroes.cancelRequest(io, socket));

    socket.on(
      "response",
      ({ requestId, data = null }: { requestId: string; data: any | null }) =>
        superHeroes.reponseToRequest({ io, socket, requestId, data })
    );

    socket.on("finish-call", () => superHeroes.finishCall(io, socket, false));

    // if the current socket has been disconnected
    socket.on("disconnect", () => {
      const {
        superHeroAssiged
      }: { superHeroAssiged: string | null } = socket.handshake.query;

      if (superHeroAssiged) {
        console.log("disconnected", superHeroAssiged);
        superHeroes.cancelRequest(io, socket);
        superHeroes.finishCall(io, socket, true);
        socket.handshake.query.superHeroAssiged = null;
        superHeroes.enabledAgain(io, superHeroAssiged);
      }
    });
  });
};
