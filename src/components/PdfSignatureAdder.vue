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
import { PDFContext } from 'pdf-lib';

const pdfStore = usePdfStore();
const signatureStore = useSignatureStore();

const ToolTips = {
    SIGNATURE_ADDER_TIP: "Draw a box around the area where you want the signature to be placed. \n\nNote: The signature will be placed on every page of the PDF."
}

let pdfPage = ref<PDFJS.PDFPageProxy | null>();
let pdfCanvas = ref<CanvasRenderingContext2D | null>();
let pdfImage = ref<HTMLImageElement | undefined>();
let startX = 0;
let startY = 0;

onMounted(async () => {
    let pdfArrayBuffer = await pdfStore.getPdfBytes();
    let pdfBytes = new Uint8Array(pdfArrayBuffer!);
    let pdfDocumentProxy = await PDFJS.getDocument(pdfBytes!).promise;
    let pdfPageProxy = await pdfDocumentProxy.getPage(1)

    pdfPage.value = pdfPageProxy
    let canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
    pdfCanvas.value = canvas.getContext('2d')!;
    let viewport = pdfPageProxy.getViewport({ scale: 1.0 });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    pdfPageProxy.render({ canvasContext: pdfCanvas.value, viewport: viewport })
});

const saveCanvasState = () => {
    if (pdfCanvas.value) {
        console.log("Saving state...")
        var canvasPic = new Image();
        canvasPic.src = pdfCanvas.value!.canvas.toDataURL("image/png");
        pdfImage.value = canvasPic;
    }
}

const handleMouseDown = (event: MouseEvent) => {
    if (pdfImage.value === undefined) {
        saveCanvasState();
    }
    event.preventDefault();
    event.stopPropagation();
    startX = event.offsetX;
    startY = event.offsetY;
}
const handleMouseUp = (event: MouseEvent) => {
    let endX = event.offsetX;
    let endY = event.offsetY;
    let width = endX - startX;
    let height = endY - startY;
    event.preventDefault();
    event.stopPropagation();
    pdfCanvas.value!.strokeRect(startX, startY, width, height);
}
const handleMouseMove = (event: MouseEvent) => {
    if (event.buttons === 1) {
        let endX = event.offsetX;
        let endY = event.offsetY;
        let width = endX - startX;
        let height = endY - startY;
        event.preventDefault();
        event.stopPropagation();

        pdfCanvas.value!.clearRect(0, 0, pdfCanvas.value!.canvas.width, pdfCanvas.value!.canvas.height);
        pdfCanvas.value!.drawImage(pdfImage.value!, 0, 0);
        pdfCanvas.value!.beginPath()
        pdfCanvas.value!.rect(startX, startY, width, height);
        pdfCanvas.value!.stroke()
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
