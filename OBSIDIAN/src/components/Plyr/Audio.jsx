import React from "react";
import dynamic from "next/dynamic";
const Plyr = dynamic(() => import("plyr-react"), { ssr: false });

const AudioPlayer = ({ src }) => {
  return (
    <div className="rounded-lg shadow-lg mt-3">
      <Plyr source={{ type: "audio", sources: [{ src }] }} />
    </div>
  );
};

export default AudioPlayer;