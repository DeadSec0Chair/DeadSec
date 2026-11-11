const $ = (s) => document.querySelector(s);
const input = $("#command-input");
const historyBox = $("#history");
const toast = $("#toast");
const discordNotification = $("#discord-notification");
const notificationBell = $("#notification-bell");
let commandHistory = [];
let historyIndex = 0;
let demoVisits = Number(sessionStorage.getItem("deadsec_demo_visits") || 1284);
demoVisits += 1;
sessionStorage.setItem("deadsec_demo_visits", demoVisits);
$("#visitors").textContent = demoVisits.toLocaleString();

function tick(){
  const now = new Date();
  $("#clock").textContent = now.toLocaleTimeString([], {hour12:false});
  const date = $("#date");
  date.textContent = now.toLocaleDateString([], {day:"2-digit", month:"2-digit", year:"numeric"});
  date.dateTime = now.toISOString().slice(0, 10);
}
tick(); setInterval(tick,1000);

const tracks = [
  {name: "SANYA TEKK", src: "SANYA TEKK .mp3"},
  {name: "Её парень", src: "Её парень.mp3"}
];
const audioPlayer = $("#audio-player");
const trackName = $("#track-name");
let currentTrack = 0;

function loadTrack(index){
  currentTrack = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrack];
  audioPlayer.src = new URL(track.src, document.baseURI).href;
  trackName.textContent = track.name;
}
function updatePlayButton(){
  const playToggle = $("#play-toggle");
  const playing = !audioPlayer.paused;
  playToggle.textContent = playing ? "Ⅱ" : "▶";
  playToggle.setAttribute("aria-label", playing ? "Pause music" : "Play music");
  playToggle.title = playing ? "Pause music" : "Play music";
}
async function toggleMusic(){
  if(audioPlayer.paused){
    try { await audioPlayer.play(); }
    catch { notify("Unable to play this track."); }
  } else audioPlayer.pause();
  updatePlayButton();
}
loadTrack(0);
audioPlayer.volume = Number($("#volume-control").value);
audioPlayer.addEventListener("play", updatePlayButton);
audioPlayer.addEventListener("pause", updatePlayButton);
audioPlayer.addEventListener("ended", ()=>loadTrack(currentTrack + 1));
audioPlayer.play().catch(updatePlayButton);
$("#play-toggle").addEventListener("click", toggleMusic);
$("#previous-track").addEventListener("click", ()=>loadTrack(currentTrack - 1));
$("#next-track").addEventListener("click", ()=>loadTrack(currentTrack + 1));
$("#volume-control").addEventListener("input", event=>{ audioPlayer.volume = Number(event.target.value); });

const workspacePanels = document.querySelectorAll("[data-workspace-panel]");
let currentWorkspace = "1";
let workspaceScrollLock = false;
function setWorkspace(id){
  if(!["1", "2", "3"].includes(id)) return;
  const previousWorkspace = currentWorkspace;
  const direction = Number(id) >= Number(previousWorkspace) ? "workspace-slide-forward" : "workspace-slide-backward";
  currentWorkspace = id;
  document.querySelectorAll(".workspace").forEach(item=>item.classList.toggle("active", item.dataset.workspace === id));
  workspacePanels.forEach(panel=>{
    panel.hidden = panel.dataset.workspacePanel !== id;
    panel.classList.remove("workspace-slide-forward", "workspace-slide-backward");
    if(!panel.hidden && id !== previousWorkspace){
      void panel.offsetWidth;
      panel.classList.add(direction);
    }
  });
  document.body.classList.toggle("htb-active", id === "2");
}
document.querySelectorAll(".workspace").forEach(workspace=>{
  workspace.addEventListener("click", ()=>setWorkspace(workspace.dataset.workspace));
});
setWorkspace(currentWorkspace);

window.addEventListener("wheel", event=>{
  if(event.target.closest("#history")) return;
  if(workspaceScrollLock || Math.abs(event.deltaY) < 24) return;
  event.preventDefault();
  const nextWorkspace = Number(currentWorkspace) + (event.deltaY > 0 ? 1 : -1);
  if(nextWorkspace < 1 || nextWorkspace > 3) return;
  setWorkspace(String(nextWorkspace));
  workspaceScrollLock = true;
  setTimeout(()=>{ workspaceScrollLock = false; }, 550);
}, {passive:false});

let notificationTimer;
function showDiscordNotification(){
  clearTimeout(notificationTimer);
  discordNotification.classList.remove("show");
  void discordNotification.offsetWidth;
  discordNotification.classList.add("show");
  notificationTimer = setTimeout(()=>discordNotification.classList.remove("show"), 15000);
}
setTimeout(showDiscordNotification, 700);
notificationBell.addEventListener("click", showDiscordNotification);
$("#notification-close").addEventListener("click", ()=>{
  clearTimeout(notificationTimer);
  discordNotification.classList.remove("show");
});

