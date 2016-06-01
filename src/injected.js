(function() {
  "use strict";

  var maxTitleLength = 30,
    maxTextLength = 35;

  var settings = {};

  var isActive = false;

  var player = null;

  var isControlEnabled = function(control) {
    var controls = player.getControls();
    return controls[control] === player.CONTROL_ENABLED;
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
    "updateSettings": function(e) {
      settings = e.settings;
      isActive = e.isActive;
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

  var getCoverUrl = function(track) {
    var urlTemplate = null;
    if (track.cover) {
      urlTemplate = track.cover;
    } else {
      var source = player.getSourceInfo();
      if (source.type === "playlist" && source.cover) {
        urlTemplate = Array.isArray(source.cover)
          ? source.cover[0]
          : source.cover;
      }
    }

    return urlTemplate
      ? "https://" + urlTemplate.replace("%%", "80x80")
      : null;
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
      icon: getCoverUrl(track),
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

  var runIfNotificatioAllowed = function(action) {
    if (settings.isNotificationEnabled) {
      if (Notification.permission === 'granted') {
        action();
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function(permission) {
          if (permission === 'granted') {
            action();
          }
        });
      }
    }
  };

  var showTrack = function(track) {
    if (!isActive) {
      return;
    }

    if (track) {
      runIfNotificatioAllowed(function() {
        createNotification(track);
      });
    }
  };

  var init = function(externalAPI) {
    if (!externalAPI) {
      throw new Error("externalAPI is not available");
    }

    player = externalAPI;

    player.on(player.EVENT_STATE, function() {
      if (player.isPlaying()) {
        var track = player.getCurrentTrack();
        showTrack(track);
      }
    });

    player.on(player.EVENT_TRACK, function() {
      var track = player.getCurrentTrack();
      showTrack(track);
    });

    document.addEventListener('player_command_event', function(e) {
      handle(e.detail);
    });
    document.dispatchEvent(new CustomEvent('player_ready_event'));
  };

  init(window.externalAPI);
})();