import { describe, expect, it } from "vitest";
import { kind } from "./index";

const parse = (params: unknown) => kind.parseInitializationParams(params);

/** A ref exactly as `resultPool.getOptions` mints it for the gene list dropdown. */
const GENE_LIST_REF = {
  __isRef: true,
  blockId: "sc-differential-expression-1",
  name: "pl7.app/rna-seq/regulationDirection",
} as const;

describe("the params envelope", () => {
  it.each([
    ["null", null],
    ["a number", 5],
    ["an array", ["GO"]],
    ["a string", "pathwayCollection=GO"],
  ])("rejects %s", (_label, value) => {
    expect(() => parse(value)).toThrow();
  });

  it("accepts an empty object — a block created with nothing seeded", () => {
    expect(parse({})).toEqual({});
  });

  it("drops keys the contract does not name", () => {
    expect(parse({ pathwayCollection: "GO", title: "Functional Analysis - X" })).toEqual({
      pathwayCollection: "GO",
    });
  });

  it("returns a full set of params unchanged", () => {
    const params = {
      geneListRef: GENE_LIST_REF,
      pathwayCollection: "Reactome",
      geneSubset: ["Up", "DEGs"],
    };
    expect(parse(params)).toEqual(params);
  });
});

describe("geneListRef", () => {
  it.each([
    [
      "an object missing the ref marker",
      { blockId: "b1", name: "pl7.app/rna-seq/regulationDirection" },
    ],
    ["a bare column name", "pl7.app/rna-seq/regulationDirection"],
    ["null", null],
  ])("rejects %s", (_label, ref) => {
    expect(() => parse({ geneListRef: ref })).toThrow("'geneListRef' must be");
  });
});

describe("pathwayCollection", () => {
  it("rejects a value that is not a string", () => {
    expect(() => parse({ pathwayCollection: ["GO"] })).toThrow("'pathwayCollection' must be");
  });
});

describe("geneSubset", () => {
  it.each([
    ["a single string", "Up"],
    ["a list with a non-string entry", ["Up", 1]],
  ])("rejects %s", (_label, geneSubset) => {
    expect(() => parse({ geneSubset })).toThrow("'geneSubset' must be");
  });
});
