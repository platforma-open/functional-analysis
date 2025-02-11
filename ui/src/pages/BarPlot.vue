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

    // Declare index variables 
    let minLog10PIndex: number;
    let descriptionIndex: number;
    let ontoFamilyIndex: number | null;
    // GO pathways Pcols have different indexing
    if ( ORATop10Pcols[3].spec.name === "pl7.app/rna-seq/pathwayOntology") {
        minLog10PIndex = 7;
        descriptionIndex = 6;
        ontoFamilyIndex = 3;

    // Reactome Pcols have different indexing
    } else {
        minLog10PIndex = 6;
        descriptionIndex = 5;
        ontoFamilyIndex = null;
    }

    const defaults: GraphMakerProps['defaultOptions'] = [
        {
            inputName: 'y',
            selectedSource: ORATop10Pcols[minLog10PIndex].spec
        },
        {
            inputName: 'primaryGrouping',
            selectedSource: ORATop10Pcols[descriptionIndex].spec
        },
        {
            inputName: 'tabBy',
            selectedSource: ORATop10Pcols[0].spec.axesSpec[1]
        }
    ];

    if ( ontoFamilyIndex !== null) {
        defaults.push(
            {
            inputName: 'filters',
            selectedSource: ORATop10Pcols[ontoFamilyIndex].spec
            }
        )
    }

    return defaults;
})
</script>

<template>
  <GraphMaker chartType="discrete" template="bar" :p-frame="app.model.outputs.ORATop10Pf" v-model="app.model.ui.graphState" 
  :defaultOptions="defaultOptions" />
</template>