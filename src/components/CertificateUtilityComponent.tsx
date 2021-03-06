import React, { Component } from 'react';
import './CertificateUtilityComponent.css';
import { styled } from '@mui/material/styles';
import { Grid, Button, Divider, Paper, Tooltip } from '@mui/material';
import { UploadFile, CallSplit, DriveFileRenameOutline } from '@mui/icons-material';
import JSZip from 'jszip';
import { saveAs } from 'file-saver'
import { PDFDocument } from 'pdf-lib'; // PDF Split, as well as modification
import * as PDFJS from "pdfjs-dist"; // Text Extraction
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { StatePDF } from '../models/StatePDF';
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;

type CertificateUtilityProps = {}
type CertificateUtilityState = {
    fileName: string,
    document: PDFDocument | null,
    documentRaw: Uint8Array,
    content: TextItem[][],
    signaturePicture: Uint8Array
}

const Input = styled('input')({
    display: 'none'
});

const states: Record<string, StatePDF> = {
    'AZ': new StatePDF("Arizona", "AZ", 57, 125, 310, 375, 20),
    'CA': new StatePDF("California", "CA", 41, 132, 185, 330, 20),
    'DE': new StatePDF("Delaware", "DE", 6, 0, 0, 0, 0),
    'FL': new StatePDF("Florida", "FL", 5, 0, 0, 0, 0),
    'GA': new StatePDF("Georgia", "GA", 98, 0, 0, 0, 0),
    'IL': new StatePDF("Illinois", "IL", 6, 0, 0, 0, 0),
    'NV': new StatePDF("Nevada", "NV", 89, 75, 203, 310, 20),
    'NC': new StatePDF("North Carolina", "NC", 20, 325, 405, 296, 30),
    'OH': new StatePDF("Ohio", "OH", 6, 0, 0, 0, 0),
    'OK': new StatePDF("Oklahoma", "OK", 6, 0, 0, 0, 0),
    'PA': new StatePDF("Pennsylvania", "PA", 6, 0, 0, 0, 0),
    'TX': new StatePDF("Texas", "TX", 38, 0, 0, 0, 0),
    'VA': new StatePDF("Virginia", "VA", 48, 290, 271, 0, 0),
    'WV': new StatePDF("West Virginia", "WV", 34, 290, 271, 330, 20)
}

const TOOL_TIPS : Record<string,string> = {
    "SELECT_PDF": "Select PDF to work on! (Enables 'Split PDF' and 'Split and Rename PDF' sections)",
    "SELECT_SIGNATURE": "Select png image of your signature to inject into PDF. (Enables 'Split, Rename, and Sign PDF' section)",
    "SPLIT_PDF_BUTTON_DISABLE": "You must select a PDF in order to use this button!",
    "SPLIT_AND_SIGN_PDF_BUTTON_DISABLE": "You must select a PDF and a Signature to use this button!"
}

class CertificateUtility extends Component<CertificateUtilityProps, CertificateUtilityState> {
    constructor(props: CertificateUtilityProps) {
        super(props);
        this.state = {
            fileName: "",
            document: null,
            documentRaw: new Uint8Array(),
            content: [],
            signaturePicture: new Uint8Array()
        }

        this.onPDFFileChange = this.onPDFFileChange.bind(this);
        this.onSignatureFileChange = this.onSignatureFileChange.bind(this);
        this.fileData = this.fileData.bind(this);
        this.onSplitPdfClick = this.onSplitPdfClick.bind(this);
        this.getTextContentFromAllPages = this.getTextContentFromAllPages.bind(this);
        this.onClearPdfClick = this.onClearPdfClick.bind(this);
        this.onClearSignatureClick = this.onClearSignatureClick.bind(this);
    }

    async onPDFFileChange(event: any) {
        let reader = new FileReader();
        let file = event.target.files[0] as File;
        let fileName = file.name
        reader.readAsArrayBuffer(file);
        reader.onloadend = async (e) => {
            if (e.target?.readyState === FileReader.DONE) {
                let arrayBuffer = e.target.result as ArrayBuffer;
                let typedArray = new Uint8Array(arrayBuffer);
                let pdfDoc = await PDFDocument.load(typedArray, {
                    updateMetadata: false
                })
                this.setState({
                    fileName: fileName,
                    document: pdfDoc,
                    documentRaw: typedArray
                });
            }
        }
    }

    async onSignatureFileChange(event: any) {
        let reader = new FileReader();
        let signatureFile = event.target.files[0] as File;
        reader.readAsArrayBuffer(signatureFile);
        reader.onloadend = async (e) => {
            if (e.target?.readyState === FileReader.DONE) {
                let arrayBuffer = e.target.result as ArrayBuffer;
                let typedArray = new Uint8Array(arrayBuffer);
                this.setState({
                    signaturePicture: typedArray
                })
            }
        }
    }

