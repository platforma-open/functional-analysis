import { kind } from "@platforma-open/milaboratories.functional-analysis.kind";
import type { InferOutputsType, PColumnIdAndSpec, PFrameHandle } from "@platforma-sdk/model";
import {
  BlockModelV3,
  createPFrameForGraphs,
  createPlDataTableSheet,
  createPlDataTableV2,
  getUniquePartitionKeys,
  isPColumnSpec,
} from "@platforma-sdk/model";
import { blockDataModel } from "./dataModel";
import type { BlockArgs } from "./types";

export { blockDataModel } from "./dataModel";
export type { BlockArgs, BlockData } from "./types";

export const platforma = BlockModelV3.create({ dataModel: blockDataModel, kind })

  // The run gate. Throwing shows the reason in the UI. Replaces V1's
  // `.argsValid`. The projection strips the view state and returns the same
  // keys V1 stored as args.
  .args<BlockArgs>((data): BlockArgs => {
    const { tableState: _tableState, graphState: _graphState, ...args } = data;

    if (args.geneListRef === undefined) {
      throw new Error("Gene list is required");
    }
    if (args.pathwayCollection === undefined) {
      throw new Error("Pathway collection is required");
    }
    // An empty subset list gives the R script nothing to enrich.
    if (args.geneSubset.length === 0) {
      throw new Error("At least one gene subset is required");
    }

    return args;
  })

  // Inverse of the kind's init-params contract. `title` is left out: the UI
  // derives it from the gene list label.
  .templateParams((data) => ({
    geneListRef: data.geneListRef,
    pathwayCollection: data.pathwayCollection,
    geneSubset: data.geneSubset,
  }))

  // User can only select as input regulationDirection lists
  // includeNativeLabel ensures regulationDirection pl7.app/label
  // is also visible in selection (by default we only see Samples & data ID)
  // addLabelAsSuffix moves the native label to the end
  // forceTraceElements ensures trace labels are always shown (e.g., cluster-markers or sc-differential-expression parameters)
  // Result: [dataID] / A vs B
  .output("geneListOptions", (ctx) =>
    ctx.resultPool.getOptions(
      (spec) => isPColumnSpec(spec) && spec.name === "pl7.app/rna-seq/regulationDirection",
      {
        includeNativeLabel: false,
        addLabelAsSuffix: false,
        forceTraceElements: [
          "milaboratories.cluster-markers",
          "milaboratories.sc-differential-expression",
        ],
      },
    ),
  )

  // The table and its sheets are two outputs: PlAgDataTableV2 (via
  // usePlDataTableSettingsV2) takes the table status-wrapped and the sheets
  // as a plain value.
  .outputWithStatus("ORApt", (ctx) => {
    const pCols = ctx.outputs?.resolve("ORAPf")?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    return createPlDataTableV2(ctx, pCols, ctx.data.tableState);
  })

  .output("ORAsheets", (ctx) => {
    const pCols = ctx.outputs?.resolve("ORAPf")?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    // Create sheets based on first axis (either contrast or cluster)
    // This first axis seems to be partitioned by default
    // notice it is not included in ORAresImportParams, which has partitionKeyLength: 0
    const anchor = pCols[0];
    if (!anchor) return undefined;

    const r = getUniquePartitionKeys(anchor.data);
    if (!r) return undefined;

    const firstAxisValues = r[0];
    if (!firstAxisValues) return undefined;

    const firstAxisSpec = anchor.spec.axesSpec[0];
    if (!firstAxisSpec) return undefined;

    return [createPlDataTableSheet(ctx, firstAxisSpec, firstAxisValues)];
  })

  // `withStatus` on the plot frame: GraphMaker's `p-frame` prop takes the
  // status-wrapped output.
  .outputWithStatus("ORATop10Pf", (ctx): PFrameHandle | undefined => {
    let pCols = ctx.outputs?.resolve("ORATop10Pf")?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    pCols = pCols.filter(
      (col) =>
        // Filter out Gene/Background Ratio pColumns
        col.spec.name !== "pl7.app/rna-seq/BgRatio" &&
        col.spec.name !== "pl7.app/rna-seq/GeneRatio",
    );

    return createPFrameForGraphs(ctx, pCols);
  })

  // Return PColumnIdAndSpec needed for default plot parameters
  .output("ORATop10Pcols", (ctx) => {
    const pCols = ctx.outputs?.resolve("ORATop10Pf")?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    return pCols.map(
      (c) =>
        ({
          columnId: c.id,
          spec: c.spec,
        }) satisfies PColumnIdAndSpec,
    );
  })

  .title((ctx) =>
    ctx.data.title ? `Functional Analysis - ${ctx.data.title}` : "Functional Analysis",
  )

  .sections(() => [
    { type: "link" as const, href: "/" as const, label: "Table" },
    { type: "link" as const, href: "/graph" as const, label: "Bar plot" },
  ])

  .done();

export type BlockOutputs = InferOutputsType<typeof platforma>;
