(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.__xlsxExportUtils = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const textEncoder = new TextEncoder();
  const crcTable = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
    crcTable[index] = value >>> 0;
  }

  function encodeText(value) {
    return textEncoder.encode(String(value));
  }

  function escapeXml(value) {
    return String(value ?? '')
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  }

  function getCrc32(bytes) {
    let crc = 0xffffffff;
    for (let index = 0; index < bytes.length; index += 1) crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[index]) & 0xff];
    return (crc ^ 0xffffffff) >>> 0;
  }

  function writeUint16(bytes, value) {
    bytes.push(value & 0xff, (value >>> 8) & 0xff);
  }

  function writeUint32(bytes, value) {
    bytes.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
  }

  function appendBytes(target, source) {
    for (let index = 0; index < source.length; index += 1) target.push(source[index]);
  }

  function getDosDateTime(date) {
    const year = Math.max(1980, date.getFullYear());
    return {
      time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
      date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
    };
  }

  function createStoredZip(files) {
    const output = [];
    const directoryEntries = [];
    const timestamp = getDosDateTime(new Date());

    files.forEach((file) => {
      const nameBytes = encodeText(file.name);
      const dataBytes = typeof file.content === 'string' ? encodeText(file.content) : file.content;
      const crc = getCrc32(dataBytes);
      const offset = output.length;

      writeUint32(output, 0x04034b50);
      writeUint16(output, 20);
      writeUint16(output, 0x0800);
      writeUint16(output, 0);
      writeUint16(output, timestamp.time);
      writeUint16(output, timestamp.date);
      writeUint32(output, crc);
      writeUint32(output, dataBytes.length);
      writeUint32(output, dataBytes.length);
      writeUint16(output, nameBytes.length);
      writeUint16(output, 0);
      appendBytes(output, nameBytes);
      appendBytes(output, dataBytes);

      directoryEntries.push({ nameBytes, dataBytes, crc, offset });
    });

    const directoryOffset = output.length;
    directoryEntries.forEach((entry) => {
      writeUint32(output, 0x02014b50);
      writeUint16(output, 20);
      writeUint16(output, 20);
      writeUint16(output, 0x0800);
      writeUint16(output, 0);
      writeUint16(output, timestamp.time);
      writeUint16(output, timestamp.date);
      writeUint32(output, entry.crc);
      writeUint32(output, entry.dataBytes.length);
      writeUint32(output, entry.dataBytes.length);
      writeUint16(output, entry.nameBytes.length);
      writeUint16(output, 0);
      writeUint16(output, 0);
      writeUint16(output, 0);
      writeUint16(output, 0);
      writeUint32(output, 0);
      writeUint32(output, entry.offset);
      appendBytes(output, entry.nameBytes);
    });

    const directorySize = output.length - directoryOffset;
    writeUint32(output, 0x06054b50);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint16(output, directoryEntries.length);
    writeUint16(output, directoryEntries.length);
    writeUint32(output, directorySize);
    writeUint32(output, directoryOffset);
    writeUint16(output, 0);
    return new Uint8Array(output);
  }

  function getColumnName(index) {
    let value = index + 1;
    let name = '';
    while (value > 0) {
      const remainder = (value - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      value = Math.floor((value - 1) / 26);
    }
    return name;
  }

  function normalizeSheetName(value) {
    return String(value || 'Sheet1').replace(/[\\/?*\[\]:]/g, ' ').trim().slice(0, 31) || 'Sheet1';
  }

  function createInlineCell(reference, value, styleIndex = 0) {
    return `<c r="${reference}" t="inlineStr"${styleIndex ? ` s="${styleIndex}"` : ''}><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
  }

  function createWorksheetXml(columns, rows) {
    const lastColumn = getColumnName(Math.max(0, columns.length - 1));
    const lastRow = Math.max(1, rows.length + 1);
    const headerCells = columns.map((column, index) => createInlineCell(`${getColumnName(index)}1`, column.label, 1)).join('');
    const dataRows = rows.map((row, rowIndex) => {
      const rowNumber = rowIndex + 2;
      const cells = columns.map((column, columnIndex) => createInlineCell(`${getColumnName(columnIndex)}${rowNumber}`, row[columnIndex] ?? '')).join('');
      return `<row r="${rowNumber}">${cells}</row>`;
    }).join('');
    const columnWidths = columns.map((column, index) => {
      const width = Math.min(60, Math.max(10, Number(column.width) || 16));
      return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`;
    }).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${lastColumn}${lastRow}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  <cols>${columnWidths}</cols>
  <sheetData><row r="1" ht="24" customHeight="1">${headerCells}</row>${dataRows}</sheetData>
  <autoFilter ref="A1:${lastColumn}${lastRow}"/>
</worksheet>`;
  }

  function createXlsxBytes({ sheetName = '工牌明细', columns = [], rows = [] } = {}) {
    if (!Array.isArray(columns) || !columns.length) throw new Error('Excel 导出至少需要一列。');
    const normalizedColumns = columns.map((column) => typeof column === 'string' ? { label: column } : column);
    const safeSheetName = normalizeSheetName(sheetName);
    const worksheetXml = createWorksheetXml(normalizedColumns, rows);
    const files = [
      {
        name: '[Content_Types].xml',
        content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`
      },
      {
        name: '_rels/.rels',
        content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
      },
      {
        name: 'xl/workbook.xml',
        content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(safeSheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`
      },
      {
        name: 'xl/_rels/workbook.xml.rels',
        content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
      },
      {
        name: 'xl/styles.xml',
        content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2563EB"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`
      },
      { name: 'xl/worksheets/sheet1.xml', content: worksheetXml }
    ];
    return createStoredZip(files);
  }

  function downloadXlsx({ filename, ...workbookOptions }) {
    const bytes = createXlsxBytes(workbookOptions);
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || '导出.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    return bytes.length;
  }

  return { createXlsxBytes, downloadXlsx };
}));
