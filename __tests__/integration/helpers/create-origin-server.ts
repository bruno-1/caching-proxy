import Fastify from 'fastify';

export async function createOriginServer() {
  const app = Fastify();

  let requestsCount = 0;

  app.get('/products', async () => {
    requestsCount++;

    return {
      products: [
        {
          id: 1,
          title: 'iPhone 15',
        },
      ],
    };
  });

  app.get('/error', async (_, reply) => {
    requestsCount++;

    reply.status(500);

    return { error: true };
  });

  await app.listen({
    port: 0,
  });

  const address = app.server.address();
  if (!address || typeof address === 'string')
    throw new Error('Failed to resolve origin server address');

  return {
    app,
    originUrl: `http://localhost:${address.port}`,
    getRequestsCount: () => requestsCount,
    resetRequestsCount: () => {
      requestsCount = 0;
    },
  };
}
