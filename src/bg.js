"use strict";

let playerTab = null;

const action = chrome.action;

let settings = {
  isNotificationEnabled: true,
};

chrome.storage.sync.get((items) => {
  if (items.settings) {
    settings = items.settings;
  } else {
    chrome.storage.sync.set({ settings: settings });
  }

  updateSettings(true);
});

function updateSettings(isActive) {
  if (playerTab) {
    chrome.tabs.sendMessage(playerTab.id, {
      action: "updateSettings",
      settings: settings,
      isActive: isActive,
    });
  }
}

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "register_player") {
    if (action.show) action.show(sender.tab.id);
  } else if (request.action === "updateSettings") {
    settings = request.settings;
    updateSettings(true);
  }
});

function activatePlayer(tab) {
  if (playerTab) {
    action.setIcon({ tabId: playerTab.id, path: "img/disabled.png" });
    updateSettings(false);
  }

  if (playerTab && playerTab.id === tab.id) {
    playerTab = null;
  } else {
    playerTab = tab;
    action.setIcon({ tabId: tab.id, path: "img/enabled.png" });
    updateSettings(true);
  }
}

action.onClicked.addListener(activatePlayer);

chrome.commands.onCommand.addListener((command) => {
  if (playerTab) {
    chrome.tabs.sendMessage(playerTab.id, { action: command });
  }
});
