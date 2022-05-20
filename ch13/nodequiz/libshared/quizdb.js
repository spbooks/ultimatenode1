// PostgreSQL database methods
import EventEmitter from 'events';
import pg from 'pg';

// data type parsers
pg.types.setTypeParser(pg.types.builtins.INT2, v => parseInt(v, 10));
pg.types.setTypeParser(pg.types.builtins.INT4, v => parseInt(v, 10));
pg.types.setTypeParser(pg.types.builtins.INT8, v => parseFloat(v));

const pool = new pg.Pool({
  host: process.env.POSTGRES_SERVER,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_QUIZUSER,
  password: process.env.POSTGRES_QUIZPASS
});


// count questions in database
export async function questionCount() {

  const res = await dbSelect('SELECT COUNT(1) FROM question;');
  return res?.[0]?.count;

}


// add a new question and answer set
export async function questionAdd(question, answer) {

  const client = await pool.connect();
  let commit = false;

  try {

    // new transaction
    await client.query('BEGIN');

    // add question
    const qId = await dbInsert({
      client,
      table: 'question',
      values: {
        text: question
      },
      return: 'id'
    })

    if (qId) {

      // insert answers in sequence
      let inserted = 0;
      for (let item of answer) {

        const a = await dbInsert({
          client,
          table: 'answer',
          values: {
            question_id: qId,
            text: item.text,
            correct: item.correct
          }
        });

        if (a) inserted++;

      }

      // answers added?
      commit = inserted === answer.length;

    }

  }
  catch(err) {
  }
  finally {

    // commit or rollback transaction
    if (commit) {
      await client.query('COMMIT');
    }
    else {
      await client.query('ROLLBACK');
    }

    client.release();
  }

  return commit;

}


// create a new game
export async function gameCreate(data) {

  const qCount = await questionCount();

  return await dbInsert({
    table: 'game',
    values: {
      question_offset : Math.floor( Math.random() * qCount ), // random starting question
      questions_asked : clamp(1, data.questions_asked, 50),
      timeout_answered: clamp(5, data.timeout_answered, 60),
      score_correct   : clamp(-100, data.score_correct, 100),
      score_fastest   : clamp(-100, data.score_fastest, 100),
      score_incorrect : clamp(-100, data.score_incorrect, 100),
      score_noanswer  : clamp(-100, data.score_noanswer, 100)
    },
    return: 'id'
  });

}


// start game
export async function gameStart( gameId ) {

  return await dbUpdate({
    table: 'game',
    values: { time_started: 'NOW()' },
    where: { id: gameId }
  });

}


// remove a game
export async function gameRemove( gameId ) {

  return await dbDelete({
    table: 'game',
    values: { id: gameId }
  });

}


// fetch game data
export async function gameFetch( gameId ) {

  const game = await dbSelect('SELECT * FROM game WHERE id=$1;', [ gameId ]);
  return game?.[0];

}


// create a new player
export async function playerCreate( game_id, name ) {

  return await dbInsert({
    table: 'player',
    values: { game_id, name },
    return: 'id'
  });

}


// remove a player
export async function playerRemove( playerId ) {

  return await dbDelete({
    table: 'player',
    values: { id: playerId }
  });

}


// fetch data for all players
export async function playersFetch( gameId ) {

  return await dbSelect('SELECT * FROM player WHERE game_id=$1;', [ gameId ]);

}


// fetch next question and answer set
export async function questionFetch( qNum ) {

  // fetch question
  const
    qCount = await questionCount(),
    question = await dbSelect('SELECT * FROM question ORDER BY id LIMIT 1 OFFSET $1', [ qNum % qCount ]);

  if (question.length !== 1) return null;

  // fetch answers
  const answer = await dbSelect('SELECT * FROM answer WHERE question_id=$1 ORDER BY id;', [ question[0].id ]);

  if (!answer.length) return null;

  return {
    text: question[0].text,
    answer: answer.map( a => { return { text: a.text, correct: a.correct }})
  };

}


// database SELECT
// pass SQL string and array of parameters
async function dbSelect(sql, arg = []) {

  const client = await pool.connect();

  try {
    const result = await client.query(sql, arg);
    return result && result.rows;
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.release();
  }

}


// database INSERT
// pass object: { table: <tablename>, values: <{ n1: v1,... }>, return: <field> }
async function dbInsert(ins) {

  const
    ret = ins.return ? ` RETURNING ${ ins.return }` : '',
    key = Object.keys( ins.values ),
    sym = key.map( (v,i) => `$${i + 1}` ),
    sql = `INSERT INTO ${ ins.table } (${ key.join() }) VALUES(${ sym.join() })${ ret };`,
    client = ins.client || await pool.connect();

  let success = false;

  try {

    // run insert
    const i = await client.query(sql, Object.values( ins.values ));

    // successful?
    success = i.rowCount === 1;

    // return value?
    if (success && ins.return) {
      success = i.rows[0][ ins.return ];
    }

  }
  catch(err) {
  }
  finally {
    if (!ins.client) client.release();
  }

  return success;

}


// database UPDATE
// pass object: { table: <tablename>, values: <{ n1: v1,... }>, where: <{ n1: v1,... }> }
async function dbUpdate(upd) {

  const
    sym = [...Object.values( upd.values ), ...Object.values( upd.where )],
    vkey = Object.keys( upd.values ),
    val = vkey.map( (k, i) => `${ k }=$${ i + 1 }` ),
    ckey = Object.keys( upd.where ),
    cond = ckey.map( (k, i) => `${ k }=$${ i + val.length + 1 }` ),
    sql = `UPDATE ${ upd.table } SET ${ val.join() } WHERE ${ cond.join() };`,
    client = upd.client || await pool.connect();

  let updated = 0;

  try {

    // run update
    const u = await client.query(sql, sym);

    // successful?
    updated = u.rowCount;

  }
  catch(err) {
  }
  finally {
    if (!upd.client) client.release();
  }

  return updated;

}


// database delete
// pass object: { table: <tablename>, where: <{ n1: v1,... }> }
// logical AND is used for all where name/value pairs
async function dbDelete(del) {

  const
    key = Object.keys( del.values ).map((v, i) => `${ v }=$${ i+1 }`),
    sql = `DELETE FROM ${ del.table } WHERE ${ key.join(' AND ') };`,
    client = del.client || await pool.connect();

  let deleted = false;

  try {

    // run delete
    const d = await client.query(sql, Object.values( del.values ));
    deleted = d.rowCount;

  }
  catch(err) {
  }
  finally {
    if (!del.client) client.release();
  }

  return deleted;

}


// pubsub event emitter
class PubSub extends EventEmitter {

  constructor(delay) {
    super();
  }

  async listen() {

    if (this.listening) return;
    this.listening = true;

    const client = await pool.connect();

    client.on('notification', event => {

      try {
        const payload = JSON.parse( event.payload );
        if ( payload ) {

          this.emit(
            `event:${ payload.game_id }`,
            {
              gameId: payload.game_id,
              type: payload.type,
              data: payload.data
            }
          );

        }
      }
      catch (e) {
      }

    });

    client.query('LISTEN pubsub_insert;');

  }

}

export const pubsub = new PubSub();
await pubsub.listen();


// broadcast an event
export async function broadcast( game_id, type, data ) {

  return await dbInsert({
    table: 'pubsub',
    values: { game_id, type, data },
    return: 'id'
  });

}


// return integer between low and high values
function clamp(min = 0, value = 0, max = 0) {

  return Math.max(min, Math.min(parseInt(value || '0', 10) || 0, max));

}
