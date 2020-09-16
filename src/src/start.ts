import app from './Server';
import { logger } from './shared/Logger';

// Start the server
const port = Number(process.env.PORT || 80);
app.listen(port, () => {
  logger.info('Express server started on port: ' + port);
});
