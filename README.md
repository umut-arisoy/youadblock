# YouTube Ad Cleaner

This is a minimal Chrome Manifest V3 extension focused on reducing YouTube ads by:

- hiding common banner and overlay ad containers
- clicking visible skip buttons automatically
- muting and accelerating detected ad playback

## Install

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `chrome-youtube-adblock` folder

## Files

- `manifest.json`: extension definition
- `content.js`: YouTube page logic
- `styles.css`: hides common ad UI containers
