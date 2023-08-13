<script setup lang="ts">
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import { usePdfStore } from '@/stores/pdf';

const store = usePdfStore();

const onFileSelect = (event: any) => {
    let file = event.files[0] as File;

    store.setPdfFile(file);
}

const onClearPdf = () => {
    store.clearPdf()
}

</script>

<template>
    <div id="pdfSelect">
        <FileUpload class="w-full" mode="basic" name="pdf" accept="application/pdf" :multiple="false" :customUpload="true" @uploader="onFileSelect" :auto="true" chooseLabel="Select PDF"/>
        <h3>PDF Details:</h3>
        <div v-if="usePdfStore().getPdfFile()">
            <p><b>Selected File:</b> {{ usePdfStore().getPdfFile()?.name }}</p>
        </div>
        <div v-else>
            <p>No PDF selected</p>
        </div>
        <Button class="w-full" label="Clear PDF" icon="pi pi-times" severity="danger" raised @click="onClearPdf" :disabled="!usePdfStore().getPdfFile()" />
    </div>
</template>

<style scoped>

</style>
