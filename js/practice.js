let currentSong = new Audio
async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/")
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML =response

    let as = div.getElementsByTagName("a")
    let songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1])
        }
    }
    return songs
}

const playMusic = (track)=>{
    currentSong.src = "/songs/" + track
    currentSong.play()
    play.src = "svgs/pause.svg"
}

async function main() {
    let songs = await getSongs()
    console.log(songs)
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="svgs/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20" , " ")}div>
                                <div>NFAK</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="svgs/play.svg" alt="">
                            </div>  </li>`
    }
    play.addEventListner("click", ()=>{
        if (currentSong.paused) {
            currentSong.play()
            play.src = "svgs/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "svgs/play.svg"
        }
    })
}
main()