// The link between the two browsers. PeerJS's public broker introduces them;
// after that, moves and chat travel over a WebRTC data channel and any camera
// or microphone over WebRTC media, directly between the two players.
/* global Peer */
import { iceServers } from './ice.js';

const PREFIX = 'bg-game-';
// How long to try before telling a joining player the link can't be made.
const CONNECT_TIMEOUT = 20000;
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';   // no look-alikes

export function newCode() {
  const pick = crypto.getRandomValues(new Uint8Array(6));
  const chars = [...pick].map((n) => ALPHABET[n % ALPHABET.length]).join('');
  return `${chars.slice(0, 3)}-${chars.slice(3)}`;
}

/** Tidy whatever someone typed or pasted (a code or a whole link) into a code. */
export function cleanCode(text) {
  const raw = text.includes('#') ? text.slice(text.lastIndexOf('#') + 1) : text;
  const chars = raw.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6);
  return chars.length > 3 ? `${chars.slice(0, 3)}-${chars.slice(3)}` : chars;
}

// Lets the host tell a returning opponent from a stranger with the code.
function guestId() {
  try {
    let id = sessionStorage.getItem('bg-guest');
    if (!id) sessionStorage.setItem('bg-guest', (id = crypto.randomUUID()));
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/**
 * Host a game or join one.
 * on: waiting(), open(), message(obj), peerLeft(), remoteStream(stream|null), ended(reason)
 * Reasons: 'left' | 'lost' | 'full' | 'noroom' | 'taken' | 'network' | 'browser' | 'unreachable'
 * The host's room outlives a dropped opponent (peerLeft) so they can rejoin.
 */
export function openLink({ code, host, on }) {
  const roomId = PREFIX + code;
  let peer = null;          // created once we know the ICE servers
  let conn = null;
  let guest = null;         // host only: who is sitting opposite
  let outgoing = null;      // our camera/mic, sent to them
  let incoming = null;      // theirs, sent to us
  let localStream = null;
  let closed = false;

  const end = (reason) => {
    if (closed) return;
    closed = true;
    try { peer?.destroy(); } catch {}
    on.ended?.(reason);
  };

  const dropIncoming = () => {
    try { incoming?.close(); } catch {}
    incoming = null;
    on.remoteStream?.(null);
  };

  const callOut = () => {
    try { outgoing?.close(); } catch {}
    outgoing = null;
    if (localStream && conn?.open) outgoing = peer.call(conn.peer, localStream);
  };

  const lostPeer = (c, reason) => {
    if (conn !== c) return;            // an old connection that was replaced
    conn = null;
    try { outgoing?.close(); } catch {}
    outgoing = null;
    dropIncoming();
    if (host) on.peerLeft?.();
    else end(reason);
  };

  const wire = (c) => {
    conn = c;
    const timer = setTimeout(() => {
      if (conn !== c || c.open) return;
      if (!host) return end('unreachable');
      conn = null;                     // forget it first so its close isn't reported as a departure
      try { c.close(); } catch {}
    }, CONNECT_TIMEOUT);
    c.on('open', () => { clearTimeout(timer); on.open?.(); callOut(); });
    c.on('data', (data) => {
      if (conn !== c) return;
      if (data?.t === 'full') return end('full');
      if (data?.t === 'bye') return lostPeer(c, 'left');
      if (data?.t === 'media-off') return dropIncoming();
      on.message?.(data);
    });
    c.on('close', () => lostPeer(c, 'lost'));
  };

  iceServers().then((servers) => {
    if (closed) return;
    const options = { config: { iceServers: servers } };
    peer = host ? new Peer(roomId, options) : new Peer(options);

    peer.on('open', () => {
      if (host) return on.waiting?.();
      wire(peer.connect(roomId, { reliable: true, metadata: { id: guestId() } }));
    });

    peer.on('connection', (c) => {
      if (!host) return c.close();
      const id = c.metadata?.id;
      if (conn && id !== guest) {
        // Backgammon is for two. Tell the newcomer, then let them go.
        c.on('open', () => { c.send({ t: 'full' }); setTimeout(() => c.close(), 500); });
        return;
      }
      // Either the seat is free or the same opponent is back (say, after a reload).
      const old = conn;
      guest = id;
      wire(c);
      try { old?.close(); } catch {}
    });

    peer.on('call', (media) => {
      if (!conn || media.peer !== conn.peer) return media.close();
      try { incoming?.close(); } catch {}
      incoming = media;
      media.answer();                    // receive only; ours goes out on its own call
      media.on('stream', (stream) => { if (incoming === media) on.remoteStream?.(stream); });
      media.on('close', () => { if (incoming === media) dropIncoming(); });
    });

    // Losing the broker doesn't affect a game in progress; quietly reconnect so
    // a waiting host stays reachable.
    peer.on('disconnected', () => { if (!closed && !peer.destroyed) peer.reconnect(); });

    peer.on('error', (err) => {
      const reason = {
        'peer-unavailable': 'noroom',
        'unavailable-id': 'taken',
        'browser-incompatible': 'browser',
        'network': 'network',
        'server-error': 'network',
        'socket-error': 'network',
        'socket-closed': 'network',
      }[err.type];
      // Once the two browsers are talking, broker trouble is not our problem.
      if (reason && !(conn?.open && reason === 'network')) end(reason);
    });
  });

  return {
    get connected() { return Boolean(conn?.open); },
    send(message) { if (conn?.open) conn.send(message); },
    /** Share a camera/microphone stream with the other player, or null to stop. */
    setMedia(stream) {
      const was = localStream;
      localStream = stream;
      callOut();
      if (was && !stream && conn?.open) conn.send({ t: 'media-off' });
    },
    close() {
      if (closed) return;
      try { if (conn?.open) conn.send({ t: 'bye' }); } catch {}
      closed = true;
      // Give the goodbye a moment to leave before tearing down.
      setTimeout(() => { try { peer?.destroy(); } catch {} }, 150);
    },
  };
}
