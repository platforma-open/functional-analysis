import type { GraphMakerState } from '@milaboratories/graph-maker';
import type {
  InferOutputsType,
  PColumnIdAndSpec,
  PFrameHandle,
  PlDataTableStateV2,
  PlRef,
} from '@platforma-sdk/model';
import {
  BlockModel,
  createPFrameForGraphs,
  createPlDataTableSheet,
  createPlDataTableStateV2,
  createPlDataTableV2,
  getUniquePartitionKeys,
  isPColumnSpec,
} from '@platforma-sdk/model';

export type UiState = {
  tableState: PlDataTableStateV2;
  graphState: GraphMakerState;
};

export type BlockArgs = {
  geneListRef?: PlRef;
  title?: string;
  pathwayCollection?: string;
  geneSubset: string[];
};

export const model = BlockModel.create()

  .withArgs<BlockArgs>({
    pathwayCollection: 'GO',
    geneSubset: ['Up', 'Down'],
  })

  .withUiState<UiState>({
    tableState: createPlDataTableStateV2(),
    graphState: {
      title: 'Top 10 enriched pathways',
      template: 'bar',
      axesSettings: {
        axisX: {
          // These angles do not seems to work currently when (reverse axis) is reverse: true
          axisLabelsAngle: 0,
          // Need to hide this axis title for proper alignment of plots for now
          titleMode: 'hidden',
        },
        axisY: {
          axisLabelsAngle: 0,
        },
        legend: {},
        other: {
          reverse: true,
          facetColumns: 1,
          facetSharedBy: 'y',
        },
      } as Partial<GraphMakerState['axesSettings']>,
    },
  })

  // Activate "Run" button only after these conditions are satisfied
  .argsValid((ctx) => (
    (ctx.args.geneListRef !== undefined))
  && ((ctx.args.geneSubset !== undefined)),
  )

  // User can only select as input regulationDirection lists
  // includeNativeLabel ensures regulationDirection pl7.app/label
  // is also visible in selection (by default we only see Samples & data ID)
  // addLabelAsSuffix moves the native label to the end
  // Result: [dataID] / A vs B
  .output('geneListOptions', (ctx) =>
    ctx.resultPool.getOptions((spec) => isPColumnSpec(spec)
      && spec.name === 'pl7.app/rna-seq/regulationDirection',
    { includeNativeLabel: false, addLabelAsSuffix: true }),
  )

  .output('ORApt', (ctx) => {
    const pCols = ctx.outputs?.resolve('ORAPf')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    return createPlDataTableV2(ctx, pCols, ctx.uiState?.tableState);
  })

  .output('ORAsheets', (ctx) => {
    const pCols = ctx.outputs?.resolve('ORAPf')?.getPColumns();
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

  .output('ORATop10Pf', (ctx): PFrameHandle | undefined => {
    let pCols = ctx.outputs?.resolve('ORATop10Pf')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    pCols = pCols.filter(
      (col) => (
        // Filter out Gene/Background Ratio pColumns
        col.spec.name !== 'pl7.app/rna-seq/BgRatio')
      && (col.spec.name !== 'pl7.app/rna-seq/GeneRatio'),
    );

    return createPFrameForGraphs(ctx, pCols);
  })

  // Return PColumnIdAndSpec needed for default plot parameters
  .output('ORATop10Pcols', (ctx) => {
    const pCols = ctx.outputs?.resolve('ORATop10Pf')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    return pCols.map(
      (c) =>
        ({
          columnId: c.id,
          spec: c.spec,
        } satisfies PColumnIdAndSpec),
    );
  })

  .title((ctx) =>
    ctx.args.title
      ? `Functional Analysis - ${ctx.args.title}`
      : 'Functional Analysis',
  )

  .sections([
    { type: 'link', href: '/', label: 'Table' },
    { type: 'link', href: '/graph', label: 'Bar plot' },
  ])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
