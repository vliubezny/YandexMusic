(function() {
  "use strict";

  var playerTab = null;

  var action = chrome.pageAction;

  var settings = {
    isNotificationEnabled: true
  };

  chrome.storage.sync.get(function(items) {
    if (items.settings) {
      settings = items.settings;
    } else {
      chrome.storage.sync.set({ settings: settings });
    }

    updateSettings(true);
  });

  var updateSettings = function(isActive) {
    if (playerTab) {
      chrome.tabs.sendMessage(playerTab.id, { action: "updateSettings", settings: settings, isActive: isActive });
    }
  };

  var handler = function(request, sender) {
    if (request.action === "register_player") {
      if (action.show) action.show(sender.tab.id);
    } else if (request.action === "updateSettings") {
      settings = request.settings;
      updateSettings(true);
    }
  };

  chrome.runtime.onMessage.addListener(handler);

  var activatePlayer = function(tab) {
    if (playerTab) {
      action.setIcon({ tabId: playerTab.id, path: "disabled.png" });
      updateSettings(false);
    }

    if (playerTab && playerTab.id === tab.id) {
      playerTab = null;
    } else {
      playerTab = tab;
      action.setIcon({ tabId: tab.id, path: "enabled.png" });
      updateSettings(true);
    }
  };

  action.onClicked.addListener(activatePlayer);

  var dispatchCommand = function(command) {
    if (playerTab) {
      chrome.tabs.sendMessage(playerTab.id, { "action": command });
    }
  };

  chrome.commands.onCommand.addListener(dispatchCommand);
})();
