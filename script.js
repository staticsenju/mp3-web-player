const multiFileInput = document.getElementById("multi-file-input"),
  legacyDirInput = document.getElementById("legacy-dir-input"),
  legacyDirLabel = document.getElementById("legacy-dir-label"),
  browseFolderBtn = document.getElementById("browse-folder-btn"),
  supportNote = document.getElementById("support-note"),
  playBtn = document.getElementById("play-btn"),
  playIcon = document.getElementById("play-icon"),
  pauseIcon = document.getElementById("pause-icon"),
  prevBtn = document.getElementById("prev-btn"),
  nextBtn = document.getElementById("next-btn"),
  shuffleBtn = document.getElementById("shuffle-btn"),
  repeatBtn = document.getElementById("repeat-btn"),
  repeatModeIndicator = document.getElementById("repeat-mode-indicator"),
  progressContainer = document.getElementById("progress-container"),
  progressBar = document.getElementById("progress-bar"),
  currentTimeEl = document.getElementById("current-time"),
  remainingTimeEl = document.getElementById("remaining-time"),
  titleEl = document.getElementById("track-title"),
  artistEl = document.getElementById("track-artist"),
  albumEl = document.getElementById("track-album"),
  artworkImg = document.getElementById("artwork"),
  artworkFallback = document.getElementById("artwork-fallback"),
  favoriteBtn = document.getElementById("favorite-btn"),
  playlistDesktop = document.getElementById("playlist"),
  playlistMobile = document.getElementById("playlist-mobile"),
  togglePlaylistBtn = document.getElementById("toggle-playlist-btn"),
  playlistOverlay = document.getElementById("playlist-overlay"),
  closeOverlayBtn = document.getElementById("close-overlay-btn"),
  bgLayer0 = document.getElementById("bg-layer-0"),
  bgLayer1 = document.getElementById("bg-layer-1"),
  batteryFill = document.getElementById("battery-fill"),
  batteryPercent = document.getElementById("battery-percent"),
  batteryBolt = document.getElementById("battery-bolt"),
  batteryShell = document.getElementById("battery-icon"),
  importBtn = document.getElementById("import-btn"),
  importMenu = document.getElementById("import-menu"),
  selectFilesItem = document.getElementById("menu-select-files"),
  browseFolderItem = document.getElementById("menu-browse-folder"),
  legacyFolderItem = document.getElementById("menu-legacy-folder"),
  moreBtn = document.getElementById("more-btn"),
  optionsMenu = document.getElementById("options-menu"),
  dynBgToggleBtn = document.getElementById("toggle-dyn-bg-btn"); 

let audio = new Audio,
  playlist = [],
  currentIndex = 0,
  isPlaying = false,
  isShuffle = false,
  repeatMode = "off",
  favorites = loadFavorites(),
  imageSidecars = {},
  sidecarObjectURLs = [],
  activeBgIndex = 0,
  fakeBattery = 100,
  fakeBatteryTimer = null,
  realBattery = null;

const AUDIO_EXT_RE = /\.(mp3|m4a|aac|wav|ogg|opus|flac)$/i;
const DYN_BG_KEY = "mp3player_dynamic_bg";

function loadDynamicBgPreference(){
  const v = localStorage.getItem(DYN_BG_KEY);
  return v === null ? true : v === "true";
}

let dynamicBackgroundEnabled = loadDynamicBgPreference();
if (dynBgToggleBtn) {
  dynBgToggleBtn.setAttribute("aria-checked", dynamicBackgroundEnabled ? "true" : "false");
}
function loadFavorites() {
  try { return JSON.parse(localStorage.getItem("mp3player_favorites") || "[]") } catch { return [] }
}
function saveFavorites() {
  localStorage.setItem("mp3player_favorites", JSON.stringify(favorites))
}

function adjustViewportHeightVar() {
  document.documentElement.style.setProperty("--app-vh", window.innerHeight + "px")
}
adjustViewportHeightVar();
window.addEventListener("resize", adjustViewportHeightVar);
window.addEventListener("orientationchange", () => setTimeout(adjustViewportHeightVar, 300));

function formatTime(t) {
  if (isNaN(t)) return "0:00";
  const e = Math.floor(t / 60),
    a = Math.floor(t % 60).toString().padStart(2, "0");
  return `${e}:${a}`
}

