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
const seperator = ref(" - ");
const selectedLineText = ref("");

const formatName = ref(true);


const ToolTips = {
    PREFIX_TIP: "Text before selected line text",
    SUFFIX_TIP: "Text after selected line text",
    SEPERATOR_TIP: "Chracter/Text to seperate prefix, selected line text, and suffix. I.e. - will produce 'Prefix - Selected Line Text - Suffix' \n Default: ' - '",
    FORMAT_NAME_TIP: "Format selected line text to name format (Last, First Middle. Suffix). May yeild unexpected results if used on other text."
}


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

<!-- TODO:
Add name preview as inputs and options are changed (this will be an example of the first page found in the PDF)
Add tooltip for the Split button stating that this will split the PDF into multiple PDFs based on the number of pages in the PDF.
Add preview of what all the PDFs will be named based on the options selected.
Add option to download each PDF individually or as a zip file.
-->
<template class="m-2">
    <div class="flex flex-column">
        <div class="flex flex-row gap-2">
            <span class="p-float-label" v-tooltip.top="ToolTips.PREFIX_TIP">
                <InputText id="prefix" v-model="prefixValue" />
                <label for="prefix">Prefix</label>
            </span>
            <span class="p-float-label" v-tooltip.top="ToolTips.SUFFIX_TIP">
                <InputText id="suffix" v-model="suffixValue" />
                <label for="suffix">Suffix</label>
            </span>
            <span class="p-float-label" v-tooltip.top="ToolTips.SEPERATOR_TIP">
                <InputText id="seperator" v-model="seperator" />
                <label for="seperator">Seperator</label>
            </span>
            <div v-tooltip.top="ToolTips.FORMAT_NAME_TIP" class="flex align-self-center">
                <Checkbox inputId="formatName" class="mr-1" v-model="formatName" name="formatName" :binary=true />
                <label for="formatName" class="mr-2"> Format Name? </label>
            </div>
        </div>
        <div class="flex flex-row justify-content-between flex-wrap mt-3">
            <!-- File Name Preview -->
            <p class="flex align-items-center justify-content-center">First File Name Preview: {{ getFirstFileNamePreview }}</p>
            <Button class="flex align-items-center justify-content-center" type="button" label="Split" icon="pi pi-check" @click="closeDialog" autofocus :disabled="store.getSelectedLineIndex() == -1"></Button>
        </div>
    </div>

</template>

<style>
.p-dialog .p-dialog-footer {
    padding: 1.75rem 1.5rem 1rem 1.5rem;
}
</style>

