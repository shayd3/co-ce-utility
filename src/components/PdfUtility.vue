<script setup lang="ts">
import Panel from 'primevue/panel';
import Button from 'primevue/button';

import PdfSelect from './PdfSelect.vue';
import SignatureUpload from './SignatureUpload.vue';
import PdfSplitter from './PdfSplitter.vue';
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
