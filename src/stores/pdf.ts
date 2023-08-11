import { PDFDocument } from 'pdf-lib';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePdfStore = defineStore('pdf', () => {
    const pdf = ref<PDFDocument | null>();
    const pdfBytes = ref<Uint8Array | null>();
    const pdfName = ref<string>();

    const getPdf = () => {
        return pdf.value;
    };

    const setPdfBytes = async (pdfDocBytes: Uint8Array | null) => {
        pdfBytes.value = pdfDocBytes;

        pdf.value = await PDFDocument.load(pdfDocBytes!, {
            updateMetadata: false
        })
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
    return { pdf, getPdf, setPdfBytes, getPdfBytes, pdfName, setPdfName, getPdfName, clearPdf };
    }
);
