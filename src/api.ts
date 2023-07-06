/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
/* eslint-disable import/first */
if (process.env.NODE_ENV === 'local') {
  require('dotenv').config({ path: './.env.local' });
} else {
  require('dotenv').config({ path: './.env' });
}

import 'reflect-metadata';

import cors from 'cors';
import express, { json } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';

import { errorMiddleware } from './middlewares';
import accountRouter from './modules/account/routes';
import calculatorRouter from './modules/calculator/routes';
import generalRouter from './modules/general/routes';
import randomStringRouter from './modules/random-string/routes';
import recordRouter from './modules/records/routes';
import reportRouter from './modules/report/routes';
import walletRouter from './modules/wallet/routes';
import { logger } from './utils';

const api = express();
const bodyParser = require('body-parser');

api.use(json({ limit: '50mb' }));
api.use(cors());

api.use(bodyParser.urlencoded({ extended: true }));

/** Request Log */
api.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${res.statusCode}`);
  next();
});

const router = express.Router();

const cspDefaults = helmet.contentSecurityPolicy.getDefaultDirectives();
delete cspDefaults['upgrade-insecure-requests'];
api.use(
  helmet({
    contentSecurityPolicy: { directives: cspDefaults },
  })
);

/** Add swagger */
const swaggerDocument = yaml.load(`${__dirname}/../docs/swagger.yaml`);
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/** Routes config */
router.use('/', generalRouter);
router.use('/account', accountRouter);
router.use('/calculator', calculatorRouter);
router.use('/wallet', walletRouter);
router.use('/record', recordRouter);
router.use('/random-string', randomStringRouter);
router.use('/report', reportRouter);

api.use('/', router);
api.use('/v1', router);

/** Not found error handler */
api.use((_, res, _2) => res.status(404).json({ error: 'NOT FOUND' }));

/**
 * Middleware Error
 */
api.use(errorMiddleware);

/** Starts API */
const PORT = process.env.PORT || 4000;
const server = api.listen(PORT, async () => {
  logger.info(`Listening on port ${PORT}`);
});

/** Gracefull shutdown */
const gracefulShutdown = () => {
  logger.warn('Received shutdown signal, closing server...');

  server.close((err) => {
    if (err) {
      logger.error('Error occurred while closing the server:', err);
      process.exit(1);
    }

    logger.info('Server closed, exiting process...');
    process.exit(0);
  });
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
