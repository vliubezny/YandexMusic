(function () {
  "use strict";

  const MAX_TITLE_LENGTH = 30;
  const MAX_TEXT_LENGTH = 35;

  let settings = {};

  let isActive = false;

  let player = null;

  function isControlEnabled(control) {
    var controls = player.getControls();
    return controls[control] === player.CONTROL_ENABLED;
  }

  const handlers = {
    playPause: () => {
      player.togglePause();
      showTrackOnPlay();
    },
    playNext: () => {
      if (isControlEnabled("next")) {
        player.next();
      }
    },
    playPrev: () => {
      if (isControlEnabled("prev")) {
        player.prev();
      }
    },
    updateSettings: (e) => {
      settings = e.settings;
      isActive = e.isActive;
    },
  };

  function handle(request) {
    const handler = handlers[request.action];
    if (!handler) {
      console.error("unhandled action", request.action);
    }
    handler(request);
  }

  function truncate(str, maxLen) {
    return str.length <= maxLen ? str : str.substring(0, maxLen - 3) + "...";
  }

  function getCoverUrl(track) {
    let urlTemplate = null;
    if (track.cover) {
      urlTemplate = track.cover;
    } else {
      const source = player.getSourceInfo();
      if (source.type === "playlist" && source.cover) {
        urlTemplate = Array.isArray(source.cover)
          ? source.cover[0]
          : source.cover;
      }
    }

    return urlTemplate ? "https://" + urlTemplate.replace("%%", "80x80") : null;
  }

  function createNotification(track) {
    let title = track.title;
    if (track.version && track.version !== "Album Version") {
      title += ` (${track.version})`;
    }

    let body = track.artists.map((a) => a.title).join(", ");
    if (track.album) {
      body += ` - ${track.album.title} (${track.album.year})`;
    }

    const notification = new Notification(truncate(title, MAX_TITLE_LENGTH), {
      tag: "newTrack",
      icon: getCoverUrl(track),
      body: truncate(body, MAX_TEXT_LENGTH),
    });

    notification.addEventListener("click", () => {
      handle({
        action: "playNext",
      });
      notification.close();
    });
    setTimeout(notification.close.bind(notification), 3000);
  }

  function runIfNotificatioAllowed(action) {
    if (settings.isNotificationEnabled) {
      if (Notification.permission === "granted") {
        action();
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission(function (permission) {
          if (permission === "granted") {
            action();
          }
        });
      }
    }
  }

  function showTrack(track) {
    if (!isActive) {
      return;
    }

    if (track) {
      runIfNotificatioAllowed(() => createNotification(track));
    }
  }

  function showTrackOnPlay() {
    if (player.isPlaying()) {
      showTrack(player.getCurrentTrack());
    }
  }

  function init(externalAPI) {
    if (!externalAPI) {
      throw new Error("externalAPI is not available");
    }

    player = externalAPI;

    player.on(player.EVENT_TRACK, () => {
      showTrack(player.getCurrentTrack());
    });

    document.addEventListener("player_command_event", (e) => {
      handle(e.detail);
    });
    document.dispatchEvent(new CustomEvent("player_ready_event"));
  }

  init(window.externalAPI);
})();
