import { dialog, Menu } from 'electron';
import { DEBUGGER_MODE } from './debugger';

export const buildMenu = (window: Electron.BrowserWindow) => {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open bootstrap ROM',
          click: () => {
            dialog.showOpenDialog(
              { filters: [{ name: 'bin', extensions: ['bin'] }] },
              (filepaths?: string[]) => {
                if ((filepaths !== undefined) && (window !== null)) {
                  window.webContents.send('loadBootRom', filepaths[0]);
                }
              }
            );
          },
        },
        {
          label: 'Open game',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            dialog.showOpenDialog(
              { filters: [{ name: 'gb', extensions: ['gb', 'gbc'] }] },
              (filepaths?: string[]) => {
                if (filepaths !== undefined) {
                  window.webContents.send('loadGame', filepaths[0]);
                }
              }
            );
          },
        },
        {
          role: 'close'
        }
      ],
    },
    {
      label: 'Control',
      submenu: [
        {
          label: 'Pause emulation',
          click: () => window.webContents.send('pauseEmulation')
        },
        {
          label: 'Resume emulation',
          click: () => window.webContents.send('resumeEmulation')
        },
        {
          label: 'Restart emulation',
          click: () => window.webContents.send('restartEmulation')
        },
      ]
    },
    {
      label: 'Display',
      submenu: [
        {
          label: 'Toggle stats',
          click: () => window.webContents.send('toggleStats')
        },
      ]
    },
    {
      label: 'Audio',
      submenu: [
        {
          label: 'Volume',
          submenu: [
            {
              label: '0%',
              click: () => window.webContents.send('setVolume', 0),
            },
            {
              label: '25%',
              click: () => window.webContents.send('setVolume', 25),
            },
            {
              label: '50%',
              click: () => window.webContents.send('setVolume', 50),
            },
            {
              label: '75%',
              click: () => window.webContents.send('setVolume', 75),
            },
            {
              label: '100%',
              click: () => window.webContents.send('setVolume', 100),
            },
          ]
        },
      ]
    },
    {
      label: 'Debug',
      submenu: [
        {
          label: 'Debugger mode',
          submenu: [
            {
              label: 'Normal',
              click: () => window.webContents.send('setDebuggerMode', DEBUGGER_MODE.NORMAL),
            },
            {
              label: 'Trace',
              click: () => window.webContents.send('setDebuggerMode', DEBUGGER_MODE.TRACE),
            },
            {
              label: 'Detailled',
              click: () => window.webContents.send('setDebuggerMode', DEBUGGER_MODE.DETAILLED),
            },
          ]
        },
        {
          label: 'Run',
          submenu: [
            {
              label: 'Run single tick',
              accelerator: 'CmdOrCtrl+Enter',
              click: () => window.webContents.send('runSingleTick'),
            },
            {
              label: 'Run single step',
              accelerator: 'CmdOrCtrl+Space',
              click: () => window.webContents.send('runSingleStep'),
            },
          ]
        },
        {
          label: 'Dump state',
          submenu: [
            {
              label: 'Dump registers',
              click: () => window.webContents.send('dumpRegisters'),
            },
            {
              label: 'Dump VRAM',
              click: () => window.webContents.send('dumpVram'),
            },
            {
              label: 'Print screen buffer SHA-1',
              click: () => window.webContents.send('getScreenBufferSha1'),
            },
          ]
        }
      ]
    }
  ];

  return Menu.buildFromTemplate(template);
};
