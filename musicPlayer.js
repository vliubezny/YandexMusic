(function() {
  "use strict";

  function Player() {
    var controls = {};
    var getControl = function(selector) {
      if (!controls[selector]) {
        controls[selector] = document.querySelector(selector);
      }
      return controls[selector];
    };

    this.playNext = function() {
      return getControl(".player-controls__btn_next");
    };

    this.playPrev = function() {
      return getControl(".player-controls__btn_prev");
    };

    this.playPause = function() {
      return getControl(".player-controls__btn_play");
    };

    this.isPlaying = function() {
      return !!document.querySelector(".player-controls__btn_pause");
    };

    this.trackContainer = function() {
      document.querySelector(".player-controls__track-container");
    };

    this.getTrack = function() {
      var trackElement = this.trackContainer();
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
  }

  window.YandexMusicExtensionInit(new Player());
})();