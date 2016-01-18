(function() {
  "use strict";

  var playerTab = null;

  var doNotify;

  chrome.storage.sync.get({
    notify: true
  }, function(items) {
    doNotify = items.notify;
  });

  var updateNotificationStatus = function (isEnabled) {
    if (playerTab) {
      chrome.tabs.sendMessage(playerTab.id, {action: "updateNotification", isEnabled: isEnabled});
    }
  };

  var register = function(request, sender) {
    if (request.action === "register_player") {
      chrome.pageAction.show(sender.tab.id);
    } else if (request.action === "updateNotification") {
      doNotify = request.isEnabled;
      updateNotificationStatus(doNotify);
    }
  };

  chrome.runtime.onMessage.addListener(register);

  var activatePlayer = function(tab) {
    if (playerTab) {
      chrome.pageAction.setIcon({tabId: playerTab.id, path: "disabled.png"});
      updateNotificationStatus(false);
    }

    if (playerTab && playerTab.id === tab.id) {
      playerTab = null;
    } else {
      playerTab = tab;
      chrome.pageAction.setIcon({tabId: tab.id, path: "enabled.png"});
      updateNotificationStatus(doNotify);
    }
  };

  chrome.pageAction.onClicked.addListener(activatePlayer);

  var dispatchCommand = function(command) {
    if (playerTab) {
      console.log(command);
      chrome.tabs.sendMessage(playerTab.id, {"action": command});
    }
  };

  chrome.commands.onCommand.addListener(dispatchCommand);
})();
