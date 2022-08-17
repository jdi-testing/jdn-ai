import jestWebExtMock from 'jest-webextension-mock';
Object.assign(global, jestWebExtMock);
Object.assign(global.chrome, {
  tabs: {
    sendMessage: function() {
      return new Promise(() => undefined);
    }
  },
  devtools: {
    inspectedWindow: function() {
      return new Promise(() => undefined);
    }
  },
  scripting: {
    insertCSS: function() {
      return new Promise(() => undefined);
    }
  }
});
