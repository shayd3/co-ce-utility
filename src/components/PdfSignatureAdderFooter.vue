<script setup lang="ts">
import { inject } from "vue";
import Button from 'primevue/button';

import { useSignatureStore } from '@/stores/signature';
import { useToast } from "primevue/usetoast";

const signatureStore = useSignatureStore();
const dialogRef = inject("dialogRef") as any;
const toast = useToast();

const ToolTips = {
    SIGNATURE_ADDER_TIP: "Add the signature to all pages in the selected area."
}

/**
 * Closes the dialog and adds the signature to the PDF.
 *
 * @returns {void}
 */
const closeDialog = () => {
    toast.add({ severity: 'success', summary: 'Adding Signature', detail: 'Signature was successfully added!', group: 'bc', life: 3000 });
    dialogRef.value.close();
}

/**
 * Checks if the user has drawn an area on the PDF.
 *
 * @returns {boolean}
 */
const hasAreaDrawn = () => {
    return signatureStore.getStartX() != 0 && signatureStore.getStartY() != 0 && signatureStore.getEndX() != 0 && signatureStore.getEndY() != 0;
}

/**
 * Gets the tooltip for the add signature button.
 *
 * @returns {string}
 */
const getAddSignatureButtonTooltip = () => {
    if (!hasAreaDrawn()) {
        return "Draw an area on the PDF to add the signature.";
    }
    return ToolTips.SIGNATURE_ADDER_TIP;
}
</script>

<template>
        <div class="mt-3">
            <div v-tooltip.top="getAddSignatureButtonTooltip()" class="inline-block">
                <Button type="button" label="Add Signature" icon="pi pi-check" @click="closeDialog" :disabled="!hasAreaDrawn()"></Button>
            </div>
        </div>
</template>

<style scoped>
</style>
