/**
 * WebSocket Service
 *
 * Manages a persistent WebSocket connection to the OIE backend.
 * Provides < 200 ms push updates for real-time parking verdicts.
 *
 * In development / demo mode the service falls back to polling the
 * mock OIEService when a real WebSocket server is unavailable.
 */

import { queryOIE } from './OIEService';

const WS_URL = 'wss://api.tripsph.mmda.gov.ph/oie/stream';
const RECONNECT_DELAY_MS = 3000;
const POLL_INTERVAL_MS = 30000; // fallback polling every 30 s

class WebSocketService {
  constructor() {
    this._ws = null;
    this._listeners = new Set();
    this._connected = false;
    this._reconnectTimer = null;
    this._pollTimer = null;
    this._lastCoords = null;
    this._useFallback = false;
  }

  /**
   * Start the WebSocket connection.
   * Falls back to polling if the server is unreachable.
   */
  connect() {
    if (this._connected) return;

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        this._connected = true;
        this._useFallback = false;
        clearTimeout(this._reconnectTimer);
        this._emit({ type: 'connected' });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this._emit({ type: 'verdict', payload: data });
        } catch (_) {
          // ignore malformed frames
        }
      };

      ws.onerror = () => {
        this._useFallback = true;
        this._startFallbackPolling();
      };

      ws.onclose = () => {
        this._connected = false;
        this._emit({ type: 'disconnected' });
        this._scheduleReconnect();
      };

      this._ws = ws;
    } catch (_) {
      this._useFallback = true;
      this._startFallbackPolling();
    }
  }

  /**
   * Send current GPS coordinates to the server so it can push back verdicts.
   */
  sendLocation(latitude, longitude) {
    this._lastCoords = { latitude, longitude };

    if (this._useFallback) {
      this._pollNow();
      return;
    }

    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: 'location', latitude, longitude }));
    }
  }

  /** Register a listener function (receives message objects). */
  addListener(fn) {
    this._listeners.add(fn);
  }

  /** Remove a previously registered listener. */
  removeListener(fn) {
    this._listeners.delete(fn);
  }

  disconnect() {
    clearTimeout(this._reconnectTimer);
    clearInterval(this._pollTimer);
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
    this._connected = false;
  }

  // ── private ──────────────────────────────────────────────────────────────────

  _emit(msg) {
    this._listeners.forEach((fn) => {
      try {
        fn(msg);
      } catch (_) {
        // don't let a bad listener crash the service
      }
    });
  }

  _scheduleReconnect() {
    this._reconnectTimer = setTimeout(() => this.connect(), RECONNECT_DELAY_MS);
  }

  _startFallbackPolling() {
    if (this._pollTimer) return; // already polling
    this._pollNow();
    this._pollTimer = setInterval(() => this._pollNow(), POLL_INTERVAL_MS);
  }

  async _pollNow() {
    if (!this._lastCoords) return;
    const { latitude, longitude } = this._lastCoords;
    const result = await queryOIE(latitude, longitude);
    this._emit({ type: 'verdict', payload: result });
  }
}

// Export a singleton instance
export const wsService = new WebSocketService();
