import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    // Several suites exercise the real Windows desktop helper, PowerShell children and
    // loopback bridge. The default worker count makes those files contend for the same host
    // desktop/process resources; keep useful file parallelism, but bound the contention.
    maxWorkers: 4,
    // Real filesystem, real child processes and a real HTTP server, so the
    // defaults are too tight.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    env: {
      // Never let a test bind — or worse, fall through to — the shipped bridge range.
      // The developer's own installed app is usually listening on 8765 while the suite
      // runs, and a test that lost the bind race used to talk to it with a test token.
      CLF_BRIDGE_PORTS: '0',
      // In-process evidence arrives in microseconds or never; the production windows only
      // exist for a real browser that is seconds late. Without this the suite spent minutes
      // waiting out fifteen-second timeouts to prove calls stay unattributed.
      CLF_EVIDENCE_MS: '1500'
    }
  }
});
