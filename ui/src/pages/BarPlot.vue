<script setup lang="ts">
import { GraphMaker, GraphMakerProps } from "@milaboratories/graph-maker";
import '@milaboratories/graph-maker/styles';
import { useApp } from "../app";
import { computed } from "vue";

const app = useApp();

const defaultOptions = computed((): GraphMakerProps['defaultOptions'] => {
    const ORATop10Pcols = app.model.outputs.ORATop10Pcols
    
    if (!ORATop10Pcols) {
        return undefined
    }

    // Declare index variable names and dictionary
    const focusNames: string[] = [
        'pl7.app/rna-seq/minlog10padj',
        'pl7.app/rna-seq/pathwayname',
        'pl7.app/rna-seq/pathwayOntology',
    ];
    const indexDict: { [key: string]: number } = {};
    // Iterate over spec names and get proper indexes
    for (const fo of focusNames) {
        indexDict[fo] = ORATop10Pcols.findIndex((p) => p.spec.name === fo);
    }

    const defaults: GraphMakerProps['defaultOptions'] = [
        {
            inputName: 'y',
            selectedSource: ORATop10Pcols[indexDict['pl7.app/rna-seq/minlog10padj']].spec
        },
        {
            inputName: 'primaryGrouping',
            selectedSource: ORATop10Pcols[indexDict['pl7.app/rna-seq/pathwayname']].spec
        },
        {
            inputName: 'tabBy',
            selectedSource: ORATop10Pcols[indexDict['pl7.app/rna-seq/pathwayname']].spec.axesSpec[1]
        }
    ];

    // Not found indexes are set to -1
    if ( indexDict['pl7.app/rna-seq/pathwayOntology'] !== -1) {
        defaults.push(
            {
            inputName: 'filters',
            selectedSource: ORATop10Pcols[indexDict['pl7.app/rna-seq/pathwayOntology']].spec
            }
        )
    }

    return defaults;
})
</script>

<template>
  <GraphMaker chartType="discrete" template="bar" :p-frame="app.model.outputs.ORATop10Pf" 
  v-model="app.model.ui.graphState" 
  :defaultOptions="defaultOptions" />
</template>