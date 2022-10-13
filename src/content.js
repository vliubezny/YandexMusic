(function () {
  "use strict";

  const { runtime } = chrome;

  function injectScript() {
    const script = document.createElement("script");
    script.src = runtime.getURL("injected.js");
    script.onload = function () {
      this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(script);
  }

  function init() {
    runtime.onMessage.addListener((request) => {
      document.dispatchEvent(
        new CustomEvent("player_command_event", { detail: request })
      );
    });

    document.addEventListener("player_ready_event", () => {
      runtime.sendMessage({ action: "register_player" });
    });

    injectScript();
  }

  init();
})();
