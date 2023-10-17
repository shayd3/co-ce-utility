import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePdfStore = defineStore('pdf', () => {
    const pdfFile = ref<File | null>(null);
    const pdfViewport = ref<any>(null);
    const selectedLineIndex = ref<number>(-1);
    const selectedLineContent = ref<string>('');

    const setPdfFile = (file: File) => {
        pdfFile.value = file;
    };

    const getPdfFile = () => {
        return pdfFile.value;
    };

    const setSelectedLine = (index: number, lineContent : string) => {
        selectedLineIndex.value = index;
        selectedLineContent.value = lineContent;
    }

    const getSelectedLineContent = () => {
        return selectedLineContent.value;
    }

    const setSelectedLineIndex = (index: number) => {
        selectedLineIndex.value = index;
    };

    const getSelectedLineIndex = () => {
        return selectedLineIndex.value;
    };

    const getPdfBytes = async () => {
        if (pdfFile.value) {
            return await pdfFile.value.arrayBuffer();
        }
        return null;
    };

    const setViewport = (viewport: any) => {
        pdfViewport.value = viewport;
    }

    const getViewport = () => {
        return pdfViewport.value;
    }

    function clearPdf() {
        pdfFile.value = null;
        selectedLineIndex.value = -1;
        selectedLineContent.value = '';
    };
    return { setPdfFile, getPdfFile, setSelectedLineIndex, setSelectedLine, getSelectedLineContent, getSelectedLineIndex, getPdfBytes, setViewport, getViewport, clearPdf };
    }
);
