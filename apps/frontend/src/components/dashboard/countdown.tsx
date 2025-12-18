"use client";
import React, { useState, useEffect, useCallback } from "react";

function Countdown({ targetDate }: { targetDate: string }) {
  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft: {
      days?: number;
      hours?: number;
      minutes?: number;
      seconds?: number;
    } = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, calculateTimeLeft]);

  return (
    <p>
      <span className="hidden md:inline">Next Issue in: </span>
      {timeLeft.days !== undefined ? (
        <span>
          <span suppressHydrationWarning>
            {timeLeft.days ?? 0}{" "}
            {timeLeft.days === 0 ? "" : timeLeft.days > 1 ? "days " : "day "}
          </span>
          <span suppressHydrationWarning>
            {timeLeft.hours ?? 0}{" "}
            {timeLeft.hours === 0
              ? ""
              : timeLeft.hours! > 1
              ? "hours "
              : "hour "}
          </span>
          <span suppressHydrationWarning>
            {timeLeft.minutes ?? 0}{" "}
            {timeLeft.minutes === 0
              ? ""
              : timeLeft.minutes! > 1
              ? "minutes "
              : "minute "}
          </span>
          <span suppressHydrationWarning>
            {timeLeft.seconds ?? 0}{" "}
            {timeLeft.seconds === 0
              ? ""
              : timeLeft.seconds! > 1
              ? "seconds "
              : "second "}
          </span>
        </span>
      ) : (
        <span suppressHydrationWarning>Now!</span>
      )}
    </p>
  );
}

export default Countdown;
