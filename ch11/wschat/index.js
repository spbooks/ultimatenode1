// Express.js application
import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';

// configuration
const cfg = {
  title:    'WebSocket Chat',
  port:     process.env.PORT || 3000,
  wsPort:   process.env.WSPORT || 3001,
  nameLen:  15,
  msgLen:   200
};

// --------------------------
// Express server
const app = express();

// EJS templates
app.set('view engine', 'ejs');
app.set('views', 'views');

// CORS header
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', '*');
  next();
});

// home page
app.get('/', (req, res) => {
  res.render('chat', cfg);
});

// static assets
app.use(express.static('static'));

// start server
app.listen(cfg.port, () => {
  console.log(`Express server at: http://localhost:${ cfg.port }`);
  console.log(`Web Socket server: ws://localhost:${ cfg.wsPort }`);
});


// --------------------------
// WebSocket server
const ws = new WebSocketServer({ port: cfg.wsPort });

// client connection
ws.on('connection', (socket, req) => {

  console.log(`connection from ${ req.socket.remoteAddress }`);

  // received message
  socket.on('message', (msg, binary) => {

    // broadcast to all clients
    ws.clients.forEach(client => {
      client.readyState === WebSocket.OPEN && client.send(msg, { binary });
    });

  });

  // closed
  socket.on('close', () => {
    console.log(`disconnection from ${ req.socket.remoteAddress }`);
  });

});
