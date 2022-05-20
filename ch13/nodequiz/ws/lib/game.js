// game handling objects

// modules
import * as db from '../libshared/quizdb.js';
import { Player } from './player.js';


// active games
const
  gameActive = new Map(),
  timerDefault = 5000;


// create and manage active game objects
export async function GameFactory( gameId ) {

  // game instance not exists?
  if ( !gameActive.has( gameId ) ) {

    // create new game instance
    const game = new Game();
    if ( await game.create( gameId ) ) {
      gameActive.set( gameId, game );
    }

    console.log(`Game ${ gameId } added - active games on this server: ${ gameActive.size }`);

  }

  return gameActive.get( gameId ) || null;

}


// remove active game
async function gameComplete( gameId ) {

  if ( !gameActive.has( gameId ) ) return;

  await db.gameRemove( gameId );
  gameActive.delete( gameId );

  console.log(`Game ${ gameId } removed - active games on this server: ${ gameActive.size }`);

}


// individual game class
class Game {

  gameId = null;
  player = new Map();
  cfg = null;
  #state = {
    current: 'join',
    question: 0
  };
  #handlerFunction = async e => await this.#eventHandler(e);

  // initialize game
  async create( gameId ) {

    // load game configuration
    this.gameId = gameId;
    this.cfg = await db.gameFetch( this.gameId );

    if (!this.cfg) return null;

    // fetch players attached to other servers
    (await db.playersFetch( this.gameId ))
      .forEach( p => this.playerAdd( new Player(p) ));

    // monitor incoming events
    db.pubsub.on(`event:${ this.gameId }`, this.#handlerFunction);

    return this.gameId;

  }


  // send message to all connected clients
  #clientSend(type, data) {
    this.player.forEach(p => p.send(type, data))
  }


  // incoming client event
  async clientMessage({ type, data }) {

    console.log('Data from client', type, data);

    // handle client event (on single server)
    switch (type) {

      case 'start':
        // fetch first question
        this.#state.current = type;

        // no question found?
        if (!await this.#questionNext( timerDefault )) {
          await db.broadcast( this.gameId, 'gameover' );
        };
        break;

      case 'questionanswered':
        // player answers question
        if (this.#state.current !== 'questionactive') return;

        // calculate player score
        const correct = this.#state.activeQuestion.answer[ data.answer ].correct;
        data = {
          playerId: data.playerId,
          score: correct ? this.cfg.score_correct : this.cfg.score_incorrect,
          fastest: correct && !this.#state.correctGiven
        };

        // fastest correct bonus?
        if (data.fastest) data.score += this.cfg.score_fastest;

        // first answer controls flow
        if (!this.#state.playersAnswered) {

          let timeout = 100;

          // first response?
          if (!this.#state.playersAnswered && this.player.size > 1) {

            // send question timeout warning
            timeout =this.cfg.timeout_answered * 1000;
            await db.broadcast( this.gameId, 'questiontimeout', { timeout });

          }

          // complete question
          if (timeout) {

            this.#setTimer(async () => {

              // broadcast correct answer
              await db.broadcast( this.gameId, 'questioncomplete', {
                correct: this.#state.activeQuestion.answer.findIndex(a => a.correct)
              });

              // show scoreboard
              this.#setTimer(async () => {
                await db.broadcast( this.gameId, 'scoreboard' );

                // next question or game over?
                if (!(await this.#questionNext( timerDefault ))) {
                  await db.broadcast( this.gameId, 'gameover' );
                };

              });

            }, timeout);

          }

        }
        break;

    }

    // broadcast message to all servers
    if (type) await db.broadcast( this.gameId, type, data );

  }


  // incoming event sent to all game servers
  async #eventHandler({ gameId, type, data }) {

    console.log('Shared server event', type, data);

    if (gameId !== this.gameId || !type) return;

    // handle server event (on all servers)
    switch (type) {

      // add player
      case 'playerAdd':
        if (!this.player.has(data.id)) {
          this.playerAdd( new Player( data ), false );
        }
        break;

      // remove player
      case 'playerRemove':
        if (this.player.has(data.id)) {
          this.player.delete( data.id );
        }
        break;

      // start game
      case 'start':
        await db.gameStart( this.gameId );
        this.#state.current = type;
        break;

      // show question
      case 'questionactive':
        this.#state.current = type;
        this.#state.question = data.num;
        this.#state.playersAnswered = 0;
        this.#state.correctGiven = false;
        this.#state.activeQuestion = { ...data };
        data.answer = data.answer.map(a => a.text); // remove correct flag
        const noAnswer = this.cfg.score_noanswer;
        this.player.forEach(p => p.scoreQuestion = noAnswer);
        break;

      // player answers question
      case 'questionanswered':
        if (this.#state.current !== 'questionactive') return;

        const p = this.player.get( data.playerId );
        if (p) {
          p.scoreQuestion = data.score;
          this.#state.correctGiven = data.fastest;
          this.#state.playersAnswered++;
        }

        type = null; // do not broadcast
        break;

      // question is complete - show answer
      case 'questioncomplete':
        if (this.#state.current !== 'questionactive') return;
        this.#state.current = type;
        break;

      // show scoreboard
      case 'scoreboard':
        if (this.#state.current !== 'questioncomplete') return;
        this.#state.current = type;
        this.player.forEach(p => p.scoreTotal += p.scoreQuestion); // calculate scores
        data = this.playerAll();
        break;

      // game over
      case 'gameover':
        this.#state.current = type;
        data = {};
        break;

    }

    // send to all clients
    if (type) this.#clientSend( type, data );

    // clean up completed game
    if (this.#state.current === 'gameover') {

      db.pubsub.off(`event:${ this.gameId }`, this.#handlerFunction);
      await gameComplete( this.gameId );

    }

  }


  // timer event
  #setTimer(callback, delay = timerDefault) {

    if (this.#state.timer) {
      this.#state.timer = clearTimeout( this.#state.timer );
    }

    const fn = callback.bind(this);

    this.#state.timer = setTimeout(async () => {
      await fn();
    }, delay);

  }


  // fetch and broadcast next question
  async #questionNext( delay ) {

    // can ask next question?
    if (this.#state.question >= this.cfg.questions_asked) return;

    // fetch next question and answer set
    const qSet = await db.questionFetch( this.#state.question + this.cfg.question_offset );
    if (!qSet) return;

    qSet.num = this.#state.question + 1;

    this.#setTimer(async () => {
      await db.broadcast( this.gameId, 'questionactive', qSet );
    }, delay || 1);

    return qSet.num;

  }


  // return array of Player { id, name } objects
  playerAll() {
    return Array.from( this.player, ([i, p]) => { return { id: p.id, name: p.name, score: p.scoreTotal } } );
  }


  // add player to game
  async playerAdd( player, broadcast = true ) {

    // add player to this server
    this.player.set( player.id, player );

    // broadcast event
    if (broadcast) {

      await db.broadcast(
        this.gameId,
        'playerAdd',
        { id: player.id, game_id: this.gameId, name: player.name }
      );

    }

  }


  // remove player from game
  async playerRemove( player ) {

    // delete from database
    await db.playerRemove( player.id );

    // broadcast event
    await db.broadcast(
      this.gameId,
      'playerRemove',
      { id: player.id }
    );

  }

}
