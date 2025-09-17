const path = require('path');
require('dotenv').config();

// Initialize Fastify with pretty-printing for logs in development
const fastify = require('fastify')({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        destination: `./logs/fastify_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.log`,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      },
    },
  },
});

// Register the news service plugin
fastify.register(require('./service/news_service'));

// Register the API routes with a prefix
fastify.register(require('./routes/news'), { prefix: '/api/v1/news' });

// Function to start the server
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port: port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();