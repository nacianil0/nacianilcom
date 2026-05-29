import Fastify from 'fastify';
import path from 'path';
import fastifyStatic from '@fastify/static';

const HOST = '127.0.0.1';
const PORT = 3001;

const server = Fastify({ logger: true });

server.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'dist', 'client'),
  prefix: '/',
});

server.get('/api/health', async () => ({ status: 'ok' }));

server.listen({ host: HOST, port: PORT }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
