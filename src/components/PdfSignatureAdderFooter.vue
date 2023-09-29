<script setup lang="ts">
import Button from 'primevue/button';
import Tooltip from 'primevue/tooltip';

const ToolTips = {
    SIGNATURE_ADDER_TIP: "Draw a box around the area where you want the signature to be placed. \n\nNote: The signature will be placed on every page of the PDF."
}
</script>

<template>
        <div>
            <!-- @click="closeDialog" autofocus :disabled="store.getSelectedLineIndex() == -1" -->
            <Button type="button" label="Add Signature" icon="pi pi-check" ></Button>
        </div>
</template>

<style scoped>
</style>
