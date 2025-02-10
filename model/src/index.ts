import { GraphMakerState } from '@milaboratories/graph-maker';
import { 
  BlockModel, 
  createPlDataTable, 
  getUniquePartitionKeys, 
  InferOutputsType, 
  isPColumn, 
  isPColumnSpec, 
  PColumn, 
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
      title: 'Enriched pathways',
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
    const pCols = ctx.outputs?.resolve('ORATop10Pf')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    // enriching with upstream data
    const valueTypes = ['Int', 'Float', 'Double', 'String'] as ValueType[];
    const upstream = ctx.resultPool
      .getData()
      .entries.map((v) => v.obj)
      .filter(isPColumn)
      .filter((column) => valueTypes.find((valueType) => valueType === column.spec.valueType));

    return ctx.createPFrame([...pCols, ...upstream]);
  })

  .output('ORATop10Pcols', (ctx) => {
    const pCols = ctx.outputs?.resolve('ORATop10Pf')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    return pCols;

  })

  .sections([
    { type: 'link', href: '/', label: 'Table' },
    { type: 'link', href: '/graph', label: 'Bar plot' }
  ])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
