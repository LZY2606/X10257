import type { CodeGenerator, Module, RecordKey, RecordLocation } from "skir-internal";
import type { ModuleSet } from "./module_set.js";

/**
 * Builds the input handed to code generators from a compiled module set.
 *
 * This is the single place where the compiler canonicalizes the order of the
 * model before it crosses the plugin boundary (`CodeGenerator.generateCode`).
 * Both `modules` and `recordMap` are sorted by their string keys using a
 * code-unit comparison, so the bytes produced by generators do not depend on
 * the order in which the source files were enumerated (glob order, dependency
 * download order, OS directory order, ...).
 *
 * The returned arrays/maps are fresh objects; the `ModuleSet` is not mutated.
 */
export function makeGeneratorInput<Config>(
  moduleSet: ModuleSet,
  config: Config,
): CodeGenerator.Input<Config> {
  const modules: Module[] = [...moduleSet.modules.values()].map(
    (r) => r.result,
  );
  modules.sort((a, b) => compareStrings(a.path, b.path));
  const recordMap: Map<RecordKey, RecordLocation> = new Map(
    [...moduleSet.recordMap.entries()].sort(([keyA], [keyB]) =>
      compareStrings(keyA, keyB),
    ),
  );
  return {
    modules: modules,
    recordMap: recordMap,
    config: config,
  };
}

/**
 * Deterministic, locale-independent string comparison (UTF-16 code units).
 * Unlike `String.localeCompare`, the result does not depend on the host
 * locale, which makes it safe to use for canonical ordering.
 */
export function compareStrings(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
