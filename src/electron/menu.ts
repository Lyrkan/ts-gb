import { dialog, Menu } from 'electron';

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
              { filters: [{ name: 'gb', extensions: ['gb'] }] },
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
          click: () => {
            window.webContents.send('pauseEmulation');
          }
        },
        {
          label: 'Resume emulation',
          click: () => {
            window.webContents.send('resumeEmulation');
          }
        },
      ]
    }
  ];

  return Menu.buildFromTemplate(template);
};
