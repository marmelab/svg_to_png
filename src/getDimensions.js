export default (svg, { width = 800, height }) => {
    const widthMatches = /svg[\s\S].*?width="([\d.\S]*)"/.exec(svg);
    let svgWidth = widthMatches
        ? Math.ceil(parseFloat(widthMatches[1]))
        : false;

    const heightMatches = /svg[\s\S].*?height="([\d.\S]*)"/.exec(svg);
    const svgHeight = heightMatches
        ? Math.ceil(parseFloat(heightMatches[1]))
        : false;
    if (width && height) {
        return { width, height };
    }

    if (width) {
        return {
            width,
            height: svgHeight / svgWidth * width,
        };
    }

    if (height) {
        return {
            height,
            width: svgWidth / svgHeight * width,
        };
    }

    return {
        width: svgWidth,
        height: svgHeight,
    };
};
