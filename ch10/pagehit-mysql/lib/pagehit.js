/*
page hit object
default function increments page counter and return total hits
*/
import dotenv from 'dotenv';
import mysqlPromise from 'mysql2/promise';
import httpReferrer from './httpreferrer.js';

// load .env configuration
dotenv.config();

// connect to MySQL
const db = await mysqlPromise.createPool({
  host:     process.env.MYSQL_HOST,
  port:     process.env.MYSQL_PORT,
  database: process.env.MYSQL_DATABASE,
  user:     process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


export default async function(req) {

  // hash of referring URL
  const hash = httpReferrer(req);

  // no referrer?
  if (!hash) return null;

  // fetch browser IP address and user agent
  const
    ipRe  = req.ip.match(/(?:\d{1,3}\.){3}\d{1,3}/),
    ip    = ipRe?.[0] || null,
    ua    = req.get('User-Agent') || null;

  try {

    // store page hit
    await db.execute(
      'INSERT INTO `hit` (hash, ip, ua) VALUES (UNHEX(?), INET_ATON(?), ?);',
      [ hash, ip, ua ]
    );

    // fetch page hit count
    const [res] = await db.query(
      'SELECT COUNT(1) AS `count` FROM `hit` WHERE hash = UNHEX(?);',
      [ hash ]
    );

    return res?.[0]?.count;

  }
  catch (err) {
    console.log(err);
    throw new Error('DB error', { cause: err });
  }

}
