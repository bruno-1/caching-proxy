import { GenericContainer, StartedTestContainer } from 'testcontainers';

export async function startRedisContainer(): Promise<{
  container: StartedTestContainer;
  redisUrl: string;
}> {
  const container = await new GenericContainer('redis:8.6.3-alpine')
    .withExposedPorts(6379)
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(6379);

  return { container, redisUrl: `redis://${host}:${port}` };
}
