const path = require('path');
const { globalShortcut, nativeImage } = require('electron')
const { menubar } = require('menubar');

const IS_DEBUG = !!process.env.VSCODE_INSPECTOR_OPTIONS;

const mb = menubar({
  browserWindow: {
    title: 'ft - Fast Translator',
    width: IS_DEBUG ? 800 : 300,
    height: IS_DEBUG ? 800 : 300,
  },
  windowPosition: 'trayRight',
  icon: nativeImage.createFromPath(path.resolve(__dirname, 'icon', 'iconTemplate.png')),
  showDockIcon: false,
});

mb.on('ready', () => {
  // console.log('app is ready');
  // 快捷键：打开翻译窗口
  globalShortcut.register('CommandOrControl+Y', () => {
    mb.showWindow();
  });
});


mb.on('after-create-window', () => {
  // do not showDockIcon
  mb.app.dock.hide();
  // 快捷键：隐藏窗口
  mb.window.webContents.on('before-input-event', (event, input) => {
    if (input.key.toLowerCase() === 'escape') {
      mb.hideWindow();
      event.preventDefault()
    }
  })
  // DEV Tools
  if (IS_DEBUG) {
    mb.window.webContents.openDevTools();
  }
});

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
  console.log('process.env.VSCODE_INSPECTOR_OPTIONS:', process.env.VSCODE_INSPECTOR_OPTIONS);
}



