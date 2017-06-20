export default (width, height) => `
new Promise((resolve, reject) => {
    try {
        const svg = document.querySelector('svg');
        const svgString = new XMLSerializer().serializeToString(svg);

        const canvas = document.createElement("canvas");
        canvas.setAttribute('width', '${width}px');
        canvas.setAttribute('height', '${height}px');
        const ctx = canvas.getContext("2d");
        const DOMURL = self.URL || self.webkitURL || self;
        const img = new Image();
        const svgBlob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
        const url = DOMURL.createObjectURL(svgBlob);

        img.onload = function() {
            ctx.drawImage(img, 0, 0);
            const png = canvas.toDataURL("image/png");
            DOMURL.revokeObjectURL(png);
            resolve(png);
        };

        img.onerror = reject;

        img.src = url;
    } catch (error) {
        resolve(error);
    }
})
`;
