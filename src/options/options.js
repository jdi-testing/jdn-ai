const serverTypes = {
  devRemote: 'http://78.47.220.208:5000',
  prodRemote: 'http://78.47.220.208:80',
  local: 'http://localhost:5050',
};

const saveOptions = () => {
  const serverUrl = document.getElementById('serverUrl').value;
  chrome.storage.sync.set({ serverUrl }, () => {});
};

const setCheckedByUrl = (url) => {
  let matched = false;
  Object.keys(serverTypes).forEach((type) => {
    if (serverTypes[type] === url) {
      document.getElementById(type).checked = true;
      matched = true;
    } else {
      document.getElementById(type).checked = false;
    }
  });
  document.getElementById('custom').checked = !matched && !!url;
};
const restoreOptionsOnLoad = () => {
  chrome.storage.sync.get('serverUrl', (items) => {
    const url = items.serverUrl;
    document.getElementById('serverUrl').value = url || '';
    setCheckedByUrl(url);
  });
};

const restoreOptions = () => {
  chrome.storage.sync.remove('serverUrl', () => {
    document.getElementById('serverUrl').value = '';
    document.querySelectorAll('input[name="serverType"]').forEach((input) => {
      input.checked = false;
    });
  });
};

document.querySelectorAll('input[name="serverType"]').forEach((input) => {
  input.addEventListener('change', function () {
    const serverUrl = document.getElementById('serverUrl');
    if (this.checked) {
      serverUrl.value = serverTypes[this.id] || '';
      document.querySelectorAll('input[name="serverType"]').forEach((otherInput) => {
        if (otherInput !== this) {
          otherInput.checked = false;
        }
      });
    }
  });
});

document.getElementById('serverUrl').addEventListener('input', () => {
  const value = document.getElementById('serverUrl').value;
  let foundMatch = false;
  Object.keys(serverTypes).forEach((type) => {
    if (serverTypes[type] === value) {
      document.getElementById(type).checked = true;
      foundMatch = true;
    } else {
      document.getElementById(type).checked = false;
    }
  });
  document.getElementById('custom').checked = !foundMatch;
});

document.getElementById('serverUrl').addEventListener('blur', () => {
  const url = document.getElementById('serverUrl').value;
  setCheckedByUrl(url);
});

document.addEventListener('DOMContentLoaded', restoreOptionsOnLoad);
document.getElementById('restore').addEventListener('click', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