    async onSplitPdfClick(state: string) {
        let pdf = this.state.document;
        if (!pdf) {
            console.error("PDF was not loaded successfully or it's empty. Make sure a PDF was selected...");
            return;
        }
        if (state === "") {
            this.splitPdf(pdf, "PDFSplit.zip", false, false, "")
        } else {
            this.splitPdf(pdf, `${state.toUpperCase()}_Split.zip`, true, true, state.toUpperCase())
        }
    }

    async onClearPdfClick(event: any) {
        this.setState({
            fileName: "",
            document: null,
            documentRaw: new Uint8Array(),
            content: []
        })
    }

    async onClearSignatureClick(event: any) {
        this.setState({
            signaturePicture: new Uint8Array()
        })
    }

    async splitPdf(pdf: PDFDocument, zipFileName: string, extractNames: boolean, addSignature: boolean, state: string) {
        const pageCount = pdf.getPageCount();

        // Get page count for page split
        if (!pageCount && pageCount === 0) {
            console.error("there was an issue reading the page count of PDF or PDF is empty...");
            return;
        }

        // Start name extraction if true
        let lastNames: string[] = []
        if (extractNames) {
            let pdfTextContent = await this.getTextContentFromAllPages()
            if (!pdfTextContent) {
                console.error("there was an issue getting text content from selected pdf...");
                return;
            }
            pdfTextContent.forEach((page, i) => {
                let fullName = page[states[state].getProducerNameIndex()].str
                let lastName = this.getLastWordInStr(fullName)
                if (lastName === undefined) {
                    console.error(`there was an issue getting last name from page ${i + 1}...`)
                    return
                }
                lastNames.push(lastName)
            })
        }

        if (addSignature) {
            if (this.state.signaturePicture.length !== 0) {
                let signature = await pdf.embedPng(this.state.signaturePicture)
                let scaledSignature = signature.scaleToFit(states[state].getSignatureWidthBoundary(), states[state].getSignatureHeightBoundary())

                pdf.getPages().forEach(page => {
                    page.drawImage(signature, {
                        x: states[state].getSignatureX(),
                        y: states[state].getSignatureY(),
                        height: scaledSignature.height,
                        width: scaledSignature.width
                    })
                })
            }
        }

        let zipFile: JSZip = new JSZip();

        for (let i = 0; i < pageCount; i++) {
            const subDoc = await PDFDocument.create();
            const [copiedPage] = await subDoc.copyPages(pdf, [i]);
            subDoc.addPage(copiedPage);
            const pdfBytes = await subDoc.save();
            if (state === "") {
                zipFile.file(`${i + 1}.pdf`, pdfBytes);
            } else {
                zipFile.file(`${lastNames[i]} - ${state}.pdf`, pdfBytes)
            }

        }

        zipFile.generateAsync({ type: "blob" })
            .then(function (content) {
                saveAs(content, zipFileName);
            })
    }

    // getTextContentFromAllPages() pulls the current pdf and pdf bytes array from state
    // and gets all text contents from each page
    async getTextContentFromAllPages() {
        const pdf = this.state.document;
        const pdfRaw = this.state.documentRaw;
        if (!pdf) {
            console.error("there was an issue reading PDF...")
            return;
        }
        const doc = await PDFJS.getDocument(pdfRaw).promise;
        const pdfPageCount = pdf.getPageCount()
        let pdfPagesItems: TextItem[][] = []

        for (let i = 1; i <= pdfPageCount; i++) {
            let page = await doc.getPage(i)
            let content = await page.getTextContent()
            let items = content.items
            pdfPagesItems.push(items as TextItem[])
        }
        console.log(pdfPagesItems)
        return pdfPagesItems
    }

    // extractStringFromPDF() extracts string from given page and line number from given TextItem[][]
    extractStringFromPDF(pdfPagesContent: TextItem[][], pageNum: number, lineNum: number) {
        return (pdfPagesContent[pageNum][lineNum]).str
    }

    getLastWordInStr(str: string) {
        return str.split(" ").pop()
    }

    fileData() {
        if (this.state.document) {
            return (
                <div>
                    <h2>PDF Details:</h2>
                    <p><b>Selected File:</b> {this.state.fileName}</p>
                    <p><b>Total Pages:</b> {this.state.document.getPageCount()}</p>
                    <p>
                        <b>Last Modified:</b> {" "}
                        {this.state.document.getModificationDate()?.toDateString()}
                    </p>

                </div>
            );
        } else {
            return (
                <div>
                    <h2>PDF Details:</h2>
                    <p>No PDF selected</p>
                </div>
            );
        }
    };

