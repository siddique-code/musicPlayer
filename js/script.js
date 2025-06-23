let currentSong = new Audio();
let songs;
let currFolder;
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const formattedMins = String(mins).padStart(2, "0");
  const formattedSecs = String(secs).padStart(2, "0");

  return `${formattedMins}:${formattedSecs}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`./${folder}/songs.json`);
  songs = await a.json();

  //Show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li><img class="invert" src="svgs/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>NFAK</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="svgs/play.svg" alt="">
                            </div></li>`;
  }

  //Attach an event listener to each song

  Array.from(songUL.getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", () => {
      const track = e.querySelector(".info").firstElementChild.innerHTML;
      playMusic(track);
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `./${currFolder}/` + track;

  if (!pause) {
    currentSong.play();
    play.src = "svgs/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`./songs/index.json`);
  let folders = await a.json();
  let cardContainer = document.querySelector(".cardContainer");

  //Get the metadata of the folder
  for (let folder of folders) {
    let meta = await fetch(`./songs/${folder}/info.json`);
    let response = await meta.json();

    cardContainer.innerHTML =
      cardContainer.innerHTML +
      `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="50" fill="green" />
                                <polygon points="40,30 70,50 40,70" fill="black" />
                            </svg>
                        </div>
                        <img src="./songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
  }

  //Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  const previous = document.getElementById("previous");
  const next = document.getElementById("next");
  const play = document.getElementById("play");

  // Load index.json and first folder
  let a = await fetch("./songs/index.json");
  let folders = await a.json();
  await getSongs(`songs/${folders[0]}`);
  playMusic(songs[0], true);

  //Display all the albums on the page
  displayAlbums();

  //Attach an event listner to previous, play and next
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "svgs/pause.svg";
    } else {
      currentSong.pause();
      play.src = "svgs/play.svg";
    }
  });

  //Listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )} / ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
  //Add an event listener to auto play next
  currentSong.addEventListener("ended", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //Add an event listener for cross
  document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //Add an event listener to previous
  previous.addEventListener("click", () => {
    let currentTrack = decodeURIComponent(currentSong.src.split("/").pop());
    let index = songs.indexOf(currentTrack);
    if (index > 0) {
      playMusic(songs[index - 1]);
    }
  });

  //Add an event listener to next
  next.addEventListener("click", () => {
    let currentTrack = decodeURIComponent(currentSong.src.split("/").pop());
    let index = songs.indexOf(currentTrack);
    if (index !== -1 && index < songs.length - 1) {
      playMusic(songs[index + 1]);
    }
  });

  //Add an event listener to range
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Settimg volume to", e.target.value, "/100");
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  //Add an event listener to mute
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
