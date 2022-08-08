import jestWebExtMock from 'jest-webextension-mock';
Object.assign(global, jestWebExtMock);
Object.assign(global.chrome, {
  tabs: {
    sendMessage: function() {
      return new Promise(() => {});
    }
  },
  devtools: {
    inspectedWindow: function() {
      return new Promise(() => {});
    }
  }
});
