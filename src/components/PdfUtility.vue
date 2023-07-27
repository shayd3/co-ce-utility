<script setup lang="ts">
import Panel from 'primevue/panel';

</script>

<template>
    <div id="pdfPanels">
        <Panel header="PDF">
            <p>PDF Details and Button Here</p>
        </Panel>
        <Panel header="Signature">
            <p>Signature Details and Button Here</p>
        </Panel>
    </div>
</template>

<style scoped>
#pdfPanels {
    display: flex;
    flex-direction: row;
    gap: 10px;

}
</style>
```
