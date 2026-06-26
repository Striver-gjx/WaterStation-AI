import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { startBackend, stopBackend, waitForBackend } from './java-backend';

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

const BACKEND_PORT = 18080;

function createSplashWindow(): BrowserWindow {
  const splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  splash.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          color: white;
        }
        .container {
          text-align: center;
          padding: 40px;
        }
        .title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .subtitle {
          font-size: 13px;
          opacity: 0.85;
          margin-bottom: 30px;
        }
        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .status {
          margin-top: 16px;
          font-size: 12px;
          opacity: 0.7;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="title">水站管理系统</div>
        <div class="subtitle">WaterStation AI Management</div>
        <div class="spinner"></div>
        <div class="status">正在启动服务...</div>
      </div>
    </body>
    </html>
  `)}`);

  return splash;
}

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    title: '水站管理系统',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const frontendPath = path.join(__dirname, '..', 'frontend', 'index.html');

  win.loadFile(frontendPath);

  win.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    win.show();
  });

  win.on('closed', () => {
    mainWindow = null;
  });

  return win;
}

async function bootstrap(): Promise<void> {
  splashWindow = createSplashWindow();

  try {
    startBackend(BACKEND_PORT);
    await waitForBackend(BACKEND_PORT, 30000);
    mainWindow = createMainWindow();
  } catch (err) {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    const errMsg = err instanceof Error ? err.message : String(err);
    const resourcesPath = process.resourcesPath || 'unknown';
    dialog.showErrorBox(
      '启动失败',
      `后端服务启动失败。\n\n错误信息: ${errMsg}\n\nResources路径: ${resourcesPath}\n\n请检查:\n1. JRE 是否完整包含在安装包中\n2. 后端 JAR 文件是否存在\n3. 系统是否允许应用执行`
    );
    app.quit();
  }
}

app.whenReady().then(bootstrap);

// IPC: Data export — save JSON to user-chosen location
ipcMain.handle('data:export', async (_event, jsonStr: string, defaultName: string) => {
  const result = await dialog.showSaveDialog({
    title: '导出数据',
    defaultPath: path.join(app.getPath('documents'), defaultName),
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  });
  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, jsonStr, 'utf-8');
    return { success: true, path: result.filePath };
  }
  return { success: false };
});

// IPC: Data import — open file dialog and read JSON
ipcMain.handle('data:import', async () => {
  const result = await dialog.showOpenDialog({
    title: '导入数据',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const content = fs.readFileSync(result.filePaths[0], 'utf-8');
    return { success: true, content, path: result.filePaths[0] };
  }
  return { success: false };
});

// IPC: Get data directory path
ipcMain.handle('data:directory', () => {
  const dataDir = path.join(app.getPath('userData'), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
});

// IPC: Open data directory in file explorer
ipcMain.handle('data:open-directory', () => {
  const dataDir = path.join(app.getPath('userData'), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  shell.openPath(dataDir);
  return dataDir;
});

let isQuitting = false;

app.on('window-all-closed', async () => {
  if (!isQuitting) {
    isQuitting = true;
    await stopBackend();
    app.quit();
  }
});

app.on('before-quit', async (e) => {
  if (!isQuitting) {
    isQuitting = true;
    e.preventDefault();
    await stopBackend();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    bootstrap();
  }
});
