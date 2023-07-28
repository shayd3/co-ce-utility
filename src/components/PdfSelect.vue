<script setup lang="ts">
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import { PDFDocument } from 'pdf-lib';
import { usePdfStore } from '@/stores/pdf';

const onFileSelect = (event: any) => {
    let file = event.files[0] as File;
    let fileName = file.name;
    let reader = new FileReader();

    // Convert file to byte array
    reader.readAsArrayBuffer(file);

    // Create PDFDocument from array
    reader.onload = async () => {
        let arrayBuffer = reader.result as ArrayBuffer;
        let bytes = new Uint8Array(arrayBuffer);
        let pdfDoc = await PDFDocument.load(bytes, {
            updateMetadata: false
        })

        const store = usePdfStore();
        store.setPdf(pdfDoc)
        store.setPdfName(fileName)
    }
}

const onClearPdf = () => {
    const store = usePdfStore()
    store.clearPdf()
}

</script>

<template>
    <div id="pdfSelect">
        <FileUpload class="w-full" mode="basic" name="pdf" accept="application/pdf" :multiple="false" :customUpload="true" @uploader="onFileSelect" :auto="true" chooseLabel="Select PDF"/>
        <h3>PDF Details:</h3>
        <div v-if="usePdfStore().pdf">
            <p><b>Selected File:</b> {{ usePdfStore().pdfName }}</p>
            <p><b>Number of Pages:</b> {{ usePdfStore().pdf?.getPageCount() }}</p>
        </div>
        <div v-else>
            <p>No PDF selected</p>
        </div>
        <Button class="w-full" label="Clear PDF" icon="pi pi-times" severity="danger" raised @click="onClearPdf" :disabled="!usePdfStore().pdf" />
    </div>
</template>

<style scoped>

</style>
