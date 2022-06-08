import React, { Component } from 'react';
import { styled } from '@mui/material/styles';
import { Grid, Button } from '@mui/material'
import { UploadFile } from '@mui/icons-material'
import { PDFDocument } from 'pdf-lib'

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

    fileData() {
        if (this.state.document) {
            return (
                <div>
                    <h2>File Details:</h2>
                    <p>File Name: {this.state.document.getTitle()}</p>
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
                <div className="CertificateUtility">
                    <label htmlFor="pdf-upload-button">
                        <Input accept=".pdf" id="pdf-upload-button" type="file" onChange={this.onFileChange} />
                        <Button variant="contained" component="span" startIcon={<UploadFile />}>
                            Select PDF
                        </Button>
                    </label>
                </div>
                <div>
                    {this.fileData()}
                </div>
            </Grid>

        )
    }

}

export default CertificateUtility;
