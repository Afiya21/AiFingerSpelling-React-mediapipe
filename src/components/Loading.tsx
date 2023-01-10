import React from "react";
import { ScaleLoader } from "react-spinners";
function Loading() {
  return (
    <div>
      <ScaleLoader color={"#fff"} />
      <p>please wait while setting up it may take a while</p>
    </div>
  );
}

export default Loading;
