// game player

// modules
import * as db from '../libshared/quizdb.js';
import { GameFactory } from './game.js';


// individual player class
export class Player {

  id = null;
  name = null;
  gameId = null;
  game = null;
  scoreQuestion = 0;
  scoreTotal = 0;
  #socket = null;


  // define player
  constructor( data ) {

    if (!data) return;

    // create player from database data
    this.id = data.id || null;
    this.gameId = data.game_id || null;
    this.name = data.name || null;

  }


  // initialize new player
  async create( gameId, playerName, socket ) {

    // player properties
    this.name = playerName;
    this.#socket = socket;

    // initialize game
    this.gameId = gameId;
    this.game = await GameFactory( gameId );
    if ( !this.game ) return null;

    // send set existing players to new player
    this.send('player', this.game.playerAll())

    // create this player
    this.id = await db.playerCreate( this.gameId, playerName );
    if ( !this.id ) return null;

    // add player to game
    this.game.playerAdd( this );

    return this.id;

  }


  // send message to player
  send( type = 'ws', data = {} ) {

    if (this.#socket) {
      this.#socket.send( `${ type }:${ JSON.stringify(data) }` );
    }

  }

}
