<script setup lang="ts">
import Panel from 'primevue/panel';
import Button from 'primevue/button';


</script>

<template>
    <div id="pdfPanels">
        <Panel header="PDF">
            <div id="pdfDetails">
                <Button label="Upload PDF" icon="pi pi-upload" severity="info" raised />
                <h3>PDF Details:</h3>
                <Button label="Clear PDF" icon="pi pi-times" severity="danger" raised />
            </div>
        </Panel>
        <Panel header="Signature">
            <div id="signatureDetails">
                <Button label="Upload Signature" icon="pi pi-pencil" severity="info" raised />
                <h3>Signature Details:</h3>
                <Button label="Clear Signature" icon="pi pi-times" severity="danger" raised />
            </div>
        </Panel>
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
