import { Game } from "./Game.js";
import { randomId } from "./helperFunctions/randomId.js";
import { Vec2 } from "./helperFunctions/vector.js";

export default class GameManager {
  constructor(io) {
    this.io = io;
    this.games = {};

    this.moves = {
      up: new Vec2(0, -5),
      down: new Vec2(0, 5),
      left: new Vec2(-5, 0),
      right: new Vec2(5, 0),
    };

    io.on("connection", (socket) => {
      this.#newConnection(socket);
    });
  }
  getGame(id) {
    return this.games[id];
  }

  addGame(id) {
    this.games[id] = new Game(id, this.io);
    return this.games[id];
  }

  removeGame(id) {
    delete this.games[id];
  }

  async removeEmptyGames() {
    for (var id in this.games) {
      if (Object.keys(this.games[id].clients).length === 0) {
        this.removeGame(id);
      }
    }
  }

  getGamesArray() {
    let returnGames = [];
    for (var key in games) {
      returnGames.push({
        id: games[key].id,
        playerCount: Object.keys(games[key].clients).length,
      });
    }
    return returnGames;
  }

  matchMaking() {
    for (var roomId in this.games) {
      const game = this.getGame(roomId);
      if (Object.keys(game.clients).length < 10) {
        return game;
      }
    }
    return this.addGame(randomId());
  }

  #newConnection(socket) {
    console.log("=> client connected", socket.handshake.address);
    socket.on("disconnect", () => {
      this.removeEmptyGames();
    });

    let changeRoom = (roomId) => {
      let game = this.getGame(roomId);
      if (game !== undefined) {
        game.addPlayer(
          socket,
          this.moves,
          socket.handshake.address,
          changeRoom
        );
      } else {
        socket.emit("WARN", {
          type: "removeCanvas",
          text: "Not a valid room id, \nreload the page to try again!",
        });
        socket.disconnect(true);
      }
    };

    this.matchMaking().addPlayer(
      socket,
      this.moves,
      socket.handshake.address,
      changeRoom
    );
  }
}