function updateProgress() {
  if (!audio.duration) return;
  progressBar.style.width = audio.currentTime / audio.duration * 100 + "%";
  currentTimeEl.textContent = formatTime(audio.currentTime);
  remainingTimeEl.textContent = "-" + formatTime((audio.duration - audio.currentTime) || 0);
}

function setPlayingUI(t) {
  isPlaying = t;
  playIcon.classList.toggle("hidden", t);
  pauseIcon.classList.toggle("hidden", !t);
}

function togglePlay() { isPlaying ? pauseCurrent() : playCurrent(); }
function playCurrent() { audio.play().then(() => setPlayingUI(true)).catch(()=>{}); }
function pauseCurrent() { audio.pause(); setPlayingUI(false); }

function getCurrentTrack() { return playlist[currentIndex]; }

function applyTrackMeta(t) {
  titleEl.textContent = t.title || t.file?.name?.replace(/\.[^.]+$/, "") || "Unknown";
  artistEl.textContent = t.artist || (t.title ? "Unknown Artist" : "");
  albumEl.textContent = t.album || "";
}

function averageColorFromImage(img){
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const ctx = c.getContext("2d");
    ctx.drawImage(img,0,0,32,32);
    const d = ctx.getImageData(0,0,32,32).data;
    let r=0,g=0,b=0,n=0;
    for (let i=0;i<d.length;i+=4){ r+=d[i]; g+=d[i+1]; b+=d[i+2]; n++; }
    return { r:Math.round(r/n), g:Math.round(g/n), b:Math.round(b/n) };
  } catch { return { r:40,g:40,b:40 }; }
}

function buildBackgroundString(url, col){
  if(!url) return "#202228";
  col ||= { r:60,g:60,b:60 };
  const grad = `linear-gradient(135deg, rgba(${col.r},${col.g},${col.b},0.55), rgba(${(col.r+60)%255}, ${(col.g+60)%255}, ${(col.b+60)%255},0.50))`;
  return `${grad}, url("${url}") center/cover no-repeat`;
}

function crossfadeBackground(url){
  const targetIndex = 1 - activeBgIndex;
  const layerIn = targetIndex === 0 ? bgLayer0 : bgLayer1;
  const layerOut = activeBgIndex === 0 ? bgLayer0 : bgLayer1;
  if(!url){
    layerIn.style.background = "#202228";
    requestAnimationFrame(()=>{
      layerOut.classList.remove("active");
      layerIn.classList.add("active");
      activeBgIndex = targetIndex;
    });
    return;
  }
  const img = new Image;
  img.onload = () => {
    const avg = averageColorFromImage(img);
    layerIn.style.background = buildBackgroundString(url, avg);
    requestAnimationFrame(()=>{
      layerOut.classList.remove("active");
      layerIn.classList.add("active");
      activeBgIndex = targetIndex;
    });
  };
  img.src = url;
}

function randomGradient(){
  return `linear-gradient(135deg, hsl(${360*Math.random()},55%,40%), hsl(${360*Math.random()},50%,25%))`;
}

function blobURLFromPicture(p){
  if(!p || !p.data) return null;
  try {
    const data = p.data instanceof Uint8Array ? p.data : new Uint8Array(p.data);
    const blob = new Blob([data], { type: p.format || "image/jpeg" });
    return { url: URL.createObjectURL(blob), blob };
  } catch { return null; }
}

function markFavoriteState(){
  const track = getCurrentTrack();
  const isFav = track && favorites.includes(track.id);
  favoriteBtn.classList.toggle("favorited", isFav);
  favoriteBtn.setAttribute("aria-pressed", isFav ? "true" : "false");
}

function buildPlaylistUI(){
  [playlistDesktop, playlistMobile].forEach(container=>{
    if(!container) return;
    container.innerHTML = "";
    playlist.forEach((t,i)=>{
      const div = document.createElement("div");
      div.className = "playlist-item" + (i===currentIndex ? " active":"");
      div.textContent = t.title || t.file.name;
      div.title = t.file.name;
      div.addEventListener("click", ()=>{
        currentIndex = i;
        loadTrack(i, true);
        playCurrent();
        if (!window.matchMedia("(min-width:900px)").matches) hidePlaylistOverlay();
      });
      container.appendChild(div);
    });
  });
}

