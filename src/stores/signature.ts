import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSignatureStore = defineStore('signature', () => {
    const signature = ref<Uint8Array | null>();
    const startX = ref<number>(0);
    const startY = ref<number>(0);
    const endX = ref<number>(0);
    const endY = ref<number>(0);

    const setSignature = (signatureData: Uint8Array) => {
        signature.value = signatureData;
    };
    const getSignature = () => {
        return signature.value;
    };
    function clearSignature() {
        signature.value = null;
    }
    function setStartX(x: number) {
        startX.value = x;
    }
    function setStartY(y: number) {
        startY.value = y;
    }
    function setEndX(x: number) {
        endX.value = x;
    }
    function setEndY(y: number) {
        endY.value = y;
    }
    function getStartX() {
        return startX.value;
    }
    function getStartY() {
        return startY.value;
    }
    function getEndX() {
        return endX.value;
    }
    function getEndY() {
        return endY.value;
    }
    function clear() {
        signature.value = null;
        startX.value = 0;
        startY.value = 0;
        endX.value = 0;
        endY.value = 0;
    }
    return { signature, setSignature, getSignature, clearSignature, setStartX, setStartY, setEndX, setEndY, getStartX, getStartY, getEndX, getEndY, clear };
    }
);
