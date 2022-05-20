// Express.js page hit application
import dotenv from 'dotenv';
import express from 'express';
import pagehit from './lib/pagehit.js';

// load .env configuration
dotenv.config();

const
  cfg = {
    port: process.env.EXPRESS_PORT || 8001,
  };

// Express initiation
const app = express();

// header middleware
app.use((req, res, next) => {

  res.set({
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'must-revalidate, max-age=0'
  });
  next();

});

// page hit count middleware
app.use(async (req, res, next) => {

  try {
    req.count = await pagehit(req);

    if (req.count) {
      next();
    }
    else {
      res.status(400).send('No referrer');
    }

  }
  catch(err) {
    res.status(503).send('Pagehit service down');
  }

});


// SVG counter response
app.get('/hit.svg', (req, res) => {

  res
    .set('Content-Type', 'image/svg+xml')
    .send(`<svg xmlns="http://www.w3.org/2000/svg" width="${ String( req.count ).length * 0.6 }em" height="1em"><text x="50%" y="75%" font-family="sans-serif" font-size="1em" text-anchor="middle" dominant-baseline="middle">${ req.count }</text></svg>`);

});

// start server
app.listen(cfg.port, () => {
  console.log(`Page hit service listening at http://localhost:${ cfg.port }`);
});
