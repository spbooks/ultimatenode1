// Express.js
import express from 'express';
import compression from 'compression';

// modules
import { questionCount, gameCreate, gameFetch } from './libshared/quizdb.js';
import { questionsImport } from './lib/questionsimport.js';
import * as libId from './libshared/libid.js';

// configuration
const cfg = {
  dev: ((process.env.NODE_ENV).trim().toLowerCase() !== 'production'),
  port: process.env.NODE_PORT || 8000,
  domain: process.env.QUIZ_WEB_DOMAIN,
  wsDomain: process.env.QUIZ_WS_DOMAIN,
  title: process.env.QUIZ_TITLE,
  questionsMax: parseInt(process.env.QUIZ_QUESTIONS_MAX, 10)
};

// Express initiation
const app = express();

// use EJS templates
app.set('view engine', 'ejs');
app.set('views', 'views');

// body parsing
app.use(express.urlencoded({ extended: true }));

// GZIP
app.use(compression());

// body parsing
app.use(express.urlencoded({ extended: true }));

// home page
app.get('/', async (req, res) => {

  if (typeof req.query.import !== 'undefined') {

    // import new questions and redirect back
    res.redirect(`/?imported=${ await questionsImport() }`);

  }
  else {

    // home page template
    res.render('home', {
      title: cfg.title,
      questions: await questionCount(),
      questionsMax: cfg.questionsMax,
      imported: req.query?.imported || null
    });

  }

});

// create a new game
app.post('/newgame', async (req, res) => {

  const
    gameId = await(gameCreate( req.body )),
    playerName = libId.clean( req.body.name );

  if (gameId === null) {

    // game creation error?
    res.status(500).render('error', {
      title: cfg.title,
      error: 'Game could not be started?'
    });

  }
  else {

    // redirect to game page using slug and user name
    res.redirect(`/game/${ libId.encode( gameId ) }/${ playerName }`);

  }

});


// join an existing game
app.post('/joingame', (req, res) => {

    // redirect to game page using slug and user name
    res.redirect(`/game/${ libId.clean( req.body.slug ).toLowerCase() || 'x' }/${ libId.clean( req.body.name ) }`);

});


// game page
app.get('/game/:slug/:name', async (req, res) => {

  // get game ID and player name
  const
    slug = req.params.slug,
    gameId = libId.decode( slug ),
    game = gameId === null ? null : await gameFetch( gameId ),
    gameValid = game && gameId === game.id,
    playerName = libId.clean( req.params.name ) || 'Player';

  if (gameValid && game.time_started === null) {

    // game open for players
    res.render('game', {
      domain: cfg.domain,
      wsDomain: cfg.wsDomain,
      slug,
      title: cfg.title,
      game,
      playerName
    });

  }
  else {

    // game has been started or is invalid
    const url = `${ cfg.domain }/game/${ slug }`;

    res.status(gameValid ? 403 : 404).render('error', {
      title: cfg.title,
      error: gameValid ? `You were too late to join the game at ${ url }` : `The game at ${ url } is not valid. Did you enter it correctly?`
    });

  }

});


// static assets
app.use(express.static('static'));

// 404 error
app.use((req, res) => {
  res.status(404).render('error', { title: cfg.title, error: 'Not found?' });
});

app.listen(cfg.port, () => {
  console.log(`Server started at ${ cfg.domain }`);
});
