import React, { Component } from 'react';
import { styled } from '@mui/material/styles';
import { Grid, Button } from '@mui/material';
import { UploadFile, CallSplit } from '@mui/icons-material';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver'
import * as PDFJS from "pdfjs-dist";
import { TextItem } from 'pdfjs-dist/types/src/display/api';
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;

type CertificateUtilityProps = {}
type CertificateUtilityState = {
    document: PDFDocument | null,
    documentRaw: Uint8Array,
    content: TextItem[][]
}

const Input = styled('input')({
    display: 'none'
});

enum StateNamePosition {
    TX = 38
}

class CertificateUtility extends Component<CertificateUtilityProps, CertificateUtilityState> {
    constructor(props: CertificateUtilityProps) {
        super(props);
        this.state = {
            document: null,
            documentRaw: new Uint8Array(),
            content: []
        }

        this.onFileChange = this.onFileChange.bind(this);
        this.fileData = this.fileData.bind(this);
        this.onSplitPdfClick = this.onSplitPdfClick.bind(this);
        this.getTextContentFromAllPages = this.getTextContentFromAllPages.bind(this);
    }

    async onFileChange(event: any) {
        let reader = new FileReader();
        let file = event.target.files[0];

        reader.readAsArrayBuffer(file);
        reader.onloadend = async (e) => {
            if (e.target?.readyState === FileReader.DONE) {
                let arrayBuffer = e.target.result as ArrayBuffer;
                let typedArray = new Uint8Array(arrayBuffer);
                let pdfDoc = await PDFDocument.load(typedArray, {
                    updateMetadata: false
                  })
                this.setState({
                    document: pdfDoc,
                    documentRaw: typedArray
                });
            }
        }
    }

    async onSplitPdfClick(state: string) {
        let pdf = this.state.document;
        if(!pdf) {
            console.error("PDF was not loaded successfully or it's empty. Make sure a PDF was selected...");
            return;
        }
        switch (state) {
            case "": {
                this.splitPdf(pdf, "PDFSplit.zip", false, "")
                break;
            }
            case "TX": {
                this.splitPdf(pdf, "TX_Split.zip", true, "TX")
                break;
            }
        }
    }

    async splitPdf(pdf: PDFDocument, zipFileName: string, extractNames: boolean, state: string) {
        const pageCount = pdf?.getPageCount();

        // Get page count for page split
        if(!pageCount && pageCount === 0) {
            console.error("there was an issue reading the page count of PDF...");
            return;
        }

        // Start name extraction if true
        let lastNames:string[] = []
        if (extractNames) {
            let pdfTextContent = await this.getTextContentFromAllPages()
            if(!pdfTextContent) {
                console.error("there was an issue getting text content from selected pdf...");
                return;
            }
            pdfTextContent.forEach( (page, i)=> {
                let fullName = page[StateNamePosition[state as keyof typeof StateNamePosition]].str
                let lastName = this.getLastWordInStr(fullName)
                if (lastName == undefined) {
                    console.error(`there was an issue getting last name from page ${i + 1}...`)
                    return
                }
                lastNames.push(lastName)
            })
        }

        let zipFile: JSZip = new JSZip();

        for(let i = 0; i < pageCount; i++) {
            const subDoc = await PDFDocument.create();
            const [copiedPage] = await subDoc.copyPages(pdf, [i]);
            subDoc.addPage(copiedPage);
            const pdfBytes = await subDoc.save();
            if(state === "") {
                zipFile.file(`${i + 1}.pdf`, pdfBytes);
            } else {
                zipFile.file(`${lastNames[i]} - ${state}.pdf`, pdfBytes)
            }

        }

        zipFile.generateAsync({type: "blob"})
            .then(function(content) {
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
        let pdfPagesItems:TextItem[][] = []

        for(let i = 1; i <= pdfPageCount; i++) {
            let page = await doc.getPage(i)
            let content = await page.getTextContent()
            let items = content.items
            // content.items.map(token => (token as TextItem).str).join("")
            pdfPagesItems.push(items as TextItem[])
        }
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
                    <h2>File Details:</h2>
                    <p>Total Pages: { this.state.document.getPageCount() }</p>
                    <p>
                        Last Modified:{" "}
                        { this.state.document.getModificationDate()?.toDateString() }
                    </p>

                </div>
            );
        }
    };

    render() {
        return (
            <Grid
                id='CertificateUtility'
                container
                direction='column'
                alignItems='center'
                justifyContent='center'
            >
                <Grid item sx={{m: .5}}>
                    <div className="CertificateUtility">
                        <label htmlFor="pdf-upload-button">
                            <Input accept=".pdf" id="pdf-upload-button" type="file" onChange={this.onFileChange} />
                            <Button variant="contained" component="span" startIcon={<UploadFile />}>
                                Select PDF
                            </Button>
                        </label>
                    </div>
                </Grid>
                <Grid item sx={{m: .5}}>
                    {this.fileData()}
                </Grid>
                <Grid item sx={{m: .5}}>
                    <Button variant="contained" startIcon={<CallSplit />} onClick={() => this.onSplitPdfClick("")}>
                        Split PDF
                    </Button>
                </Grid>
                <Grid item sx={{m: .5}}>
                    <Button variant="contained" startIcon={<CallSplit />} onClick={() => this.onSplitPdfClick("TX")}>
                        Split PDF (TX)
                    </Button>
                </Grid>
            </Grid>

        )
    }

}

export default CertificateUtility;
