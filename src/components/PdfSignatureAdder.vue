/** PdfSignatureAdder.vue
Component that allows the user to add a signature to a PDF.
This option becomes available if the user has selected a PDF via PdfSelect.vue and has selected an image via SignatureUpload.vue

User will see the first page of the PDF that was selected and will be asked to draw a box around the area where the signature should be placed.
User will then be asked to select the signature image that they want to use.

After selected the area and the signature image, the image will be placed on every page of the PDF in the selected location.
*/

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePdfStore } from '@/stores/pdf';
import { useSignatureStore } from '@/stores/signature';
import * as PDFJS from "pdfjs-dist";

const pdfStore = usePdfStore();
const signatureStore = useSignatureStore();

const ToolTips = {
    SIGNATURE_ADDER_TIP: "Draw a box around the area where you want the signature to be placed. \n\nNote: The signature will be placed on every page of the PDF."
}

let pdfPage = ref<PDFJS.PDFPageProxy | null>();
let pdfCanvas = ref<CanvasRenderingContext2D | null>();
let startX = 0;
let startY = 0;

onMounted(() => {
    let pdfArrayBuffer = pdfStore.getPdfBytes();
    pdfArrayBuffer.then((arrayBuffer) => {
        let pdfBytes = new Uint8Array(arrayBuffer!);
        PDFJS.getDocument(pdfBytes!).promise.then((pdfDoc) => {
            pdfDoc.getPage(1).then((page) => {
                pdfPage.value = page;
                let canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
                pdfCanvas.value = canvas.getContext('2d')!;
                let viewport = page.getViewport({ scale: 1.0 });
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                page.render({ canvasContext: pdfCanvas.value, viewport: viewport });
            });
        });
    });
});

// TODO: Fix issue with PDF becoming not visible after clicking on the canvas
const handleMouseDown = (event: MouseEvent) => {
    startX = event.offsetX;
    startY = event.offsetY;
}

const handleMouseUp = (event: MouseEvent) => {
    let endX = event.offsetX;
    let endY = event.offsetY;
    let width = endX - startX;
    let height = endY - startY;

    pdfCanvas.value!.clearRect(0, 0, pdfCanvas.value!.canvas.width, pdfCanvas.value!.canvas.height);
    pdfCanvas.value!.strokeRect(startX, startY, width, height);
}

const handleMouseMove = (event: MouseEvent) => {
    if (event.buttons === 1) {
        let endX = event.offsetX;
        let endY = event.offsetY;
        let width = endX - startX;
        let height = endY - startY;

        pdfCanvas.value!.clearRect(0, 0, pdfCanvas.value!.canvas.width, pdfCanvas.value!.canvas.height);
        pdfCanvas.value!.strokeRect(startX, startY, width, height);
    }
}

</script>

<template>
    <div>
        <div class="p-d-flex p-flex-column p-ai-center p-mt-2">
            <canvas class="border-solid" id="pdf-canvas" ref="pdfCanvas" v-on:mousedown="handleMouseDown" v-on:mouseup="handleMouseUp" v-on:mousemove="handleMouseMove"></canvas>
        </div>
    </div>
</template>

<style scoped="true">
</style>
