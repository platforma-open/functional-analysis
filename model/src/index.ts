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

  .output('test', (ctx) => {
    if (ctx.args.geneListRef === undefined) {
      return undefined
    }
    const anchorColumn = ctx.resultPool.getPColumnByRef(ctx.args?.geneListRef);
    return anchorColumn

  })

  .output('test2', (ctx) => {
    const moreColumns = ctx.resultPool
      .getData()
      .entries.map((o) => o.obj)
      .filter(isPColumn)
      .filter((col) => {
        if (
          col.spec.name === 'pl7.app/rna-seq/regulationDirection'
        ) {
          return true;
        }
        return false;
      });
      return moreColumns;

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

  // .output('ORATop10PfSpec', (ctx) => {
  //   const pCols = ctx.outputs?.resolve('ORATop10Pf')?.getPColumns();
  //   if (pCols === undefined) {
  //     return undefined;
  //   }

  //   const anchor = pCols[0];
  //   if (!anchor) return undefined;

  //   const r = getUniquePartitionKeys(anchor.data);
  //   if (!r) return undefined;

  //   // for the table purposes, we set "pl7.app/axisNature": "heterogeneous" on gene axis
  //   if (pCols.length !== 1) {
  //     throw Error('unexpected number of columns');
  //   }

  //   return pCols[0];

  // })

  .sections([
    { type: 'link', href: '/', label: 'Table' },
    { type: 'link', href: '/graph', label: 'Bar plot' }
  ])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
