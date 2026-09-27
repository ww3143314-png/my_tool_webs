/**
 * Web Polyfill for @tauri-apps/api/event
 * Allows in-browser event subscriptions using DOM CustomEvent & in-memory listeners.
 */

type EventCallback<T = any> = (event: { event: string; id: number; payload: T }) => void;

const listeners = new Map<string, Set<EventCallback>>();
let nextId = 1;

export async function listen<T = any>(
  event: string,
  handler: EventCallback<T>
): Promise<() => void> {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  const set = listeners.get(event)!;
  set.add(handler);

  return () => {
    set.delete(handler);
    if (set.size === 0) {
      listeners.delete(event);
    }
  };
}

export async function once<T = any>(
  event: string,
  handler: EventCallback<T>
): Promise<() => void> {
  const unlisten = await listen<T>(event, (ev) => {
    unlisten();
    handler(ev);
  });
  return unlisten;
}

export async function emit<T = any>(event: string, payload?: T): Promise<void> {
  const set = listeners.get(event);
  if (set) {
    const ev = { event, id: nextId++, payload: payload as T };
    set.forEach((fn) => {
      try {
        fn(ev);
      } catch (err) {
        console.error(`[WebEvent] Error in listener for ${event}:`, err);
      }
    });
  }
}
