<script setup lang="ts">
import { usePdfStore } from '@/stores/pdf';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { ref } from 'vue';
import * as PDFJS from "pdfjs-dist";

const store = usePdfStore();
const firstPageContent = ref([]) as { value: string[] };

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

const getPdfFileName = () => {
    let pdfFile = store.getPdfFile();
    return pdfFile?.name;
}
</script>

<template>
    <div>
        <p>PDF: {{ getPdfFileName() }}</p>
        <p v-for="line in getFirstPageContent()" :key="line.toString()">
            {{ line }}
        </p>
    </div>
</template>
