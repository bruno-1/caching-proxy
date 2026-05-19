import Fastify, { FastifyInstance } from 'fastify';

export type OriginServer = {
  app: FastifyInstance;
  port: number;
};

export async function createOriginServer(): Promise<OriginServer> {
  const app = Fastify();

  app.get('/products', async () => {
    return {
      products: [{ id: 1 }],
    };
  });

  app.get('/plain-text', async (_, reply) => {
    return reply.header('content-type', 'text/plain').send('plain response');
  });

  app.get('/error', async (_, reply) => {
    return reply.status(500).send({
      error: true,
    });
  });

  await app.listen({ port: 0 });

  const address = app.server.address();
  if (!address || typeof address === 'string')
    throw new Error('Failed to resolve origin server address');

  return {
    app,
    port: address.port,
  };
}
