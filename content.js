(function() {
  "use strict";

  var handle = function(request) {
    document.dispatchEvent(new CustomEvent('player_command_event', {
      detail: request
    }));
  };

  var injectScript = function() {
    var script = document.createElement('script');
    script.src = chrome.extension.getURL('injected.js');
    script.onload = function() {
      this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(script);
  };

  var init = function() {
    chrome.runtime.onMessage.addListener(handle);

    document.addEventListener('player_ready_event', function() {
      chrome.runtime.sendMessage({ action: "register_player" });
    });

    injectScript();
  };

  init();
})();
