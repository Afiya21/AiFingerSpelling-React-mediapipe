import { Coords3D } from "@tensorflow-models/handpose/dist/pipeline";
import { Alphabet } from "../Alphabet";
import { HandAnalyzer } from "./HandAnalyzer";

const handAnalyzer = new HandAnalyzer();
const reactToPoseChange = (fingerPoseResults, result: Coords3D) => {
  const alphabet = new Alphabet();
  const lookingForLetter = alphabet.getSpecificLetter("a");

  let fingerData = {
    handSize: 0,
    handRotation: 0,
  };

  fingerData.handSize =
    handAnalyzer.findDistanceBetweenTwoLandMarks(result[0], result[5]) * 10;

  //	fingerData.handRotation = Globals.HAND_ANALYZER.getHandRotation(result);
  // Better way of getting the hand rotation
  fingerData.handRotation = handAnalyzer.getHandRotationFromIndex(result);

  let thumbAngle = fingerPoseResults.curls[0].angle;
  let indexFingerAngle = fingerPoseResults.curls[1].angle;
  let middleFingerAngle = fingerPoseResults.curls[2].angle;
  let ringFingerAngle = fingerPoseResults.curls[3].angle;
  let littleFingerAngle = fingerPoseResults.curls[4].angle;

  let lookForLetter = lookingForLetter;
  //console.log(lookForLetter);
  let isHandAngleCorrect;
  lookForLetter.thumb.currentAngle = thumbAngle;
  lookForLetter.index.currentAngle = indexFingerAngle;
  lookForLetter.middle.currentAngle = middleFingerAngle;
  lookForLetter.ring.currentAngle = ringFingerAngle;
  lookForLetter.little.currentAngle = littleFingerAngle;
  if (lookForLetter.rotation === "up") {
    if (fingerData.handRotation < 180 && fingerData.handRotation > -180) {
      isHandAngleCorrect = true;
    } else {
    }
  }

  if (lookForLetter.rotation === "down") {
    if (fingerData.handRotation > 80 && fingerData.handRotation < 220) {
      isHandAngleCorrect = true;
    } else {
    }
  }

  if (lookForLetter.rotation === "side") {
    if (fingerData.handRotation > 40 && fingerData.handRotation < 140) {
      isHandAngleCorrect = true;
    } else {
    }
  }
  let countCorrectFingers = 0;
  if (isHandAngleCorrect) {
    for (let i = 0; i < 5; i++) {
      let lookFor;
      if (i == 0) {
        lookFor = lookForLetter.thumb;
      } else if (i == 1) {
        lookFor = lookForLetter.index;
      } else if (i == 2) {
        lookFor = lookForLetter.middle;
      } else if (i == 3) {
        lookFor = lookForLetter.ring;
      } else if (i == 4) {
        lookFor = lookForLetter.little;
      }

      let angle = lookFor.currentAngle;

      if (angle < lookFor.curlMin && angle > lookFor.curlMax) {
        lookFor.percentageCorrect = 1;

        if (lookFor.special !== "none") {
          lookFor.percentageCorrect = 0;

          if (lookFor.special === "betweenRingAndPointerBase") {
            // We are in this take not looking at tips _ but instead at the base of the finger

            if (
              result[4][0] > result[9][0] - 0.002 &&
              result[4][0] < result[17][0] + 0.002
            ) {
              lookFor.percentageCorrect = 1;
            }
          } else if (lookFor.special === "betweenRingAndLittleBase") {
            // Used for M
            // We are in this take not looking at tips _ but instead at the base of the finger
            if (result[4][0] > result[7][0] && result[4][0] < result[17][0]) {
              // Lets also make sure that the thumbs 'tip' is higher on the Y axis than the Tips of the fingers
              if (
                result[4][1] < result[16][1] &&
                result[4][1] < result[20][1]
              ) {
                lookFor.percentageCorrect = 1;
              }
            }
          } else if (lookFor.special === "betweenMiddleAndRing") {
            // Used for N
            if (
              result[4][0] > result[10][0] - 0.001 &&
              result[4][0] < result[14][0] + 0.001
            ) {
              // Lets also make sure that the thumbs 'tip' is higher on the Y axis than the Tips of the fingers
              //if (result[4][1] < result[16][1] && result[4][1] < result[12][1]) {
              lookFor.percentageCorrect = 1;
              //	}
            }
          } else if (lookFor.special === "betweenIndexAndMiddle") {
            if (
              result[4][0] > result[6][0] - 0.004 &&
              result[4][0] < result[10][0] + 0.004
            ) {
              lookFor.percentageCorrect = 1;
            }
          } else if (lookFor.special === "thumbBendOverOtherFingers") {
            //	console.log('result[4][0] ; ' + result[4][0]);
            //	console.log('result[5][0] ; ' + result[5][0]);
            //if (Globals.IS_MOBILE === true) {
            // && result[4][0] < result[17][0]
            if (result[4][0] > result[8][0] - 0.03 * fingerData.handSize) {
              lookFor.percentageCorrect = 1;
            }
            /*	}
          else {
            if (result[4][0] > result[5][0] + 0.01 * fingerData.handSize && result[4][0] < result[17][0] + 0.0 * fingerData.handSize) {
              lookFor.percentageCorrect = 1;
            }
          }*/
          } else if (
            lookFor.special === "thumbBendOverOtherFingersAndUnderOtherFingers"
          ) {
            // Used for the letter E - to make sure it doesnt look too much like a T -
            if (result[4][0] > result[5][0] && result[4][0] < result[17][0]) {
              //if (result[4][1] > result[8][1] && result[4][1] > result[12][1] && result[4][1] > result[16][1]) {
              lookFor.percentageCorrect = 1;
              //}
            }
          } else if (
            lookFor.special === "thumbBendOverOtherFingersAndOverOtherFingers"
          ) {
            // FIXME: NOT USED
            // Used for the letter T - to make sure it doesnt look too much like a E -
            if (
              result[4][0] > result[5][0] - 0.02 * fingerData.handSize &&
              result[4][0] < result[17][0] + 0.001 * fingerData.handSize
            ) {
              if (
                result[4][1] < result[8][1] &&
                result[4][1] < result[12][1] &&
                result[4][1] < result[16][1]
              ) {
                lookFor.percentageCorrect = 1;
              }
            }
          } else if (lookFor.special === "betweenIndexAndMiddleLetterT") {
            var distanceWithHandSize = 0.004 * fingerData.handSize;

            if (
              result[4][0] > result[7][0] - distanceWithHandSize &&
              result[4][0] < result[10][0] + distanceWithHandSize
            ) {
              if (
                result[4][1] < result[8][1] &&
                result[4][1] < result[12][1] &&
                result[4][1] < result[16][1]
              ) {
                lookFor.percentageCorrect = 1;
              }
            }
          } else if (lookFor.special === "betweenIndexAndMiddleLetterS") {
            var distanceWithHandSize = 0.004 * fingerData.handSize;

            if (result[4][0] > result[7][0] && result[4][0] < result[15][0]) {
              // Check its pos on the Y axis too
              if (
                result[4][1] < result[8][1] &&
                result[4][1] < result[12][1] &&
                result[4][1] < result[16][1]
              ) {
                lookFor.percentageCorrect = 1;
              }
            }
          } else if (lookFor.special === "thumbToTheLeft") {
            // Used for the letter A - make sure the thumb is all the way to the left - but also not to far from the hand
            var distanceWithHandSize = 0.03 * fingerData.handSize;
            if (result[4][0] < result[5][0]) {
              // && result[4][0] + distanceWithHandSize > result[8][0]
              lookFor.percentageCorrect = 1;
            }
          } else if (lookFor.special === "distanceBetweenThumbAndPointer") {
            var distancePinch = handAnalyzer.findDistanceBetweenTwoLandMarks(
              result[4],
              result[8]
            );
            var distanceWithHandSize = 0.02 * fingerData.handSize;

            //	console.log('distancePinch : ' + distancePinch);
            //	console.log('distanceWithHandSize : ' + distanceWithHandSize);

            if (distancePinch > distanceWithHandSize) {
              lookFor.percentageCorrect = 1;
            } else {
              lookFor.percentageCorrect = distancePinch / distanceWithHandSize;
            }
          } else if (lookFor.special === "pinchThumbAndPointer") {
            var distancePinch = handAnalyzer.findDistanceBetweenTwoLandMarks(
              result[4],
              result[8]
            );
            var distanceWithHandSize = 0.045 * fingerData.handSize;

            //	console.log('distancePinch : ' + distancePinch);
            //	console.log('distanceWithHandSize : ' + distanceWithHandSize);

            if (distancePinch < distanceWithHandSize) {
              lookFor.percentageCorrect = 1;
            } else {
              lookFor.percentageCorrect = distanceWithHandSize / distancePinch;
              //	console.log('lookFor.percentageCorrect : ' + lookFor.percentageCorrect);
            }
          } else if (lookFor.special === "thumbPointerAlignOnYAxis") {
            var distancePointerAndThumbOnY = result[4][1] - result[8][1];
            if (distancePointerAndThumbOnY < 0) {
              distancePointerAndThumbOnY = distancePointerAndThumbOnY * -1;
            }

            //	console.log('distancePointerAndThumbOnY : ' + distancePointerAndThumbOnY);

            if (distancePointerAndThumbOnY < 0.07) {
              lookFor.percentageCorrect = 1;
            }
          } else if (lookFor.special === "crossIndexAndMiddle") {
            // Used on R
            var distanceIndexAndMiddle = result[12][0] - result[8][0];
            if (distanceIndexAndMiddle < 0.0 + 0.01 * fingerData.handSize) {
              lookFor.percentageCorrect = 1;
            }
          } else if (lookFor.special === "indexAndMiddleMustBeClose") {
            // Used on U
            var distanceIndexAndMiddle =
              handAnalyzer.findDistanceBetweenTwoLandMarks(
                result[12],
                result[8]
              );
            var distanceWithHandSize = 0.045 * fingerData.handSize;
            //	console.log('distanceIndexAndMiddle : ' + distanceIndexAndMiddle);
            //	console.log('distanceWithHandSize : ' + distanceWithHandSize);
            if (distanceIndexAndMiddle < distanceWithHandSize) {
              lookFor.percentageCorrect = 1;
            }
          } else if (lookFor.special === "indexAndMiddleMustBeApart") {
            // Used on V
            var distanceIndexAndMiddle =
              handAnalyzer.findDistanceBetweenTwoLandMarks(
                result[12],
                result[8]
              );
            var distanceWithHandSize = 0.02 * fingerData.handSize;
            //	console.log('distanceIndexAndMiddle : ' + distanceIndexAndMiddle);
            //	console.log('distanceWithHandSize : ' + distanceWithHandSize);
            if (distanceIndexAndMiddle > distanceWithHandSize) {
              lookFor.percentageCorrect = 1;
            }
          } else if (lookFor.special === "indexAndMiddleAndRingMustBeApart") {
            // Used on W
            var distanceIndexAndMiddle =
              handAnalyzer.findDistanceBetweenTwoLandMarks(
                result[16],
                result[12]
              );
            var distanceWithHandSize = 0.015 * fingerData.handSize;

            //	console.log('distanceIndexAndMiddle : ' + distanceIndexAndMiddle);
            //	console.log('distanceWithHandSize : ' + distanceWithHandSize);
            if (distanceIndexAndMiddle > distanceWithHandSize) {
              lookFor.percentageCorrect = 1;
            } else {
              lookFor.percentageCorrect =
                (distanceIndexAndMiddle - 0.01) / distanceWithHandSize;
              //		console.log('lookFor.percentageCorrect : ' + lookFor.percentageCorrect);
            }
          }
        }
      } else {
        if (angle > lookFor.curlMin) {
          // Needs more bend
          //console.log('lookForLetter.index.curlMin : ' + lookFor.curlMin)

          // 60 / 180
          var maxDistance = 180 - lookFor.curlMin; // 120 (is also the max distance
          var calculateExactDistance = angle - lookFor.curlMin; // 60 - 180
          lookFor.percentageCorrect =
            (maxDistance - calculateExactDistance) / maxDistance;

          if (i === 1) {
            /*	console.log('angle : ' + angle);
            console.log('maxDistance : ' + maxDistance);
            console.log('calculateExactDistance : ' + calculateExactDistance);
            console.log('Angle Over : ' + lookFor.percentageCorrect);*/
          }
          //	lookFor.percentageCorrect = 0;
        } else if (angle < lookFor.curlMax) {
          // Needs to be bend less
          //indexPercentageCorrect = indexFingerAngle / lookForLetter.index.curlMax;
          lookFor.percentageCorrect = angle / lookFor.curlMax;
          //	lookFor.percentageCorrect = 0;
          if (i === 1) {
            //console.log('Angle Less : ' + lookFor.percentageCorrect);
          }
        }
      }

      /*	if (i === 4) {
      console.log('lookFor.percentageCorrect : ' + lookFor.percentageCorrect)
    }*/

      if (lookFor.percentageCorrect === 1) {
        countCorrectFingers = 1 + countCorrectFingers;
      }
    }
  }
  return countCorrectFingers;
};

export default { reactToPoseChange };
