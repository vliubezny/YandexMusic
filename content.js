(function() {
  "use strict";

  var doNotify = false;

  var player = null;

  var handle = function(request) {
    if (request.action === "updateNotification") {
      doNotify = request.isEnabled;
      return;
    }
    var controlProvider = player[request.action];
    controlProvider().click();
  };

  var notify = function(track) {
    var show = function() {
      var title = track.version ? track.title + " " + track.version : track.title;
      var notification = new Notification(title, {
        tag: "newTrack",
        icon: track.coverSrc.replace("40x40", "80x80"),
        body: track.artists
      });
      notification.addEventListener("click", function() {
        handle({
          action: "playNext"
        });
        notification.close();
      });
      setTimeout(notification.close.bind(notification), 3000);
    };

    if (doNotify) {
      if (Notification.permission === 'granted') {
        show();
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function(permission) {
          if (permission === 'granted') {
            show();
          }
        });
      }
    }
  };

  var showTrack = function() {
    var track = player.getTrack();
    if (track) {
      notify(track);
    }
  };

  window.YandexMusicExtensionInit = function(playerInstance) {
    player = playerInstance;

    player.playPause().addEventListener("click", function() {
      setTimeout(function() {
        if (player.isPlaying()) {
          showTrack();
        }
      }, 100);
    });

    chrome.runtime.onMessage.addListener(handle);
    chrome.runtime.sendMessage({
      action: "register_player"
    });

    var seeker = setInterval(function() {
      var trackElement = player.trackContainer();
      if (trackElement) {
        trackElement.addEventListener("DOMSubtreeModified", function() {
          showTrack();
        }, false);
        clearInterval(seeker);
        if (player.isPlaying()) {
          showTrack();
        }
      }
    }, 1000);
  };
})();
