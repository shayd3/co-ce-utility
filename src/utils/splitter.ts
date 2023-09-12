// Utilities for splitting and formatting strings for the PdfUtility
// ----------------------------------------------------------------------

/**
 * Format selected line text to name format (Last, First Middle. Suffix)
 *
 * @param lineText - The text of the line to format
 * @returns The formatted line text
 */
export function formatLineText(lineText: string): string {
    const lineSplit = lineText.split(" ");
    let lastWord = lineSplit[lineSplit.length - 1].toUpperCase();
    if(lastWord == "JR" || lastWord == "SR" || lastWord == "I" || lastWord == "II" || lastWord == "III" || lastWord == "IV" || lastWord == "V" || lastWord == "VI" || lastWord == "VII" || lastWord == "VIII" || lastWord == "IX" || lastWord == "X" || lastWord == "XI" || lastWord == "XII" || lastWord == "XIII" || lastWord == "XIV" || lastWord == "XV" || lastWord == "XVI" || lastWord == "XVII" || lastWord == "XVIII" || lastWord == "XIX" || lastWord == "XX") {
        lastWord = lineSplit[lineSplit.length - 2].toUpperCase() + " " + lastWord;
        lineSplit.splice(lineSplit.length - 2, 2);
    } else {
        lineSplit.splice(lineSplit.length - 1, 1);
    }

    const firstWord = lineSplit.join(" ")
    const fullLine = lastWord + ", " + firstWord;

    return fullLine.toUpperCase();
}


export function formatLineWithPrefixSuffix(str: string, prefix: string = "", suffix: string = "", seperator: string = ""): string {
    if(prefix != "") {
        str = prefix + seperator + str;
    }
    if(suffix != "") {
        str = str + seperator + suffix;
    }
    return str;
}

