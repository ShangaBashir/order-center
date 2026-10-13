import { useEffect, useState, useRef, useCallback } from 'react';

export interface RealtimeOrderEvent {
  type: 'ORDER_CREATED' | 'ORDER_UPDATED' | 'ORDER_STATUS_UPDATED' | 'ORDER_DELETED';
  orderId: string;
  trackingNumber?: string;
  status?: string;
  order?: any;
  timestamp?: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SSE_URL = `${API_BASE}/tracking/events`;
const BROADCAST_CHANNEL_NAME = 'order_center_realtime_channel';

// Cross-tab broadcast channel
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch (e) {
  // Ignore BroadcastChannel errors in unsupported envs
}

type EventListener = (event: RealtimeOrderEvent) => void;
const listeners = new Set<EventListener>();

// Broadcast locally across browser tabs
export function broadcastLocalOrderEvent(event: RealtimeOrderEvent) {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage(event);
    }
  } catch (e) {}

  listeners.forEach(fn => {
    try {
      fn(event);
    } catch (err) {
      console.error('Error executing realtime listener:', err);
    }
  });
}

// Receive messages from BroadcastChannel
if (broadcastChannel) {
  broadcastChannel.onmessage = (msgEvent) => {
    if (msgEvent.data && msgEvent.data.type) {
      listeners.forEach(fn => {
        try {
          fn(msgEvent.data);
        } catch (err) {
          console.error('Error executing realtime listener:', err);
        }
      });
    }
  };
}

// Singleton SSE connection
let eventSource: EventSource | null = null;
let reconnectTimer: any = null;
let sseConnected = false;

function connectSSE() {
  if (typeof window === 'undefined') return;
  if (eventSource && eventSource.readyState !== EventSource.CLOSED) return;

  try {
    eventSource = new EventSource(SSE_URL);

    eventSource.onopen = () => {
      sseConnected = true;
    };

    eventSource.onmessage = (e) => {
      try {
        const data: RealtimeOrderEvent = JSON.parse(e.data);
        if (data && data.type) {
          // Notify all registered listeners
          listeners.forEach(fn => {
            try {
              fn(data);
            } catch (err) {
              console.error('Realtime listener error:', err);
            }
          });

          // Also forward through BroadcastChannel so all tabs hear it
          if (broadcastChannel) {
            try {
              broadcastChannel.postMessage(data);
            } catch (err) {}
          }
        }
      } catch (parseErr) {
        // Ping or non-JSON message, ignore
      }
    };

    eventSource.onerror = () => {
      sseConnected = false;
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      // Reconnect after 3 seconds
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connectSSE, 3000);
    };
  } catch (err) {
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectSSE, 5000);
  }
}

// Hook to subscribe to specific order tracking updates in real-time
export function useRealtimeTracking(
  targetId?: string,
  onUpdate?: (event: RealtimeOrderEvent) => void
) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLivePulse, setIsLivePulse] = useState(false);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const targetIdClean = (targetId || '').trim().toLowerCase();

  const handleEvent = useCallback((event: RealtimeOrderEvent) => {
    if (!targetIdClean) return;

    const eventOrderId = (event.orderId || '').trim().toLowerCase();
    const eventTracking = (event.trackingNumber || '').trim().toLowerCase();

    if (
      eventOrderId === targetIdClean ||
      eventTracking === targetIdClean ||
      (event.order && (
        (event.order.orderId || '').toLowerCase() === targetIdClean ||
        (event.order.trackingNumber || '').toLowerCase() === targetIdClean ||
        (event.order._id || '').toLowerCase() === targetIdClean
      ))
    ) {
      setLastUpdated(new Date());
      setIsLivePulse(true);
      setTimeout(() => setIsLivePulse(false), 2500);

      if (onUpdateRef.current) {
        onUpdateRef.current(event);
      }
    }
  }, [targetIdClean]);

  useEffect(() => {
    connectSSE();
    listeners.add(handleEvent);

    return () => {
      listeners.delete(handleEvent);
    };
  }, [handleEvent]);

  return { lastUpdated, isLivePulse, isConnected: sseConnected };
}

// Hook to subscribe to ANY order updates (e.g. for user account or admin dashboard)
export function useRealtimeOrders(onAnyUpdate?: (event: RealtimeOrderEvent) => void) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const onUpdateRef = useRef(onAnyUpdate);
  onUpdateRef.current = onAnyUpdate;

  const handleEvent = useCallback((event: RealtimeOrderEvent) => {
    setLastUpdated(new Date());
    if (onUpdateRef.current) {
      onUpdateRef.current(event);
    }
  }, []);

  useEffect(() => {
    connectSSE();
    listeners.add(handleEvent);

    return () => {
      listeners.delete(handleEvent);
    };
  }, [handleEvent]);

  return { lastUpdated };
}
