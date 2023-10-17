<script setup lang="ts">
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import { useSignatureStore } from '@/stores/signature';

const store = useSignatureStore();
const ToolTips = {
    SIGNATURE_SELECT_TIP: 'Select the signature file to use.',
    CLEAR_SIGNATURE_TIP: 'Clear the selected signature file.'
}

/**
 * Handles the file upload for the signature.
 *
 * @param event
 * @returns
 */
const onSignatureFileSelect = (event: any) => {
    let file = event.files[0] as File;
    let reader = new FileReader();

    // Convert file to byte array
    reader.readAsArrayBuffer(file);

    reader.onloadend = async () => {
        let arrayBuffer = reader.result as ArrayBuffer;
        let bytes = new Uint8Array(arrayBuffer);

        store.setSignature(bytes)
    }
}

/**
 * Generates a blob from the byte array.
 *
 * @param bytes
 * @returns {string | null}
 */
const generateImgBlob = (bytes: Uint8Array | undefined | null) => {
    if (!bytes) {
        return null;
    }
    const blob = new Blob([bytes]);
    return URL.createObjectURL(blob).toString();
}

/**
 * Clears the signature from the store.
 *
 * @returns {void}
 */
const onClearSignature = () => {
    store.clear()
}

/**
 * Gets the tooltip for the signature select button.
 *
 * @returns {string}
 */
const getClearSignatureToolTip = () => {
    if (!useSignatureStore().signature) {
        return "No signature selected.";
    }
    return ToolTips.CLEAR_SIGNATURE_TIP;
}
</script>

<template>
    <div id="signatureSelect">
        <FileUpload v-tooltip.top="ToolTips.SIGNATURE_SELECT_TIP" class="w-full" mode="basic" name="signature" accept="image/*" :multiple="false" :customUpload="true" @uploader="onSignatureFileSelect" :auto="true" chooseLabel="Select Signature"/>
        <h3>Signature Details:</h3>
        <div v-if="useSignatureStore().signature">
            <img :src="generateImgBlob(useSignatureStore().getSignature()) || undefined" alt="Signature Image" />
        </div>
        <div v-else>
            <p>No signature selected</p>
        </div>
        <div v-tooltip.top="getClearSignatureToolTip()">
            <Button class="w-full" label="Clear Signature" icon="pi pi-times" severity="danger" raised @click="onClearSignature" :disabled="!useSignatureStore().signature"/>
        </div>
    </div>
</template>

<style scoped>
</style>
