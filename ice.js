// Where WebRTC looks for a route between the two browsers.
//
// STUN tells each browser its public address, which is enough to connect most home
// networks directly. When no direct route exists (mobile data, routers or browsers
// that block local connections), TURN relays the traffic instead. mco.dev/api/turn
// hands out short-lived Cloudflare TURN credentials; without it (running locally,
// or the service is down) we fall back to STUN alone.
const STUN_ONLY = [{ urls: 'stun:stun.l.google.com:19302' }];
const FRESH_FOR = 60 * 60 * 1000;     // credentials last much longer; refresh hourly anyway
const WAIT_AT_MOST = 4000;

let cached = null;                     // { servers, at }

export async function iceServers() {
  if (cached && Date.now() - cached.at < FRESH_FOR) return cached.servers;
  try {
    const res = await fetch('/api/turn', { cache: 'no-store', signal: AbortSignal.timeout(WAIT_AT_MOST) });
    if (!res.ok) throw new Error(`TURN credentials: HTTP ${res.status}`);
    const { iceServers: servers } = await res.json();
    if (!Array.isArray(servers) || !servers.length) throw new Error('TURN credentials: empty');
    cached = { servers, at: Date.now() };
    return servers;
  } catch (err) {
    console.info('No TURN relay; direct connections only.', err.message);
    return STUN_ONLY;
  }
}
