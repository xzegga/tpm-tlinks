import * as XLSX from 'xlsx';

const setFirstRowColor = (ws: XLSX.WorkSheet): XLSX.WorkSheet => {
    const firstRowRange = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']) : { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };

    for (let col = firstRowRange.s.c; col <= firstRowRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        ws[cellAddress].s = {
            fill: {
                patternType: 'solid',
                fgColor: { rgb: 'FFFF00' } // Yellow color
            },
            font: {
                bold: true // Bold font for the first row
            }
        };
    }
    return ws;
};

const autoSizeColumns = (ws: XLSX.WorkSheet): XLSX.WorkSheet => {
    if (ws['!ref']) {
        const firstRowRange = XLSX.utils.decode_range(ws['!ref']);

        for (let i = firstRowRange.s.c; i <= firstRowRange.e.c; i++) {
            let maxLength = 0;

            for (let row = firstRowRange.s.r; row <= firstRowRange.e.r; row++) {
                const cell = ws[XLSX.utils.encode_cell({ r: row, c: i })];
                if (cell && cell.v) {
                    const cellLength = cell.v.toString().length + 3;
                    maxLength = Math.max(maxLength, cellLength);
                }
            }

            ws['!cols'] = ws['!cols'] || [];
            ws['!cols'][i] = { wch: maxLength };
        }

        // Add padding to cell heights

        const range = XLSX.utils.decode_range(ws['!ref']);
        const last = XLSX.utils.encode_col(range.e.c);

        for (let row = range.s.r; row <= range.e.r; row++) {
            ws['!rows'] = ws['!rows'] || [];
            ws['!rows'][row] = { hpx: 20 + 2 };

            ws[`${last}${row + 1}`].z = '$0.00';
        }
    }

    return ws;
};

export const exportToExcel = (data: any[][], fileName: string) => {
    let ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    ws = setFirstRowColor(ws);
    ws = autoSizeColumns(ws);

    XLSX.writeFile(wb, fileName);
};
