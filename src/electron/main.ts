import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../display/display';
import { buildMenu } from './menu';
import { WINDOW_SCALING } from './constants';

let mainWindow: Electron.BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    height: SCREEN_HEIGHT * WINDOW_SCALING,
    width: SCREEN_WIDTH * WINDOW_SCALING,
    useContentSize: true,
    resizable: false,
  });

  mainWindow.loadFile(path.join(__dirname, '../../views/index.html'));
  mainWindow.webContents.openDevTools({ mode: 'detach' });

  // Update menu
  Menu.setApplicationMenu(buildMenu(mainWindow));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

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