    signatureData() {
        if (this.state.signaturePicture && this.state.signaturePicture.length !== 0) {
            let signatureUrl = ""
            const blob = new Blob([this.state.signaturePicture]);
            signatureUrl = URL.createObjectURL(blob);

            return (
                <div>
                    <h2>Signature:</h2>
                    <img src={signatureUrl} alt="signature" id="SignatureImage"></img>
                </div>
            )

        } else {
            return (
                <div>
                    <h2>Signature:</h2>
                    <p>No signature selected</p>
                </div>
            )
        }
    }

    render() {
        return (
            <div>
                <Grid
                    id='CertificateUtility'
                    container
                    direction='column'
                    alignItems="flex-start"
                    justifyContent='flex-start'
                    spacing={1}
                    sx={{ m: 2 }}
                >
                    <Paper elevation={3}>
                        <Grid
                            id='CertificateUtilityDetails'
                            container
                            textAlign="left"
                            sx={{ m: 1 }}
                        >
                            <Grid item sx={{ mx: 1.5 }}>
                                <label htmlFor="pdf-upload-button">
                                    <Input accept=".pdf" id="pdf-upload-button" type="file" onChange={this.onPDFFileChange} />
                                    <Tooltip title={TOOL_TIPS["SELECT_PDF"]} arrow>
                                        <Button variant="contained" component="span" startIcon={<UploadFile />}>
                                            Select PDF
                                        </Button>
                                    </Tooltip>
                                </label>
                                {this.fileData()}
                                <Button variant="outlined" disabled={!this.state.document} color="error" onClick={this.onClearPdfClick}>
                                Clear PDF
                                </Button>
                            </Grid>

                            <Divider orientation="vertical" flexItem />
                            <Grid item sx={{ mx: 1.5 }}>
                                <label htmlFor="signature-upload-button">
                                    <Input accept=".png" id="signature-upload-button" type="file" onChange={this.onSignatureFileChange} />
                                    <Tooltip title={TOOL_TIPS["SELECT_SIGNATURE"]} arrow>
                                        <Button variant="contained" component="span" startIcon={<DriveFileRenameOutline />}>
                                            Select Signature
                                        </Button>
                                    </Tooltip>
                                </label>
                                {this.signatureData()}
                                <Button variant="outlined" disabled={(this.state.signaturePicture.length === 0)} color="error" onClick={this.onClearSignatureClick}>
                                Clear Signature
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>


                    <h2>Split and Rename PDF</h2>
                    <Grid item>
                        <Button fullWidth variant="contained" startIcon={<CallSplit />} disabled={!this.state.document} onClick={() => this.onSplitPdfClick("DE")}>
                            Delaware
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button fullWidth variant="contained" startIcon={<CallSplit />} disabled={!this.state.document} onClick={() => this.onSplitPdfClick("FL")}>
                            Florida
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" startIcon={<CallSplit />} disabled={!this.state.document} onClick={() => this.onSplitPdfClick("GA")}>
                            Georgia
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" startIcon={<CallSplit />} disabled={!this.state.document} onClick={() => this.onSplitPdfClick("IL")}>
                            Illinois
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" startIcon={<CallSplit />} disabled={!this.state.document} onClick={() => this.onSplitPdfClick("OH")}>
                            Ohio
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" startIcon={<CallSplit />} disabled={!this.state.document} onClick={() => this.onSplitPdfClick("OK")}>
                            Oklahoma
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" startIcon={<CallSplit />} disabled={!this.state.document} onClick={() => this.onSplitPdfClick("PA")}>
                            Pennsylvania
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" startIcon={<CallSplit />} disabled={!this.state.document} onClick={() => this.onSplitPdfClick("TX")}>
                            Texas
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" startIcon={<CallSplit />} disabled={!this.state.document} onClick={() => this.onSplitPdfClick("VA")}>
                            Virginia
                        </Button>
                    </Grid>

                    <h2>Split, Rename, and Sign PDF</h2>
                    <Grid item>
                        <Button variant="contained" startIcon={<DriveFileRenameOutline />} disabled={(this.state.signaturePicture.length === 0)} onClick={() => this.onSplitPdfClick("AZ")}>
                            Arizona
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" startIcon={<DriveFileRenameOutline />} disabled={(this.state.signaturePicture.length === 0)} onClick={() => this.onSplitPdfClick("CA")}>
                            California
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" startIcon={<DriveFileRenameOutline />} disabled={(this.state.signaturePicture.length === 0)} onClick={() => this.onSplitPdfClick("NV")}>
                            Nevada
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" startIcon={<DriveFileRenameOutline />} disabled={(this.state.signaturePicture.length === 0)} onClick={() => this.onSplitPdfClick("NC")}>
                            North Carolina
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" startIcon={<DriveFileRenameOutline />} disabled={(this.state.signaturePicture.length === 0)} onClick={() => this.onSplitPdfClick("WV")}>
                            West Virginia
                        </Button>
                    </Grid>
                </Grid>
            </div>

        )
    }

}

export default CertificateUtility;
