<script setup lang="ts">
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import { useSignatureStore } from '@/stores/signature';

const onSignatureFileSelect = (event: any) => {
    let file = event.files[0] as File;
    let reader = new FileReader();

    // Convert file to byte array
    reader.readAsArrayBuffer(file);

    reader.onloadend = async () => {
        if(event.readyState === FileReader.DONE) {
            let arrayBuffer = reader.result as ArrayBuffer;
            let bytes = new Uint8Array(arrayBuffer);

            const store = useSignatureStore();
            store.setSignature(bytes)
        }
    }
}

const onClearSignature = () => {
    const store = useSignatureStore()
    store.clearSignature()
}
</script>

<template>
    <!-- Only accept images -->
    <FileUpload class="w-full" mode="basic" name="signature" accept="image/*" :multiple="false" :customUpload="true" @uploader="onSignatureFileSelect" :auto="true" chooseLabel="Select Signature"/>
    <h3>Signature Details:</h3>
    <Button class="w-full" label="Clear Signature" icon="pi pi-times" severity="danger" raised @click="onClearSignature"/>
</template>
