
export const getFunction = (textPiece: string): string | null => {
    if(textPiece.includes("FOREACH")) return "FOREACH";
    if(textPiece.includes("FOR"))     return "FOR";
    if(textPiece.includes("IF"))      return "IF";
    if(textPiece.includes("DATE"))      return "DATE";
    
    return null;
}

export const hasArabic = (textPiece: string): boolean => {
    const arabicLetters = ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د", "ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط", "ئ", "ء", "ؤ", "ر", "ى", "ة", "و", "ز", "ظ"]

    for(let arabicChar of arabicLetters )
        if (textPiece.includes(arabicChar)) return true;

    return false;
}

export const isTemplateVariable = (textPiece: string): boolean => {
    const beginning = textPiece.slice(0,2);
    const ending = textPiece.slice(-2);

    if (beginning === "{{" && ending === "}}") return true;

    return false;
}
