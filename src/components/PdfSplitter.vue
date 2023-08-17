<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

import { usePdfStore } from '@/stores/pdf';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import * as PDFJS from "pdfjs-dist";

import Listbox from 'primevue/listbox';
import Message from 'primevue/message';

// Interface for pageLine
interface PageLine {
    index: number;
    lineContent: string;
}

const store = usePdfStore();
const firstPageContent = ref([]) as { value: PageLine[] };
const selectedLineIndex = ref();

// Get each line from first page of PDF
onMounted(() => {
    let pdfArrayBuffer = store.getPdfBytes();
    pdfArrayBuffer.then((arrayBuffer) => {
        let pdfBytes = new Uint8Array(arrayBuffer!);
        PDFJS.getDocument(pdfBytes!).promise.then((pdfDoc) => {
            pdfDoc.getPage(1).then((page) => {
                page.getTextContent().then((textContent) => {
                    firstPageContent.value = textContent.items.map((lineContent, index) =>  {
                        return {
                            index: index,
                            lineContent: (lineContent as TextItem).str
                        }
                    });
                });
            });
        });
    });
});

//when selectedLine changes, console output
watch(() => selectedLineIndex.value, (val) => {
    store.setSelectedLineIndex(val);
});


const getFirstPageContent = () => {
    return firstPageContent.value;
}

// }
</script>

<template>
    <div>
        <Message :closable="false">Select the line you would like to split your PDF on!<br> (Example: if you select "Bob Ross", it will take that same line on each page and rename each split PDF with the text of that line.)</Message>
        <Listbox v-model="selectedLineIndex" :options="getFirstPageContent()" optionLabel="lineContent" optionValue="index" class="w-full" listStyle="max-height:400px" />
    </div>
</template>
