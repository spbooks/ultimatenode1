// main Web Socket server

// modules
import { WebSocketServer } from 'ws';
import { Player } from './lib/player.js';

// configuration
const
  cfg = {
    wsPort: process.env.NODE_WSPORT || 8001
  },

  // server
  ws = new WebSocketServer({ port: cfg.wsPort, perMessageDeflate: false });


// client connected
ws.on('connection', (socket, req) => {

  let player = null;

  console.log(`connection from ${ req.socket.remoteAddress }`);

  // message received from client
  socket.on('message', async (msg) => {

    // parse message
    msg = parseMessage(msg);

    // initialize player and game
    if (!player && msg.type === 'gameInit' && msg.data) {

      player = new Player();
      const pId = await player.create( msg.data.gameId, msg.data.playerName, socket );
      if (!pId) player = null;

    }
    else {

      // pass message to game object
      msg.data = msg.data || {};
      msg.data.playerId = player.id;
      await player.game.clientMessage( msg );

    }


  });

  // client connection closed
  socket.on('close', async () => {

    // remove player
    if (player) {
      await player.game.playerRemove( player );
    }

    console.log(`disconnection from ${ req.socket.remoteAddress }`);

  });

});


// parse incoming message in format "type:jsondata"
// e.g. 'myMessage:{"value",123}' returns { type: "myMessage", data: { "value": 123 }}
function parseMessage( msg ) {

  msg = msg.toString().trim();

  let
    s = msg.indexOf(':'),
    type = null,
    data = {};

  if (s > 0) {
    type = msg.slice(0, s);
    data = msg.slice(s + 1);

    try {
      let json = JSON.parse(data);
      data = json;
    }
    catch(e){}

  }
  else {
    type = msg;
  }

  return { type, data };

}