function refreshPlaylistActive(){
  [...playlistDesktop.children].forEach((el,i)=>el.classList.toggle("active", i===currentIndex));
  [...playlistMobile.children].forEach((el,i)=>el.classList.toggle("active", i===currentIndex));
}

function applyArtwork(track){
  if(track._prevAppliedArtwork && track._prevAppliedArtwork !== track.artworkURL && track._prevAppliedArtwork.startsWith("blob:")){
    URL.revokeObjectURL(track._prevAppliedArtwork);
  }
  let src = track.artworkURL || track.sidecarURL;
  if(src){
    artworkImg.src = src;
    artworkImg.classList.remove("hidden");
    artworkFallback.classList.add("hidden");
    if(dynamicBackgroundEnabled) crossfadeBackground(src); else crossfadeBackground(null);
    track._prevAppliedArtwork = src;
  } else {
    artworkImg.src = "";
    artworkImg.classList.add("hidden");
    artworkFallback.classList.remove("hidden");
    crossfadeBackground(dynamicBackgroundEnabled ? null : null);
  }
}

function loadTrack(i, userInitiated=false){
  const t = playlist[i];
  if(!t) return;
  audio.src = t.objectURL;
  applyTrackMeta(t);
  applyArtwork(t);
  markFavoriteState();
  refreshPlaylistActive();
  if(!userInitiated) setPlayingUI(false);
}

function nextTrack(fromEnded=false){
  if(repeatMode === "one" && fromEnded){
    audio.currentTime = 0;
    return playCurrent();
  }
  if(isShuffle && playlist.length>1){
    let n;
    do n = Math.floor(Math.random()*playlist.length); while (n===currentIndex);
    currentIndex = n;
  } else if(++currentIndex >= playlist.length){
    if(repeatMode !== "all"){
      currentIndex = playlist.length - 1;
      return pauseCurrent();
    }
    currentIndex = 0;
  }
  loadTrack(currentIndex);
  playCurrent();
}

function prevTrack(){
  if(audio.currentTime > 5){
    audio.currentTime = 0;
    return;
  }
  if(isShuffle && playlist.length>1){
    currentIndex = Math.floor(Math.random()*playlist.length);
  } else {
    currentIndex = Math.max(0, currentIndex - 1);
  }
  loadTrack(currentIndex);
  playCurrent();
}

function showPlaylistOverlay(){ playlistOverlay.classList.remove("hidden"); }
function hidePlaylistOverlay(){ playlistOverlay.classList.add("hidden"); }

function browseFolder(){
  window.showDirectoryPicker().then(async dir=>{
    const gathered = [];
    await recurseDirectory(dir, gathered);
    if(gathered.length) addFilesToPlaylist(gathered);
  }).catch(err=>{
    if(err.name !== "AbortError"){
      supportNote.textContent = "Unable to open folder (permission or unsupported). Use other buttons."
    }
  });
}

async function recurseDirectory(dir, out, prefix=""){
  for await (const entry of dir.values()){
    if(entry.kind === "file"){
      try {
        const f = await entry.getFile();
        f._fullPath = prefix + entry.name;
        out.push(f);
      } catch {}
    } else if(entry.kind === "directory"){
      await recurseDirectory(entry, out, prefix + entry.name + "/");
    }
  }
}

function browserCanLikelyPlay(name){
  switch(name.split(".").pop().toLowerCase()){
    case "mp3": return !!audio.canPlayType("audio/mpeg");
    case "m4a":
    case "aac": return !!audio.canPlayType("audio/aac") || !!audio.canPlayType("audio/mp4");
    case "ogg":
    case "opus": return !!audio.canPlayType("audio/ogg; codecs=opus") || !!audio.canPlayType("audio/ogg");
    case "wav": return !!audio.canPlayType("audio/wav");
    case "flac": return !!audio.canPlayType("audio/flac") || !!audio.canPlayType("audio/x-flac");
    default: return false;
  }
}

