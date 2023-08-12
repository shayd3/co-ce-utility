<script setup lang="ts">
import { usePdfStore } from '@/stores/pdf';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { ref } from 'vue';
import * as PDFJS from "pdfjs-dist";
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;

const store = usePdfStore();
const firstPageContent = ref([]) as { value: string[] };

// Get each line from first page of PDF
(async () => {
    let pdfBytes = store.getPdfBytes();

    if (!pdfBytes) return;

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
</script>

<template>
    <div>
        <p>PDF: {{ store.getPdfName() }}</p>
        <p v-for="line in getFirstPageContent()" :key="line.toString()">
            {{ line }}
        </p>
    </div>
</template>
