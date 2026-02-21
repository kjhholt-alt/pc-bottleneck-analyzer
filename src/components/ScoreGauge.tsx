"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { getScoreColor, getScoreGlow } from "@/lib/score-utils";
import type { PerformanceScore } from "@/lib/types";

interface ScoreGaugeProps {
  score: PerformanceScore;
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const motionScore = useMotionValue(0);

  const size = 200;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useTransform(
    motionScore,
    [0, 100],
    [circumference, 0]
  );

  useEffect(() => {
    const controls = animate(motionScore, score.total, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (value) => setDisplayScore(Math.round(value)),
    });
    return controls.stop;
  }, [score.total, motionScore]);

  const color = getScoreColor(score.total);
  const glow = getScoreGlow(score.total);

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          style={{ filter: `drop-shadow(${glow})` }}
          role="img"
          aria-label={`Performance score: ${score.total} out of 100, grade ${score.grade}`}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {/* Animated progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: progress }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-bold font-mono tabular-nums"
            style={{ color }}
          >
            {displayScore}
          </span>
          <span
            className="text-lg font-semibold mt-0.5"
            style={{ color }}
          >
            {score.grade}
          </span>
        </div>
      </div>

      <p className="text-text-secondary text-sm text-center max-w-[240px]">
        {score.grade_description}
      </p>
    </motion.div>
  );
}
