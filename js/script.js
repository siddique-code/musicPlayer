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
  let a = await fetch(`./${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  // Use the newly created div to get <a> elements from the fetched HTML
  let as = div.getElementsByTagName("a");
  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

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
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "svgs/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`./songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let url = new URL(e.href);
      let pathParts = url.pathname.split("/").filter(Boolean); // removes empty strings
      let folder = pathParts[pathParts.length - 1]; // last segment

      // skip if not a valid folder
      if (!folder || folder === "songs") continue;

      console.log("Folder:", folder);

      //Get the metadata of the folder
      let a = await fetch(`./songs/${folder}/info.json`);
      let response = await a.json();
      console.log("Response:", response);

      console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="50" fill="green" />
                                <polygon points="40,30 70,50 40,70" fill="black" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
    }
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
  //Get the list of all the songs
  await getSongs("songs/ncs");
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
    console.log("previous clicked");
    console.log(currentSong);
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  //Add an event listener to next
  next.addEventListener("click", () => {
    console.log("next clicked");
    console.log(currentSong);
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
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
