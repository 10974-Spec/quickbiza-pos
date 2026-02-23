'use strict';

const { app, BrowserWindow, ipcMain, shell } = require('electron');

// ─── Linux AppArmor / Sandbox Fix ─────────────────────────────────────────────
// Modern Linux kernels restrict unprivileged user namespaces, breaking Electron
// AppImages. Disabling the sandbox is required to run the AppImage on Ubuntu 24.04+.
if (process.platform === 'linux') {
    app.commandLine.appendSwitch('no-sandbox');
    app.commandLine.appendSwitch('disable-setuid-sandbox');
}

const path = require('path');
const { spawn, exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

// ─── Logging setup ────────────────────────────────────────────────────────────
// Write backend logs to a persistent file so we can diagnose production failures
const LOG_DIR = app.getPath('userData');
const LOG_FILE = path.join(LOG_DIR, 'quickbiza-backend.log');

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    try { fs.appendFileSync(LOG_FILE, line); } catch (_) { }
    if (isDev) console.log(msg);
}

function logErr(msg) {
    const line = `[${new Date().toISOString()}] ERROR: ${msg}\n`;
    try { fs.appendFileSync(LOG_FILE, line); } catch (_) { }
    if (isDev) console.error(msg);
}

// ─── Constants ────────────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const BACKEND_PORT = 5000;
const FRONTEND_PORT = 8080;
const MAX_BACKEND_WAIT_MS = 30000; // 30 seconds
const BACKEND_POLL_INTERVAL_MS = 500;

let mainWindow;
let backendProcess;

// ─── Configure auto-updater ───────────────────────────────────────────────────
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

// ─── Kill any leftover process on the backend port ────────────────────────────
function killProcessOnPort(port) {
    return new Promise((resolve) => {
        const command = process.platform === 'win32'
            ? `for /f "tokens=5" %a in ('netstat -aon ^| find ":${port}" ^| find "LISTENING"') do taskkill /f /pid %a`
            : `lsof -i :${port} -t | xargs kill -9 2>/dev/null || true`;
        exec(command, () => setTimeout(resolve, 500));
    });
}

// ─── Poll the health endpoint until the backend is ready ─────────────────────
function waitForBackend() {
    return new Promise((resolve, reject) => {
        const deadline = Date.now() + MAX_BACKEND_WAIT_MS;
        const check = () => {
            if (Date.now() > deadline) {
                return reject(new Error(`Backend did not start within ${MAX_BACKEND_WAIT_MS / 1000}s`));
            }
            const req = http.get({ hostname: '127.0.0.1', port: BACKEND_PORT, path: '/health', timeout: 1000 }, (res) => {
                if (res.statusCode === 200) {
                    log('✅ Backend is ready');
                    resolve();
                } else {
                    setTimeout(check, BACKEND_POLL_INTERVAL_MS);
                }
            });
            req.on('error', () => setTimeout(check, BACKEND_POLL_INTERVAL_MS));
            req.on('timeout', () => { req.destroy(); setTimeout(check, BACKEND_POLL_INTERVAL_MS); });
        };
        check();
    });
}

