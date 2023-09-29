<script setup lang="ts">
import { inject, ref, defineAsyncComponent, markRaw } from "vue";
import * as fs from 'file-saver';
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import * as PDFJS from "pdfjs-dist";
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { formatLineText, formatLineWithPrefixSuffix } from "@/utils/splitter";

import { usePdfStore } from '@/stores/pdf';
import { useSignatureStore } from '@/stores/signature';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import { useDialog } from 'primevue/usedialog';

const store = usePdfStore();
const signatureStore = useSignatureStore();
const dialogRef = inject("dialogRef") as any;
const PdfSignatureAdder = defineAsyncComponent(() => import('./PdfSignatureAdder.vue'))
const PdfSignatureAdderFooter = defineAsyncComponent(() => import('./PdfSignatureAdderFooter.vue'))

const dialog = useDialog();

const prefixValue = ref("");
const suffixValue = ref("");
const seperatorValue = ref(" - ");
const formatName = ref(true);

const ToolTips = {
    PREFIX_TIP: "Text before selected line text",
    SUFFIX_TIP: "Text after selected line text",
    SEPERATOR_TIP: "Chracter/Text to seperate prefix, selected line text, and suffix. I.e. - will produce 'Prefix - Selected Line Text - Suffix' \n Default: ' - '",
    FORMAT_NAME_TIP: "Format selected line text to name format (Last, First Middle. Suffix). May yeild unexpected results if used on other text."
}

const onSignatureAdd = () => {
    dialog.open(PdfSignatureAdder, {
        props: {
            header: 'Add Signature',
            style: {
                width: '70vw',
            },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            modal: true,
            draggable: false
        },
        templates: {
            footer: markRaw(PdfSignatureAdderFooter)
        }
    });
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
    let pdfTextContents = await getAllContentFromPdfPages();

    let pages = pdfDoc.getPages();

    for (let index = 0; index < pages.length; index++) {
        let newPdf = await PDFDocument.create();
        const copiedPage = await newPdf.copyPages(pdfDoc, [index]);
        newPdf.addPage(copiedPage[0]);
        let newPdfBytes = await newPdf.save();

        const selectedLineContent = pdfTextContents[index][store.getSelectedLineIndex()].str;
        let fileName = generateFileName(selectedLineContent);

        zipFile.file(fileName, newPdfBytes);

    }
    console.log("Finished splitting PDF")

    // download zip
    zipFile.generateAsync({ type: "blob" }).then(function (content) {
        fs.saveAs(content, "splitPDF.zip");
    });

}

const getAllContentFromPdfPages = async() => {
    let pdfBytes = await store.getPdfBytes();
    let pdfBytesUint8Array = new Uint8Array(pdfBytes!);
    let pdfDoc = await PDFJS.getDocument(pdfBytesUint8Array).promise
    let pages = pdfDoc.numPages;

    let pdfPagesItems: TextItem[][] = [];
    for (let index = 0; index < pages; index++) {
        let page = await pdfDoc.getPage(index + 1);
        let pageItems = await page.getTextContent();
        pdfPagesItems.push(pageItems.items as TextItem[]);
    }

    return pdfPagesItems;
}

const pdfNamePreview = () => {
    let selectedLineContent = store.getSelectedLineContent();

    if(selectedLineContent == "") {
        return "";
    }

    return generateFileName(selectedLineContent);
}

const generateFileName = (lineContent: string) => {
    if (formatName.value) {
        lineContent = formatLineText(lineContent);
    }

    lineContent = formatLineWithPrefixSuffix(lineContent, prefixValue.value, suffixValue.value, seperatorValue.value);

    return lineContent + ".pdf";
}

</script>

<!-- TODO:
Add tooltip for the Split button stating that this will split the PDF into multiple PDFs based on the number of pages in the PDF.
Add preview of what all the PDFs will be named based on the options selected.
Add option to download each PDF individually or as a zip file.
Add clear button for the formating inputs to go back to defaults (blank, blank, " - ")
Add input to allow re-naming of the resulting zip file. Make this a 2-way bind between the function call or manually typing in the input.
-->
<template class="m2">
    <div class="flex flex-column pt-4 gap-2">
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
                <InputText id="seperator" v-model="seperatorValue" />
                <label for="seperator">Seperator</label>
            </span>
            <div v-tooltip.top="ToolTips.FORMAT_NAME_TIP" class="flex align-self-center">
                <Checkbox inputId="formatName" class="mr-1" v-model="formatName" name="formatName" :binary=true />
                <label for="formatName" class="mr-2"> Format Name? </label>
            </div>
        </div>
        <div class="flex flex-row">
            <Button type="button" label="Add Signature" icon="pi pi-plus" :disabled="!signatureStore.signature" @click="onSignatureAdd" />
        </div>
        <div class="flex flex-row justify-content-between flex-wrap">
            <!-- File Name Preview -->
            <p v-if="store.getSelectedLineContent()" class="flex align-items-center justify-content-center">First File Name Preview: <b>{{ pdfNamePreview() }}</b></p>
            <p v-else><i>Select line to see preview of file name...</i></p>
            <Button class="flex align-items-center justify-content-center" type="button" label="Split" icon="pi pi-check" @click="closeDialog" autofocus :disabled="store.getSelectedLineIndex() == -1"></Button>
        </div>
    </div>

</template>

<style scoped="true">
.p-dialog .p-dialog-footer {
    padding: 1.75rem 1.5rem 1rem 1.5rem;
}

b {
    margin-left: 0.5rem;
}
</style>

