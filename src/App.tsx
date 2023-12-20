import "./App.css";
import Player from "@vimeo/player";
import { useEffect, useRef, useState } from "react";
import { getChapters } from "./lib/video.service";
import { v4 as uuidv4 } from "uuid";

interface Flag {
  id: string;
  time: number;
}

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player>();
  const [chapters, setChapters] = useState<Player.VimeoChapter[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pipEnabled, setPipEnabled] = useState(false);
  const [subtitleEnabled, setSubtitleEnabled] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const playerElement = new Player(ref.current, {
      id: 889542825,
      width: 1000,
      loop: false,
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
    console.log(isPlaying);
    if (isPlaying) {
      player?.pause();
    } else {
      player?.play();
    }
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
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handleAddFlagClick}
        >
          Flag
        </button>
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handleGoBack15sClick}
        >
          -15s
        </button>
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handlePlayStateClick}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handleFordward30sClick}
        >
          +30s
        </button>
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handleFullscreenClick}
        >
          Fullscreen
        </button>
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handlePiPClick}
        >
          {pipEnabled ? "Exit PiP" : "PiP"}
        </button>
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handleGetChaptersClick}
        >
          Get chapters
        </button>
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handleSubtitleClick}
        >
          {subtitleEnabled ? "Disable" : "Enable"} subtitles
        </button>
        <div className="flex gap-1">
          <button
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => handlePlaybackRateClick(0.75)}
          >
            0.75
          </button>
          <button
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => handlePlaybackRateClick(1)}
          >
            1
          </button>
          <button
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => handlePlaybackRateClick(1.25)}
          >
            1.25
          </button>
          <button
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
