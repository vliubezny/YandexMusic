"use strict";

const { action, declarativeContent, commands, runtime, storage, tabs } = chrome;
const DEFAULT_SETTINGS = { isNotificationEnabled: true };

async function setDefaultSettings() {
  const { settings } = await storage.sync.get(["settings"]);
  if (!settings) {
    storage.sync.set({ settings: DEFAULT_SETTINGS });
  }
}

setDefaultSettings();

async function updateSettings(tabId, isActive) {
  if (tabId) {
    const { settings } = await storage.sync.get(["settings"]);
    tabs.sendMessage(tabId, {
      action: "updateSettings",
      settings: settings || DEFAULT_SETTINGS,
      isActive,
    });
  }
}

runtime.onMessage.addListener(async (request, sender) => {
  if (request.action === "register_player") {
    action.show && action.show(sender.tab.id);
    retorePlayer(sender.tab);
  } else if (request.action === "updateSettings") {
    const { tabId } = await storage.local.get(["tabId"]);
    updateSettings(tabId, true);
  }
});

async function retorePlayer(tab) {
  const { tabId, index } = await storage.local.get(["tabId", "index"]);
  if (!tabId) {
    return;
  }

  if (tabId === tab.id || (!(await isValidTab(tabId)) && index === tab.index)) {
    activatePlayer(tab.id, tab.index);
  }
}

async function isValidTab(tabId) {
  try {
    await tabs.get(tabId);
    return true;
  } catch (error) {
    return false;
  }
}

function activatePlayer(tabId, index) {
  storage.local.set({ tabId, index });
  action.setIcon({ tabId, path: "img/enabled.png" });
  updateSettings(tabId, true);
}

async function switchPlayer(tab) {
  const { tabId } = await storage.local.get(["tabId"]);
  if (tabId) {
    action.setIcon({ tabId, path: "img/disabled.png" });
    updateSettings(tabId, false);
  }

  if (tabId === tab.id) {
    storage.local.set({ tabId: null });
  } else {
    activatePlayer(tab.id, tab.index);
  }
}

action.onClicked.addListener(switchPlayer);

commands.onCommand.addListener(async (command) => {
  const { tabId } = await storage.local.get(["tabId"]);
  if (tabId) {
    tabs.sendMessage(tabId, { action: command });
  }
});

tabs.onMoved.addListener(async (movedTabId, moveInfo) => {
  const { tabId } = await storage.local.get(["tabId"]);
  if (movedTabId === tabId) {
    storage.local.set({ index: toIndex });
  }
});

tabs.onRemoved.addListener(async (removedTabId) => {
  const { tabId } = await storage.local.get(["tabId"]);
  if (removedTabId === tabId) {
    storage.local.set({ tabId: null, index: null });
  }
});

runtime.onInstalled.addListener(() => {
  action.disable();

  declarativeContent.onPageChanged.removeRules(undefined, () => {
    const rule = {
      conditions: [
        new declarativeContent.PageStateMatcher({
          pageUrl: {
            urlMatches: "https://(?:music|radio)\\.yandex\\.(?:ru|by|ua|kz)",
          },
        }),
      ],
      actions: [new declarativeContent.ShowAction()],
    };

    declarativeContent.onPageChanged.addRules([rule]);
  });
});
