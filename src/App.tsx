import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import "./App.css";
import Loading from "./components/Loading";
import { FingerPoseEstimator } from "./FingerUtils/FingerPostEstimator";
import { HandAnalyzer } from "./HandUtils/HandAnalyzer";
import reactToDOMCursor from "./HandUtils/temp";
import { fourLetterWords } from "./pages/words";
const alphabet = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];
const handAnalyzer = new HandAnalyzer();

function App() {
  const [whereIsWord , setWhereIsWord] = useState(0)
  const [selectedWord , setSelectWord] = useState(fourLetterWords[whereIsWord]) ;
  const [started, setStarted] = useState(false);
  const [wordLength , setWordLength] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const videoElement = useRef(null);
  const canvasElement = useRef<HTMLCanvasElement>(null);
  let [countPrediction, setCountPrediction] = useState(0);
  const [prediction, setPrediction] = useState<boolean>(false);
  const [selectedLetter, setSelectedLetter] = useState("");
  useEffect(()=>{


    setSelectedLetter(selectedWord[wordLength]);
    setWordLength(wordLength+1)
  },[])
  useEffect(()=>{
    if(prediction)
    
    {
      alert("helo")
      if(wordLength==selectedWord.length){
        
        setSelectWord(fourLetterWords[whereIsWord+1])
        setWhereIsWord(whereIsWord + 1);
        setSelectedLetter(selectedWord[0]);
        setWordLength(1)
        
        //setSelectedLetter(selectedWord[wordLength]);
        //setPrediction(false)
      }else{
        setWordLength((wordLen)=>wordLen + 1);
        setSelectedLetter(selectedWord[wordLength]);
        setPrediction(false);
      }
   
     
    
    }
  },[prediction])
  const onResults = (results) => {
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
        // NOTE: We are only accepting hands of a certain size - to have less false positives
        var handSize =
          handAnalyzer.findDistanceBetweenTwoLandMarks(
            newLandMarks[0],
            newLandMarks[5]
          ) * 10;
        if (handSize > 0.7) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#ff00ff",
            lineWidth: 2,
          });
          drawLandmarks(canvasCtx, landmarks, {
            color: "transparent",
            lineWidth: 0,
          });
          if (selectedLetter) {
            let bool =   5 ==
            reactToDOMCursor(
              fingerPoseResults,
              newLandMarks,
              selectedLetter
            );
           
            setPrediction(
              bool
              );
          }
        } else {
          setPrediction(false);
        }
      }
    } else {
      setPrediction(false);
    }
    canvasCtx?.restore();
  };

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
  }, [started, selectedLetter]);

  useEffect(() => {
    if (videoElement.current) {
      const camera = new window.Camera(videoElement.current, {
        onFrame: async () => {
          await hands.send({ image: videoElement.current });
        },
      });
      camera.start();
    }
  }, [started, selectedLetter]);
  canvasElement.width = window.innerWidth / 2;
  canvasElement.height = window.innerWidth / 3;

  if (started) {
    return (
      <div className="container">
        {loading && <Loading />}
        <h1>{selectedWord}</h1>
        <h1>{selectedLetter}</h1>

        <div style={{ marginBottom: 10 }}>
          {alphabet.map((letter, index) => {
            return (
              <div style={{ display: "inline-block", margin: 5 }}>
                <button
                  key={index}
                  style={{
                    borderColor: selectedLetter == letter ? "blue" : "",
                  }}
                  onClick={() => {
                    setSelectedLetter(letter);
                  }}
                >
                  {letter}
                </button>
              </div>
            );
          })}
        </div>
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
            border: prediction ? "5px solid green" : "",
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
