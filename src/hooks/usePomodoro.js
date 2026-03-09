import { useState, useEffect, useRef, useCallback } from "react";
import { POMODORO_SETTINGS } from "../data/constants";

/**
 * usePomodoro — Pomodoro timer (work / short break / long break cycles).
 *
 * Returns:
 *   timeLeft      {number}   seconds remaining in current phase
 *   phase         {string}   "work" | "shortBreak" | "longBreak"
 *   isRunning     {boolean}
 *   sessionCount  {number}   completed work sessions
 *   start()       {fn}
 *   pause()       {fn}
 *   skip()        {fn}       move to next phase
 *   reset()       {fn}       reset to work phase
 */
export function usePomodoro(settings = POMODORO_SETTINGS) {
  const [phase,        setPhase]        = useState("work");
  const [timeLeft,     setTimeLeft]     = useState(settings.work);
  const [isRunning,    setIsRunning]    = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const intervalRef = useRef(null);

  const nextPhase = useCallback((currentPhase, count) => {
    if (currentPhase === "work") {
      const newCount = count + 1;
      setSessionCount(newCount);
      if (newCount % 4 === 0) {
        setPhase("longBreak");
        setTimeLeft(settings.longBreak);
      } else {
        setPhase("shortBreak");
        setTimeLeft(settings.shortBreak);
      }
    } else {
      setPhase("work");
      setTimeLeft(settings.work);
    }
    setIsRunning(false);
    clearInterval(intervalRef.current);
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

  return { timeLeft, phase, isRunning, sessionCount, start, pause, skip, reset };
}