function addFilesToPlaylist(files){
  revokeSidecars();
  playlist.forEach(t=>URL.revokeObjectURL(t.objectURL));
  playlist = [];
  imageSidecars = {};
  sidecarObjectURLs = [];
  currentIndex = 0;

  const audioFiles = [], imageFiles = [];
  [...files].forEach(f=>{
    const lower = f.name.toLowerCase();
    const isAudio = f.type.startsWith("audio/") || (f.type==="" && AUDIO_EXT_RE.test(lower));
    if(isAudio && AUDIO_EXT_RE.test(lower)){
      if(browserCanLikelyPlay(f.name)) audioFiles.push(f);
    } else if(/\.(jpe?g|png|webp)$/i.test(lower)){
      imageFiles.push(f);
    }
  });

  audioFiles.sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
  imageFiles.sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));

  imageFiles.forEach(f=>{
    const full = f.webkitRelativePath || f._fullPath || f.name;
    const dir = full.split("/").slice(0,-1).join("/") + "/";
    imageSidecars[dir] || (imageSidecars[dir] = {});
    const nameL = f.name.toLowerCase();
    const score = /^(cover|folder|album)\./.test(nameL) ? 1 : 2;
    if(!imageSidecars[dir].best || score < imageSidecars[dir].best.score){
      const url = URL.createObjectURL(f);
      sidecarObjectURLs.push(url);
      imageSidecars[dir].best = { score, url, file:f };
    }
  });

  audioFiles.forEach(f=>{
    const full = f.webkitRelativePath || f._fullPath || f.name;
    const dir = full.split("/").slice(0,-1).join("/") + "/";
    const objectURL = URL.createObjectURL(f);
    const id = full;
    const track = {
      id,
      file:f,
      objectURL,
      title:f.name.replace(/\.[^.]+$/,""),
      artist:"",
      album:"",
      artworkURL:null,
      sidecarURL:imageSidecars[dir]?.best?.url || null,
      fallbackGradient:randomGradient(),
      _dirPath:dir,
      _prevAppliedArtwork:null
    };
    playlist.push(track);
    extractTags(track);
  });
  buildPlaylistUI();
  loadTrack(0);
}

function extractTags(track){
  if(!window.jsmediatags) return;
  try {
    window.jsmediatags.read(track.file,{
      onSuccess: res=>{
        const tags = res.tags||{};
        track.title = tags.title || track.title;
        track.artist = tags.artist || "";
        track.album = tags.album || "";
        if(tags.picture){
          const img = blobURLFromPicture(tags.picture);
            if(img && img.url){
              if(track.artworkURL && track.artworkURL.startsWith("blob:")) URL.revokeObjectURL(track.artworkURL);
              track.artworkURL = img.url;
            }
        }
        if(playlist[currentIndex] === track){
          applyTrackMeta(track);
          applyArtwork(track);
        }
        buildPlaylistUI();
      },
      onError:()=>{}
    });
  } catch {}
}

function updateClock(){
  const d = new Date;
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2,"0");
  const c = document.getElementById("clock");
  if(c) c.textContent = `${h}:${m}`;
}

/* Battery logic (unchanged except display function) */
function startFakeBattery(){
  stopFakeBattery();
  fakeBatteryTimer = setInterval(()=>{
    fakeBattery = Math.max(0.05, fakeBattery - 0.5*Math.random());
    updateBatteryDisplay(fakeBattery, false, false);
  },6000);
}
function stopFakeBattery(){ if(fakeBatteryTimer){ clearInterval(fakeBatteryTimer); fakeBatteryTimer=null; } }

function updateBatteryDisplay(level, charging){
  if(!batteryFill || !batteryPercent) return;
  if(typeof level !== "number"){
    batteryPercent.textContent = "—";
    batteryFill.setAttribute("width",0);
    return;
  }
  const w = Math.round(18 * Math.min(1, Math.max(0, level)));
  batteryFill.setAttribute("width", w);
  batteryPercent.textContent = Math.round(level*100) + "%";
  batteryShell.classList.toggle("charging", !!charging);
  batteryBolt.style.display = charging ? "inline" : "none";
  let color = "currentColor";
  batteryShell.classList.remove("low");
  if(charging){
    color = "#37d063";
  } else if(level < 0.15){
    color = "#ff4d4f";
    batteryShell.classList.add("low");
  } else if(level < 0.35){
    color = "#ffb347";
  }
  batteryFill.setAttribute("fill", color);
  batteryFill.style.opacity = level < .07 ? .4 : 1;
}

