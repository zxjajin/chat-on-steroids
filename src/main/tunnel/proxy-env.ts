import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { CommandEnvironment } from '../exec.js';

const PROXY_KEYS = new Set(['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY']);

function envFilename(): string {
  // In an installed Electron app process.execPath is the executable in the installation
  // directory. Development keeps the file beside the repository's package.json instead.
  const defaultApp = (process as NodeJS.Process & { defaultApp?: boolean }).defaultApp === true;
  return path.join(defaultApp ? process.cwd() : path.dirname(process.execPath), '.env');
}

function parseValue(raw: string): string {
  const value = raw.trim();
  if (value.length >= 2 && value[0] === value[value.length - 1] && (value[0] === '"' || value[0] === "'")) {
    return value.slice(1, -1);
  }
  return value.replace(/\s+#.*$/, '').trim();
}

/**
 * Read only the proxy part of the app-local environment.
 *
 * The file can contain credentials and provider settings. Tunnel startup therefore never
 * imports it wholesale: only standard proxy variables are selected, and the result is handed
 * to the tunnel child rather than to the renderer, shell tools or the app process itself.
 */
export async function readTunnelProxyEnvironment(): Promise<CommandEnvironment> {
  const filename = envFilename();
  let source: string;
  try {
    source = await readFile(filename, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    return {};
  }

  const result: CommandEnvironment = {};
  for (const rawLine of source.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/.exec(line);
    if (!match) continue;
    const key = match[1].toUpperCase();
    if (!PROXY_KEYS.has(key)) continue;
    result[key] = parseValue(match[2]);
  }
  return result;
}
