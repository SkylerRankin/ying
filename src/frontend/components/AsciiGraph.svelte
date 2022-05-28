<script lang="ts">
import type { GraphAxisData, YAxisNumberData } from "../../common/constants";
    export let title: string = "untitled graph";
    export const width: number = 100;
    export const height: number = 20;
    const spaceBetweenAxisMarks: number = 5;

    let data = [10, 52, 5, 14, 12, 54, 7, 2, 3, 45, 23, 6, 0];

    const maxY = data.reduce((prev, curr) => Math.max(prev, curr), data[0]);
    const minY = data.reduce((prev, curr) => Math.min(prev, curr), data[0]);
    const minGraphedY = Math.min(minY, 0);
    const yRange = (Math.abs(maxY) - Math.min(minY, 0));
    const yRatio = height / yRange;
    const xRatio = (data.length - 1) / width;
    const xSegmentSize = Math.floor(1.0 / xRatio);

    const padding: any = { x: 4, xLeft: Math.max(`${maxY}`.length, `${minY}`.length) + 2, xRight: 2, y: 2 };

    const fitDataToWidth = (data: number[]): number[] => {
        // console.log(`max=${maxY}, min=${minY}, xRatio=${xRatio}, yRatio=${yRatio}, yRange=${yRange} xSegmentSize=${xSegmentSize}`);

        const result = [] as number[];
        let indexInSegment = 0;
        let segment = 0;
        for (let i = 0; i < width; i++) {
            const t = indexInSegment / xSegmentSize;

            const xIndex = segment;
            const nextXIndex = Math.min(segment + 1, data.length - 1);

            const y = data[xIndex] + (data[nextXIndex] - data[xIndex]) * t;
            const yScaled = Math.floor(yRatio * (y - minGraphedY));

            // console.log(`i=${i}, t=${t}, y=${y}, dataXAfter=${nextXIndex}, segment=${segment} indexInSegment=${indexInSegment}`);

            result.push(Math.min(height - yScaled, height - 1));

            if (indexInSegment === xSegmentSize - 1) {
                segment++;
                indexInSegment = 0;
            } else {
                indexInSegment++;
            }
        }

        // console.log(result);

        return result;
    }

    const getAxisData = (): GraphAxisData => {
        const xAxisRow = height - Math.floor(Math.abs(yRatio * minGraphedY));

        const yAxisNumbers: YAxisNumberData[] = [];
        yAxisNumbers.push({value: 0, row: xAxisRow});

        for (let row = xAxisRow; row <= height; row += spaceBetweenAxisMarks) {
            yAxisNumbers.push({value: -Math.floor((row - xAxisRow) / yRatio), row: row});
        }

        for (let row = xAxisRow; row >= 0; row -= spaceBetweenAxisMarks) {
            yAxisNumbers.push({value: -Math.ceil((row - xAxisRow) / yRatio), row: row});
        }

        let axisData: GraphAxisData = {
            xAxisRow: xAxisRow,
            yAxisNumbers: yAxisNumbers
        };
        return axisData;
    }

    const yValues: number[] = fitDataToWidth(data);
    const axisData: GraphAxisData = getAxisData();

    let textLines: string[] = [];

    const fillPadding = (x: number, y: number): string => {
        if ((x === padding.xLeft + width || x === padding.xLeft - 1) && y < height + padding.y && y >= padding.y) {
            return "|";
        } else if ((y === height + padding.y || y === padding.y - 1) && x >= padding.xLeft - 1 && x <= width + padding.xLeft) {
            return "-";
        } else {
            return " ";
        }
    }

    const fillChart = (x: number, y: number): string => {
        if (y - padding.y === yValues[x - padding.x]) {
            return "*";
        } else {
            return " ";
        }
    }

    for (let y = 0; y < height + padding.y * 2; y++) {
        let textLine = "";
        for (let x = 0; x < width + padding.xLeft + padding.xRight; x++) {
            if (y < padding.y || y >= height + padding.y || x < padding.xLeft || x >= width + padding.xLeft) {
                textLine += fillPadding(x, y);
            } else {
                textLine += fillChart(x, y);
            }
        }
        textLines.push(textLine);
    }

    // Add title to first row
    textLines[0] = " ".repeat(padding.xLeft - 1) + title + " ".repeat(width - title.length + padding.xLeft + 1);

    // Add the y axis numbers
    axisData.yAxisNumbers.forEach((data: YAxisNumberData) => {
        const row = padding.y + data.row;
        let line = textLines[row];
        line = " ".repeat(padding.xLeft - `${data.value}`.length - 2) + data.value + " +" + line.substring(padding.xLeft);
        textLines[row] = line;
    });

    const text = textLines.join("\n");

</script>

<style>
    pre { font-size: 10px; }
</style>

<div>
    <pre>
        {text}
    </pre>
</div>