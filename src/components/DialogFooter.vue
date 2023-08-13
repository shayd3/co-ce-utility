
<template>
    <div class="mt-3">
        <Button type="button" label="Split" icon="pi pi-check" @click="closeDialog({ buttonType: 'Split' })" autofocus></Button>
    </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import Button from 'primevue/button';

const dialogRef = inject("dialogRef") as any;

const closeDialog = (e : any) => {
    dialogRef.value.close(e);
};
</script>
