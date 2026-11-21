import type { GradientKindDefinition } from "./kind";
import { grain } from "./shaders/grain";
import type { GradientKind, GradientParams } from "./types";

export type { GradientKindDefinition } from "./kind";

const registry = new Map<string, GradientKindDefinition>();

/** Adds a kind. Re-registering a name replaces it. */
export function registerKind(definition: GradientKindDefinition): void {
  registry.set(definition.name, definition);
}

registerKind(grain);

/** The kind's definition, or grain when the name is unknown. */
export function getKind(kind: GradientKind): GradientKindDefinition {
  return registry.get(kind) ?? grain;
}

export function listKinds(): GradientKindDefinition[] {
  return [...registry.values()];
}

/** Full params tuned for a kind. */
export function kindDefaults(kind: GradientKind): GradientParams {
  const definition = getKind(kind);
  return { ...definition.defaults, kind: definition.name };
}
