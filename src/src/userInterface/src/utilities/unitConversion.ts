export const pixelToPt = (pixels: number) => {
    const ptConversion = 0.75;
    return pixels * ptConversion;
}

export const ptToPixel = (pixels: number) => {
    const ptConversion = 0.75;
    return pixels / ptConversion;
}
