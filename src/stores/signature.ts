import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSignatureStore = defineStore('signature', () => {
    const signature = ref<Uint8Array | null>();

    const setSignature = (signatureData: Uint8Array) => {
        signature.value = signatureData;
    };
    const getSignature = () => {
        return signature.value;
    };
    function clearSignature() {
        signature.value = null;
    }
    return { signature, setSignature, getSignature, clearSignature };
    }
);
