<script setup lang="ts">
import FileUpload from 'primevue/fileupload';

const onFileSelect = (event: any) => {
    console.log(event.files[0]);
}

</script>

<template>
    <div id="pdfSelect">
        <FileUpload mode="basic" name="pdf" accept="application/pdf" :multiple="false" :customUpload="true" @uploader="onFileSelect" :auto="true" chooseLabel="Select PDF"/>
    </div>
</template>

<style scoped>

</style>s
