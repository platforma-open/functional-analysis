import type { GraphMakerState } from "@milaboratories/graph-maker";
import { kind } from "@platforma-open/milaboratories.functional-analysis.kind";
import { createPlDataTableStateV2, DataModelBuilder } from "@platforma-sdk/model";
import type { BlockArgs, BlockData, LegacyUiState } from "./types";

export const blockDataModel = new DataModelBuilder({ kind })
  .from<BlockData>("v1")
  // V1 kept these in two buckets and V3 keeps one, but the fields are the same
  // fields — the merge is the whole upgrade.
  .upgradeLegacy<BlockArgs, LegacyUiState>(({ args, uiState }) => ({
    ...args,
    tableState: uiState.tableState,
    graphState: uiState.graphState,
  }))
  .init(({ params }) => ({
    geneListRef: params?.geneListRef,
    pathwayCollection: params?.pathwayCollection ?? "GO",
    geneSubset: params?.geneSubset ?? ["Up", "Down"],

    tableState: createPlDataTableStateV2(),
    graphState: {
      title: "Top 10 enriched pathways",
      template: "bar",
      axesSettings: {
        axisX: {
          // These angles do not seems to work currently when (reverse axis) is reverse: true
          axisLabelsAngle: 0,
          // Need to hide this axis title for proper alignment of plots for now
          titleMode: "hidden",
        },
        axisY: {
          axisLabelsAngle: 0,
        },
        legend: {},
        other: {
          reverse: true,
          facetColumns: 1,
          facetSharedBy: "none",
        },
      } as Partial<GraphMakerState["axesSettings"]>,
    },
  }));
