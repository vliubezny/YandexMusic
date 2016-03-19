(function(externalAPI) {
  "use strict";

  var maxTitleLength = 35,
    maxTextLength = 40;

  if (!externalAPI) {
    throw new Error("externalAPI is not available!");
  }

  var doNotify = false;

  var player = externalAPI;
  var wasPlaying = player.isPlaying();

  var isControlEnabled = function(control) {
    var controls = player.getControls();
    return controls[control] === "enabled";
  };

  var handlers = {
    "playPause": function() {
      player.togglePause();
    },
    "playNext": function() {
      if (isControlEnabled("next")) {
        player.next();
      }
    },
    "playPrev": function() {
      if (isControlEnabled("prev")) {
        player.prev();
      }
    },
    "updateNotification": function(e) {
      doNotify = e.isEnabled;
    }
  };

  var handle = function(request) {
    var handler = handlers[request.action];
    if (!handler) {
      console.error("unhandled action", request.action);
    }
    handler(request);
  };

  var truncate = function(str, maxLen) {
    return str.length <= maxLen ? str : str.substring(0, maxLen - 3) + "...";
  };

  var createNotification = function(track) {
    var title = track.title;
    if (track.version && track.version !== "Album Version") {
      title += " (" + track.version + ")";
    }

    var body = track.artists.map(function(a) { return a.title; }).join(", ");
    if (track.album) {
      body += " - " + track.album.title + " (" + track.album.year + ")";
    }

    var notification = new Notification(truncate(title, maxTitleLength), {
      tag: "newTrack",
      icon: "https://" + track.cover.replace("%%", "80x80"),
      body: truncate(body, maxTextLength)
    });

    notification.addEventListener("click", function() {
      handle({
        action: "playNext"
      });
      notification.close();
    });
    setTimeout(notification.close.bind(notification), 3000);
  };

  var runIfNotificatioAllowed = function(fun) {
    if (doNotify) {
      if (Notification.permission === 'granted') {
        fun();
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function(permission) {
          if (permission === 'granted') {
            fun();
          }
        });
      }
    }
  };

  var showTrack = function() {
    var track = player.getCurrentTrack();
    if (track) {
      runIfNotificatioAllowed(function() {
        createNotification(track);
      });
    }
  };

  player.on(player.EVENT_TRACK, showTrack);

  player.on(player.EVENT_STATE, function() {
    var isPlaying = player.isPlaying();
    if (isPlaying && !wasPlaying) {
      showTrack();
    }
    wasPlaying = isPlaying;
  });

  chrome.runtime.onMessage.addListener(handle);
  chrome.runtime.sendMessage({
    action: "register_player"
  });

})(externalAPI);