// ─── Start the bundled backend ─────────────────────────────────────────────────
async function startBackend() {
    if (isDev) {
        log('Dev mode: skipping backend spawn');
        return;
    }

    await killProcessOnPort(BACKEND_PORT);

    const backendDir = app.isPackaged
        ? path.join(process.resourcesPath, 'backend')
        : path.join(__dirname, '../backend');
    // Use the CommonJS loader which bridges CJS → ESM via dynamic import().
    // This works with process.execPath + ELECTRON_RUN_AS_NODE on any machine
    // without needing a separate system Node.js installation.
    const loaderEntry = path.join(backendDir, 'loader.cjs');

    log(`Starting backend via loader: ${loaderEntry}`);

    if (!fs.existsSync(loaderEntry)) {
        logErr(`Backend loader NOT FOUND at: ${loaderEntry}`);
        return;
    }

    backendProcess = spawn(process.execPath, [loaderEntry], {
        env: {
            ...process.env,
            ELECTRON_RUN_AS_NODE: '1',
            NODE_ENV: 'production',
            USER_DATA_PATH: app.getPath('userData'),
            PORT: String(BACKEND_PORT),
            HOST: '127.0.0.1',
        },
        cwd: backendDir,
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    if (!backendProcess.pid) {
        logErr('Failed to spawn backend process (no PID)');
        return;
    }
    log(`Backend PID: ${backendProcess.pid}`);

    backendProcess.stdout.on('data', (d) => log(`[backend] ${d.toString().trim()}`));
    backendProcess.stderr.on('data', (d) => logErr(`[backend] ${d.toString().trim()}`));
    backendProcess.on('exit', (code) => log(`Backend exited with code ${code}`));
    backendProcess.on('error', (err) => logErr(`Backend spawn error: ${err.message}`));
}

// ─── Create main window ────────────────────────────────────────────────────────
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: 'QuickBiza POS',
        show: false,
        backgroundColor: '#f0ede8',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, '../frontend/public/favicon.ico'),
    });

    mainWindow.once('ready-to-show', () => mainWindow.show());

    if (isDev) {
        mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
    }

    // Open external links in browser, not in Electron
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── Show a loading overlay while backend warms up ────────────────────────────
function createLoadingWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        webPreferences: { nodeIntegration: false, contextIsolation: true },
    });

    // Load the icon as base64 so it works in data: URLs (no file:// needed)
    let iconBase64 = '';
    try {
        const iconPath = app.isPackaged
            ? path.join(process.resourcesPath, 'frontend', 'public', 'Appicon.png')
            : path.join(__dirname, '../frontend/public/Appicon.png');
        if (fs.existsSync(iconPath)) {
            iconBase64 = `data:image/png;base64,${fs.readFileSync(iconPath).toString('base64')}`;
        }
    } catch (_) { }

    const iconHTML = iconBase64
        ? `<img src="${iconBase64}" style="width:64px;height:64px;border-radius:14px;margin-bottom:16px;object-fit:contain;" />`
        : `<div style="font-size:40px;margin-bottom:16px">⚡</div>`;

    win.loadURL(`data:text/html,<!DOCTYPE html>
<html>
<body style="margin:0;background:#1a1a1a;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:'Segoe UI',sans-serif;color:#fff;border-radius:12px">
  ${iconHTML}
  <div style="font-size:18px;font-weight:700;margin-bottom:8px">QuickBiza POS</div>
  <div style="font-size:13px;color:#aaa">Starting local server...</div>
</body>
</html>`);

    return win;
}

// ─── IPC: openExternal ────────────────────────────────────────────────────────
ipcMain.on('open-external', (_, url) => {
    shell.openExternal(url);
});

// ─── Single instance lock ─────────────────────────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (_, commandLine) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
        const url = commandLine.find((arg) => arg.startsWith('quickbiza://'));
        if (url && mainWindow) mainWindow.webContents.send('deep-link', url);
    });

    app.on('ready', async () => {
        // Deep link protocol
        if (process.defaultApp) {
            app.setAsDefaultProtocolClient('quickbiza', process.execPath, [path.resolve(process.argv[1])]);
        } else {
            app.setAsDefaultProtocolClient('quickbiza');
        }

        let loadingWin = null;

        if (!isDev) {
            // Show loading splash immediately
            loadingWin = createLoadingWindow();

            try {
                await startBackend();
                log('Waiting for backend health check...');
                await waitForBackend();
            } catch (err) {
                logErr(`Backend startup failed: ${err.message}`);
                // Still open the window — cloud fallback may work
            }

            if (loadingWin && !loadingWin.isDestroyed()) loadingWin.close();
        }

        createWindow();

        if (!isDev) {
            setTimeout(() => autoUpdater.checkForUpdatesAndNotify(), 5000);
        }
    });
}

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.on('open-url', (event, url) => {
    event.preventDefault();
    if (mainWindow) mainWindow.webContents.send('deep-link', url);
});

autoUpdater.on('update-available', () => {
    if (mainWindow) mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
    if (mainWindow) mainWindow.webContents.send('update_downloaded');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (!mainWindow) createWindow();
});

app.on('will-quit', () => {
    if (backendProcess) {
        backendProcess.kill('SIGTERM');
    }
});
