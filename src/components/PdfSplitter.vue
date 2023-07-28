<script setup lang="ts">
import { usePdfStore } from '@/stores/pdf';
import * as PDFJS from 'pdfjs-dist/legacy/build/pdf';
import { PDFDocument } from 'pdf-lib';

const store = usePdfStore();

// Get each line from first page of PDF
const getLines = async () => {

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
