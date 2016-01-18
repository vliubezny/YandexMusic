(function () {
  "use strict";

  function save_options() {
    var notify = document.getElementById('notify').checked;
    chrome.storage.sync.set({
      notify: notify,
    }, function() {
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
      chrome.runtime.sendMessage({action: "updateNotification", isEnabled: notify});
    });
  }

  function restore_options() {
    chrome.storage.sync.get({
      notify: true
    }, function(items) {
      document.getElementById('notify').checked = items.notify;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('notify').addEventListener('change',
  save_options);
})();
