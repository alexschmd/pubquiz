"use client";
import { kindDefaults } from "../lib/gradient-engine";
import type { GradientParams } from "../lib/gradient-engine";
import { GradientBackground } from "./gradient-surface";
import type { GradientBackgroundProps } from "./gradient-surface";

/** A grainy, out-of-focus blend of saturated colour. */
export const grainGradientDefaults: GradientParams = kindDefaults("grain");

export type GrainGradientProps = GradientBackgroundProps;

export function GrainGradient(props: GrainGradientProps) {
  return <GradientBackground defaults={grainGradientDefaults} {...props} />;
}
