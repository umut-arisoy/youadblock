(() => {
  const SELECTORS_TO_REMOVE = [
    ".ytp-ad-overlay-container",
    ".ytp-ad-overlay-slot",
    ".ytp-ad-image-overlay",
    ".ytd-popup-container tp-yt-paper-dialog:has(.ytd-enforcement-message-view-model)",
    "ytd-display-ad-renderer",
    "ytd-statement-banner-renderer",
    "ytd-ad-slot-renderer",
    "ytm-promoted-sparkles-web-renderer"
  ];

  const SKIP_BUTTON_SELECTORS = [
    ".ytp-ad-skip-button",
    ".ytp-ad-skip-button-modern",
    ".videoAdUiSkipButton",
    "button[aria-label*='Skip']",
    "button[aria-label*='Atla']"
  ];

  const STATE = {
    lastUrl: location.href,
    observer: null
  };

  function removeMatchedNodes(root = document) {
    for (const selector of SELECTORS_TO_REMOVE) {
      root.querySelectorAll(selector).forEach((node) => node.remove());
    }
  }

  function clickSkipButtons(root = document) {
    for (const selector of SKIP_BUTTON_SELECTORS) {
      root.querySelectorAll(selector).forEach((button) => {
        if (button instanceof HTMLElement && button.offsetParent !== null) {
          button.click();
        }
      });
    }
  }

  function forceThroughVideoAds(root = document) {
    const player = root.querySelector(".html5-video-player");
    const video = root.querySelector("video");
    if (!(player instanceof HTMLElement) || !(video instanceof HTMLVideoElement)) {
      return;
    }

    const isAd =
      player.classList.contains("ad-showing") ||
      document.querySelector(".ad-showing") !== null ||
      document.querySelector(".ytp-ad-player-overlay") !== null;

    if (!isAd) {
      if (video.playbackRate !== 1) {
        video.playbackRate = 1;
      }
      return;
    }

    video.muted = true;
    video.playbackRate = 16;

    if (Number.isFinite(video.duration) && video.duration > 0) {
      const remaining = video.duration - video.currentTime;
      if (remaining > 0.75) {
        video.currentTime = Math.max(video.duration - 0.2, video.currentTime);
      }
    }
  }

  function cleanPage(root = document) {
    removeMatchedNodes(root);
    clickSkipButtons(root);
    forceThroughVideoAds(root);
  }

  function installObserver() {
    if (STATE.observer) {
      STATE.observer.disconnect();
    }

    STATE.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element) {
              cleanPage(node);
            }
          });
        }
      }

      cleanPage(document);
    });

    STATE.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });
  }

  function monitorNavigation() {
    setInterval(() => {
      if (STATE.lastUrl !== location.href) {
        STATE.lastUrl = location.href;
        cleanPage(document);
      }
    }, 500);
  }

  function boot() {
    cleanPage(document);
    installObserver();
    monitorNavigation();
    setInterval(() => cleanPage(document), 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
