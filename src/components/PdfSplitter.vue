<script setup lang="ts">
import { usePdfStore } from '@/stores/pdf';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { ref } from 'vue';
import * as PDFJS from "pdfjs-dist";

import Listbox from 'primevue/listbox';

const store = usePdfStore();
const firstPageContent = ref([]) as { value: string[] };
const selectedLine = ref();

// Get each line from first page of PDF
(async () => {
    let pdfArrayBuffer = await store.getPdfBytes()
    let pdfBytes = new Uint8Array(pdfArrayBuffer!);

    // Use PDFJS to extract all lines from first page of PDF
    let pdfDoc = await PDFJS.getDocument(pdfBytes!).promise;
    let page = await pdfDoc.getPage(1);
    let textContent = await page.getTextContent();
    let lines = textContent.items.map((item) => (item as TextItem).str);

    firstPageContent.value = lines;
})();

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
