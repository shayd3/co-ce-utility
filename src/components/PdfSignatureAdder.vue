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

let pdfCanvas = ref<CanvasRenderingContext2D | null>();

// Get the first page of the PDF and render the page to a canvas
onMounted(() => {
    let pdfArrayBuffer = pdfStore.getPdfBytes();
    pdfArrayBuffer.then((arrayBuffer) => {
        let pdfBytes = new Uint8Array(arrayBuffer!);
        PDFJS.getDocument(pdfBytes!).promise.then((pdfDoc) => {
            pdfDoc.getPage(1).then((page) => {
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

// Handle mouse events on the canvas
const handleMouseDown = (event: MouseEvent) => {
    let rect = pdfCanvas.value!.canvas.getBoundingClientRect();
    let x = Math.ceil(event.clientX - rect.left);
    let y = Math.ceil(event.clientY - rect.top);
    console.log("Mouse down on: " + x + ", " + y);
}

const handleMouseUp = (event: MouseEvent) => {
    let rect = pdfCanvas.value!.canvas.getBoundingClientRect();
    let x = Math.ceil(event.clientX - rect.left);
    let y = Math.ceil(event.clientY - rect.top);
    console.log("Mouse up on: " + x + ", " + y);
}

const handleMouseMove = (event: MouseEvent) => {
    let rect = pdfCanvas.value!.canvas.getBoundingClientRect();
    let x = Math.ceil(event.clientX - rect.left);
    let y = Math.ceil(event.clientY - rect.top);
    console.log("Mouse move on: " + x + ", " + y);
}


</script>

<template>
    <div>
        <div class="p-d-flex p-flex-column p-ai-center p-mt-2">
            <canvas class="border-solid" id="pdf-canvas" ref="pdfCanvas" width="1000" height="1000" v-on:mousedown="handleMouseDown" v-on:mouseup="handleMouseUp" v-on:mousemove="handleMouseMove"></canvas>
        </div>
    </div>
</template>

<style scoped="true">
</style>
