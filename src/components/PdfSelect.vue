<script setup lang="ts">
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import { PDFDocument } from 'pdf-lib';

const onFileSelect = (event: any) => {
    let file = event.files[0] as File;
    let fileName = file.name;
    let reader = new FileReader();

    // Convert file to byte array
    reader.readAsArrayBuffer(file);

    // Create PDFDocument from array
    reader.onload = async () => {
        let arrayBuffer = reader.result as ArrayBuffer;
        let bytes = new Uint8Array(arrayBuffer);
        let pdfDoc = PDFDocument.load(bytes);

        // Get PDF page count
        let pageCount = (await pdfDoc).getPageCount();

        // Get PDF page dimensions
        let firstPage = (await pdfDoc).getPages()[0];
        let dimensions = firstPage.getSize();

        console.log(`PDF Name: ${fileName}`);
        console.log(`PDF Page Count: ${pageCount}`);
        console.log(`PDF Page Dimensions: ${dimensions.width} x ${dimensions.height}`);

    }
}

</script>

<template>
    <div id="pdfSelect">
        <FileUpload mode="basic" name="pdf" accept="application/pdf" :multiple="false" :customUpload="true" @uploader="onFileSelect" :auto="true" chooseLabel="Select PDF"/>
        <h3>PDF Details:</h3>
        <Button label="Clear PDF" icon="pi pi-times" severity="danger" raised />
    </div>
</template>

<style scoped>

</style>s
