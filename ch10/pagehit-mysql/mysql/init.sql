-- MySQL database initialization
USE pagehitmysql;

CREATE TABLE IF NOT EXISTS hit (
  id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'record ID',
  hash binary(16) NOT NULL COMMENT 'URL hash',
  ip int(4) unsigned DEFAULT NULL COMMENT 'client IP address',
  ua varchar(200) DEFAULT NULL COMMENT 'client useragent string',
  time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'hit time',
  PRIMARY KEY (id),
  KEY hash_time (hash, time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='page hits';
