import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useTimer — manages a running stopwatch + active session state.
 *
 * Returns:
 *   elapsed      {number}   seconds elapsed since start
 *   isRunning    {boolean}
 *   sessionMeta  {object}   { categoryId, projectId, notes }
 *   start(meta)  {fn}       start timer with session metadata
 *   stop()       {fn}       stop and return { duration, ...meta }
 *   reset()      {fn}       reset without saving
 *   setNotes(s)  {fn}       update notes while running
 */
export function useTimer() {
  const [elapsed,     setElapsed]     = useState(0);
  const [isRunning,   setIsRunning]   = useState(false);
  const [sessionMeta, setSessionMeta] = useState({ categoryId: "", projectId: "", notes: "" });

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const tick = useCallback(() => {
    setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
  }, []);

  const start = useCallback((meta = {}) => {
    if (isRunning) return;
    startTimeRef.current = Date.now();
    setElapsed(0);
    setIsRunning(true);
    setSessionMeta({ categoryId: "", projectId: "", notes: "", ...meta });
    intervalRef.current = setInterval(tick, 1000);
  }, [isRunning, tick]);

  const stop = useCallback(() => {
    if (!isRunning) return null;
    clearInterval(intervalRef.current);
    setIsRunning(false);
    const duration = elapsed;
    const result = { duration, ...sessionMeta };
    setElapsed(0);
    return result;
  }, [isRunning, elapsed, sessionMeta]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setElapsed(0);
    setSessionMeta({ categoryId: "", projectId: "", notes: "" });
  }, []);

  const setNotes = useCallback((notes) => {
    setSessionMeta((prev) => ({ ...prev, notes }));
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  return { elapsed, isRunning, sessionMeta, start, stop, reset, setNotes, setSessionMeta };
}
