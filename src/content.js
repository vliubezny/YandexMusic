(function () {
  "use strict";

  function injectScript() {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("injected.js");
    script.onload = function () {
      this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(script);
  }

  function init() {
    chrome.runtime.onMessage.addListener((request) => {
      document.dispatchEvent(
        new CustomEvent("player_command_event", { detail: request })
      );
    });

    document.addEventListener("player_ready_event", () => {
      chrome.runtime.sendMessage({ action: "register_player" });
    });

    injectScript();
  }

  init();
})();
