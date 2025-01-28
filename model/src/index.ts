import { GraphMakerState } from '@milaboratories/graph-maker';
import { 
  BlockModel, 
  createPlDataTable, 
  InferOutputsType, 
  isPColumn, 
  isPColumnSpec, 
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
};

export const model = BlockModel.create()

  .withArgs<BlockArgs>({
    pathwayCollection: "GO"
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

  .output('geneListOptions', (ctx) =>
    ctx.resultPool.getOptions((spec) => isPColumnSpec(spec) && spec.name === 'pl7.app/rna-seq/DEG')
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

  .sections([
    { type: 'link', href: '/', label: 'Table' },
    { type: 'link', href: '/graph', label: 'Bar plot' }
  ])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
