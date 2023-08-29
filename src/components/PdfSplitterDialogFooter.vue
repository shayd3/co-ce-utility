<script setup lang="ts">
import { inject, ref } from "vue";
import { usePdfStore } from '@/stores/pdf';
import * as fs from 'file-saver';
import JSZip from "jszip";
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import { PDFDocument } from "pdf-lib";

const store = usePdfStore();
const dialogRef = inject("dialogRef") as any;

const prefixValue = ref("");
const suffixValue = ref("");
const formatName = ref(true);


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
    <div class="flex flex-column">
        <div class="flex flex-row gap-2 mt-1">
            <span class="p-float-label">
                <InputText id="prefix" v-model="prefixValue" />
                <label for="prefix">Prefix</label>
                <!-- <small id="prefix-help">Text displayed before selected line text</small> -->
            </span>
            <span class="p-float-label">
                <InputText id="suffix" v-model="suffixValue" />
                <label for="suffix">Suffix</label>
                <!-- <small id="suffix-help">Text displayed after selected line text</small> -->
            </span>
            <div class="flex align-self-center">
                <Checkbox class="mr-1" v-model="formatName" inputId="formatName" name="formatName" :binary=true />
                <label for="formatName" class="mr-2"> Format Name? </label>
            </div>
        </div>
        <div class="flex flex-row-reverse mt-3">
            <Button type="button" label="Split" icon="pi pi-check" @click="closeDialog" autofocus :disabled="store.getSelectedLineIndex() == -1"></Button>
        </div>
    </div>

</template>


