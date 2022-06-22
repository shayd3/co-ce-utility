export class StatePDF {
    private name: string;
    private abbreviatedName: string;
    private producerNameIndex: number;
    private signatureX: number;
    private signatureY: number;
    private signatureWidthBoundary: number;
    private signatureHeightBoundary: number;



    constructor(name: string, abbreviatedName: string, producerNameIndex: number, signatureX: number, signatureY: number, signatureWidthBoundary: number, signatureHeightBoundary: number) {
        this.name = name;
        this.abbreviatedName = abbreviatedName;
        this.producerNameIndex = producerNameIndex;
        this.signatureX = signatureX;
        this.signatureY = signatureY;
        this.signatureWidthBoundary = signatureWidthBoundary;
        this.signatureHeightBoundary = signatureHeightBoundary;
    }

    getName(): string {
        return this.name;
    }

    getAbbreviatedName(): string {
        return this.abbreviatedName;
    }

    getProducerNameIndex(): number {
        return this.producerNameIndex;
    }

    getSignatureX(): number {
        return this.signatureX;
    }

    getSignatureY(): number {
        return this.signatureY;
    }

    getSignatureWidthBoundary(): number {
        return this.signatureWidthBoundary;
    }

    getSignatureHeightBoundary(): number {
        return this.signatureHeightBoundary;
    }

 }
