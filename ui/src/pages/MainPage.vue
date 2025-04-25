<script setup lang="ts">
import type {
  PlDataTableSettings } from '@platforma-sdk/ui-vue';
import { PlAgDataTable, PlBlockPage, PlBtnGhost, PlCheckboxGroup, PlDropdown, PlDropdownRef,
  PlMaskIcon24, PlSlideModal } from '@platforma-sdk/ui-vue';
import { useApp } from '../app';
import { computed, ref } from 'vue';

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

</script>

<template>
  <PlBlockPage>
    <template #title>Functional Analysis</template>
    <template #append>
      <PlBtnGhost @click.stop="showSettings">
        Settings
        <template #append>
          <PlMaskIcon24 name="settings" />
        </template>
      </PlBtnGhost>
    </template>

    <PlSlideModal v-model="settingsAreShown">
      <template #title>Settings</template>
      <PlDropdownRef
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
