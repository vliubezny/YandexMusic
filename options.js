(function () {
  "use strict";

  function saveOptions() {
    var notify = document.getElementById('notify').checked;

    var settings = {
      isNotificationEnabled: notify
    };

    chrome.storage.sync.set({
      settings: settings
    }, function() {
      var status = document.getElementById('status');
      status.textContent = 'Настройки сохранены.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
      chrome.runtime.sendMessage({ action: "updateSettings", settings: settings });
    });
  }

  function restoreOptions() {
    chrome.storage.sync.get(function(items) {
      document.getElementById('notify').checked = items.settings.isNotificationEnabled;
    });
  }
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('notify').addEventListener('change', saveOptions);
})();
