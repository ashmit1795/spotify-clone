console.log("File connected");
var currentSong = new Audio();
let songs;
let currFolder;

//generated using AI
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}


//Getting songs from the folder
async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`/songs/${currFolder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    // Get all the song elements from the HTML page and store them in an array
    let as = div.getElementsByTagName("a");
    songs = [];
    for (a of as){
        if(a.href.endsWith(".mp3") || a.href.endsWith(".m4a") ){
            songs.push(a.href)
        }
    }
    
    //Show all the songs in the playlist in the library
    let songUl = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for(let song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
        <img src="./images/logos/music.svg" alt="" class="invert">
        <div class="info">
            <div>${song.split(`/songs/${currFolder}/`)[1].replaceAll("%20", " ")}</div>
            <div>Ashmit</div>
        </div>
        <img class="play-now invert" src="./images/logos/play.svg" alt="Play Now">
        </li>`;
    }

    //Attach event listeners to each songs in the library
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach((e)=>{
        e.addEventListener("click", (evt)=>{
            console.log(e.querySelector(".info>div").innerHTML);
            playMusic(e.querySelector(".info>div").innerHTML);
        })
    });

    return songs;
}


// Function to play music
function playMusic(track, paused = false){
    currentSong.src = `/songs/${currFolder}/${track}`
    if(!paused){
        currentSong.play();
        play.src="./images/logos/pause.svg";
    }
    document.querySelector(".song-info").innerHTML = `<p>${track}</p>`;
    document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
}

//Function to display all the albums in the website
async function displayAlbums(){
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    //Storing all the folders in a array
    let array = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container");

    //Creating cards for each album
    let folder;
    let info;
    let infodata;
    
    for (let index = 0; index < array.length; index++) {
        const a = array[index];
        if(a.href.includes("/songs/")){
            folder = a.href.split(`/songs/`)[1];
            info = await fetch(`/songs/${folder}/info.json`);
            infodata = await info.json();
            console.log(infodata);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <img src="./images/logos/play-button-green-icon.svg" alt="">
            </div>
            <img src="./songs/${folder}/cover.jpg" alt="Cover Photo">
            <h2>${infodata.title}</h2>
            <p>${infodata.desc}</p>
        </div>`
        } 
    }

    //Adding event listener to each album cards
    document.querySelectorAll(".card").forEach(item =>{
        item.addEventListener("click", async (evt)=>{
            // Getting the list of all songs in the folder
            songs = await getSongs(`${evt.currentTarget.dataset.folder}`);
            // Setting a default music when a card is clicked
            playMusic(songs[0].split(`/songs/${currFolder}/`)[1].replaceAll("%20", " "));
            // document.querySelector(".album-name").innerHTML = `<h3>${infodata.title}</h3>`
        });
    });
    
}

async function main(){
    
    // Setting a default playlist
    songs = await getSongs("sawar-loon");
    playMusic(songs[0].split(`/songs/${currFolder}/`)[1].replaceAll("%20", " "), true);

    //Display Albums
    displayAlbums();


    //Attach event listeners to song buttons
    let previous = document.querySelector("#previous");
    let play = document.querySelector("#play");
    let next = document.querySelector("#next");

    // Adding event listener to play button
    play.addEventListener("click",(evt)=>{
        if(currentSong.paused){
            currentSong.play();
            play.src="./images/logos/pause.svg";
        }else{
            currentSong.pause();
            play.src="./images/logos/play.svg";
        }
    });

    //Adding event listener to previous button
    previous.addEventListener("click",(evt)=>{
        console.log("Prev");
        console.log(songs.indexOf(currentSong.src));
        let prevIndex = songs.indexOf(currentSong.src)-1;
        if ( prevIndex >= 0) {
            let prevSong = songs[prevIndex];
            playMusic(prevSong.split(`/songs/${currFolder}/`)[1].replaceAll("%20", " "));    
        }

    });

    //Adding event listener to next button
    next.addEventListener("click",(evt)=>{
        console.log("Next");
        console.log(songs.indexOf(currentSong.src));
        let nextIndex = songs.indexOf(currentSong.src) + 1;
        if (nextIndex < songs.length) {
            let prevSong = songs[nextIndex];
            playMusic(prevSong.split(`/songs/${currFolder}/`)[1].replaceAll("%20", " "));    
        }
    });

    //Adding event listener to update time in the playbar 
    currentSong.addEventListener("timeupdate",(evt)=>{
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    //Adding event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", (evt)=>{
        let percent = (evt.offsetX/evt.target.getBoundingClientRect().width) * 100;
        console.log(percent);
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration*percent)/100;
    });

    //Adding event listener to hamburger menu
    document.querySelector(".hamburger").addEventListener("click",(evt)=>{
        document.querySelector(".left-col").style.transform= "translateX(0)";
        console.log(evt);
    });

    //Adding event listener to close button
    document.querySelector(".close").addEventListener("click",(evt)=>{
        document.querySelector(".left-col").style.transform= "translateX(-120%)";
        console.log(evt);
    });

    //Adding event listener to volume rocker
    let range = document.querySelector(".range");
    range.addEventListener("change", (evt)=>{
        currentSong.volume = evt.target.value/100;
        if (currentSong.volume != 0){
            volBtn.src = "./images/logos/volume.svg"
        }else{
            volBtn.src = "./images/logos/mute.svg"
        }
    });

    //Adding event listener to volume button to mute and unmute
    let volBtn = document.querySelector(".vol-btn")
    volBtn.addEventListener("click", ()=>{
        if (currentSong.volume != 0){
            volBtn.src = "./images/logos/mute.svg"
            range.value = 0;
            currentSong.volume = 0;
        }else{
            volBtn.src = "./images/logos/volume.svg"
            range.value = 20;
            currentSong.volume = range.value/100;
        }

    })

}

main();