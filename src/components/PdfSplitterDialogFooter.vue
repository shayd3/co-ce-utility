<script setup lang="ts">
import { inject, ref } from "vue";
import { usePdfStore } from '@/stores/pdf';
import * as fs from 'file-saver';
import JSZip from "jszip";
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import { PDFDocument } from "pdf-lib";

const dialogRef = inject("dialogRef") as any;
const formatName = ref(true);
const store = usePdfStore();

// TODO: Split the PDF on closeDialog and then download
const closeDialog = async () => {
    await splitPdf();
    dialogRef.value.close();
};

// Create a new PDF for each page in the PDF
const splitPdf = async () => {
    let pdfBytes = await store.getPdfBytes();
    let zipFile = new JSZip();

    let pdfBytesUint8Array = new Uint8Array(pdfBytes!);
    let pdfDoc = await PDFDocument.load(pdfBytesUint8Array, {
        updateMetadata: false
    });
    let pages = pdfDoc.getPages();

    for (let index = 0; index < pages.length; index++) {
        let newPdf = await PDFDocument.create();
        const copiedPage = await newPdf.copyPages(pdfDoc, [index]);
        newPdf.addPage(copiedPage[0]);
        let newPdfBytes = await newPdf.save();

        zipFile.file(`file${index + 1}.pdf`, newPdfBytes);

    }
    console.log("Finished splitting PDF")

    // download zip
    zipFile.generateAsync({ type: "blob" }).then(function (content) {
        fs.saveAs(content, "splitPDF.zip");
    });

}

</script>

<template>
    <div class="mt-3">
        <Checkbox v-model="formatName" inputId="formatName" name="formatName" :binary=true />
        <label for="formatName" class="mr-2"> Format Name? </label>

        <Button type="button" label="Split" icon="pi pi-check" @click="closeDialog" autofocus :disabled="store.getSelectedLineIndex() == -1"></Button>
    </div>
</template>


