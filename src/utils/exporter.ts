/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export interface ExportOptions {
  title?: string;
  author?: string;
  date?: string;
  caseNumber?: string;
  clientName?: string;
}

export class DocumentExporter {
  public static copyToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return Promise.resolve(success);
  }

  public static async shareContent(title: string, text: string): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `المستشار عطية الهلباوي - ${title}`,
          text,
        });
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  public static exportTxt(content: string, filename = 'استشارة_المستشار_عطية_الهلباوي.txt') {
    const header = `======================================================
المستشار عطية الهلباوي — المنصة الذكية الملكية
تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}
======================================================\n\n`;
    const fullText = header + content;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    this.downloadBlob(blob, filename);
  }

  public static exportHtml(content: string, options: ExportOptions = {}, filename = 'وثيقة_المستشار_عطية_الهلباوي.html') {
    const formattedHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${options.title || 'المستشار عطية الهلباوي'}</title>
  <style>
    body {
      font-family: 'Tajawal', 'Cairo', Arial, sans-serif;
      line-height: 1.8;
      color: #111827;
      background-color: #ffffff;
      padding: 40px;
      margin: 0 auto;
      max-width: 900px;
    }
    .header {
      border: 3px double #d4af37;
      padding: 20px;
      text-align: center;
      margin-bottom: 30px;
      background-color: #faf8f0;
    }
    .header h1 {
      margin: 0;
      color: #070d18;
      font-size: 24px;
    }
    .header p {
      margin: 5px 0 0 0;
      color: #aa820a;
      font-weight: bold;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 10px;
      margin-bottom: 25px;
      font-size: 13px;
      color: #6b7280;
    }
    .content {
      font-size: 16px;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 50px;
      border-top: 2px solid #d4af37;
      padding-top: 15px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>المستشار عطية الهلباوي</h1>
    <p>محامٍ بالنقض والدستورية العليا — المنصة الذكية الملكية</p>
  </div>
  <div class="meta">
    <span>تاريخ التحرير: ${options.date || new Date().toLocaleDateString('ar-EG')}</span>
    ${options.caseNumber ? `<span>رقم القضية: ${options.caseNumber}</span>` : ''}
    ${options.clientName ? `<span>الموكل: ${options.clientName}</span>` : ''}
  </div>
  <div class="content">${content.replace(/\n/g, '<br/>')}</div>
  <div class="footer">
    صادر عن المنظومة القضائية الذكية — صرح المستشار عطية الهلباوي
  </div>
</body>
</html>`;

    const blob = new Blob([formattedHtml], { type: 'text/html;charset=utf-8' });
    this.downloadBlob(blob, filename);
  }

  public static async exportDocx(content: string, options: ExportOptions = {}, filename = 'وثيقة_المستشار_عطية_الهلباوي.docx') {
    const paragraphs = content.split('\n').map((line) => {
      const isHeading = line.startsWith('#');
      const cleanLine = line.replace(/^#+\s*/, '');
      return new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
        children: [
          new TextRun({
            text: cleanLine || ' ',
            font: 'Arial',
            size: isHeading ? 32 : 26,
            bold: isHeading,
            color: isHeading ? 'AA820A' : '111827',
          }),
        ],
        spacing: { after: 120, line: 360 },
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: 'المستشار عطية الهلباوي',
                  font: 'Arial',
                  size: 38,
                  bold: true,
                  color: '070D18',
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: 'المنصة الذكية الملكية — محامٍ واستشارات قانونية',
                  font: 'Arial',
                  size: 24,
                  bold: true,
                  color: 'AA820A',
                }),
              ],
              spacing: { after: 300 },
            }),
            ...paragraphs,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    this.downloadBlob(blob, filename);
  }

  public static printDocument(content: string, title = 'المستشار عطية الهلباوي') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Tajawal', 'Cairo', Arial, sans-serif;
      margin: 20px;
      color: #000;
      line-height: 1.8;
      background: #fff;
    }
    .royal-border {
      border: 4px double #b8860b;
      padding: 30px;
      min-height: 90vh;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #b8860b;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      color: #0a192f;
    }
    .header p {
      margin: 5px 0 0;
      color: #b8860b;
      font-weight: bold;
    }
    .content {
      font-size: 16px;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      border-top: 1px solid #ccc;
      padding-top: 10px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="royal-border">
    <div class="header">
      <h1>المستشار عطية الهلباوي</h1>
      <p>محامٍ بالنقض والدستورية العليا — المنصة الذكية الملكية</p>
      <div style="font-size: 12px; margin-top: 5px; color: #555;">تحريراً في: ${new Date().toLocaleDateString('ar-EG')}</div>
    </div>
    <div class="content">${content}</div>
    <div class="footer">
      المستشار عطية الهلباوي © جميع الحقوق محفوظة
    </div>
  </div>
  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>`);
    printWindow.document.close();
  }

  private static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
