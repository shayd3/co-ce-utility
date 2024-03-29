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

const ToolTips = {
    PDF_SPLITTER_TIP: 'Open utility to split PDF.'
}

const onPdfSplit = () => {
    dialog.open(PdfSplitter, {
        props: {
            header: 'Split PDF',
            style: {
                width: '60vw',
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

const getPdfSplitToolTip = () => {
    if (!usePdfStore().getPdfFile()) {
        return 'Select a PDF file above to split.';
    }
    return ToolTips.PDF_SPLITTER_TIP;
}

</script>

<template>
    <div id="pdfPanels" class="flex flex-row gap-3">
        <Panel header="PDF">
            <div class="w-15rem max-w-15rem" id="pdfDetails">
                <PdfSelect />
            </div>
        </Panel>
        <Panel header="Signature">
            <div class="w-15rem max-w-15rem" id="signatureDetails">
                <SignatureUpload />
            </div>
        </Panel>
    </div>
    <div class="flex flex-column">
        <div id="pdfSplitter">
            <h2>PDF Splitter</h2>
            <div v-tooltip.top="getPdfSplitToolTip()" class="inline-block">
                <Button label="Split PDF" icon="pi pi-arrow-right" severity="info" raised @click="onPdfSplit" :disabled="!usePdfStore().getPdfFile()" />
            </div>
        </div>
    </div>
    <DynamicDialog />
</template>

<style scoped>
input {
    display: none;
}

</style>
```
