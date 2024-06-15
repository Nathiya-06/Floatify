        let now_playing = document.querySelector('.now-playing');
        let track_art = document.querySelector('.track-art');
        let track_name = document.querySelector('.track-name');
        let track_artist = document.querySelector('.track-artist');

        let playpause_btn = document.querySelector('.playpause-track');
        let next_btn = document.querySelector('.next-track');
        let prev_btn = document.querySelector('.prev-track');

        let seek_slider = document.querySelector('.seek_slider');
        let volume_slider = document.querySelector('.volume_slider');
        let curr_time = document.querySelector('.current-time');
        let total_duration = document.querySelector('.total-duration');
        let wave = document.getElementById('wave');
        let randomIcon = document.querySelector('.fa-random');
        let curr_track = document.createElement('audio');

        let track_index = 0;
        let isPlaying = false;
        let isRandom = false;
        let updateTimer;

        const music_list = [
            {
                img: 'img/stay.png',
                name: 'Stay',
                artist: 'The Kid LAROI, Justin Bieber',
                music: 'songs/stay.mp3'
            },
            {
                img: 'img/fallingdown.jpg',
                name: 'Falling Down',
                artist: 'Wid Cards',
                music: 'songs/fallingdown.mp3'
            },
            {
                img: 'img/faded.png',
                name: 'Faded',
                artist: 'Alan Walker',
                music: 'songs/Faded.mp3'
            },
            {
                img: 'img/ratherbe.jpg',
                name: 'Rather Be',
                artist: 'Clean Bandit',
                music: 'songs/Rather Be.mp3'
            },
            {
                img: 'img/sunnraha.jpeg',
                name: 'Sunn Raha Hai',
                artist: 'Arijit Singh',
                music: 'songs/sunnraha.mp3'
            }
        ];
        loadTrack(track_index);
        function loadTrack(track_index) {
            clearInterval(updateTimer);
            reset();

            curr_track.src = music_list[track_index].music;
            curr_track.load();

            track_art.style.backgroundImage = "url(" + music_list[track_index].img + ")";
            track_name.textContent = music_list[track_index].name;
            track_artist.textContent = music_list[track_index].artist;
            now_playing.textContent = "Playing music " + (track_index + 1) + " of " + music_list.length;

            updateTimer = setInterval(setUpdate, 1000);

            curr_track.addEventListener('ended', nextTrack);
        }
        function reset() {
            curr_time.textContent = "00:00";
            total_duration.textContent = "00:00";
            seek_slider.value = 0;
        }

        function randomTrack() {
            isRandom ? pauseRandom() : playRandom();
        }

        function playRandom() {
            isRandom = true;
            randomIcon.classList.add('randomActive');
        }

        function pauseRandom() {
            isRandom = false;
            randomIcon.classList.remove('randomActive');
        }

        function repeatTrack() {
            let current_index = track_index;
            loadTrack(current_index);
            playTrack();
        }

        function playpauseTrack() {
            isPlaying ? pauseTrack() : playTrack();
        }

        function playTrack() {
            curr_track.play();
            isPlaying = true;
            track_art.classList.add('rotate');
            wave.classList.add('loader');
            playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
            console.log("audio playing")
        }

        function pauseTrack() {
            curr_track.pause();
            isPlaying = false;
            track_art.classList.remove('rotate');
            wave.classList.remove('loader');
            playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
            console.log("audio paused")
        }

        function nextTrack() {
            if (track_index < music_list.length - 1 && isRandom === false) {
                track_index += 1;
            } else if (track_index < music_list.length - 1 && isRandom === true) {
                let random_index = Number.parseInt(Math.random() * music_list.length);
                track_index = random_index;
            } else {
                track_index = 0;
            }
            loadTrack(track_index);
            playTrack();
        }

        function prevTrack() {
            if (track_index > 0) {
                track_index -= 1;
            } else {
                track_index = music_list.length - 1;
            }
            loadTrack(track_index);
            playTrack();
        }

        function seekTo() {
            let seekto = curr_track.duration * (seek_slider.value / 100);
            curr_track.currentTime = seekto;
        }

        function setVolume() {
            curr_track.volume = volume_slider.value / 100;
        }

        function setUpdate() {
            let seekPosition = 0;
            if (!isNaN(curr_track.duration)) {
                seekPosition = curr_track.currentTime * (100 / curr_track.duration);
                seek_slider.value = seekPosition;

                let currentMinutes = Math.floor(curr_track.currentTime / 60);
                let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
                let durationMinutes = Math.floor(curr_track.duration / 60);
                let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

                if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
                if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
                if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
                if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

                curr_time.textContent = currentMinutes + ":" + currentSeconds;
                total_duration.textContent = durationMinutes + ":" + durationSeconds;
            }
        }

        async function setupCamera() {
            video = document.createElement('video');
            video.setAttribute('playsinline', '');
            video.style.display = 'block'; // Set to 'block' to make the video visible
            document.body.appendChild(video);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true
            });
            video.srcObject = stream;

            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    resolve(video);
                };
            });

            video.play();
            canvas = document.createElement('canvas');
            canvas.width = video.videoWidth / 4;
            canvas.height = video.videoHeight / 4; 
            canvas.style.position = 'absolute'; 
            canvas.style.top = '10px'; 
            canvas.style.left = '10px'; 
            // canvas.style.bottom='10px';
            ctx = canvas.getContext('2d');
            document.body.appendChild(canvas);
        }

        async function loadModel() {
            console.log("Loading Handpose model...");

            model = await handpose.load();
            console.log("Handpose model loaded.");

            predict();
        }

        async function predict() {
            const predictions = await model.estimateHands(video, true);

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            if (predictions.length > 0) {
                const landmarks = predictions[0].landmarks;
                handleGesture(landmarks);
                captureAndProcessHandPose(landmarks);
            } else {
                console.log("No hand pose detected.");
            }
            requestAnimationFrame(predict);
        }

        function captureAndProcessHandPose(landmarks) {
            ctx.fillStyle = "red";
            for (let i = 0; i < landmarks.length; i++) {
                const [x, y] = landmarks[i];
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        setupCamera().then(loadModel);

        function handleGesture(landmarks) {
            const indexTip = landmarks[8]; // Index fingertip
            const middleTip = landmarks[12]; // Middle fingertip
            const thumbTip = landmarks[4]; // Thumb fingertip
            // Define a reference point between index and middle fingertip to represent the V shape
            const referencePointX = (indexTip[0] + middleTip[0]) / 2;
            const referencePointY = (indexTip[1] + middleTip[1]) / 2;
            const referencePoint = [referencePointX, referencePointY];
        
            const distance = Math.sqrt(
                Math.pow(indexTip[0] - middleTip[0], 2) +
                Math.pow(indexTip[1] - middleTip[1], 2)
            );
        
            const thresholdDistance = 50; // Define the threshold distance
        
            if (distance < thresholdDistance) {
                console.log("V gesture detected! Playing/pausing music.");
                playpauseTrack(); // Toggle play/pause based on gesture
            } else {
                console.log("V gesture not detected.");
            }}
