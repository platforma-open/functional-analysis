<script setup lang="ts">
import { PlAlert, PlBlockPage, PlDataTableSettings, PlTextField } from '@platforma-sdk/ui-vue';
import { useApp } from '../app';
import { computed, ref } from 'vue';

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
  { text: "WikiPathways (WP)", value: "WikiPathways" },
  { text: "Kyoto Encyclopedia of Genes and Genomes (KEGG)", value: "KEGG" },
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
      <PlDropdownRef v-model="app.model.args.geneListRef" :options="app.model.outputs.geneListOptions"
        label="Select gene list" />
      <PlDropdown v-model="app.model.args.pathwayCollection" :options="pathwayCollectionOptions" label="Select pathway collection" />
    </PlSlideModal>

    <PlAgDataTable v-if="app.model.ui" :settings="tableSettings" v-model="app.model.ui.tableState" />
  </PlBlockPage>
</template>
