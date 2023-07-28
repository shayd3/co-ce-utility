import type { PDFDocument } from 'pdf-lib';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePdfStore = defineStore('pdf', () => {
    const pdf = ref<PDFDocument | null>();
    const pdfName = ref<string>();

    const setPdf = (pdfDoc: PDFDocument | null) => {
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

    function clearPdf() {
        pdf.value = null;
        pdfName.value = '';
    };
    return { pdf, setPdf, getPdf, pdfName, setPdfName, getPdfName, clearPdf };
    }
);
