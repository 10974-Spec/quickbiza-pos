const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const http = require('http');
const { autoUpdater } = require('electron-updater');

// Configure autoUpdater
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

let mainWindow;
let backendProcess;

const isDev = process.env.NODE_ENV === 'development';
const BACKEND_PORT = 5000;
const FRONTEND_PORT = 8080;

function killProcessOnPort(port) {
    return new Promise((resolve) => {
        const platform = process.platform;
        const command = platform === 'win32'
            ? `for /f "tokens=5" %a in ('netstat -aon ^| find ":${port}" ^| find "LISTENING"') do taskkill /f /pid %a`
            : `lsof -i :${port} -t | xargs kill -9`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                // Ignore errors (e.g., no process found)
                resolve();
                return;
            }
            console.log(`Freed port ${port}`);
            setTimeout(resolve, 1000); // Wait for process to actually die
        });
    });
}

async function startBackend() {
    if (isDev) return; // In dev, we run backend separately

    await killProcessOnPort(BACKEND_PORT);

    const backendPath = path.join(process.resourcesPath, 'backend', 'server.js');

    console.log('Starting backend from:', backendPath);

    // Use the Electron binary itself to run the backend node script
    // This avoids needing a separate Node.js installation on the user's machine
    backendProcess = spawn(process.execPath, [backendPath], {
        env: {
            ...process.env,
            ELECTRON_RUN_AS_NODE: '1',
            NODE_ENV: isDev ? 'development' : 'production',
            USER_DATA_PATH: app.getPath('userData'),
            PORT: BACKEND_PORT
        },
        cwd: isDev ? path.join(__dirname, '../backend') : path.join(process.resourcesPath, 'backend'),
        stdio: ['ignore', 'pipe', 'pipe'] // Change from 'inherit' to pipe to capture output
    });

    if (backendProcess.pid) {
        console.log(`Backend process started with PID: ${backendProcess.pid}`);
    } else {
        console.error('Failed to spawn backend process');
    }

    if (backendProcess.stdout) {
        backendProcess.stdout.on('data', (data) => {
            console.log(`Backend: ${data}`);
        });
    }

    if (backendProcess.stderr) {
        backendProcess.stderr.on('data', (data) => {
            console.error(`Backend Error: ${data}`);
        });
    }

    backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });

    backendProcess.on('error', (err) => {
        console.error('Failed to start backend process:', err);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "QuickBiza POS",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For easier IPC initially, can be tightened later
        },
        icon: path.join(__dirname, '../frontend/public/favicon.ico')
    });

    if (isDev) {
        console.log(`[Main] Loading URL: http://localhost:${FRONTEND_PORT}`);
        mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
        mainWindow.webContents.openDevTools();
    } else {
        // In production, we serve the frontend logic
        // But since we are using a React SPA, we might want to serve it via the backend or load the index.html directly
        // If loading index.html directly, we need to ensure API calls go to localhost:5000
        mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Basic Deep Linking Setup
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('quickbiza', process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient('quickbiza');
}

const gotTheLock = app.requestSingleInstanceLock();
console.log(`[Main] Single Instance Lock Acquired: ${gotTheLock}`);

if (!gotTheLock) {
    console.log("[Main] Failed to acquire lock. Quitting...");
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }

        console.log("⚠️ SECOND INSTANCE DETECTED ⚠️");
        console.log("Command Line Args:", JSON.stringify(commandLine));
        console.log("Working Directory:", workingDirectory);

        // Protocol handler for Windows/Linux
        // Find the argument that starts with quickbiza://
        const url = commandLine.find(arg => arg.startsWith('quickbiza://'));

        if (url) {
            console.log("✅ Deep link received (Windows/Linux):", url);

            // VISUAL CONFIRMATION REMOVED

            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.focus();
                mainWindow.webContents.send('deep-link', url);
            }
        } else {
            console.log("❌ Deep link received but NO quickbiza:// url found in args:", commandLine);
        }
    });

    app.on('ready', () => {
        ipcMain.on('renderer-log', (event, arg) => {
            console.log("🎨 RENDERER:", arg);
        });

        startBackend();
        createWindow();

        // Check for updates
        if (!isDev) {
            autoUpdater.checkForUpdatesAndNotify();
        }
    });
}

// Protocol handler for macOS
app.on('open-url', (event, url) => {
    event.preventDefault();
    console.log("Deep link received (macOS):", url);
    if (mainWindow) {
        mainWindow.webContents.send('deep-link', url);
    }
});

// Auto-update events
autoUpdater.on('update-available', () => {
    if (mainWindow) {
        mainWindow.webContents.send('update_available');
    }
});

autoUpdater.on('update-downloaded', () => {
    if (mainWindow) {
        mainWindow.webContents.send('update_downloaded');
    }
    // Silent installation on quit is default
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('will-quit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});
