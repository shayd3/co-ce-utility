<script setup lang="ts">
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import { usePdfStore } from '@/stores/pdf';

const store = usePdfStore();
const ToolTips = {
    PDF_SELECT_TIP: 'Select the PDF file to split.',
    CLEAR_PDF_TIP: 'Clear the selected PDF file.'
}

/**
 * Handles the file upload event.
 *
 * @returns {void}
 * @param event
 */
const onFileSelect = (event: any) => {
    store.clearPdf();
    let file = event.files[0] as File;

    store.setPdfFile(file);
}

/**
 * Clears the PDF file from the store.
 *
 * @returns {void}
 */
const onClearPdf = () => {
    store.clearPdf()
}

/**
 * Gets the tooltip for the PDF select button.
 *
 * @returns {string}
 */
const getPdfSelectTooltip = () => {
    if (!usePdfStore().getPdfFile()) {
        return "No PDF file selected.";
    }
    return ToolTips.CLEAR_PDF_TIP;
}

</script>

<template>
    <div id="pdfSelect">
        <FileUpload v-tooltip.top="ToolTips.PDF_SELECT_TIP" class="w-full" mode="basic" name="pdf" accept="application/pdf" :multiple="false" :customUpload="true" @uploader="onFileSelect" :auto="true" chooseLabel="Select PDF"/>
        <h3>PDF Details:</h3>
        <div v-if="usePdfStore().getPdfFile()">
            <p><b>Selected File:</b> {{ usePdfStore().getPdfFile()?.name }}</p>
        </div>
        <div v-else>
            <p>No PDF selected</p>
        </div>
        <div v-tooltip.top="getPdfSelectTooltip()">
            <Button class="w-full" label="Clear PDF" icon="pi pi-times" severity="danger" raised @click="onClearPdf" :disabled="!usePdfStore().getPdfFile()" />
        </div>
    </div>
</template>

<style scoped>

</style>
