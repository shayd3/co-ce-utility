import type { PDFDocument } from 'pdf-lib';
import { defineStore } from 'pinia';
import { ref } from 'vue';


export const usePdfStore = defineStore('pdf', () => {
    const pdf = ref<PDFDocument>();
    const pdfName = ref<string>();

    const setPdf = (pdfDoc: PDFDocument) => {
        pdf.value = pdfDoc;
    };
    const getPdf = () => {
        return pdf.value;
    };
    const setPdfName = (name: string) => {
        pdfName.value = name;
    };
    const getPdfName = () => {
        return pdfName.value;
    };
    return { pdf, setPdf, getPdf, pdfName, setPdfName, getPdfName };
    }
);
