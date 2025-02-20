import { GraphMakerState } from '@milaboratories/graph-maker';
import { 
  BlockModel, 
  createPlDataTable, 
  InferOutputsType, 
  isPColumnSpec, 
  PColumnIdAndSpec, 
  PFrameHandle, 
  PlDataTableState, 
  PlRef, 
  ValueType
} from '@platforma-sdk/model';

export type UiState = {
  tableState: PlDataTableState;
  graphState: GraphMakerState;
};

export type BlockArgs = {
  geneListRef?: PlRef;
  pathwayCollection?: string;
  geneSubset: string[];
};

export const model = BlockModel.create()

  .withArgs<BlockArgs>({
    pathwayCollection: "GO",
    geneSubset: ['Up', 'Down'],
  })

  .withUiState<UiState>({
    tableState: {
      gridState: {},
      pTableParams: {
        sorting: [],
        filters: []
      }
    },
    graphState: {
      title: 'Top 10 enriched pathways',
      template: 'bar',
      axesSettings: {
        other: {
          reverse: true
        }
      } as Partial<GraphMakerState['axesSettings']>
    }
  })

  // Activate "Run" button only after input DEG list is selected
  .argsValid((ctx) =>  (ctx.args.geneListRef !== undefined) &&
                      (ctx.args.geneSubset.length !== 0))

  // User can only select as input regulationDirection lists
  // includeNativeLabel ensures regulationDirection pl7.app/label
  // is also visible in selection (by default we only see Samples & data ID)
  // addLabelAsSuffix moves the native label to the end
  // Result: [dataID] / A vs B
  .output('geneListOptions', (ctx) =>
    ctx.resultPool.getOptions((spec) => isPColumnSpec(spec) && spec.name === 'pl7.app/rna-seq/regulationDirection',
                              {includeNativeLabel: true, addLabelAsSuffix:true})
  )

  .output('datasetSpec', (ctx) => {
    if (ctx.args.geneListRef) return ctx.resultPool.getSpecByRef(ctx.args.geneListRef);
    else return undefined;
  })

  .output('ORApt', (ctx) => {
    const pCols = ctx.outputs?.resolve('ORAPf')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    return createPlDataTable(ctx, pCols, ctx.uiState?.tableState);
  })

  .output('ORATop10Pf', (ctx): PFrameHandle | undefined => {
    let pCols = ctx.outputs?.resolve('ORATop10Pf')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    // Filter out Gene/Background Ratio pColumns
    pCols = pCols.filter(
      col => (col.spec.name !== "pl7.app/rna-seq/BgRatio") &&
      (col.spec.name !== "pl7.app/rna-seq/GeneRatio")
    );

    return ctx.createPFrame([...pCols]);
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
    { type: 'link', href: '/graph', label: 'Bar plot' }
  ])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
