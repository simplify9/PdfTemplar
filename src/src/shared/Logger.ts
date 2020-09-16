/**
 * Setup the winston logger.
 *
 * Documentation: https://github.com/winstonjs/winston
 */

import { createLogger, format, transports } from 'winston';
import ElasticSearch from 'winston-elasticsearch';

// Import Functions
const { File, Console } = transports;

// Init Logger

if (process.env.NODE_ENV === 'production') {

}

/**
 * For production write to all logs with level `info` and below
 * to `combined.log. Write all logs error (and below) to `error.log`.
 * For development, print to the console.
 */
/*
if (process.env.NODE_ENV === 'production') {

    const fileFormat = format.combine(
        format.timestamp(),
        format.json(),
    );
    const errTransport = new File({
        filename: './logs/error.log',
        format: fileFormat,
        level: 'error',
    });
    const infoTransport = new File({
        filename: './logs/combined.log',
        format: fileFormat,
    });
    wintstonLogger.add(errTransport);
    wintstonLogger.add(infoTransport);

} else {
*/

const errorStackFormat = format((info) => {
  if (info.stack) {
    // tslint:disable-next-line:no-console
    console.log(info.stack);
    return false;
  }
  return info;
});
const consoleTransport = new Console({
  format: format.combine(
    format.colorize(),
    format.simple(),
    errorStackFormat(),
  ),
});

const elasticLog = new ElasticSearch({
  level: "info",
  index: `${process.env.ELASTIC_NAME}-${new Date().getFullYear()}.${new Date().getMonth()+1}`,
  format: {
    transform: (inp, opt) => {
      inp.environment = process.env.NODE_ENV;
      return inp;
    }
  },
  clientOpts: {
    node: process.env.ELASTIC_URL,
    name: process.env.ELASTIC_NAME,
    auth: {
      password: process.env.ELASTIC_PASSWORD!,
      username: process.env.ELASTIC_USER!
    }
  }
})

const enrich = (logEntry: any) => {
  const base = {
    environment: process.env.NODE_ENV,
  }
  const enriched = Object.assign(base, logEntry);
  return enriched;
}


const wintstonLogger = createLogger({
  level: 'info',
  format: format(enrich)(),
  transports: [
    consoleTransport,
    elasticLog
  ]
});

// Export logger
export const logger = wintstonLogger;
