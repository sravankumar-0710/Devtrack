import { useEffect, useRef } from "react";
import { fmtDuration } from "../utils/helpers";

/**
 * useActivityGoalNotifications
 *
 * Fires a browser notification for each activity goal whose reminder time
 * has passed today and whose target has NOT yet been met.
 *
 * Checks every 60 seconds. Won't re-fire within the same minute.
 *
 * @param {Array}  activityGoals  - array of goal objects
 * @param {Array}  entries        - all session entries
 * @param {Array}  categories     - for resolving category names
 */
export function useActivityGoalNotifications(activityGoals, entries, categories) {
  const firedRef = useRef({}); // tracks which goals fired today

  useEffect(() => {
    // Request permission once
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const check = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      if (!activityGoals?.length) return;

      const now        = new Date();
      const todayStr   = now.toISOString().slice(0, 10);
      const todayDay   = now.getDay(); // 0 = Sun
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      activityGoals.forEach((goal) => {
        if (!goal.enabled) return;

        // Check if today is one of the goal's active days
        const activeDays = goal.days || [0,1,2,3,4,5,6];
        if (!activeDays.includes(todayDay)) return;

        // Parse reminder time
        if (!goal.reminderTime) return;
        const [rh, rm]      = goal.reminderTime.split(":").map(Number);
        const goalMinutes   = rh * 60 + rm;

        // Only fire at or after reminder time
        if (nowMinutes < goalMinutes) return;

        // Only fire once per day per goal
        const fireKey = `${goal.id}-${todayStr}`;
        if (firedRef.current[fireKey]) return;

        // Check if goal is already met
        const doneSecs = entries
          .filter((e) => e.date === todayStr && e.categoryId === goal.categoryId)
          .reduce((a, b) => a + b.duration, 0);

        if (doneSecs >= goal.targetSeconds) return; // already done — no notification

        // Fire notification
        const cat       = categories.find((c) => c.id === goal.categoryId);
        const remaining = goal.targetSeconds - doneSecs;

        try {
          new Notification("DevTrack Reminder 🎯", {
            body: `"${cat?.name || "Activity"}" goal not yet done — ${fmtDuration(remaining)} remaining (target: ${fmtDuration(goal.targetSeconds)})`,
            icon: "/favicon.ico",
            tag:  fireKey, // prevents duplicate OS notifications
          });
        } catch (e) {
          console.warn("Notification failed:", e);
        }

        firedRef.current[fireKey] = true;
      });
    };

    check(); // run immediately on mount / data change
    const interval = setInterval(check, 60_000); // re-check every minute
    return () => clearInterval(interval);
  }, [activityGoals, entries, categories]);
}