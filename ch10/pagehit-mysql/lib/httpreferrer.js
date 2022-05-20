/*
httpreferrer
returns a 32-character hash of a URL passed as the referrer in an HTTP request header
*/

import { URL } from 'url';
import { createHash } from 'crypto';

export default function(req) {

  const r = req.headers.referer;
  if (!r) return null;

  const
    url = new URL(r),
    ref = url.protocol + url.host + url.pathname;

  return ref ? createHash('md5').update(ref).digest('hex') : null;

}
