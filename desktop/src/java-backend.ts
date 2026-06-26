import { ChildProcess, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { app } from 'electron';
import treekill = require('tree-kill');

let backendProcess: ChildProcess | null = null;

function getJrePath(): string {
  const resourcesPath = process.resourcesPath || path.join(__dirname, '..');
  const javaExe = process.platform === 'win32' ? 'java.exe' : 'java';
  return path.join(resourcesPath, 'jre', 'bin', javaExe);
}

function getJarPath(): string {
  const resourcesPath = process.resourcesPath || path.join(__dirname, '..');
  return path.join(resourcesPath, 'backend', 'waterstation.jar');
}

function getDataDir(): string {
  const userData = app.getPath('userData');
  // On Windows, avoid issues with Chinese characters in AppData path
  // by using a simpler path if possible
  if (process.platform === 'win32') {
    const homeDrive = process.env['HOMEDRIVE'] || 'C:';
    const simpleDir = path.join(homeDrive, 'WaterStation', 'data');
    return simpleDir;
  }
  return path.join(userData, 'data');
}

export function startBackend(port: number): void {
  if (backendProcess) return;

  const jrePath = getJrePath();
  const jarPath = getJarPath();
  const dataDir = getDataDir();

  // Ensure data directory exists before spawn
  fs.mkdirSync(dataDir, { recursive: true });

  // Ensure JRE binary has execute permission (macOS strips +x from extraResources)
  if (process.platform !== 'win32') {
    try {
      fs.chmodSync(jrePath, 0o755);
      const jreDir = path.dirname(jrePath);
      const entries = fs.readdirSync(jreDir);
      for (const entry of entries) {
        const fullPath = path.join(jreDir, entry);
        try { fs.chmodSync(fullPath, 0o755); } catch { /* skip non-files */ }
      }
    } catch (err) {
      console.error('[Backend] Failed to set JRE permissions:', err);
    }
  }

  // Verify JRE and JAR exist
  if (!fs.existsSync(jrePath)) {
    console.error(`[Backend] JRE not found: ${jrePath}`);
    throw new Error(`JRE not found at: ${jrePath}`);
  }
  if (!fs.existsSync(jarPath)) {
    console.error(`[Backend] JAR not found: ${jarPath}`);
    throw new Error(`Backend JAR not found at: ${jarPath}`);
  }

  // H2 JDBC URL requires forward slashes on all platforms
  const dbFilePath = path.join(dataDir, 'waterstation').replace(/\\/g, '/');
  const dbUrl = `jdbc:h2:file:${dbFilePath};MODE=MySQL;DB_CLOSE_DELAY=-1`;

  const args = [
    '-jar', jarPath,
    `--server.port=${port}`,
    `--spring.datasource.url=${dbUrl}`,
    `--app.data-dir=${dataDir.replace(/\\/g, '/')}`,
    '--spring.h2.console.enabled=false',
  ];

  console.log(`[Backend] Starting: ${jrePath}`);
  console.log(`[Backend] JAR: ${jarPath}`);
  console.log(`[Backend] Data dir: ${dataDir}`);
  console.log(`[Backend] DB URL: ${dbUrl}`);

  backendProcess = spawn(jrePath, args, {
    cwd: dataDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, JAVA_TOOL_OPTIONS: '', JAVA_HOME: '' },
    windowsHide: true,
  });

  backendProcess.stdout?.on('data', (data: Buffer) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  backendProcess.stderr?.on('data', (data: Buffer) => {
    console.error(`[Backend:ERR] ${data.toString().trim()}`);
  });

  backendProcess.on('error', (err) => {
    console.error(`[Backend] Failed to start process:`, err.message);
    backendProcess = null;
  });

  backendProcess.on('exit', (code) => {
    console.log(`[Backend] Process exited with code ${code}`);
    backendProcess = null;
  });
}

export function stopBackend(): Promise<void> {
  return new Promise((resolve) => {
    if (!backendProcess || !backendProcess.pid) {
      resolve();
      return;
    }

    console.log('[Backend] Stopping...');
    const pid = backendProcess.pid;

    const timeout = setTimeout(() => {
      console.log('[Backend] Force killing after timeout...');
      treekill(pid, 'SIGKILL');
      backendProcess = null;
      resolve();
    }, 5000);

    backendProcess.on('exit', () => {
      clearTimeout(timeout);
      backendProcess = null;
      resolve();
    });

    // On Windows, SIGTERM is not supported; use tree-kill which handles it
    treekill(pid, process.platform === 'win32' ? 'SIGKILL' : 'SIGTERM');
  });
}

export function waitForBackend(port: number, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = (): void => {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Backend did not start within ${timeoutMs / 1000}s`));
        return;
      }

      const req = http.get(`http://127.0.0.1:${port}/api/v1/products?page=1&size=1`, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          setTimeout(check, 500);
        }
      });

      req.on('error', () => {
        setTimeout(check, 500);
      });

      req.setTimeout(2000, () => {
        req.destroy();
        setTimeout(check, 500);
      });
    };

    setTimeout(check, 1000);
  });
}
