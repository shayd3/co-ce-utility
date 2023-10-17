<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePdfStore } from '@/stores/pdf';
import { useSignatureStore } from '@/stores/signature';
import * as PDFJS from "pdfjs-dist";
import Message from 'primevue/message';

const pdfStore = usePdfStore();
const signatureStore = useSignatureStore();

let pdfPage = ref<PDFJS.PDFPageProxy | null>();
let pdfCanvas = ref<CanvasRenderingContext2D | null>();
let pdfImage = ref<HTMLImageElement | undefined>();
let startX = 0;
let startY = 0;

/**
 * Load the pdf and render the first page
 */
onMounted(async () => {
    let pdfArrayBuffer = await pdfStore.getPdfBytes();
    let pdfBytes = new Uint8Array(pdfArrayBuffer!);
    let pdfDocumentProxy = await PDFJS.getDocument(pdfBytes!).promise;
    let pdfPageProxy = await pdfDocumentProxy.getPage(1)

    pdfPage.value = pdfPageProxy
    let canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
    pdfCanvas.value = canvas.getContext('2d')!;

    let viewport = pdfPageProxy.getViewport({ scale: 1.0 });
    pdfStore.setViewport(viewport)

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    pdfPageProxy.render({ canvasContext: pdfCanvas.value, viewport: viewport })
});

/**
 * Saves the canvas state to an image so that it can be used later.
 * This is used to draw the signature on the PDF.
 *
 * @returns {void}
 */
const saveCanvasState = () => {
    if (pdfCanvas.value) {
        var canvasPic = new Image();
        canvasPic.src = pdfCanvas.value!.canvas.toDataURL("image/png");
        pdfImage.value = canvasPic;
    }
}

/**
 * Handles the mouse down event on the canvas.
 *
 * @param {MouseEvent} event
 *
 * @returns {void}
 */
const handleMouseDown = (event: MouseEvent) => {
    if (pdfImage.value === undefined) {
        saveCanvasState();
    }
    event.preventDefault();
    event.stopPropagation();
    startX = event.offsetX;
    startY = event.offsetY;
    signatureStore.setStartX(startX);
    signatureStore.setStartY(startY);
}

/**
 * Handles the mouse up event on the canvas.
 *
 * @param {MouseEvent} event
 *
 * @returns {void}
 */
const handleMouseUp = (event: MouseEvent) => {
    let endX = event.offsetX;
    let endY = event.offsetY;
    let width = endX - startX;
    let height = endY - startY;

    event.preventDefault();
    event.stopPropagation();
    pdfCanvas.value!.strokeRect(startX, startY, width, height);

    signatureStore.setStartX(startX);
    signatureStore.setStartY(startY);
    signatureStore.setEndX(endX);
    signatureStore.setEndY(endY);
    signatureStore.setWidth(Math.abs(width));
    signatureStore.setHeight(Math.abs(height));
}

/**
 * Handles the mouse move event on the canvas.
 *
 * @param {MouseEvent} event
 *
 * @returns {void}
 */
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
        <Message severity="success" :closable="false">Draw a box where you want to add your signature! This will add the signature to every page in the selected box.</Message>
        <div class="p-d-flex p-flex-column p-mt-2">
            <canvas class="border-solid" id="pdf-canvas" ref="pdfCanvas" v-on:mousedown="handleMouseDown" v-on:mouseup="handleMouseUp" v-on:mousemove="handleMouseMove" />
        </div>
    </div>
</template>

<style scoped="true">
</style>
