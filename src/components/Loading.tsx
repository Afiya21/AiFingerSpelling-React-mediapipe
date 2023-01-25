import React from "react";
import { ScaleLoader } from "react-spinners";
function Loading() {
  return (
    <div>
      <ScaleLoader color={"#000"} />
      <p>Please Sleep While Setting Up It May Take a While</p>
    </div>
  );
}

export default Loading;
