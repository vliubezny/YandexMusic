(function() {
  "use strict";

  var doNotify = false;

  var keys = {};
  var addKey = function(key, selector) {
    keys[key] = document.querySelector(selector);
  };

  addKey("playPause", ".player-controls__btn_play");
  addKey("playNext", ".player-controls__btn_next");
  addKey("playPrev", ".player-controls__btn_prev");

  var handle = function(request) {
    if (request.action === "updateNotification") {
      doNotify = request.isEnabled;
      return;
    }
    var key = keys[request.action];
    key.click();
  };

  keys.playPause.addEventListener("click", function() {
    setTimeout(function() {
      if (isPlaying()) {
        showTrack();
      }
    }, 100);
  });

  chrome.runtime.onMessage.addListener(handle);
  chrome.runtime.sendMessage({
    action: "register_player"
  });

  var isPlaying = function() {
    return !!document.querySelector(".player-controls__btn_pause");
  };

  var getTrack = function() {
    var trackElement = document.querySelector(".player-controls__track-container");
    if (trackElement) {
      var coverImage = document.querySelector(".player-controls__track-container .album-cover");
      if (!coverImage) {
        return false;
      }
      var track = {};
      track.coverSrc = coverImage.src;
      track.title = document.querySelector(".player-controls__track-container .track__title").textContent;
      var versionElement = document.querySelector(".player-controls__track-container .track__ver");
      if (versionElement) {
        track.version = versionElement.textContent;
      }
      track.artists = document.querySelector(".player-controls__track-container .track__artists").textContent;
      return track;
    }
    return false;
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
    var track = getTrack();
    if (track) {
      notify(track);
    }
  };

  var seeker = setInterval(function() {
    var trackElement = document.querySelector(".player-controls__track-container");
    if (trackElement) {
      console.log("found track");
      trackElement.addEventListener("DOMSubtreeModified", function() {
        showTrack();
      }, false);
      clearInterval(seeker);
      if (isPlaying()) {
        showTrack();
      }
    }
  }, 1000);

})();
