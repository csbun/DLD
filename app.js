const path = require('path');
const { globalShortcut, nativeImage } = require('electron')
const { menubar } = require('menubar');

const IS_DEBUG = !!process.env.VSCODE_INSPECTOR_OPTIONS;

const mb = menubar({
  browserWindow: {
    width: IS_DEBUG ? 800 : 400,
    height: IS_DEBUG ? 800 : 400,
  },
  icon: nativeImage.createFromPath(path.resolve(__dirname, 'icon', 'iconTemplate.png')),
  showDockIcon: false,
});

mb.on('ready', () => {
  // console.log('app is ready');
  // 快捷键打开翻译窗口
  globalShortcut.register('CommandOrControl+Y', () => {
    mb.showWindow();
  });
});



mb.on('after-create-window', () => {
  if (IS_DEBUG) {
    mb.window.webContents.openDevTools();
  }
});

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
  console.log('process.env.VSCODE_INSPECTOR_OPTIONS:', process.env.VSCODE_INSPECTOR_OPTIONS);
}



