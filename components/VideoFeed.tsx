
import React, { useEffect, useRef, useState } from 'react';
import { Peer } from 'peerjs';
import type { MediaConnection } from 'peerjs';
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
  const [retryPeerTrigger, setRetryPeerTrigger] = useState(0);
  const [mediaRetryTrigger, setMediaRetryTrigger] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const activeCallRef = useRef<MediaConnection | null>(null);
  const callRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Attach Local Stream to Video Element when stream/element is ready
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach Remote Stream to Video Element when stream/element is ready
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // 1. Handle Media Stream (Camera/Mic)
  useEffect(() => {
    let mounted = true;
    let stream: MediaStream | null = null;

    const startStream = async () => {
      if (!gameActive) return;

      // Check if API is available (requires HTTPS)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (mounted) setError('Media API unavailable. HTTPS required?');
        return;
      }
      
      try {
        setStatus('Accessing camera...');
        setError(null);

        // Explicitly request front camera for mobile compatibility
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' }, 
            audio: true 
        });
        
        if (mounted) {
          setLocalStream(stream);
          // Note: We do not attach srcObject here anymore. 
          // The useEffect above handles it once the video element renders.
        } else {
          // Component unmounted during await
          stream.getTracks().forEach(t => t.stop());
        }
      } catch (err: any) {
        console.error('Media access error:', err);
        if (mounted) {
            let msg = 'Could not access camera/mic.';
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                msg = 'Permission denied. Allow camera access in browser settings.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                msg = 'No camera or microphone found.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                msg = 'Camera/mic is in use by another app.';
            } else if (err.name === 'SecurityError' || err.name === 'TypeError') {
                msg = 'Secure context required (HTTPS).';
            } else if (err.name === 'OverconstrainedError') {
                msg = 'Camera constraints not met.';
            }
            setError(msg);
        }
      }
    };

    startStream();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setLocalStream(null);
    };
  }, [gameActive, mediaRetryTrigger]);

  // 2. Handle PeerJS Connection
  useEffect(() => {
    if (!gameId || !playerColor || !gameActive || !localStream) {
      if (!gameActive) setStatus('Idle');
      return;
    }

    let mounted = true;

    // Cleanup function for this effect
    const cleanup = () => {
      if (callRetryTimeoutRef.current) clearTimeout(callRetryTimeoutRef.current);
      if (activeCallRef.current) {
        activeCallRef.current.close();
        activeCallRef.current = null;
      }
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      setRemoteStream(null);
    };

    cleanup(); // Ensure clean slate before starting

    // Sanitize Game ID for PeerJS compatibility (alphanumeric + dashes)
    const cleanGameId = gameId.replace(/[^a-zA-Z0-9]/g, '-');
    const myPeerId = `bg-game-${cleanGameId}-${playerColor}`;
    const opponentPeerId = `bg-game-${cleanGameId}-${playerColor === 'white' ? 'black' : 'white'}`;

    const initPeer = () => {
        setStatus('Connecting to signaling server...');
        
        const peer = new Peer(myPeerId, {
            debug: 1,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });
        peerRef.current = peer;

        peer.on('open', (id) => {
            if (!mounted) return;
            console.log('My Peer ID:', id);
            setStatus('Waiting for opponent...');
            
            if (playerColor === 'white') {
                startCalling();
            }
        });

        peer.on('call', (call) => {
            if (!mounted) return;
            console.log('Incoming call from:', call.peer);
            // Accept call
            call.answer(localStream);
            handleCall(call);
        });

        peer.on('error', (err: any) => {
            if (!mounted) return;
            console.warn('PeerJS Error:', err.type, err);

            if (err.type === 'unavailable-id') {
                setStatus('ID taken. Retrying...');
                // ID is locked (likely from previous session). Retry completely after delay.
                setTimeout(() => {
                    if (mounted) setRetryPeerTrigger(n => n + 1);
                }, 2000);
            } else if (err.type === 'peer-unavailable') {
                // Expected when calling an opponent who hasn't joined yet.
                // The startCalling retry loop handles this.
                setStatus('Opponent not online yet...');
            } else if (err.type === 'network' || err.type === 'disconnected') {
                 setError('Network connection lost.');
            } else {
                 // Other fatal errors
                 console.error('Fatal PeerJS Error', err);
            }
        });
    };

    const startCalling = () => {
        if (!mounted || !peerRef.current || peerRef.current.destroyed) return;
        
        // Don't call if we already have a connection
        if (activeCallRef.current && activeCallRef.current.open) return;

        setStatus('Calling opponent...');
        const call = peerRef.current.call(opponentPeerId, localStream);
        handleCall(call);

        // Setup retry loop in case opponent isn't there yet
        // We only want to retry if WE are the caller (White) and connection isn't established
        if (callRetryTimeoutRef.current) clearTimeout(callRetryTimeoutRef.current);
        callRetryTimeoutRef.current = setTimeout(() => {
            if (mounted && (!activeCallRef.current || !activeCallRef.current.open)) {
                startCalling();
            }
        }, 3000);
    };

    const handleCall = (call: MediaConnection) => {
        if (activeCallRef.current && activeCallRef.current !== call) {
            activeCallRef.current.close();
        }
        activeCallRef.current = call;

        call.on('stream', (stream) => {
            if (!mounted) return;
            console.log('Received remote stream');
            setStatus('Connected');
            setError(null);
            setRemoteStream(stream);
            // Note: We do not attach srcObject here anymore.
            // The useEffect above handles it once the video element renders.

            // Clear any pending retries
            if (callRetryTimeoutRef.current) clearTimeout(callRetryTimeoutRef.current);
        });

        call.on('close', () => {
            if (!mounted) return;
            setStatus('Opponent disconnected');
            setRemoteStream(null);
            activeCallRef.current = null;
            // If we are White, restart calling loop
            if (playerColor === 'white') {
                startCalling();
            }
        });

        call.on('error', (err) => {
             console.error('Call error:', err);
             activeCallRef.current = null;
        });
    };

    initPeer();

    return () => {
        mounted = false;
        cleanup();
    };
  }, [gameId, playerColor, gameActive, localStream, retryPeerTrigger]);

  return (
    <div className="w-full h-full bg-black rounded-lg border-2 border-gray-700 aspect-video relative overflow-hidden shadow-lg group">
        {/* Remote Video (Main View) */}
        {remoteStream ? (
             <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
             />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                 {error ? (
                     <div className="text-red-400 text-sm flex flex-col items-center gap-2">
                        <div>
                            <p className="font-bold">Video Error</p>
                            {error}
                        </div>
                        <button 
                            onClick={() => setMediaRetryTrigger(n => n + 1)}
                            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-200 text-xs rounded border border-red-500/50 transition-colors"
                        >
                            Retry Camera
                        </button>
                     </div>
                 ) : (
                    <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-2"></div>
                        <span className="text-xs animate-pulse">{status}</span>
                        {playerColor === 'white' && <span className="text-[10px] text-gray-600 mt-2">(You are the host/caller)</span>}
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
                     {/* Placeholder icon */}
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
            )}
        </div>
        
        <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-[10px] text-gray-300 font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {gameId ? `${gameId} (${playerColor})` : 'No Game'}
        </div>
    </div>
  );
};

export default VideoFeed;
