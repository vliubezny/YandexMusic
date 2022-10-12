(function () {
  "use strict";

  const { runtime, storage } = chrome;

  const statusEl = document.getElementById("status");
  const notifyEl = document.getElementById("notify");

  function showStatus(status) {
    statusEl.textContent = status;
    setTimeout(() => (statusEl.textContent = ""), 750);
  }

  notifyEl.addEventListener("change", async () => {
    const settings = {
      isNotificationEnabled: notifyEl.checked,
    };

    await storage.sync.set({ settings });
    showStatus("Настройки сохранены.");
    runtime.sendMessage({ action: "updateSettings" });
  });

  document.addEventListener("DOMContentLoaded", async () => {
    const { settings } = await storage.sync.get(["settings"]);
    notifyEl.checked = settings.isNotificationEnabled;
  });
})();
