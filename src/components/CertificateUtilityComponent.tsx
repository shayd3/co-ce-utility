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

const splitRenameStates: Record<string, StatePDF> = {
    'DE': new StatePDF("Delaware", "DE", 6, 0, 0, 0, 0),
    'FL': new StatePDF("Florida", "FL", 5, 0, 0, 0, 0),
    'GA': new StatePDF("Georgia", "GA", 98, 0, 0, 0, 0),
    'IL': new StatePDF("Illinois", "IL", 6, 0, 0, 0, 0),
    'NH': new StatePDF("New Hampshire", "NH", 6, 0, 0, 0, 0),
    'OH': new StatePDF("Ohio", "OH", 6, 0, 0, 0, 0),
    'OK': new StatePDF("Oklahoma", "OK", 6, 0, 0, 0, 0),
    'OR': new StatePDF("Oregon", "OR", 6, 0, 0, 0, 0),
    'PA': new StatePDF("Pennsylvania", "PA", 6, 0, 0, 0, 0),
    'TX': new StatePDF("Texas", "TX", 38, 0, 0, 0, 0),
    'VA': new StatePDF("Virginia", "VA", 48, 290, 271, 0, 0)
}

const splitRenameSignStates : Record<string, StatePDF> = {
    'AZ': new StatePDF("Arizona", "AZ", 57, 125, 310, 375, 20),
    'AR': new StatePDF("Arkansas", "AR", 6, 0, 0, 0, 0),
    'CA': new StatePDF("California", "CA", 41, 132, 185, 330, 20),
    'CO': new StatePDF("Colorado", "CO", 249, 40, 305, 330, 20),
    'IA': new StatePDF("Iowa", "IA", 6, 0, 0, 0, 0),
    'IN': new StatePDF("Indiana", "IN", 66, 300, 385, 330, 20),
    'NE': new StatePDF("Nebraska", "NE", 6, 0, 0, 0, 0),
    'NV': new StatePDF("Nevada", "NV", 89, 75, 203, 310, 20),
    'NC': new StatePDF("North Carolina", "NC", 20, 325, 405, 296, 30),
    'WA': new StatePDF("Washington", "WA", 6, 0, 0, 0, 0),
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

    /**
     * onPDFFileChange() - Reads the PDF file and stores it in the state
     * @param event
     * @returns
     */
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

    /**
     * onSignatureFileChange() - Reads the signature file and stores it in the state
     *
     * @param event
     */
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

    /**
     * onSplitPdfClick() - Splits PDF into individual pages and zips them into a single file
     *
     * @param states
     * @param state
     * @returns
     */
    async onSplitPdfClick(states: Record<string, StatePDF>, state: string) {
        let pdf = this.state.document;
        if (!pdf) {
            console.error("PDF was not loaded successfully or it's empty. Make sure a PDF was selected...");
            return;
        }
        if (state === "") {
            this.splitPdf(states, pdf, "PDFSplit.zip", false, false, "")
        } else {
            this.splitPdf(states, pdf, `${state.toUpperCase()}_Split.zip`, true, true, state.toUpperCase())
        }
    }

    /**
     * onClearPdfClick() - Clears PDF from state
     *
     * @param event
     */
    async onClearPdfClick(event: any) {
        this.setState({
            fileName: "",
            document: null,
            documentRaw: new Uint8Array(),
            content: []
        })
    }

    /**
     * onClearSignatureClick() - Clears signature picture from state
     *
     * @param event
     */
    async onClearSignatureClick(event: any) {
        this.setState({
            signaturePicture: new Uint8Array()
        })
    }

    /**
     * splitPdf() - Splits PDF into individual pages and adds signature to each page
     * if applicable. Also extracts names from PDF if applicable.
     *
     * @param states
     * @param pdf
     * @param zipFileName
     * @param extractNames
     * @param addSignature
     * @param state
     * @returns
     */
    async splitPdf(states: Record<string, StatePDF>, pdf: PDFDocument, zipFileName: string, extractNames: boolean, addSignature: boolean, state: string) {
        const pageCount = pdf.getPageCount();

        // Get page count for page split
        if (!pageCount && pageCount === 0) {
            console.error("there was an issue reading the page count of PDF or PDF is empty...");
            return;
        }

        // Start name extraction if true
        let nameSubStrings: string[] = []
        if (extractNames) {
            let pdfTextContent = await this.getTextContentFromAllPages()
            if (!pdfTextContent) {
                console.error("there was an issue getting text content from selected pdf...");
                return;
            }
            pdfTextContent.forEach((page, i) => {
                let fullName = page[states[state].getProducerNameIndex()].str
                let fullNameSplit = fullName.split(" ")

                let lastName = fullNameSplit[fullNameSplit.length - 1].toUpperCase()
                if (lastName === "SR" || lastName === "JR" || lastName === "I" || lastName === "II" || lastName === "III" || lastName === "IV") {
                    lastName = fullNameSplit[fullNameSplit.length - 2] + " " + lastName
                    fullNameSplit.splice(fullNameSplit.length - 2, 2)
                } else {
                    fullNameSplit.splice(fullNameSplit.length - 1, 1)
                }
                let firstName = fullNameSplit.join(" ")
                let newFullName = lastName + ", " + firstName
                console.log(newFullName)
                nameSubStrings.push(newFullName)
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
                zipFile.file(`${nameSubStrings[i]} - ${state}.pdf`, pdfBytes)
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

    /**
     * fileData() returns the file data of the selected pdf
     */
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

    /**
     * signatureData() returns the signature data of the selected signature
     * if no signature is selected, it returns a message saying no signature is selected
     * @returns
     * @memberof CertificateUtility
     */
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
                    {Object.entries(splitRenameStates).map(([stateCode, statePDF]) => (
                        <Grid item key={stateCode}>
                            <Button fullWidth variant='contained' startIcon={<CallSplit />} disabled={!this.state.document} onClick={() => this.onSplitPdfClick(splitRenameStates, stateCode)}>
                                {statePDF.getName()}
                            </Button>
                        </Grid>
                    ))}

                    <h2>Split, Rename, and Sign PDF</h2>
                    {Object.entries(splitRenameSignStates).map(([stateCode, statePDF]) => (
                        <Grid item key={stateCode}>
                            <Button fullWidth variant='contained' startIcon={<CallSplit />} disabled={!this.state.document} onClick={() => this.onSplitPdfClick(splitRenameSignStates, stateCode)}>
                                {statePDF.getName()}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </div>

        )
    }

}

export default CertificateUtility;
