<script setup lang="ts">
import { PlAgDataTable, PlBlockPage, PlBtnGhost, PlCheckboxGroup, 
  PlDataTableSettings, PlDropdown, PlDropdownRef, PlCheckbox,
  PlMaskIcon24, PlSlideModal, PlTooltip} from '@platforma-sdk/ui-vue';
import { useApp } from '../app';
import { computed, reactive, ref } from 'vue';

const app = useApp();

const tableSettings = computed<PlDataTableSettings>(() => ({
  sourceType: "ptable",

  pTable: app.model.outputs.ORApt,

} satisfies PlDataTableSettings));

const settingsAreShown = ref(app.model.outputs.ORApt === undefined)
const showSettings = () => { settingsAreShown.value = true }

const pathwayCollectionOptions = [
  { text: "Gene Ontology (GO)", value: "GO" },
  { text: "Reactome (RA)", value: "Reactome" },
  // { text: "WikiPathways (WP)", value: "WikiPathways" },
  // { text: "Kyoto Encyclopedia of Genes and Genomes (KEGG)", value: "KEGG" },
];

// Define input gene subset options
const geneSubsetOptions = [
  { text: "Upregulated", value: "Up" },
  { text: "Downregulated", value: "Down" },
  { text: "Dysregulated (all DEGs)", value: "DEGs" }
];

const data = reactive({
  text: 'some text',
  single: 'A',
  multiple: ['A', 'B'],
  importHandles: [] as unknown[],
  currentTab: 'one',
  compactBtnGroup: false,
  multipleAccordion: false,
});

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
      <PlDropdownRef v-model="app.model.args.geneListRef" :options="app.model.outputs.geneListOptions"
        label="Select gene list" />
      <PlDropdown v-model="app.model.args.pathwayCollection" :options="pathwayCollectionOptions" label="Select pathway collection" />
      <!-- Option buttons to choose how to do GO analysis -->
      <PlCheckboxGroup v-model="app.model.args.geneSubset" label="Select gene subsets" :options="geneSubsetOptions" >
          <template #tooltip>
              Select one or more Differentially Enriched Gene (DEG) subsets for functional analysis. The
              results will be displayed separately for each of the selected subsets
          </template>
      </PlCheckboxGroup>


    </PlSlideModal>

    <PlAgDataTable v-if="app.model.ui" :settings="tableSettings" v-model="app.model.ui.tableState" />
  </PlBlockPage>
</template>
