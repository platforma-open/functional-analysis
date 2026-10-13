import { assertParamsObject, defineBlockKind } from "@platforma-sdk/block-kind";
import type { PlRef } from "@platforma-sdk/model";
import { isPlRef } from "@platforma-sdk/model";
import { name, version } from "../package.json" with { type: "json" };

/**
 * This block's init-params contract — the settings a user picks by hand: the
 * gene list, the pathway collection and the gene subsets.
 *
 * `title` is absent. The UI sets it from the label of the chosen gene list, so
 * there is nothing for a template to carry.
 *
 * Every field is optional. A block with no gene list chosen is ordinary state
 * the UI reaches — it is what a freshly created block looks like — and the
 * projection hands that state back untouched, so a required field would make
 * this block export a file its own kind refuses.
 */
export type BlockParams = {
  geneListRef?: PlRef;
  pathwayCollection?: string;
  geneSubset?: string[];
};

// Identity (`name`/`version`) comes from this package's own `package.json`, so
// the on-wire `{name}@{version}` reference can never drift from what npm
// publishes; the bundler inlines the JSON import.
export const kind = defineBlockKind<BlockParams>({
  name,
  version,
  parseInitializationParams,
});

// Internals

/** The same contract at runtime, for params arriving from a template file rather than typed code. */
function parseInitializationParams(value: unknown): BlockParams {
  assertParamsObject(value);

  const { geneListRef, pathwayCollection, geneSubset } = value;

  if (geneListRef !== undefined && !isPlRef(geneListRef)) {
    throw new Error(
      "'geneListRef' must be a reference to an upstream column, written as { __isRef: true, blockId, name }.",
    );
  }
  if (pathwayCollection !== undefined && typeof pathwayCollection !== "string") {
    throw new Error("'pathwayCollection' must be a pathway collection name.");
  }
  if (
    geneSubset !== undefined &&
    !(Array.isArray(geneSubset) && geneSubset.every((s) => typeof s === "string"))
  ) {
    throw new Error("'geneSubset' must be a list of gene subset names.");
  }

  return { geneListRef, pathwayCollection, geneSubset };
}
