/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  globalShortcut,
  clipboard,
  dialog,
  Tray,
  Menu,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { chat, chatWithStreaming } from './lib/ai';
import { AppStore } from './lib/store';
import { ChatMessage } from './lib/types';

// IPC listener
ipcMain.handle('electron-store-get', async (event, val) => {
  return AppStore.get(val);
});
ipcMain.handle('electron-store-set', async (event, key, val) => {
  AppStore.set(key, val);
});

ipcMain.handle('electron-store-has', async (event, val) => {
  return AppStore.has(val);
});

ipcMain.handle('electron-store-reset', async (event, val) => {
  AppStore.reset(val);
});

// delete
ipcMain.handle('electron-store-delete', async (event, val) => {
  AppStore.delete(val);
});

ipcMain.on('clipboard-write', async (event, val) => {
  clipboard.writeText(val);
});

// showErrorBox
ipcMain.on('show-error-box', async (event, title, val) => {
  dialog.showErrorBox(title, val);
});

// showMessageBox
ipcMain.on('show-message-box', (event, options): number => {
  return dialog.showMessageBoxSync(options);
});

ipcMain.on('chat-stream', async (event, msg: ChatMessage) => {
  // The renderer has sent us a MessagePort that it wants us to send our
  // response over.

  const [replyPort] = event.ports;

  try {
    await chatWithStreaming(replyPort, AppStore, msg);
  } catch (error) {
    dialog.showErrorBox(
      'Error',
      'Something went wrong when calling OpenAI. Try again later or check your API key.'
    );
  } finally {
    replyPort.close();
  }
});

ipcMain.handle('chat', async (event, msg: ChatMessage) => {
  try {
    return await chat(AppStore, msg);
  } catch (error) {
    dialog.showErrorBox(
      'Error',
      'Something went wrong when calling OpenAI. Try again later or check your API key.'
    );
  }
});

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')({ showDevTools: false });
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  console.log('createWindow');
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 750,
    height: 500,
    frame: false,
    resizable: false,
    focusable: true,
    movable: true,
    title: 'DataQuestion',
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  app.dock.hide();
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, 'modal-panel'); // <-- Hit and Trial, I guess ¯\_(ツ)_/¯

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('blur', () => {
    // This will close the window when it loses focus (i.e., when you click outside)
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    }
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    // This will close the window when the 'esc' key is pressed
    if (input.key === 'Escape') {
      if (mainWindow?.isVisible()) {
        mainWindow.hide();
      }
    }
  });

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    // Create the window once when the app is ready
    if (mainWindow === null) {
      console.log('ONE');
      createWindow();
    }

    tray = new Tray(path.join(__dirname, '../../assets/dqTemplate.png'));

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Quit', type: 'normal', click: () => app.quit() },
    ]);

    tray.setContextMenu(contextMenu);

    const ret = globalShortcut.register('CommandOrControl+Shift+S', () => {
      console.log('CommandOrControl+Shift+S is pressed');

      if (!mainWindow) {
        return;
      }

      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    if (!ret) {
      console.log('registration failed');
    }

    // Check whether a shortcut is registered.
    console.log(globalShortcut.isRegistered('CommandOrControl+Shift+S'));

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) {
        createWindow();
      }
    });
  })
  .catch(console.log);

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister('CommandOrControl+Shift+S');

  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});