function initBattery(){
  if(!("getBattery" in navigator)){
    batteryPercent.textContent = "—";
    startFakeBattery();
    return;
  }
  navigator.getBattery().then(b=>{
    realBattery = b;
    stopFakeBattery();
    const upd = ()=> updateBatteryDisplay(b.level, b.charging);
    upd();
    ["levelchange","chargingchange"].forEach(ev=>b.addEventListener(ev,upd));
  }).catch(()=>{
    batteryPercent.textContent = "—";
    startFakeBattery();
  });
}

function revokeSidecars(){
  sidecarObjectURLs.forEach(u=>URL.revokeObjectURL(u));
  sidecarObjectURLs = [];
}

/* EVENT LISTENERS */
playBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", prevTrack);
nextBtn.addEventListener("click", ()=>nextTrack(false));
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("ended", ()=>nextTrack(true));

progressContainer.addEventListener("click", e=>{
  if(!audio.duration) return;
  const rect = progressContainer.getBoundingClientRect();
  audio.currentTime = (e.clientX - rect.left)/rect.width * audio.duration;
});

shuffleBtn.addEventListener("click", ()=>{
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});
repeatBtn.addEventListener("click", ()=>{
  repeatMode = repeatMode==="off" ? "all" : repeatMode==="all" ? "one" : "off";
  repeatBtn.dataset.mode = repeatMode==="off" ? "" : repeatMode;
  repeatBtn.classList.toggle("active", repeatMode!=="off");
  repeatModeIndicator.textContent = repeatMode==="one" ? "1" : "";
});

favoriteBtn.addEventListener("click", ()=>{
  const t = getCurrentTrack();
  if(!t) return;
  const idx = favorites.indexOf(t.id);
  if(idx>=0) favorites.splice(idx,1); else favorites.push(t.id);
  saveFavorites();
  markFavoriteState();
});

/* Dynamic background toggle */
dynBgToggleBtn?.addEventListener("click", () => {
  dynamicBackgroundEnabled = !dynamicBackgroundEnabled;
  localStorage.setItem(DYN_BG_KEY, dynamicBackgroundEnabled);
  dynBgToggleBtn.setAttribute("aria-checked", dynamicBackgroundEnabled ? "true":"false");
  const current = getCurrentTrack();
  if (dynamicBackgroundEnabled && current && (current.artworkURL || current.sidecarURL)) {
    crossfadeBackground(current.artworkURL || current.sidecarURL);
  } else {
    crossfadeBackground(null);
  }
});

/* ---------------------- IMPORT MENU (unchanged behavior) ---------------------- */
function toggleImportMenu(){
  importMenu.classList.toggle("hidden");
  if(!importMenu.classList.contains("hidden")) {
    closeOptionsMenu();
  }
}
importBtn?.addEventListener("click",(e)=>{
  e.stopPropagation();
  toggleImportMenu();
});

/* ---------------------- OPTIONS MENU (viewport-safe) ---------------------- */
function openOptionsMenu(){
  if(!optionsMenu) return;
  importMenu?.classList.add("hidden");
  optionsMenu.classList.remove("hidden");
  moreBtn.setAttribute("aria-expanded","true");
  requestAnimationFrame(()=>{
    positionOptionsMenu();
    requestAnimationFrame(()=>positionOptionsMenu());
  });
}
function closeOptionsMenu(){
  if(!optionsMenu || optionsMenu.classList.contains("hidden")) return;
  optionsMenu.classList.add("hidden");
  moreBtn.setAttribute("aria-expanded","false");
}
function toggleOptionsMenu(){
  if(optionsMenu.classList.contains("hidden")) openOptionsMenu();
  else closeOptionsMenu();
}
moreBtn?.addEventListener("click",(e)=>{
  e.stopPropagation();
  toggleOptionsMenu();
});

