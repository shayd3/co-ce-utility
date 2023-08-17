<script setup lang="ts">
import { inject, ref } from "vue";
import { usePdfStore } from '@/stores/pdf';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';

const dialogRef = inject("dialogRef") as any;
const formatName = ref(true);
const store = usePdfStore();

const closeDialog = (e : any) => {
    e.formatName = formatName.value;
    dialogRef.value.close(e);
};
</script>

<template>
    <div class="mt-3">
        <Checkbox v-model="formatName" inputId="formatName" name="formatName" :binary=true />
        <label for="formatName" class="mr-2"> Format Name? </label>

        <Button type="button" label="Split" icon="pi pi-check" @click="closeDialog" autofocus :disabled="store.getSelectedLineIndex() == -1"></Button>
    </div>
</template>


