<script setup lang="ts">
import { usePdfStore } from '@/stores/pdf';
import * as PDFJS from "pdfjs-dist/legacy/build/pdf";
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;


const store = usePdfStore();

// Get each line from first page of PDF
const getLines = async () => {
    let pdfBytes = store.getPdfBytes();

    if (!pdfBytes) return;

    // Use PDFJS to extract all lines from first page of PDF
    let pdfDoc = await PDFJS.getDocument(pdfBytes!).promise;
    let page = await pdfDoc.getPage(1);
    let textContent = await page.getTextContent();
    let lines = textContent.items.map((item) => (item as TextItem).str);
    console.log(lines)
    // Return lines
    return lines;
}
</script>

<template>
    <div>
        <p>PDF: {{ store.getPdfName() }}</p>
        <p v-for="line in getLines()" :key="line.toString()">
            {{ line }}
        </p>
    </div>
</template>