function notify(message){
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(notify.timer); notify.timer = setTimeout(()=>toast.classList.remove("show"),1800);
}
function addLine(html, cls=""){
  const div=document.createElement("div"); div.className="history-entry "+cls; div.innerHTML=html; historyBox.appendChild(div);
  requestAnimationFrame(()=>{
    historyBox.scrollTo({top: historyBox.scrollHeight, behavior: "smooth"});
    $("#terminal").scrollTo({top: $("#terminal").scrollHeight, behavior: "smooth"});
  });
}
function promptLine(cmd){
  addLine(`<span class="prompt">➜</span> <span class="path">~</span> <span style="color:#e1e9e5"></span>${escapeHtml(cmd)}`);
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
const links = {
  github: "https://github.com/deadsec0chair",
  discord: "https://discord.com/users/1238573706268114975",
  email: "mailto:deadsec069@proton.me"
};
const commands = {
  help: () => `<span class="out-title">Available commands</span>\n  <span class="out-title">about</span>       whoami / about me\n  <span class="out-title">projects</span>    view selected projects\n  <span class="out-title">github</span>      copy GitHub profile link\n  <span class="out-title">socials</span>     show social links\n  <span class="out-title">contact</span>     contact information\n  <span class="out-title">neofetch</span>    show system info\n  <span class="out-title">clear</span>       clear terminal\n  <span class="out-title">help</span>        show this message`,
  about: () => `<span class="out-title">About me</span>\nI'm deadsec — a cybersecurity student from Egypt.\nInto Linux, privacy, networking, and learning how things work.\n<span class="out-muted">Currently exploring: Linux • CTFs • Web development</span>`,
  projects: () => `<span class="out-title">Projects</span>\n<span class="out-muted">01.</span> 1FileCompiler — a small file compiler project\n<span class="out-muted">02.</span> More experiments coming soon...\n\n<span class="out-muted">Tip: replace these demo entries with your real repositories.</span>`,
  github: () => copyText(links.github, "GitHub URL copied to clipboard."),
  socials: () => `<span class="out-title">Social links</span>\nGitHub   <a href="${links.github}" target="_blank" rel="noreferrer">github.com/deadsec0chair</a> <button class="copy-link" data-copy="${links.github}">copy</button>\nDiscord  <a href="${links.discord}" target="_blank" rel="noreferrer">discord.com</a> <button class="copy-link" data-copy="${links.discord}">copy</button>`,
  contact: () => `<span class="out-title">Contact</span>\nEmail: <a href="${links.email}">deadsec069@proton.me</a>\n<span class="out-muted">Replace this placeholder with your public contact address.</span>`,
  neofetch: () => `<span class="out-title">deadsec@website</span>\nOS: DeadSec Web x86_64\nShell: zsh 5.9\nWM: Hyprland\nTheme: Midnight / Minimal\nVisitors: ${demoVisits.toLocaleString()} <span class="out-muted">(demo)</span>`,
  whoami: () => "deadsec",
  date: () => new Date().toString(),
  clear: () => { historyBox.innerHTML=""; return null; }
};
async function copyText(value,message){
  try { await navigator.clipboard.writeText(value); notify(message); return `<span class="out-title">Copied:</span> ${escapeHtml(value)}`; }
  catch { return `Clipboard permission unavailable. Open this site on localhost or HTTPS, then try again.\n${escapeHtml(value)}`; }
}
async function runCommand(raw){
  const cmd=raw.trim(); if(!cmd)return;
  promptLine(cmd);
  commandHistory.push(cmd); historyIndex=commandHistory.length;
  const [name,...args]=cmd.split(/\s+/); const action=commands[name.toLowerCase()];
  if(!action){addLine(`<span style="color:#e59b9b">zsh: command not found: ${escapeHtml(name)}</span>\n<span class="out-muted">Try 'help' to see available commands.</span>`);return;}
  const result=await action(args);
  if(result!==null && result!==undefined) addLine(result);
}
$("#command-form").addEventListener("submit",e=>{e.preventDefault();const value=input.value;input.value="";runCommand(value);});
document.addEventListener("click",e=>{
  const commandButton=e.target.closest("[data-cmd]");
  if(commandButton){runCommand(commandButton.dataset.cmd);input.focus();return;}
  const copyButton=e.target.closest("[data-copy]");
  if(copyButton){copyText(copyButton.dataset.copy,"Link copied to clipboard.");}
});
input.addEventListener("keydown",e=>{
  if(e.key==="ArrowUp"){e.preventDefault();historyIndex=Math.max(0,historyIndex-1);input.value=commandHistory[historyIndex]||"";}
  if(e.key==="ArrowDown"){e.preventDefault();historyIndex=Math.min(commandHistory.length,historyIndex+1);input.value=commandHistory[historyIndex]||"";}
});
