const { menubar } = require('menubar');

const IS_DEBUG = !!process.env.VSCODE_INSPECTOR_OPTIONS;

const mb = menubar({
  browserWindow: {
    width: IS_DEBUG ? 1200 : 400,
    height: IS_DEBUG ? 800 : 400,
  }
});

mb.on('ready', () => {
  // console.log('app is ready');
  // your app code here
});

mb.on('after-create-window', () => {
  if (IS_DEBUG) {
    mb.window.webContents.openDevTools();
  }
})

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
  console.log('process.env.VSCODE_INSPECTOR_OPTIONS:', process.env.VSCODE_INSPECTOR_OPTIONS);
}



