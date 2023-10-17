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

// Object to hold tooltips
const ToolTips = {
    PDFSPLITTER_LISTBOX_TIP: "Note: Not all text will be displayed in the list. Lines found in the PDF are filtered out if they meet one of the following:\nBlank, Underscores (_), dates, numbers, 3 characters or less"
}

const store = usePdfStore();
const firstPageContent = ref([]) as { value: PageLine[] };
const selectedLineIndex = ref();


/**
 * Gets all the text content from the first page of the PDF to display in the listbox.
 *
 * @returns {void}
 */
onMounted(async () => {
    let pdfArrayBuffer = await store.getPdfBytes();
    let pdfBytes = new Uint8Array(pdfArrayBuffer!);
    let pdfDoc = await PDFJS.getDocument(pdfBytes!).promise;
    let pdfFirstPage = await pdfDoc.getPage(1);
    let pdfFirstPageTextContent = await pdfFirstPage.getTextContent()
    firstPageContent.value = pdfFirstPageTextContent.items.map((lineContent, index) =>  {
        return {
            index: index,
            lineContent: (lineContent as TextItem).str
        }
    });
});

/**
 * Watches for changes to the selected line index and sets the selected line in the store.
 */
watch(() => selectedLineIndex.value, (val) => {
    store.setSelectedLine(val, firstPageContent.value[val].lineContent);
});

/**
 * Gets the first page content from the PDF.
 *
 * @returns {PageLine[]}
 */
const getFirstPageContent = () => {
    return cleanUpPageContent(firstPageContent.value);
}

/**
 * Cleans up the page content by filtering out lines that are blank, dates, numbers, etc.
 *
 * TODO: Split to helper function to clean up page content with a choosable filter
 *
 * @param pageContent
 * @returns {PageLine[]}
 */
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
        <div v-if="usePdfStore().getPdfFile()">
            <p><b>Selected File:</b> {{ usePdfStore().getPdfFile()?.name }}</p>
        </div>
        <div v-else>
            <p>No PDF selected</p>
        </div>
        <Message severity="success" :closable="false">This is the first page of the PDF you selected. Select the line you would like to split your PDF on!<br><br> (Example: if you select "Bob Ross", it will take that same line on each page and rename each split PDF with the text of that line.)</Message>
        <Listbox v-model="selectedLineIndex" v-tooltip="ToolTips.PDFSPLITTER_LISTBOX_TIP"  :options="getFirstPageContent()" filter optionLabel="lineContent" optionValue="index" class="w-full" listStyle="max-height:400px" />
    </div>
</template>
