import type { GraphMakerState } from '@milaboratories/graph-maker';
import type {
  InferOutputsType,
  PColumnIdAndSpec,
  PFrameHandle,
  PlDataTableState,
  PlRef } from '@platforma-sdk/model';
import {
  BlockModel,
  createPlDataTable,
  isPColumnSpec,
} from '@platforma-sdk/model';

export type UiState = {
  tableState: PlDataTableState;
  graphState: GraphMakerState;
  contrast?: string;
};

export type BlockArgs = {
  geneListRef?: PlRef[];
  pathwayCollection?: string;
  geneSubset: string[];
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
  .argsValid((ctx) => (ctx.args.geneListRef !== undefined)
    && (ctx.args.geneListRef.length !== 0)
    && (ctx.args.geneSubset.length !== 0))

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

  .output('contrastList', (ctx): string[] | undefined => {
    // Make sure input contrast results have been selected
    if (!ctx.args.geneListRef) return undefined;

    // Get the specs of the selected p-columns and extract contrast info
    const contrasts: string[] = [];
    for (const gRef of ctx.args.geneListRef) {
      const anchorSpec = ctx.resultPool.getSpecByRef(gRef);
      if (anchorSpec?.annotations !== undefined) {
        contrasts.push(anchorSpec.annotations['pl7.app/label']);
      }
    }
    return contrasts;
  })

// .output('datasetSpec', (ctx) => {
//   if (ctx.args.geneListRef) return ctx.resultPool.getSpecByRef(ctx.args.geneListRef);
//   else return undefined;
// })

  .output('ORApt', (ctx) => {
    let pCols = ctx.outputs?.resolve('ORAPf')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    // Filter by selected contrast
    pCols = pCols.filter(
      (col) => (col.spec.axesSpec[0]?.domain?.['pl7.app/comparison'] === ctx.uiState.contrast),
    );

    return createPlDataTable(ctx, pCols, ctx.uiState?.tableState);
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
      && (col.spec.name !== 'pl7.app/rna-seq/GeneRatio')
      // Filter by selected contrast
      && (col.spec.axesSpec[0]?.domain?.['pl7.app/comparison'] === ctx.uiState.contrast),
    );

    return ctx.createPFrame([...pCols]);
  })

  // Return PColumnIdAndSpec needed for default plot parameters
  .output('ORATop10Pcols', (ctx) => {
    let pCols = ctx.outputs?.resolve('ORATop10Pf')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    // Filter by selected contrast
    pCols = pCols.filter(
      (col) => (col.spec.axesSpec[0]?.domain?.['pl7.app/comparison'] === ctx.uiState.contrast),
    );

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
