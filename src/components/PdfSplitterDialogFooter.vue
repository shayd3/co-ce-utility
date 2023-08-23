<script setup lang="ts">
import { inject, ref } from "vue";
import { usePdfStore } from '@/stores/pdf';
import JSZip from 'jszip';
import * as fs from 'file-saver';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import { PDFDocument } from "pdf-lib";
import { compileScript } from "vue/compiler-sfc";

const dialogRef = inject("dialogRef") as any;
const formatName = ref(true);
const store = usePdfStore();

// TODO: Split the PDF on closeDialog and then download
const closeDialog = () => {
    splitPdf();
    dialogRef.value.close();
};

// Create a new PDF for each page in the PDF
const splitPdf = () => {
    let pdfBytes = store.getPdfBytes();
    let zipFile = new JSZip();

    pdfBytes.then((arrayBuffer) => {
        let pdfBytes = new Uint8Array(arrayBuffer!);
        let pdfDoc = PDFDocument.load(pdfBytes, {
            updateMetadata: false
        });
        pdfDoc.then((doc) => {
            let pages = doc.getPages();
            pages.forEach((page, index) => {
                let newPdf = PDFDocument.create();
                newPdf.then((newDoc) => {
                    const copiedPage = newDoc.copyPages(doc, [index]);
                    copiedPage.then((copiedPage) => {
                        newDoc.addPage(copiedPage[0]);
                        let newPdfBytes = newDoc.save();
                        newPdfBytes.then((newBytes) => {
                            console.log(newBytes)
                            zipFile.file(`page${index}.pdf`, newBytes);
                        });
                    });
                });
            });
        });
    });

    // TODO: Get zipping working
    zipFile.generateAsync({type:"blob"}).then((content) => {
        // Save the zip file
        console.log(content)
        fs.saveAs(content, "splitPDF.zip");
    })

}

</script>

<template>
    <div class="mt-3">
        <Checkbox v-model="formatName" inputId="formatName" name="formatName" :binary=true />
        <label for="formatName" class="mr-2"> Format Name? </label>

        <Button type="button" label="Split" icon="pi pi-check" @click="closeDialog" autofocus :disabled="store.getSelectedLineIndex() == -1"></Button>
    </div>
</template>


