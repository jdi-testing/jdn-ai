const saveOptions = () => {
  const serverUrl = document.getElementById('serverUrl').value;

  chrome.storage.sync.set({ serverUrl: serverUrl }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Options saved';
    setTimeout(() => {
      status.textContent = '';
    }, 1000);
  });
};

const restoreOptions = () => {
  const serverUrl = document.getElementById('serverUrl');
  serverUrl.value = '';
  // ToDO: add checkbox with default options:
  //   devRemote: 'http://78.47.220.208:5000',
  //   prodRemote: 'http://78.47.220.208:80',
  //   local: 'http://localhost:5050',
  chrome.storage.sync.remove('serverUrl', (items) => {
    const status = document.getElementById('status');
    status.textContent = 'Server URL reset successfully';
    setTimeout(() => {
      status.textContent = '';
    }, 1000);
  });
};

document.getElementById('restore').addEventListener('click', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
