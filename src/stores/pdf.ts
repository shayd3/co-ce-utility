import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePdfStore = defineStore('pdf', () => {
    const pdfFile = ref<File | null>(null);

    const setPdfFile = (file: File) => {
        pdfFile.value = file;
    };

    const getPdfFile = () => {
        return pdfFile.value;
    };

    const getPdfBytes = async () => {
        if (pdfFile.value) {
            return await pdfFile.value.arrayBuffer();
        }
        return null;
    };

    // const getPdf = () => {
    //     return pdf.value;
    // };

    // const setPdfBytes = async (pdfDocBytes: Uint8Array) => {
    //     pdfBytes.value = pdfDocBytes;

    //     pdf.value = await PDFDocument.load(pdfDocBytes!, {
    //         updateMetadata: false
    //     })
    // };
    // const getPdfBytes = () => {
    //     return pdfBytes.value;
    // };
    // const setPdfName = (name: string) => {
    //     pdfName.value = name;
    // };
    // const getPdfName = () => {
    //     return pdfName.value;
    // };

    function clearPdf() {
       pdfFile.value = null;
    };
    return { setPdfFile, getPdfFile, getPdfBytes, clearPdf };
    }
);
