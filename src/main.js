const { initialize, enable } = require('@electron/remote/main');
initialize();

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

const Store = require('electron-store');
const store = new Store();

const prompt = require('electron-prompt');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webSecurity: false,
    },
  });
  enable(mainWindow.webContents);

  const handlerUrl = (e, url) => {
    if( url.match(/^https/)){
      e.preventDefault()
      shell.openExternal(url)
    }
  }
  mainWindow.webContents.on('will-navigate', handlerUrl);
  mainWindow.webContents.on('new-window', handlerUrl);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle('launch', async (event) => {
  const renpy = store.get("renpy");
  if (renpy == null) {
    dialog.showErrorBox("Error", "Ren'Py path not set.");
    return;
  }
  const game = store.get("game");
  if (game == null) {
    dialog.showErrorBox("Error", "Game path not set.");
    return;
  }
  await execSync(`${path.join(renpy, "renpy.exe")} ${game} compile`);
  spawn(path.join(renpy, "renpy.exe"), [game, "run"]);
})

ipcMain.handle('open-folder-dialog', async (event, title) => {
  const result = await dialog.showOpenDialog({
    title: title,
    properties: ['openDirectory']
  });
  return result.filePaths[0];
})

ipcMain.handle('delete-compiled', async (event) => {
  const game = store.get("game");
  if (game == null) {
    dialog.showErrorBox("Error", "Game path not set.");
    return;
  }
  const files = fs.readdirSync(path.join(game, "game"));
  for (const file of files) {
    if (file.endsWith(".rpyc")) {
      fs.unlinkSync(path.join(game, "game", file));
    }
  }
  return;
});

ipcMain.handle('change-branch', async (event, branch) => {
  const game = store.get("game");
  if (game == null) {
    dialog.showErrorBox("Error", "Game path not set.");
    return;
  }
  const git = "git";
  await execSync(`${git} -C ${game} checkout ${branch}`);
  return;
});

ipcMain.handle('currect-branch', async (event) => {
  const game = store.get("game");
  if (game == null) {
    dialog.showErrorBox("Error", "Game path not set.");
    return;
  }
  const git = "git";
  const branch = await execSync(`${git} -C ${game} branch --show-current`);
  return branch.toString();
});
