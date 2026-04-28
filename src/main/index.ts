async function bootstrap(): Promise<void> {
  try {
    console.log('starting application...');

    // Composition root: wiring HTTP server and dependencies
    // TODO: initialize HTTP server

    console.log('started successfully');
  } catch (error) {
    console.error('fatal error:', error);
    process.exit(1);
  }
}

void bootstrap();
