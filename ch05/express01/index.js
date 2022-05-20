// Express.js application
import express from 'express';

// configuration
const
  cfg = {
    port: process.env.PORT || 3000
  };

// Express initiation
const app = express();

// home page route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// another route
app.get('/hello/', (req, res) => {
  res.send('Hello again!');
});

// start server
app.listen(cfg.port, () => {
  console.log(`Example app listening at http://localhost:${ cfg.port }`);
});
