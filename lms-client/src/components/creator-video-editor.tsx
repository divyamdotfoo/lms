import { BASE_URL, formatTime } from "@/utils";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
export function CreatorVideoEditor({ videoId }: { videoId: string | null }) {
  const playerRef = useRef<ReactPlayer>(null);
  const [breakPoints, setBreakPoints] = useState<number[]>([]);
  const [isMouseOver, setMouseOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [parts, setParts] = useState<
    { name: string; start: string; end: string }[]
  >([]);
  console.log(parts);
  console.log(videoId);

  useEffect(() => {
    if (!playerRef.current) return;
    const newParts = breakPoints.map((b, i) => {
      if (i === 0) return { name: "Part 1", start: "0", end: b.toFixed(2) };
      return {
        name: `Part ${i + 1}`,
        start: breakPoints[i - 1].toFixed(2),
        end: b.toFixed(2),
      };
    });

    newParts.push({
      name: `Part ${breakPoints.length + 1}`,
      start: breakPoints[breakPoints.length - 1].toFixed(2),
      end: playerRef.current.getDuration().toFixed(2),
    });

    setParts(newParts);
  }, [breakPoints]);

  const calulateBreakPointPos = (curr: number, duration: number) =>
    ((curr / duration) * 100).toFixed(2);

  const addBreakPoints = () => {
    const player = playerRef.current;
    if (player) {
      setBreakPoints((p) =>
        Array.from(new Set([...p, player.getCurrentTime()])).toSorted(
          (a, b) => a - b
        )
      );
    }
  };

  const handlePublishCourse = async () => {
    if (!parts.length) {
      alert("Please choose breakpoints for your course");
      return;
    }
    setLoading(true);
    const { status } = await axios.post(
      `${BASE_URL}/publish/${videoId}`,
      parts
    );
    setLoading(false);

    if (status == 200) router.replace(`/course/${videoId}`);
  };

  if (!videoId) return null;
  return (
    <div className=" flex items-start gap-10">
      <div className="basis-1/2">
        <div
          className=" relative"
          onMouseOver={() => {
            setMouseOver(true);
            setTimeout(() => setMouseOver(false), 3000);
          }}
          onMouseOut={() => setMouseOver(false)}
        >
          <ReactPlayer
            ref={playerRef}
            url={`${BASE_URL}/video/${videoId}`}
            autoPlay
            controls={true}
            id="video-player"
            onPause={() => setIsPaused(true)}
            onPlay={() => setIsPaused(false)}
          />
          {playerRef &&
            playerRef.current &&
            (isPaused || isMouseOver) &&
            breakPoints.map((b) => (
              <>
                <span
                  className=" bg-yellow-300 w-3 h-3 rounded-full bottom-4 absolute"
                  style={{
                    left:
                      b < 0.5
                        ? "16px"
                        : `calc(${calulateBreakPointPos(
                            b,
                            playerRef.current!.getDuration()
                          )}%)`,
                  }}
                ></span>
              </>
            ))}
        </div>
        <div className=" flex items-center justify-between w-full gap-10 pt-8">
          <p>
            To add breakpoints in your video seek over to the desired point and
            click Add Breakpoint
          </p>
          <button
            className=" px-3 py-1 rounded-lg text-black bg-white text-nowrap"
            onClick={addBreakPoints}
          >
            Add breakpoint
          </button>
        </div>
      </div>
      <div className=" pt-7">
        <p className=" underline">
          Your course will be divided into the following segments.
        </p>
        <div className="">
          {!breakPoints.length && (
            <p className=" py-20 text-center">
              Please divide your course into smaller parts.
            </p>
          )}
          {breakPoints.length > 0 && (
            <div className="h-[350px] overflow-y-auto">
              <div className=" flex items-center justify-between py-6 text-xl font-medium">
                <p>Name</p>
                <p>Start</p>
                <p>End</p>
              </div>
              {parts.map((p) => (
                <div className=" flex items-center text-white justify-between py-2">
                  {Object.values(p).map((p, i) => (
                    <p>{i >= 1 ? formatTime(p) : p}</p>
                  ))}
                </div>
              ))}
            </div>
          )}
          <button
            onClick={handlePublishCourse}
            className=" w-full flex items-center justify-center gap-2 hover:bg-gray-100 transition-all text-center py-2 text-black bg-white rounded-xl"
          >
            Publish Course{" "}
            {loading && (
              <Loader2 className=" text-black w-4 h-4 animate-spin" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
