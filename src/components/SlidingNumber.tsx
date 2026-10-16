import { useEffect } from "react";
import { m, useReducedMotion, useSpring, useTransform } from "motion/react";

/** Each decimal place keeps its own spring, so rapid updates can interrupt a roll. */
function RollingDigit({ value, place }: { value: number; place: number }) {
  const target = Math.floor(value / place);
  const position = useSpring(target, {
    stiffness: 180,
    damping: 26,
    mass: 0.7,
  });
  useEffect(() => {
    position.set(target);
  }, [position, target]);
  return (
    <span className="sliding-digit">
      {Array.from({ length: 10 }, (_, digit) => (
        <DigitFace key={digit} digit={digit} position={position} />
      ))}
    </span>
  );
}
function DigitFace({
  digit,
  position,
}: {
  digit: number;
  position: ReturnType<typeof useSpring>;
}) {
  const y = useTransform(position, (latest) => {
    const current = ((latest % 10) + 10) % 10;
    const offset = ((digit - current + 15) % 10) - 5;
    return `${offset * 100}%`;
  });
  return (
    <m.span className="sliding-digit-face" style={{ y }}>
      {digit}
    </m.span>
  );
}
export function SlidingNumber({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  // Retain legacy fractional scores verbatim; score controls normally use integers.
  if (reduceMotion || !Number.isSafeInteger(value)) return <span>{value}</span>;
  const absolute = Math.abs(value);
  const places = Array.from(
    { length: String(absolute).length },
    (_, index) => 10 ** index,
  ).reverse();
  return (
    <span className="sliding-number" role="img" aria-label={String(value)}>
      <span className="sliding-number-visual" aria-hidden="true">
        {value < 0 && <span>−</span>}
        {places.map((place) => (
          <RollingDigit key={place} value={absolute} place={place} />
        ))}
      </span>
    </span>
  );
}
