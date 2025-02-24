import React from "react";

const VideoPlayer = ({ videoSource }) => {
  return (
    <div className={`flex justify-center items-center bg-gray-900 p-4 rounded-lg shadow-lg w-full`}>
      <div className="relative w-full h-auto rounded-lg overflow-hidden">
        <video 
          src={videoSource} 
          controls 
          className="w-full h-auto rounded-lg" 
          preload="metadata"
          style={{
            outline: "none",
            border: "none",
          }}
        >
          Your browser does not support the video tag.
        </video>
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex justify-between items-center">
          <button className="text-white text-sm bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg shadow-md">Play</button>
          <button className="text-white text-sm bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg shadow-md">Pause</button>
          <input type="range" className="w-full mx-2 bg-gray-300 rounded-lg" />
          <button className="text-white text-sm bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg shadow-md">Fullscreen</button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
