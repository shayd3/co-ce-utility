<script setup lang="ts">
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';

const onSignatureFileSelect = (event: any) => {
    console.log(event.files[0]);
}
</script>

<template>
    <!-- Only accept images -->
    <FileUpload mode="basic" name="signature" accept="image/*" :multiple="false" :customUpload="true" @uploader="onSignatureFileSelect" :auto="true" chooseLabel="Select Signature"/>
    <h3>Signature Details:</h3>
    <Button label="Clear Signature" icon="pi pi-times" severity="danger" raised />
</template>
