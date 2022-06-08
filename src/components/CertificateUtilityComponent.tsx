import React, { Component } from 'react';
import { styled } from '@mui/material/styles';
import { Grid, Button } from '@mui/material'
import { UploadFile } from '@mui/icons-material'
import { PDFDocument } from 'pdf-lib'

type CertificateUtilityProps = {}
type CertificateUtilityState = { document: any}

const Input = styled('input')({
    display: 'none',
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
        this.setState({
            document: event.target.files[0]
        });
    }

    fileData() {
        if (this.state.document) {
            return (
                <div>
                    <h2>File Details:</h2>
                    <p>File Name: {this.state.document.name}</p>
                    <p>File Type: {this.state.document.type}</p>
                    <p>
                        Last Modified:{" "}
                        {this.state.document.lastModifiedDate.toDateString()}
                    </p>

                </div>
            );
        } else {
            return (
                <div>
                    <br />
                    <h4>Choose before Pressing the Upload button</h4>
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
