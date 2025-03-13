<script setup lang="ts">
import type { GraphMakerProps } from '@milaboratories/graph-maker';
import { GraphMaker } from '@milaboratories/graph-maker';
import '@milaboratories/graph-maker/styles';
import { useApp } from '../app';
import { computed, ref, watch } from 'vue';
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

  const defaults: GraphMakerProps['defaultOptions'] = [
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
      inputName: 'tabBy',
      selectedSource: ORATop10Pcols[getIndex('pl7.app/rna-seq/pathwayname',
        ORATop10Pcols)].spec.axesSpec[1],
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

// Generate list of comparisons with all contrasts
const comparisonOptions = computed(() => {
  if (app.model.outputs.contrastList !== undefined) {
    return listToOptions(app.model.outputs.contrastList);
  }
  return undefined;
});

// Steps needed to reset graph maker after changing input table
const defaultOptions = ref(getDefaultOptions(app.model.outputs.ORATop10Pcols));
const key = ref(defaultOptions.value ? JSON.stringify(defaultOptions.value) : '');
// Reset graph maker state to allow new selection of defaults
watch(() => app.model.outputs.ORATop10Pcols, (ORATop10Pcols) => {
  delete app.model.ui.graphState.optionsState;
  defaultOptions.value = getDefaultOptions(ORATop10Pcols);
  key.value = defaultOptions.value ? JSON.stringify(defaultOptions.value) : '';
});

</script>

<template>
  <GraphMaker
    :key="key"
    v-model="app.model.ui.graphState" chartType="discrete" template="bar"
    :p-frame="app.model.outputs.ORATop10Pf"
    :defaultOptions="defaultOptions"
  >
    <template #titleLineSlot>
      <PlDropdown
        v-model="app.model.ui.contrast" :options="comparisonOptions"
        label="Comparison" :style="{ width: '300px' }"
      />
    </template>
  </GraphMaker>
</template>
