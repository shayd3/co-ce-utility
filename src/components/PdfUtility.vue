<script setup lang="ts">
import { defineAsyncComponent, markRaw } from 'vue';
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import DynamicDialog from 'primevue/dynamicdialog';

import PdfSelect from './PdfSelect.vue';
import SignatureUpload from './SignatureUpload.vue';

import { usePdfStore } from '@/stores/pdf';
import { useDialog } from 'primevue/usedialog';

const PdfSplitter = defineAsyncComponent(() => import('./PdfSplitter.vue'))
const PdfSplitterDialogFooter = defineAsyncComponent(() => import('./PdfSplitterDialogFooter.vue'))
const dialog = useDialog();

const onPdfSplit = () => {
    dialog.open(PdfSplitter, {
        props: {
            header: 'Split PDF',
            style: {
                width: '50vw'
            },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            modal: true,
            draggable: false
        },
        templates: {
            footer: markRaw(PdfSplitterDialogFooter)
        }
    });
}

</script>

<template>
    <div id="pdfPanels">
        <Panel header="PDF">
            <div id="pdfDetails">
                <PdfSelect />
            </div>
        </Panel>
        <Panel header="Signature">
            <div id="signatureDetails">
                <SignatureUpload />
            </div>
        </Panel>
    </div>
    <div id="pdfSplitter">
        <h2>PDF Splitter</h2>
        <Button label="Split PDF" icon="pi pi-arrow-right" severity="info" raised @click="onPdfSplit" :disabled="!usePdfStore().getPdfFile()" />
    </div>
    <div id="pdfSplitterWithSignature">
        <h2>PDF Splitter with Signature</h2>
    </div>
    <DynamicDialog />
</template>

<style scoped>
input {
    display: none;
}
#pdfPanels {
    display: flex;
    flex-direction: row;
    gap: 10px
}

#pdfDetails, #signatureDetails {
    display: flex;
    flex-direction: column;
}
</style>
```
