import React, { Component } from 'react';
import { styled } from '@mui/material/styles';
import { Grid, Button } from '@mui/material';
import { UploadFile, CallSplit } from '@mui/icons-material';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver'

type CertificateUtilityProps = {}
type CertificateUtilityState = { document: PDFDocument | null}

const Input = styled('input')({
    display: 'none'
});

class CertificateUtility extends Component<CertificateUtilityProps, CertificateUtilityState> {
    constructor(props: CertificateUtilityProps) {
        super(props);
        this.state = {
            document: null
        }

        this.onFileChange = this.onFileChange.bind(this);
        this.fileData = this.fileData.bind(this);
        this.onSplitClick = this.onSplitClick.bind(this);
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
                    document: pdfDoc
                });
            }
        }
    }

    async onSplitClick(event: any) {
        let zipFile: JSZip = new JSZip();
        const pdfDoc = this.state.document;
        if (!pdfDoc) {
            console.error("there was an issue reading the page count of PDF...")
            return;
        }

        const pageCount = pdfDoc?.getPageCount();

        if(!pageCount && pageCount === 0) {
            console.error("PDF was not loaded successfully or it's empty. Make sure a PDF was selected...");
            return;
        }

        for(let i = 0; i < pageCount; i++) {
            const subDoc = await PDFDocument.create();
            const [copiedPage] = await subDoc.copyPages(pdfDoc, [i]);
            subDoc.addPage(copiedPage);
            const pdfBytes = await subDoc.save();
            zipFile.file(`test ${i + 1}.pdf`, pdfBytes);
        }

        zipFile.generateAsync({type: "blob"})
            .then(function(content) {
                saveAs(content, "test.zip");
            })
    }

    fileData() {
        if (this.state.document) {
            return (
                <div>
                    <h2>File Details:</h2>
                    <p>File Name: {this.state.document.getSubject()}</p>
                    <p>
                        Last Modified:{" "}
                        {this.state.document.getModificationDate()?.toDateString()}
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
                    <Button variant="contained" startIcon={<CallSplit />} onClick={this.onSplitClick}>
                        Split PDF
                    </Button>
                </Grid>
            </Grid>

        )
    }

}

export default CertificateUtility;
