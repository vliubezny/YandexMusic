(function () {
  "use strict";

  const statusEl = document.getElementById("status");
  const notifyEl = document.getElementById("notify");

  function showStatus(status) {
    statusEl.textContent = status;
    setTimeout(() => (statusEl.textContent = ""), 750);
  }

  notifyEl.addEventListener("change", () => {
    const settings = {
      isNotificationEnabled: notifyEl.checked,
    };

    chrome.storage.sync.set({ settings }, () => {
      showStatus("Настройки сохранены.");
      chrome.runtime.sendMessage({ action: "updateSettings", settings });
    });
  });

  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get((items) => {
      notifyEl.checked = items.settings.isNotificationEnabled;
    });
  });
})();
