Object.assign(global, require('jest-chrome'));
Object.assign(global.chrome, {
  tabs: {
    sendMessage: function() {
      return new Promise(() => {});
    }
  }
});
