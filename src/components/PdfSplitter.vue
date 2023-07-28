<script setup lang="ts">
import Button from 'primevue/button';
import { usePdfStore } from '@/stores/pdf';

</script>

<template>
    <Button label="Split PDF" icon="pi pi-arrow-right" severity="info" raised :disabled="!usePdfStore().pdf" />
</template>
