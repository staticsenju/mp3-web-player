<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>
<!--
  MP3 Web Player
  If this helped you, a ⭐ is appreciated.
  Open issues for bugs / enhancements.
-->

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/staticsenju/mp3-web-player">
    <img src="https://media.istockphoto.com/id/1136912208/vector/mp3-icon-black-vector-icon.jpg?s=612x612&w=0&k=20&c=aVGmcZXqmE-FRH2QWVWFCBx3YcFHv9g20J6zoBgbBns=" alt="Logo" width="90" height="90">
  </a>

  <h3 align="center">MP3 Web Player</h3>

  <p align="center">
    A lightweight, privacy‑friendly, local-only web music player (no uploads).
    <br />
    <a href="https://staticsenju.github.io/mp3-web-player/"><strong>Open Live Demo »</strong></a>
    <br /><br />
    <a href="https://github.com/staticsenju/mp3-web-player">View Code</a>
    &middot;
    <a href="https://github.com/staticsenju/mp3-web-player/issues/new?labels=bug&title=%5BBUG%5D%3A+">Report Bug</a>
    &middot;
    <a href="https://github.com/staticsenju/mp3-web-player/issues/new?labels=enhancement&title=%5BFEATURE%5D%3A+">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#keyboard-shortcuts">Keyboard Shortcuts</a></li>
    <li><a href="#data--privacy">Data & Privacy</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#faq">FAQ</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

[![mpe3web][product-screenshot](https://staticsenju.github.io/mp3-web-player/)

MP3 Web Player is a single‑page, dependency‑light audio player that runs entirely in your browser.  
Load individual files or a full folder: it extracts metadata (tags + embedded artwork), locates sidecar cover images, builds a playlist, and gives you shuffle, repeat, favorites, and an optional dynamic artwork background. No server, no tracking.

Why:
* Instantly preview folders without installing a desktop app
* Keep playback private and local
* Minimal footprint (plain HTML/CSS/JS)
* Playground for browser APIs (File System Access, Battery API fallback)

### Built With

* Vanilla HTML / CSS / JavaScript
* [File System Access API](https://developer.mozilla.org/docs/Web/API/File_System_Access_API) (progressive enhancement)
* [`jsmediatags`](https://github.com/aadsm/jsmediatags) for metadata & embedded artwork
* LocalStorage (preferences & favorites)
* Native browser media decoding

_No frameworks, no bundler, no transpiler._


### Installation

```sh
git clone https://github.com/staticsenju/mp3-web-player.git
cd mp3-web-player
# Option A: double-click index.html
# Option B (recommended for folder import reliability):
python -m http.server 5173
# Visit http://localhost:5173
```

Click “Import” → choose “Select Files” or “Browse Folder”. Press play.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
## Usage

1. Import menu:
   * Select Files – multi‑select audio files
   * Browse Folder – recursive (modern browsers)
   * Legacy Folder – fallback using `webkitdirectory`
2. Playlist auto-populates (filename ordering)
3. Click track or use Next/Prev buttons
4. Heart icon = favorite
5. Options (… menu) toggles Dynamic Background

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

| Category | Detail |
|----------|--------|
| Formats | mp3, m4a, aac, ogg, opus, wav, flac (depends on browser) |
| Metadata | Title, artist, album via tags (where present) |
| Artwork | Embedded + sidecar (`cover.*`, `folder.*`, `album.*`) |
| Background | Cross‑fade dynamic blurred art (toggle) |
| Playback | Play/Pause, seek, shuffle, repeat (off/all/one) |
| Favorites | Saved locally |
| Mobile | Playlist overlay |
| Performance | No network except optional metadata script CDN |
| Fallbacks | Graceful when APIs unsupported |
| Privacy | Fully local; no uploads |

### Artwork Selection Order
1. Embedded artwork (if found)
2. Sidecar: `cover.*` > `folder.*` > `album.*`
3. Neutral background if none

### Stored Keys
| Key | Purpose |
|-----|---------|
| `mp3player_favorites` | Track ID set |
| `mp3player_dynamic_bg` | Boolean preference |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play / Pause |
| ← / → | Seek -5s / +5s |
| S | Toggle Shuffle |
| R | Cycle Repeat (Off → All → One → Off) |
| F | Favorite current track |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Data & Privacy

All processing is in‑browser. Audio file contents never leave your machine.  
Only minimal preferences + favorites stored in LocalStorage.  
No analytics, tracking pixels, or remote calls (besides `jsmediatags` CDN unless self-hosted).

Self‑host `jsmediatags`:
1. Download minified file
2. Place in `vendor/jsmediatags.min.js`
3. Update `<script>` reference in `index.html`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [x] Folder import
- [x] Embedded + sidecar artwork
- [x] Dynamic artwork background
- [x] Favorites persistence
- [x] Mobile overlay playlist
- [ ] Drag & drop import
- [ ] Track search/filter
- [ ] Playlist persistence (with file handle permissions)
- [ ] Reorder / manual queue
- [ ] Playback speed control
- [ ] Visualizer (spectrum/waveform)
- [ ] PWA manifest / offline shell

See [open issues][issues-url] for current discussions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

1. Fork
2. Branch: `git checkout -b feature/thing`
3. Commit: `git commit -m "Add thing"`
4. Push: `git push origin feature/thing`
5. Open Pull Request

Prefer small, focused changes. Avoid heavy dependencies unless justified.

### Contributors
<a href="https://github.com/staticsenju/mp3-web-player/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=staticsenju/mp3-web-player" alt="Contributors" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License.  
See the [LICENSE](LICENSE) file for details.

## FAQ

**Does it upload my music?**  
No. Files are only read locally.

**Some files don’t appear/play?**  
Browser codec support may be missing.

**Folder import button disabled?**  
Your browser lacks `showDirectoryPicker()` or the context isn’t secure (`file://`). Serve locally.

**Why no playlist persistence?**  
Intentional until a clean UX for re‑granting access is added.

**Dynamic background laggy?**  
Disable it in the options (… menu).

**Battery indicator odd?**  
If Battery API unsupported, a simulated value is displayed; if it annoys you feel free to go into script.js and disable it.


[contributors-shield]: https://img.shields.io/github/contributors/staticsenju/mp3-web-player.svg?style=for-the-badge
[contributors-url]: https://github.com/staticsenju/mp3-web-player/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/staticsenju/mp3-web-player.svg?style=for-the-badge
[forks-url]: https://github.com/staticsenju/mp3-web-player/network/members
[stars-shield]: https://img.shields.io/github/stars/staticsenju/mp3-web-player.svg?style=for-the-badge
[stars-url]: https://github.com/staticsenju/mp3-web-player/stargazers
[issues-shield]: https://img.shields.io/github/issues/staticsenju/mp3-web-player.svg?style=for-the-badge
[issues-url]: https://github.com/staticsenju/mp3-web-player/issues
[license-shield]: https://img.shields.io/github/license/staticsenju/mp3-web-player.svg?style=for-the-badge
[license-url]: https://github.com/staticsenju/mp3-web-player/blob/main/LICENSE
[product-screenshot]: https://github.com/staticsenju/mp3-web-player/blob/main/cover.png?raw=true
