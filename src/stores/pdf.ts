import type { PDFDocument } from 'pdf-lib';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePdfStore = defineStore('pdf', () => {
    const pdf = ref<PDFDocument | null>();
    const pdfBytes = ref<Uint8Array | null>();
    const pdfName = ref<string>();

    const setPdf = (pdfDoc: PDFDocument | null) => {
        pdf.value = pdfDoc;
    };
    const getPdf = () => {
        return pdf.value;
    };

    const setPdfBytes = (pdfDocBytes: Uint8Array | null) => {
        pdfBytes.value = pdfDocBytes;
    };
    const getPdfBytes = () => {
        return pdfBytes.value;
    };
    const setPdfName = (name: string) => {
        pdfName.value = name;
    };
    const getPdfName = () => {
        return pdfName.value;
    };

    function clearPdf() {
        pdf.value = null;
        pdfBytes.value = null;
        pdfName.value = '';
    };
    return { pdf, setPdf, getPdf, setPdfBytes, getPdfBytes, pdfName, setPdfName, getPdfName, clearPdf };
    }
);
