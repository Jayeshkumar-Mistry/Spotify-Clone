console.log("Initializing Javascript");
let currentSong = new Audio();
let currentSongIndex;
let currFolder;
let songs = [];
let duration = []

async function getSongs(folder) {
    songs = []
    let a = await fetch(`/songs/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a")


    song = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {

            songs.push(element.href)


        }

    }



    let dur = await getDurations(songs);
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (let i = 0; i < songs.length; i++) {



        let songName = songs[i].split("/")[5].replaceAll("%20", " ").split("-")[0];

        let artist = songs[i].split("/")[5].replaceAll("%20", " ").split("-")[1].trim().replace(".mp3", " ");
        console.log(artist);

        let songduration = dur[i];
        songUL.innerHTML = songUL.innerHTML + `<li>
                <img src="/img/musiclist.svg" alt="musiclist">
                <div class="songinfo">
                   <p>${songName}</p>
                  <p>${artist}</p>
                </div>
                <p>${songduration}</p>
              </li>`;

    }

    //Attaching Event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((element, index) => {
        // element.addEventListener("click",() => playMusic(songs[index]))


        element.addEventListener("click", () => {
            currentSongIndex = index;
            console.log(`Playing song: ${songs[index]}`);
            playMusic(songs[index]);
        });
    });

}

function formatSecondsToMinutes(seconds) {
    // Round the seconds to the nearest integer
    const totalSeconds = Math.round(seconds);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    // Format minutes and seconds with leading zeros
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}




const playMusic = ((track, pause = false) => {
    currentSong.src = track;
    if (!pause) {

        currentSong.play();
        document.querySelector("#play").setAttribute("src", "/img/pause.svg");
    }


    document.querySelector(".songdetails").innerHTML = track.split("/")[5].replaceAll("%20", " ").split("-")[0];


})



async function getDurations(songs) {
    let durations = [];

    for (const element of songs) {
        let aud = new Audio(element);

        // Wrap the duration calculation in a Promise
        const durationPromise = new Promise((resolve, reject) => {
            aud.addEventListener('canplaythrough', function () {
                // Convert duration to minutes and seconds
                let minutes = Math.floor(aud.duration / 60);
                let seconds = Math.floor(aud.duration % 60);
                resolve(`${minutes}:${seconds < 10 ? '0' + seconds : seconds}`);
            });

            aud.addEventListener('error', () => {
                reject("Error loading audio file: " + element);
            });
        });

        // Add the resolved duration to the array
        try {
            let duration = await durationPromise;
            durations.push(duration);
        } catch (error) {
            console.error(error);
        }
    }

    return durations;
}

async function dsiplayAlbum() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = Array.from(div.getElementsByClassName("icon icon-directory"))
    let cardContainer = document.querySelector(".cardcontainer");
    anchors.forEach(async (element) => {
        if ((element.href).includes("/songs")) {
            let folder = element.href.split("/").splice(-1)[0];
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                <img src="/img/playicon.svg" alt="playicon" />
                <img src="/songs/${folder}/cover.jpg" alt="playlistlogo" />
                <h3>${response.title}</h3>
                <h5>${response.description}</h5>
              </div>
              
             
              `

        }

    });



}

async function main() {

    dsiplayAlbum();

    await getSongs("Happy")
    // console.log(songs);
    playMusic(songs[0], true);


    // Add Event listener for each playlist card
    Array.from(document.getElementsByClassName("card")).forEach((card) => {
        card.addEventListener("click", async (e) => {
            await getSongs(e.currentTarget.dataset.folder);

        })

    });



    // Add Event listener for each playlist card play button
    console.log(document.querySelectorAll(".card").forEach((e) => {
        e.firstElementChild.addEventListener("click", (e) => {
            playMusic(songs[0])

        })

    }))


    // Attach an event listener to to play or pause the song
    let play = document.querySelector("#play");

    play.addEventListener("click", function () {
        if (currentSong.paused) {
            play.setAttribute("src", "/img/pause.svg");
            currentSong.play();
        }
        else {
            play.setAttribute("src", "/img/play.svg");
            currentSong.pause();
        }
    })


    // add an event listener for next and previous
    let next = document.querySelector("#next");
    next.addEventListener("click", function () {
        currentSongIndex = songs.indexOf(currentSong.src);
        if (currentSongIndex + 1 < songs.length) {
            playMusic(songs[currentSongIndex + 1]);
        }

    })

    let previous = document.querySelector("#previous");
    previous.addEventListener("click", function () {
        currentSongIndex = songs.indexOf(currentSong.src);
        if (currentSongIndex - 1 >= 0) {
            playMusic(songs[currentSongIndex - 1]);
        }
        console.log(currentSong.src);


    })

    // Add an event listener for Song time 
    currentSong.addEventListener("timeupdate", function () {


        document.querySelector(".songtime").innerHTML = `${formatSecondsToMinutes(currentSong.currentTime)}/${formatSecondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = currentSong.currentTime / currentSong.duration * 100 + "%";
    })

    // Add an event listener for seekbar
    document.querySelector(".seekbar").addEventListener("click", function (e) {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;

    })


    //Add an event listener for Hamburger icon
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".leftpart").style.left = "0%";
    })

    //Add an event listener for crossicon icon
    document.querySelector(".crossicon").addEventListener("click", () => {
        document.querySelector(".leftpart").style.left = "-100%";
    })

    //Add an event listener for searchbar icon
    document.querySelector(".searchbox").addEventListener("click", () => {
        document.querySelector(".main").style.display = "none";
        document.querySelector(".searchbox").style.top = "32px";
        document.querySelector(".searchbox").style.width = "296px";
        document.querySelector(".searchbox").style.right = "-235px";
        document.querySelector("#browselogo").style.display = "block";
        document.querySelector(".searchbox>input").style.display = "block";


    })

    //Add an event for listener for volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume img").setAttribute("src", "/img/volume.svg");

        }

    });

    //Add an event for listener for mute
    document.querySelector(".volume img").addEventListener("click", (e) => {
        if (e.target.src.includes("/img/volume.svg")) {
            document.querySelector(".volume img").setAttribute("src", "/img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        } else {
            document.querySelector(".volume img").setAttribute("src", "/img/volume.svg");
            currentSong.volume = .10;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;

        }


    })



}
main()





















