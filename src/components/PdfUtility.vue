<script setup lang="ts">
import Panel from 'primevue/panel';
import Button from 'primevue/button';

import PdfUpload from './PdfUpload.vue';
import SignatureUpload from './SignatureUpload.vue';
import PdfSplitter from './PdfSplitter.vue';
</script>

<template>
    <div id="pdfPanels">
        <Panel header="PDF">
            <div id="pdfDetails">
                <PdfUpload />
                <h3>PDF Details:</h3>
                <Button label="Clear PDF" icon="pi pi-times" severity="danger" raised />
            </div>
        </Panel>
        <Panel header="Signature">
            <div id="signatureDetails">
                <SignatureUpload />
                <h3>Signature Details:</h3>
                <Button label="Clear Signature" icon="pi pi-times" severity="danger" raised />
            </div>
        </Panel>
    </div>
    <div id="pdfSplitter">
        <h2>PDF Splitter</h2>
        <PdfSplitter />
    </div>
    <div id="pdfSplitterWithSignature">
        <h2>PDF Splitter with Signature</h2>

    </div>
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
