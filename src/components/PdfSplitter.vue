<script setup lang="ts">
import { usePdfStore } from '@/stores/pdf';
// TODO: Get PDFJS working to extract text/lines...
import * as PDFJS from "pdfjs-dist/legacy/build/pdf";
import { PDFDocument } from 'pdf-lib';

const store = usePdfStore();

// Get each line from first page of PDF
const getLines = async () => {
    let pdf = store.getPdf()
    let pdfBytes = store.getPdfBytes();
    let pdfName = store.getPdfName();

    // If PDF is not loaded, return
    if (!pdf) {
        return;
    }


}
</script>

<template>
    <div>
        <!-- Display lines from getLines-->
        <div v-for="line in getLines" :key="line">
            {{ line }}
        </div>
    </div>
</template>
