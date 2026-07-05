import { useState, useEffect, useRef, useCallback } from "react";
import { POMODORO_SETTINGS } from "../data/constants";

/**
 * usePomodoro — Pomodoro timer (work / short break / long break cycles).
 *
 * @param {object}   initialSettings  { work, shortBreak, longBreak } in seconds
 * @param {function} onPhaseComplete  called with the new phase name whenever
 *                                    a phase finishes (used to fire an alarm)
 *
 * Returns:
 *   timeLeft        {number}   seconds remaining in current phase
 *   phase           {string}   "work" | "shortBreak" | "longBreak"
 *   isRunning       {boolean}
 *   sessionCount    {number}   completed work sessions
 *   settings        {object}   current durations in seconds
 *   start()         {fn}
 *   pause()         {fn}
 *   skip()          {fn}       move to next phase
 *   reset()         {fn}       reset to work phase
 *   updateSettings(partial)  {fn}  change durations (e.g. { work: 1500 })
 */
export function usePomodoro(initialSettings = POMODORO_SETTINGS, onPhaseComplete) {
  const [settings,     setSettings]     = useState(initialSettings);
  const [phase,        setPhase]        = useState("work");
  const [timeLeft,     setTimeLeft]     = useState(initialSettings.work);
  const [isRunning,    setIsRunning]    = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const intervalRef = useRef(null);
  const onPhaseCompleteRef = useRef(onPhaseComplete);
  onPhaseCompleteRef.current = onPhaseComplete;

  const nextPhase = useCallback((currentPhase, count) => {
    let newPhase;
    if (currentPhase === "work") {
      const newCount = count + 1;
      setSessionCount(newCount);
      newPhase = newCount % 4 === 0 ? "longBreak" : "shortBreak";
    } else {
      newPhase = "work";
    }
    setPhase(newPhase);
    setTimeLeft(settings[newPhase]);
    setIsRunning(false);
    clearInterval(intervalRef.current);
    onPhaseCompleteRef.current?.(newPhase);
  }, [settings]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          nextPhase(phase, sessionCount);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, phase, sessionCount, nextPhase]);

  const start  = () => setIsRunning(true);
  const pause  = () => { setIsRunning(false); clearInterval(intervalRef.current); };
  const skip   = () => nextPhase(phase, sessionCount);
  const reset  = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setPhase("work");
    setTimeLeft(settings.work);
    setSessionCount(0);
  };

  // Change focus/break durations. If nothing is running, also snaps the
  // current phase's remaining time to the new value right away.
  const updateSettings = (partial) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      if (!isRunning) setTimeLeft(next[phase]);
      return next;
    });
  };

  return { timeLeft, phase, isRunning, sessionCount, settings, start, pause, skip, reset, updateSettings };
}