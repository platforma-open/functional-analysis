<script setup lang="ts">
import type { PredefinedGraphOption } from '@milaboratories/graph-maker';
import { GraphMaker } from '@milaboratories/graph-maker';
import '@milaboratories/graph-maker/styles';
import { useApp } from '../app';
import { computed, ref, useTemplateRef, watch } from 'vue';
import type { PColumnIdAndSpec } from '@platforma-sdk/model';
import { listToOptions, PlDropdown } from '@platforma-sdk/ui-vue';

const app = useApp();

function getDefaultOptions(ORATop10Pcols?: PColumnIdAndSpec[]) {
  if (!ORATop10Pcols) {
    return undefined;
  }

  function getIndex(name: string, pcols: PColumnIdAndSpec[]): number {
    return pcols.findIndex((p) => p.spec.name === name);
  }

  const defaults: PredefinedGraphOption<'discrete'>[] = [
    {
      inputName: 'y',
      selectedSource: ORATop10Pcols[getIndex('pl7.app/rna-seq/minlog10padj',
        ORATop10Pcols)].spec,
    },
    {
      inputName: 'primaryGrouping',
      selectedSource: ORATop10Pcols[getIndex('pl7.app/rna-seq/pathwayname',
        ORATop10Pcols)].spec,
    },
    {
      // Tab by third axis, pl7.app/rna-seq/pathwayRegDir
      inputName: 'tabBy',
      selectedSource: ORATop10Pcols[getIndex('pl7.app/rna-seq/pathwayname',
        ORATop10Pcols)].spec.axesSpec[2],
    },
    // Add grouping factor in facetBy (cluster or comparison)
    {
      inputName: 'facetBy',
      selectedSource: ORATop10Pcols[getIndex('pl7.app/rna-seq/pathwayname',
        ORATop10Pcols)].spec.axesSpec[0],
    },
  ];

  // Not found indexes are set to -1
  if (getIndex('pl7.app/rna-seq/pathwayOntology', ORATop10Pcols) !== -1) {
    defaults.push(
      {
        inputName: 'filters',
        selectedSource: ORATop10Pcols[getIndex('pl7.app/rna-seq/pathwayOntology',
          ORATop10Pcols)].spec,
      },
    );
  }

  return defaults;
}

// Steps needed to reset graph maker after changing input table
const defaultOptions = ref(getDefaultOptions(app.model.outputs.ORATop10Pcols));

// Updata graphstate every time we switch between pathways
const graphMakerRef = useTemplateRef('graphMaker');
watch(() => app.model.outputs.ORATop10Pcols, (topTablePcols) => {
  delete app.model.ui.graphState.optionsState;
  defaultOptions.value = getDefaultOptions(topTablePcols);
  graphMakerRef.value?.reset();
});

</script>

<template>
  <GraphMaker
    ref="graphMaker"
    v-model="app.model.ui.graphState" chartType="discrete" template="bar"
    :p-frame="app.model.outputs.ORATop10Pf"
    :defaultOptions="defaultOptions"
  />
</template>
