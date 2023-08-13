<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { usePdfStore } from '@/stores/pdf';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import * as PDFJS from "pdfjs-dist";

import Listbox from 'primevue/listbox';

const store = usePdfStore();
const firstPageContent = ref([]) as { value: string[] };
const selectedLine = ref();

// Get each line from first page of PDF
onMounted(() => {
    let pdfArrayBuffer = store.getPdfBytes();
    pdfArrayBuffer.then((arrayBuffer) => {
        let pdfBytes = new Uint8Array(arrayBuffer!);
        PDFJS.getDocument(pdfBytes!).promise.then((pdfDoc) => {
            pdfDoc.getPage(1).then((page) => {
                page.getTextContent().then((textContent) => {
                    let lines = textContent.items.map((item) => (item as TextItem).str);
                    firstPageContent.value = lines;
                });
            });
        });
    });
});

const getFirstPageContent = () => {
    return firstPageContent.value;
}

const cleanUpPageContent = (pageContent: string[]) => {
    // Remove empty lines
    let cleanedPageContent = pageContent.filter((line) => line.trim() !== "");

    // Remove lines that is just 1 or more '_'
    cleanedPageContent = cleanedPageContent.filter((line) => !line.match(/^_+$/));

    // Remove lines that are just integers, decimals, or integers with decimals
    cleanedPageContent = cleanedPageContent.filter((line) => !line.match(/^\d+\.?\d*$/));

    return cleanedPageContent;
}

const getPdfFileName = () => {
    let pdfFile = store.getPdfFile();
    return pdfFile?.name;
}
</script>

<template>
    <div>
        <p><b>PDF:</b> {{ getPdfFileName() }}</p>
        <Listbox v-model="selectedLine" :options="cleanUpPageContent(getFirstPageContent())" class="w-full" />
    </div>

</template>
