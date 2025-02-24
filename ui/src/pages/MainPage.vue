<script setup lang="ts">
import type {
  PlDataTableSettings } from '@platforma-sdk/ui-vue';
import { listToOptions, PlAgDataTable, PlBlockPage, PlBtnGhost, PlCheckboxGroup, PlDropdown, PlDropdownMultiRef,
  PlMaskIcon24, PlSlideModal } from '@platforma-sdk/ui-vue';
import { useApp } from '../app';
import { computed, ref, watch } from 'vue';

const app = useApp();

const tableSettings = computed<PlDataTableSettings>(() => ({
  sourceType: 'ptable',

  pTable: app.model.outputs.ORApt,

} satisfies PlDataTableSettings));

const settingsAreShown = ref(app.model.outputs.ORApt === undefined);
const showSettings = () => {
  settingsAreShown.value = true;
};

const pathwayCollectionOptions = [
  { label: 'Gene Ontology (GO)', value: 'GO' },
  { label: 'Reactome (RA)', value: 'Reactome' },
  // { text: "WikiPathways (WP)", value: "WikiPathways" },
  // { text: "Kyoto Encyclopedia of Genes and Genomes (KEGG)", value: "KEGG" },
];

// Define input gene subset options
const geneSubsetOptions = [
  { label: 'Upregulated', value: 'Up' },
  { label: 'Downregulated', value: 'Down' },
  { label: 'Dysregulated (all DEGs)', value: 'DEGs' },
];

// Generate list of comparisons with all contrasts
const comparisonOptions = computed(() => {
  if (app.model.outputs.contrastList !== undefined) {
    return listToOptions(app.model.outputs.contrastList);
  }
  return undefined;
});

// Select first contrast when available
watch(() => app.model.outputs.geneListOptions, (_) => {
  if (!app.model.ui.contrast
    && (comparisonOptions.value !== undefined)) {
    if (comparisonOptions.value.length !== 0) {
      app.model.ui.contrast = comparisonOptions.value[0].value;
    }
  }
}, { immediate: true });
</script>

<template>
  <PlBlockPage>
    <template #title>Functional Analysis</template>
    <template #append>
      <PlDropdown
        v-model="app.model.ui.contrast"
        :options="comparisonOptions"
        label="Contrast" :style="{ width: '300px' }"
      />
      <PlBtnGhost @click.stop="showSettings">
        Settings
        <template #append>
          <PlMaskIcon24 name="settings" />
        </template>
      </PlBtnGhost>
    </template>

    <PlSlideModal v-model="settingsAreShown">
      <template #title>Settings</template>
      <PlDropdownMultiRef
        v-model="app.model.args.geneListRef" :options="app.model.outputs.geneListOptions"
        label="Select gene list"
      />
      <PlDropdown v-model="app.model.args.pathwayCollection" :options="pathwayCollectionOptions" label="Select pathway collection" />
      <!-- Option buttons to choose how to do GO analysis -->
      <PlCheckboxGroup v-model="app.model.args.geneSubset" label="Select gene subsets" :options="geneSubsetOptions" >
        <template #tooltip>
          Select one or more Differentially Enriched Gene (DEG) subsets for functional analysis. The
          results will be displayed separately for each of the selected subsets
        </template>
      </PlCheckboxGroup>
    </PlSlideModal>

    <PlAgDataTable v-if="app.model.ui" v-model="app.model.ui.tableState" :settings="tableSettings" />
  </PlBlockPage>
</template>
