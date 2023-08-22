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
    console.log(val);
    store.setSelectedLineIndex(val);
});


const getFirstPageContent = () => {
    return cleanUpPageContent(firstPageContent.value);
}

const cleanUpPageContent = (pageContent: PageLine[]) => {
    // Filter out PageLine objects where PageLine.lineContent is empty or only whitespace
    let cleanedPageContent = pageContent.filter((pageLine) => {
        return pageLine.lineContent.trim() !== "";
    });

    // Remove lines that is just 1 or more '_'
    cleanedPageContent = cleanedPageContent.filter((pageLine) => {
        return !pageLine.lineContent.match(/^_+$/);
    });

    // Remove lines that are just integers, decimals, or integers with decimals
    cleanedPageContent = cleanedPageContent.filter((pageLine) => {
        return !pageLine.lineContent.match(/^\d+(\.\d+)?$/);
    });

    // Remove lines that are 3 characets or less
    cleanedPageContent = cleanedPageContent.filter((pageLine) => {
        return pageLine.lineContent.length > 3;
    });

    // Remove dates of any format
    cleanedPageContent = cleanedPageContent.filter((pageLine) => {
        return !pageLine.lineContent.match(/^(0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)?\d\d$/);
    });
    return cleanedPageContent;
}


// }
</script>

<template>
    <div>
        <Message :closable="false">This is the first page of the PDF you selected. Select the line you would like to split your PDF on!<br> (Example: if you select "Bob Ross", it will take that same line on each page and rename each split PDF with the text of that line.)</Message>
        <Message :closable="false">Note: Not all text will be displayed in the list. Lines found in the PDF are filtered out if they meet one of the following: Blank, Underscores (_), dates, numbers, 3 characters or less </Message>
        <Listbox v-model="selectedLineIndex" :options="getFirstPageContent()" filter optionLabel="lineContent" optionValue="index" class="w-full" listStyle="max-height:400px" />
    </div>
</template>
