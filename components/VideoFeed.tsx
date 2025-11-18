import React, { useEffect, useRef, useState } from 'react';
import { Peer, MediaConnection } from 'peerjs';
import { Player } from '../types';

interface VideoFeedProps {
  gameId: string;
  playerColor: Player | null;
  gameActive: boolean;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ gameId, playerColor, gameActive }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Initializing...');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const activeCallRef = useRef<MediaConnection | null>(null);
  // FIX: Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout to be environment agnostic
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset state when game details change
    setRemoteStream(null);
    setError(null);
    
    // Cleanup previous peer instances
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (!gameId || !playerColor || !gameActive) {
      setStatus(gameId ? 'Waiting for opponent...' : 'Initializing...');
      return;
    }

    // --- Deterministic Peer ID Strategy ---
    // Both players independently generate "phone numbers" based on the shared Game ID.
    // This allows them to find each other without a dedicated signaling database.
    // White -> bg-game-{id}-white
    // Black -> bg-game-{id}-black
    const myPeerId = `bg-game-${gameId}-${playerColor}`;
    const opponentPeerId = `bg-game-${gameId}-${playerColor === 'white' ? 'black' : 'white'}`;

    const initPeer = async () => {
      try {
        setStatus('Accessing camera...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setStatus('Connecting to video server...');
        
        const peer = new Peer(myPeerId, {
          debug: 1,
        });
        peerRef.current = peer;

        peer.on('open', (id) => {
          console.log('My Peer ID is active:', id);
          setStatus('Waiting for opponent...');
          
          // --- Connection Logic ---
          // To prevent race conditions, we assign roles:
          // White is the CALLER (Initiator).
          // Black is the CALLEE (Listener).
          if (playerColor === 'white') {
             startCalling(peer, opponentPeerId, stream);
          }
        });

        // Handle incoming calls (This mostly applies to Black, or if connection drops and re-dials)
        peer.on('call', (call) => {
          console.log('Received incoming call from', call.peer);
          // Answer the call with our local stream
          call.answer(stream);
          handleCall(call);
        });

        peer.on('error', (err) => {
          console.error('PeerJS error:', err);

          // 'unavailable-id': The ID we want is taken (maybe we refreshed fast).
          // 'peer-unavailable': The person we are calling isn't online yet.
          // In both cases, these are temporary state issues, not fatal errors.
          if (err.type === 'unavailable-id') {
             // We likely didn't clean up fast enough on reload. 
             // The server will eventually timeout the old ID.
             setStatus('ID conflict, retrying...');
          } else if (err.type === 'peer-unavailable') {
             // This happens when White calls Black, but Black hasn't loaded the page yet.
             // We silently ignore this and let the retry loop in startCalling handle it.
             setStatus('Waiting for opponent to join...');
             
             // If we are the caller, ensure we retry
             if (playerColor === 'white' && peerRef.current && localStream) {
                clearTimeout(retryTimeoutRef.current!);
                retryTimeoutRef.current = setTimeout(() => {
                    startCalling(peerRef.current!, opponentPeerId, localStream);
                }, 2000);
             }
          } else {
             // Actual errors (network, webrtc, etc.)
             setError(`Connection error: ${err.type}`);
          }
        });

      } catch (err) {
        console.error('Media access error:', err);
        setError('Could not access camera/mic.');
      }
    };

    initPeer();

    return () => {
      // Cleanup on unmount
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (activeCallRef.current) activeCallRef.current.close();
      if (peerRef.current) peerRef.current.destroy();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [gameId, playerColor, gameActive]);

  const startCalling = (peer: Peer, opponentId: string, stream: MediaStream) => {
    // Don't call if we already have a healthy connection
    if (activeCallRef.current && activeCallRef.current.open) return;

    setStatus('Calling opponent...');
    
    // Initiate the call
    const call = peer.call(opponentId, stream);
    handleCall(call);
  };

  const handleCall = (call: MediaConnection) => {
      // If we have an existing call that's stuck, close it
      if (activeCallRef.current && activeCallRef.current !== call) {
          activeCallRef.current.close();
      }
      
      activeCallRef.current = call;

      call.on('stream', (remoteStream) => {
          setStatus('Connected');
          setError(null);
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
          }
      });

      call.on('close', () => {
          setRemoteStream(null);
          setStatus('Opponent disconnected.');
          activeCallRef.current = null;
          // If we were the caller (White), the useEffect cleanup or retry logic 
          // isn't automatically triggered here unless we trigger a state change 
          // or if the 'peer-unavailable' error loop catches it on next attempt.
      });
      
      call.on('error', (err) => {
          console.error("Call specific error", err);
          activeCallRef.current = null;
      });
  };

  return (
    <div className="w-full bg-black rounded-lg border-2 border-gray-700 aspect-video relative overflow-hidden shadow-lg group">
        {/* Remote Video (Main View) */}
        {remoteStream ? (
             <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
             />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                 {error ? (
                     <span className="text-red-400 text-sm px-2 text-center">{error}</span>
                 ) : (
                    <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-2"></div>
                        <span className="text-xs animate-pulse">{status}</span>
                    </>
                 )}
            </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute bottom-2 right-2 w-1/3 max-w-[100px] aspect-video bg-gray-800 rounded border border-gray-600 overflow-hidden shadow-md transition-transform hover:scale-110 z-10">
            {localStream ? (
                <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover mirror"
                    style={{ transform: 'scaleX(-1)' }}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
            )}
        </div>
        
        <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-[10px] text-gray-300 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            {gameId ? `${gameId} (${playerColor})` : 'No Game'}
        </div>
    </div>
  );
};

export default VideoFeed;