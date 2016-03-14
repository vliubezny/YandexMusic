(function() {
  "use strict";

  var playerTab = null;

  var doNotify;

  var action = chrome.browserAction;

  chrome.storage.sync.get({
    notify: true
  }, function(items) {
    doNotify = items.notify;
    updateNotificationStatus(doNotify);
  });

  var updateNotificationStatus = function (isEnabled) {
    if (playerTab) {
      chrome.tabs.sendMessage(playerTab.id, { action: "updateNotification", isEnabled: isEnabled });
    }
  };

  var register = function(request, sender) {
    if (request.action === "register_player") {
      if (action.show) action.show(sender.tab.id);
    } else if (request.action === "updateNotification") {
      doNotify = request.isEnabled;
      updateNotificationStatus(doNotify);
    }
  };

  chrome.runtime.onMessage.addListener(register);

  var activatePlayer = function(tab) {
    if (playerTab) {
      action.setIcon({ tabId: playerTab.id, path: "disabled.png" });
      updateNotificationStatus(false);
    }

    if (playerTab && playerTab.id === tab.id) {
      playerTab = null;
    } else {
      playerTab = tab;
      action.setIcon({ tabId: tab.id, path: "enabled.png" });
      updateNotificationStatus(doNotify);
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