function positionOptionsMenu(){
  if(!optionsMenu || optionsMenu.classList.contains("hidden")) return;
  const margin = 8;
  optionsMenu.style.position = "fixed";
  optionsMenu.style.left = "0px";
  optionsMenu.style.top = "0px";
  optionsMenu.style.visibility = "hidden";
  const btnRect = moreBtn.getBoundingClientRect();
  const menuRect = optionsMenu.getBoundingClientRect();
  let left = btnRect.right - menuRect.width;
  let top  = btnRect.bottom + margin;
  let placement = "bottom";
  if(left < margin) left = btnRect.left;
  if(left + menuRect.width + margin > window.innerWidth){
    left = window.innerWidth - menuRect.width - margin;
  }
  if(left < margin) left = margin;
  if(top + menuRect.height + margin > window.innerHeight){
    const flipTop = btnRect.top - menuRect.height - margin;
    if(flipTop >= margin){
      top = flipTop;
      placement = "top";
    }
  }
  if(top + menuRect.height + margin > window.innerHeight){
    top = window.innerHeight - menuRect.height - margin;
  }
  if(top < margin) top = margin;
  optionsMenu.style.left = left + "px";
  optionsMenu.style.top  = top  + "px";
  optionsMenu.dataset.placement = placement;
  optionsMenu.style.visibility = "visible";
}

["resize","scroll","orientationchange"].forEach(ev=>{
  window.addEventListener(ev, ()=>{
    if(!optionsMenu.classList.contains("hidden")) positionOptionsMenu();
  }, { passive:true });
});

document.addEventListener("click", ()=>{
  importMenu?.classList.add("hidden");
  closeOptionsMenu();
});

selectFilesItem?.addEventListener("click", ()=>{
  importMenu.classList.add("hidden");
  multiFileInput.click();
});
browseFolderItem?.addEventListener("click", ()=>{
  importMenu.classList.add("hidden");
  if("showDirectoryPicker" in window) browseFolder();
  else supportNote.textContent = "Folder picker not supported.";
});
legacyFolderItem?.addEventListener("click", ()=>{
  importMenu.classList.add("hidden");
  legacyDirInput.click();
});

togglePlaylistBtn?.addEventListener("click", ()=>{
  playlistOverlay.classList.toggle("hidden");
});
closeOverlayBtn?.addEventListener("click", hidePlaylistOverlay);

multiFileInput.addEventListener("change", e=>{
  e.target.files.length && addFilesToPlaylist(e.target.files);
});
legacyDirInput.addEventListener("change", e=>{
  e.target.files.length && addFilesToPlaylist(e.target.files);
});
browseFolderBtn?.addEventListener("click", ()=>{
  if("showDirectoryPicker" in window) browseFolder();
  else supportNote.textContent = "Folder picker not supported; use other options."
});

window.addEventListener("keydown", e=>{
  if(e.target.tagName==="INPUT" && e.target.type!=="range") return;
  switch(e.key){
    case " ":
      e.preventDefault();
      togglePlay();
      break;
    case "ArrowRight":
      audio.currentTime = Math.min(audio.duration||0, audio.currentTime+5);
      break;
    case "ArrowLeft":
      audio.currentTime = Math.max(0, audio.currentTime-5);
      break;
    default:
      const k = e.key.toLowerCase();
      if(k==="s") shuffleBtn.click();
      else if(k==="r") repeatBtn.click();
      else if(k==="f") favoriteBtn.click();
  }
});

audio.addEventListener("error", ()=>{});

updateClock();
setInterval(updateClock, 60000);
initBattery();

(function(){
  const modern = "showDirectoryPicker" in window;
  if(modern){
    supportNote && (supportNote.textContent = "Folder picker enabled.");
    legacyDirLabel?.classList.add("hidden");
  } else {
    supportNote && (supportNote.textContent = "No modern folder picker; use Legacy Folder or Select Files.");
  }
})();

applyTrackMeta({ title:"Select Music", artist:"", album:"" });
if(dynamicBackgroundEnabled) crossfadeBackground(null);

window.addEventListener("unload", ()=>{
  playlist.forEach(t=>{
    URL.revokeObjectURL(t.objectURL);
    if(t.artworkURL && t.artworkURL.startsWith("blob:")) URL.revokeObjectURL(t.artworkURL);
  });
  revokeSidecars();
  stopFakeBattery();
});
