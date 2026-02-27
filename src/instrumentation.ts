export async function register() {
  // Only run scheduler on the server (not during build or in edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeScheduler } = await import('@/lib/scheduler');
    try {
      await initializeScheduler();
      console.log('Scheduler started successfully');
    } catch (error) {
      console.error('Failed to start scheduler:', error);
    }
  }
}
