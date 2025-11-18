import React from 'react';

const VideoFeed: React.FC = () => {
  return (
    <div className="w-full bg-gray-900/80 rounded-lg border-2 border-dashed border-gray-700 aspect-video flex flex-col items-center justify-center text-gray-500 shadow-inner">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-12 w-12 mb-2 opacity-50" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium tracking-wide">Video Feed</span>
    </div>
  );
};

export default VideoFeed;