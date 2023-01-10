import { useState, createContext, useRef, useMemo, useEffect } from "react";
import "./App.css";
import Loading from "./components/Loading";
import { FingerPoseEstimator } from "./FingerUtils/FingerPostEstimator";
let a = 1;
function App() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const videoElement = useRef(null);
  const canvasElement = useRef<HTMLCanvasElement>(null);
  let [countPrediction, setCountPrediction] = useState(0);

  const hands = useMemo(() => {
    if (started) {
      let hands = new window.Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      hands.onResults(onResults);
      return hands;
    }
  }, [started]);
  useEffect(() => {
    if (videoElement.current) {
      const camera = new window.Camera(videoElement.current, {
        onFrame: async () => {
          await hands.send({ image: videoElement.current });
        },
      });
      camera.start();
    }
  }, [started]);
  canvasElement.width = window.innerWidth / 2;
  canvasElement.height = window.innerWidth / 3;
  function onResults(results) {
    let canvasCtx = canvasElement?.current?.getContext("2d");
    setCountPrediction(countPrediction++);
    if (countPrediction == 1) {
      setLoading(false);
    }
    canvasCtx?.save();
    canvasCtx?.clearRect(
      0,
      0,
      canvasElement.current.width,
      canvasElement.current.height
    );
    canvasCtx?.drawImage(
      results.image,
      0,
      0,
      canvasElement.current.width,
      canvasElement.current.height
    );
    if (results.multiHandLandmarks && results.multiHandedness) {
      let newLandMarks = [];
      for (const landmarks of results.multiHandLandmarks) {
        for (var i = 0; i < 21; i++) {
          let currentLandmark = landmarks[i];
          newLandMarks.push([
            currentLandmark.x,
            currentLandmark.y,
            currentLandmark.z,
          ]);
          // For Left hand we are reverting all the positions
          if (results.multiHandedness[0].label === "left") {
            newLandMarks[i][0] = newLandMarks[i][0] * -1;
          }
        }
        let fingerPoseEstimator = new FingerPoseEstimator(null);
        let fingerPoseResults = fingerPoseEstimator.estimate(newLandMarks);
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#ff00ff",
          lineWidth: 2,
        });
        drawLandmarks(canvasCtx, landmarks, {
          color: "transparent",
          lineWidth: 0,
        });
      }
    }
    canvasCtx?.restore();
  }

  if (started) {
    return (
      <div className="container">
        {loading && <Loading />}
        <video
          style={{ display: "none" }}
          ref={videoElement}
          className="input_video"
        ></video>
        <canvas
          className="output_canvas"
          style={{
            borderRadius: 10,
            width: 600,
            height: 400,
            display: loading ? "none" : "block",
          }}
          ref={canvasElement}
        ></canvas>
      </div>
    );
  }
  return (
    <div className="App">
      <h1>Welcom to finger spelling....</h1>
      <div className="card">
        <button
          onClick={() => {
            setStarted(true);
            setLoading(true);
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
}

export default App;
