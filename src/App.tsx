import Player from "@vimeo/player";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import { getChapters } from "./lib/video.service";
import { initializeApp } from "firebase/app";
import { child, get, getDatabase, ref as refFirebase } from "firebase/database";
import { getAuth, signInWithCustomToken } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDpXJ-HVlbO-G_kY9cux1OCBqxu7lT9ohM",
  authDomain: "fbrb-lms-1ff6c.firebaseapp.com",
  databaseURL:
    "https://fbrb-lms-1ff6c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fbrb-lms-1ff6c",
  storageBucket: "fbrb-lms-1ff6c.appspot.com",
  messagingSenderId: "703069628591",
  appId: "1:703069628591:web:d8b670c50f3765c7e2cc5a",
  measurementId: "G-NNBBCS3YCH",
};

interface Flag {
  id: string;
  time: number;
}

const sampleButtonStyles = `rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`;

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player>();
  const [chapters, setChapters] = useState<Player.VimeoChapter[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pipEnabled, setPipEnabled] = useState(false);
  const [subtitleEnabled, setSubtitleEnabled] = useState(false);

  useEffect(() => {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    const auth = getAuth();
    signInWithCustomToken(
      auth,
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1laXdmdUBmYnJiLWxtcy0xZmY2Yy5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInN1YiI6ImZpcmViYXNlLWFkbWluc2RrLWVpd2Z1QGZicmItbG1zLTFmZjZjLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwiYXVkIjoiaHR0cHM6XC9cL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbVwvZ29vZ2xlLmlkZW50aXR5LmlkZW50aXR5dG9vbGtpdC52MS5JZGVudGl0eVRvb2xraXQiLCJpYXQiOjE3MDYwMTcwNDUsImV4cCI6MTcwNjAyMDY0NSwidWlkIjoiMTY1MDdlNzIxMzhlZDgiLCJjbGFpbXMiOnsibmFtZSI6IkFsZXhhbmRlciBMZW1iZXJ0In19.IMEusQkx4AGjUzoiS9BgUelnpk2RqE_YiGFG3VPD52rAKWz8L8Co8dXhsoiwqBnhJpJ3udgcg3FCYYTBqNrdoLngZNY79yiwdqbRhFf9qydexsALyebWRGcAmJoF_Cjd0kCuARyYRiFxzXls2f4x3juGubH0-HAQA4DVeyiLnPG5JvzAhoxGdfo1NVZG84q0xJzn32i7KI0Cm0sP9qvZuQR0A-6PS7L09PN9Nwsa3RV8Mx9EE-TtU1qa0cXmRwJnzxQUV544NvshkIgXm_eX3de5YuBFVN6tLdN00nWiTVAz8UJYSJuWhDzvcZEZ6TDCP9JtwMYDG14C9cd1TTFrOQ"
    )
      .then((userCredential) => {
        const user = userCredential.user;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });

    const db = getDatabase(app);

    get(child(refFirebase(db), "welante"))
      .then((snapshot) => {
        if (snapshot.exists()) {
          let data = snapshot.val();
          console.log(data);
        } else {
          console.log("Data not available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const playerElement = new Player(ref.current, {
      width: 1000,
      loop: false,
      url: "https://vimeo.com/826912993/ae4d06fc29",
    });

    playerElement.on("play", () => {
      setIsPlaying(true);
    });
    playerElement.on("pause", () => {
      setIsPlaying(false);
    });
    playerElement.on("enterpictureinpicture", () => {
      setPipEnabled(true);
    });
    playerElement.on("leavepictureinpicture", () => {
      setPipEnabled(false);
    });

    setPlayer(playerElement);
  }, [ref]);

  const handleGetChaptersClick = async () => {
    const result = await getChapters(player!);
    setChapters(result);
  };

  const handleFullscreenClick = () => {
    player?.requestFullscreen();
  };

  const handleAddFlagClick = async () => {
    const currentPlaybackTime = await player?.getCurrentTime();
    if (!currentPlaybackTime) return;
    const flag: Flag = {
      id: uuidv4(),
      time: currentPlaybackTime,
    };
    setFlags((flags) => [...flags, flag]);
  };

  const handleJumpToFlag = (time: number) => {
    player?.setCurrentTime(time);
  };

  const handleDeleteFlag = (id: string) => {
    setFlags((flags) => flags.filter((flag) => flag.id !== id));
  };

  const handleGoBack15sClick = async () => {
    const currentPlaybackTime = await player?.getCurrentTime();
    if (!currentPlaybackTime || currentPlaybackTime - 15 < 0) return;
    player?.setCurrentTime(currentPlaybackTime - 15);
  };

  const handleFordward30sClick = async () => {
    const currentPlaybackTime = await player?.getCurrentTime();
    const duration = await player?.getDuration();

    if (currentPlaybackTime === undefined || duration === undefined) return;

    if (!duration || currentPlaybackTime + 30 > duration) return;
    player?.setCurrentTime(currentPlaybackTime + 30);
  };

  const handlePlayStateClick = () => {
    isPlaying ? player?.pause() : player?.play();
  };

  const handlePiPClick = async () => {
    if (pipEnabled) {
      await player?.exitPictureInPicture();
      setPipEnabled(false);
      return;
    }

    await player?.requestPictureInPicture();
    setPipEnabled(true);
  };

  const handleSubtitleClick = async () => {
    const tracks = await player?.getTextTracks();
    if (!tracks) return;
    if (subtitleEnabled) {
      await player?.disableTextTrack();
      setSubtitleEnabled(false);
      return;
    }

    await player?.enableTextTrack(tracks![0].language);
    setSubtitleEnabled(true);
  };

  const handlePlaybackRateClick = async (playbackRate: number) => {
    await player?.setPlaybackRate(playbackRate);
  };

  return (
    <div>
      <div ref={ref}></div>
      <div className="mt-12"></div>
      <div className="flex gap-2">
        <button
          type="button"
          className={sampleButtonStyles}
          onClick={handleAddFlagClick}
        >
          Flag
        </button>
        <button
          type="button"
          className={sampleButtonStyles}
          onClick={handleGoBack15sClick}
        >
          -15s
        </button>
        <button
          type="button"
          className={sampleButtonStyles}
          onClick={handlePlayStateClick}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          className={sampleButtonStyles}
          onClick={handleFordward30sClick}
        >
          +30s
        </button>
        <button
          type="button"
          className={sampleButtonStyles}
          onClick={handleFullscreenClick}
        >
          Fullscreen
        </button>
        <button
          type="button"
          className={sampleButtonStyles}
          onClick={handlePiPClick}
        >
          {pipEnabled ? "Exit PiP" : "PiP"}
        </button>
        <button
          type="button"
          className={sampleButtonStyles}
          onClick={handleGetChaptersClick}
        >
          Get chapters
        </button>
        <button
          type="button"
          className={sampleButtonStyles}
          onClick={handleSubtitleClick}
        >
          {subtitleEnabled ? "Disable" : "Enable"} subtitles
        </button>
        <div className="flex gap-1">
          <button
            className={sampleButtonStyles}
            onClick={() => handlePlaybackRateClick(0.75)}
          >
            0.75
          </button>
          <button
            className={sampleButtonStyles}
            onClick={() => handlePlaybackRateClick(1)}
          >
            1
          </button>
          <button
            className={sampleButtonStyles}
            onClick={() => handlePlaybackRateClick(1.25)}
          >
            1.25
          </button>
          <button
            className={sampleButtonStyles}
            onClick={() => handlePlaybackRateClick(1.5)}
          >
            1.5
          </button>
        </div>
      </div>
      <div className="flex mt-12">
        <div className="flex-1">
          <h2 className="mb-6">Chapters</h2>
          <ol>
            {chapters.map((chapter) => (
              <li key={chapter.index}>{chapter.title}</li>
            ))}
          </ol>
        </div>
        <div className="flex-1">
          <h2 className="mb-6">Flags</h2>
          <ol className="flex flex-col gap-2 items-center">
            {flags.map((flag) => (
              <li key={flag.id}>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleJumpToFlag(flag.time)}
                    className="bg-slate-600 py-2 px-4 rounded-sm text-white"
                  >
                    {flag.time}
                  </button>
                  <button onClick={() => handleDeleteFlag(flag.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default App;
