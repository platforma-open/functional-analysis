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
  createPlDataTableV2,
  isPColumnSpec,
} from '@platforma-sdk/model';

export type UiState = {
  tableState: PlDataTableStateV2;
  graphState: GraphMakerState;
};

export type BlockArgs = {
  geneListRef?: PlRef;
  pathwayCollection?: string;
  geneSubset: string[];
  contrast?: string;
};

export const model = BlockModel.create()

  .withArgs<BlockArgs>({
    pathwayCollection: 'GO',
    geneSubset: ['Up', 'Down'],
  })

  .withUiState<UiState>({
    tableState: {
      gridState: {},
      pTableParams: {
        sorting: [],
        filters: [],
      },
    },
    graphState: {
      title: 'Top 10 enriched pathways',
      template: 'bar',
      axesSettings: {
        other: {
          reverse: true,
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
    { includeNativeLabel: true, addLabelAsSuffix: true }),
  )

  .output('contrastOptions', (ctx) => {
    if (!ctx.args.geneListRef) return undefined;

    // Get the contrastExport p-column from the result pool
    const contrastExport = ctx.resultPool.getData()
      .entries
      .map((entry) => entry.obj)
      .find((col) =>
        isPColumnSpec(col.spec)
        && col.spec.name === 'pl7.app/label'
        && col.spec.annotations?.['pl7.app/isLabel'] === 'true'
        && col.spec.axesSpec?.[0]?.name === 'pl7.app/rna-seq/contrastGroup',
      );

    if (contrastExport) {
      // Get the contrast values from the p-column data
      const contrastData = contrastExport.data?.getDataAsJson<Record<string, string>>();
      if (contrastData?.data) {
        return [...new Set(Object.values(contrastData.data))];
      }
    }
    return undefined;
  })

  .output('ORApt', (ctx) => {
    const pCols = ctx.outputs?.resolve('ORAPf')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    return createPlDataTableV2(ctx, pCols, ctx.uiState?.tableState);
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

  .sections([
    { type: 'link', href: '/', label: 'Table' },
    { type: 'link', href: '/graph', label: 'Bar plot' },
  ])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
