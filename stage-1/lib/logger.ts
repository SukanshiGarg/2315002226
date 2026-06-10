
type LogStack = 'frontend';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

type LogPackage =
  | 'api'
  | 'component'
  | 'hook'
  | 'page'
  | 'state'
  | 'style'
  | 'auth'
  | 'config'
  | 'middleware'
  | 'utils';

interface LogPayload {
  stack: LogStack;
  level: LogLevel;
  package: LogPackage;
  message: string;
  timestamp: string;
}

const VALID_STACKS: LogStack[] = ['frontend'];
const VALID_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
const VALID_PACKAGES: LogPackage[] = [
  'api',
  'component',
  'hook',
  'page',
  'state',
  'style',
  'auth',
  'config',
  'middleware',
  'utils',
];

/**
 * Main logging function.
 * Sends logs to the internal /api/log proxy (never directly to external service).
 * Non-blocking — errors are silently suppressed.
 */
export function Log(
  stack: LogStack,
  level: LogLevel,
  packageName: LogPackage,
  message: string
): void {
  try {
    // Validate inputs
    if (!VALID_STACKS.includes(stack)) {
      console.warn(`[Logger] Invalid stack: "${stack}"`);
      return;
    }
    if (!VALID_LEVELS.includes(level)) {
      console.warn(`[Logger] Invalid level: "${level}"`);
      return;
    }
    if (!VALID_PACKAGES.includes(packageName)) {
      console.warn(`[Logger] Invalid package: "${packageName}"`);
      return;
    }

    const payload: LogPayload = {
      stack,
      level,
      package: packageName,
      message,
      timestamp: new Date().toISOString(),
    };

    // Fire-and-forget: send to internal API proxy, never await
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silently suppress — logging must never break the UI
    });
  } catch {
    // Outer safety net — catch any synchronous errors
  }
}

export type { LogStack, LogLevel, LogPackage, LogPayload };
