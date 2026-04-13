

import React, { useState, useRef } from "react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, Barcode as BarcodeIcon, QrCode, Info as InfoIcon } from "lucide-react";
import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";

const ProductViewModal = ({ show, onClose, product }: any) => {
    const [activeTab, setActiveTab] = useState("details");
    const [printQty, setPrintQty] = useState(1);
    const printRef = useRef<HTMLDivElement>(null);

    if (!show || !product) return null;

    // Parse specifications
    let parsedSpecs: any[] = [];
    if (product.specification) {
        try {
            const specData = typeof product.specification === "string"
                ? JSON.parse(product.specification)
                : product.specification;

            if (Array.isArray(specData)) {
                parsedSpecs = specData.map((item: any) => {
                    const key = Object.keys(item)[0];
                    return { key, value: item[key] };
                });
            } else if (typeof specData === "object") {
                parsedSpecs = Object.entries(specData).map(([key, value]) => ({ key, value }));
            }
        } catch (e) {
            console.error("Error parsing specs", e);
        }
    }


    const handlePrint = (type: "barcode" | "qrcode") => {
        const iframe = document.getElementById("ifmcontentstoprint") as HTMLIFrameElement;
        const pri = iframe?.contentWindow;
        if (!pri) return;

        let labelsHtml = "";

        const content =
            type === "barcode"
                ? document.getElementById("barcode-print-box")?.innerHTML
                : document.getElementById("qrcode-print-box")?.innerHTML;

        for (let i = 0; i < printQty; i++) {
            labelsHtml += `
            <div class="label">
                ${content}
            </div>
        `;
        }

        const htmlContent = `
        <html>
            <head>
                <style>
                    @page {
                        size: 105mm auto;
                        margin: 0;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                    }

                    .sheet {
                        display: grid;
                        grid-template-columns: repeat(3, 35mm);
                        width: 105mm;
                     row-gap: 5mm;
                     margin-bottom:14.7mm;
                    }

                    .label {
                        width: 35mm;
                        height: 25mm; /* 🔥 exact label size */
                        position: relative;
                        overflow: hidden;
                        box-sizing: border-box;
                    }

                    /* barcode */
                    .label svg {
                        position: absolute;
                        top: 2mm;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 30mm !important;
                        height: 12mm !important;
                    }

                    /* product name */
                    .label h3 {
                        position: absolute;
                        top: 14mm;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 33mm;
                        font-size: 7px;
                        text-align: center;
                        margin: 0;
                        line-height: 1.1;
                    }

                    .label p {
                        display: none;
                    }
                </style>
            </head>

            <body>
                <div class="sheet">
                    ${labelsHtml}
                </div>

                <script>
                    window.onload = function () {
                        setTimeout(function () {
                            window.focus();
                            window.print();
                        }, 300);
                    };
                </script>
            </body>
        </html>
    `;

        pri.document.open();
        pri.document.write(htmlContent);
        pri.document.close();
    };

    // 🔥 Download Logic (Common for both)
    const downloadCode = (type: "barcode" | "qrcode") => {
        const svgId = type === "barcode" ? "product-barcode-svg" : "product-qrcode-svg";
        const svg = document.getElementById(svgId);
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width + 40;
            canvas.height = img.height + 40;
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 20, 20);
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `${product.sku || 'product'}-${type}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    // 🔥 Print Logic with Quantity Loop
    // const handlePrint = (type: "barcode" | "qrcode") => {
    //     const pri = (document.getElementById("ifmcontentstoprint") as HTMLIFrameElement).contentWindow;
    //     if (!pri) return;

    //     // Generate Multiple Labels based on Qty
    //     let labelsHtml = "";
    //     for (let i = 0; i < printQty; i++) {
    //         const content = type === "barcode"
    //             ? document.getElementById("barcode-print-box")?.innerHTML
    //             : document.getElementById("qrcode-print-box")?.innerHTML;
    //         labelsHtml += `<div class="label-item">${content}</div>`;
    //     }

    //     pri.document.open();
    //     pri.document.write(`
    //         <html>
    //             <head>
    //                 <style>
    //                     body { margin: 0; padding: 20px; font-family: sans-serif; }
    //                     .print-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    //                     .label-item { border: 1px solid #eee; padding: 15px; text-align: center; page-break-inside: avoid; border-radius: 8px; }
    //                     .label-item h3 { margin: 5px 0; font-size: 14px; }
    //                     .label-item p { margin: 0; font-size: 10px; color: #666; }
    //                     @media print { .print-grid { display: grid; } }
    //                 </style>
    //             </head>
    //             <body>
    //                 <div class="print-grid">${labelsHtml}</div>
    //             </body>
    //         </html>
    //     `);
    //     pri.document.close();
    //     pri.focus();
    //     setTimeout(() => pri.print(), 500);
    // };

    //     const handlePrint = (type: "barcode" | "qrcode") => {
    //     const pri = (document.getElementById("ifmcontentstoprint") as HTMLIFrameElement)?.contentWindow;
    //     if (!pri) return;

    //     let labelsHtml = "";

    //     for (let i = 0; i < printQty; i++) {
    //         const content =
    //             type === "barcode"
    //                 ? document.getElementById("barcode-print-box")?.innerHTML
    //                 : document.getElementById("qrcode-print-box")?.innerHTML;

    //         labelsHtml += `<div class="label">${content}</div>`;
    //     }

    //     pri.document.open();
    //     pri.document.write(`
    //         <html>
    //             <head>
    //                 <style>
    //                     @page {
    //                         size: auto;
    //                         margin: 0;
    //                     }

    //                     body {
    //                         margin: 0;
    //                         padding: 0;
    //                         font-family: Arial, sans-serif;
    //                     }

    //                     /* 🔥 GRID (3 ACROSS) */
    //                     .sheet {
    //                         display: grid;
    //                         grid-template-columns: repeat(3, 35mm);
    //                         gap: 0;
    //                         justify-content: start;
    //                     }

    //                     /* 🔥 LABEL SIZE EXACT */
    //                     .label {
    //                         width: 35mm;
    //                         height: 25mm;
    //                         display: flex;
    //                         flex-direction: column;
    //                         align-items: center;
    //                         justify-content: center;
    //                         overflow: hidden;
    //                         box-sizing: border-box;
    //                     }

    //                     /* 🔥 TEXT */
    //                     .label h3 {
    //                         font-size: 8px;
    //                         margin: 0;
    //                         text-align: center;
    //                         line-height: 1.1;
    //                     }

    //                     .label p {
    //                         font-size: 7px;
    //                         margin: 0;
    //                     }

    //                     /* 🔥 BARCODE */
    //                     svg {
    //                         width: 90%;
    //                         height: 40%;
    //                     }

    //                     /* 🔥 QR */
    //                     canvas, svg.qr {
    //                         width: 40px !important;
    //                         height: 40px !important;
    //                     }

    //                     @media print {
    //                         body {
    //                             margin: 0;
    //                         }
    //                     }
    //                 </style>
    //             </head>
    //             <body>
    //                 <div class="sheet">
    //                     ${labelsHtml}
    //                 </div>
    //             </body>
    //         </html>
    //     `);

    //     pri.document.close();
    //     pri.focus();
    //     setTimeout(() => pri.print(), 300);
    // };


    // const handlePrint = (type: "barcode" | "qrcode") => {
    //     const pri = (document.getElementById("ifmcontentstoprint") as HTMLIFrameElement)?.contentWindow;
    //     if (!pri) return;

    //     let labelsHtml = "";

    //     for (let i = 0; i < printQty; i++) {
    //         const content =
    //             type === "barcode"
    //                 ? document.getElementById("barcode-print-box")?.innerHTML
    //                 : document.getElementById("qrcode-print-box")?.innerHTML;

    //         labelsHtml += `<div class="label">${content}</div>`;
    //     }

    //     pri.document.open();
    //     pri.document.write(`
    //         <html>
    //             <head>
    //                 <style>
    //                     @page {
    //                         size: 110mm auto;
    //                         margin: 0;
    //                     }

    //                     body {
    //                         margin: 0;
    //                         padding: 0;
    //                         font-family: Arial;
    //                     }

    //                     /* 🔥 GRID (3 ACROSS) */
    //                     .sheet {
    //                         display: grid;
    //                         grid-template-columns: repeat(3, 35mm);
    //                         grid-auto-rows: 25mm;
    //                         width: 110mm;
    //                     }

    //                     /* 🔥 LABEL */
    //                     .label {
    //                         width: 35mm;
    //                         height: 25mm;
    //                         display: flex;
    //                         flex-direction: column;
    //                         justify-content: center;
    //                         align-items: center;
    //                         box-sizing: border-box;
    //                         overflow: hidden;
    //                     }

    //                     /* 🔤 TEXT */
    //                     .label h3 {
    //                         font-size: 7px;
    //                         margin: 0;
    //                         text-align: center;
    //                         line-height: 1.1;
    //                     }

    //                     .label p {
    //                         font-size: 6px;
    //                         margin: 0;
    //                     }

    //                     /* 📦 BARCODE */
    //                     svg {
    //                         width: 90%;
    //                         height: 40%;
    //                     }

    //                     /* 🔳 QR */
    //                     canvas, svg.qr {
    //                         width: 34px !important;
    //                         height: 34px !important;
    //                     }

    //                 </style>
    //             </head>

    //             <body>
    //                 <div class="sheet">
    //                     ${labelsHtml}
    //                 </div>
    //             </body>
    //         </html>
    //     `);

    //     pri.document.close();
    //     pri.focus();
    //     setTimeout(() => pri.print(), 300);
    // };

    // const handlePrint = (type: "barcode" | "qrcode") => {
    //     const iframe = document.getElementById("ifmcontentstoprint") as HTMLIFrameElement;
    //     const pri = iframe?.contentWindow;
    //     if (!pri) return;

    //     let labelsHtml = "";

    //     for (let i = 0; i < printQty; i++) {
    //         const content =
    //             type === "barcode"
    //                 ? document.getElementById("barcode-print-box")?.innerHTML
    //                 : document.getElementById("qrcode-print-box")?.innerHTML;

    //         labelsHtml += `<div class="label">${content}</div>`;
    //     }

    //     pri.document.open();
    //     pri.document.write(`
    //         <html>
    //             <head>
    //                 <title>Print</title>
    //                 <style>
    //                     @page {
    //                         size: 110mm auto;
    //                         margin: 0;
    //                     }

    //                     body {
    //                         margin: 0;
    //                         padding: 0;
    //                         display: flex;
    //                         justify-content: center;
    //                         font-family: Arial, sans-serif;
    //                     }

    //                     /* 🔥 3 LABELS PER ROW */
    //                     .sheet {
    //                         display: grid;
    //                         grid-template-columns: repeat(3, 35mm);
    //                         grid-auto-rows: 25mm;
    //                         width: 110mm;
    //                         justify-content: center;
    //                         margin-top: 15mm;
    //                     }

    //                     /* 🔥 LABEL */
    //                     .label {
    //                         width: 35mm;
    //                         height: 25mm;
    //                         display: flex;
    //                         flex-direction: column;
    //                         justify-content: space-between;
    //                         align-items: center;
    //                         box-sizing: border-box;
    //                         overflow: hidden;
    //                         text-align: center;

    //                     }

    //                     /* 🔤 PRODUCT NAME */
    //                     .label h3 {
    //                         font-size: 6px;
    //                         margin: 0;
    //                         padding-left: 1mm;
    //                         padding-right: 1mm;
    //                         word-break: break-word;
    //                         max-height: 2.2em;
    //                         overflow: hidden;
    //                         width: 25mm;
    //                         padding-bottom: 0mm;
    //                     }

    //                     /* 🔢 CODE TEXT */
    //                     .label p {
    //                         font-size: 5px;
    //                         margin: 0;
    //                         padding-left: 1mm;
    //                         padding-right: 1mm;
    //                     }

    //                     /* 🚀 BARCODE BIG */
    //                     svg {
    //                         width: 100%;
    //                         height: 70%;
    //                     }

    //                     /* 🔳 QR */
    //                     canvas, svg.qr {
    //                         width: 36px !important;
    //                         height: 36px !important;
    //                     }

    //                 </style>
    //             </head>

    //             <body>
    //                 <div class="sheet">
    //                     ${labelsHtml}
    //                 </div>
    //             </body>
    //         </html>
    //     `);

    //     pri.document.close();
    //     pri.focus();

    //     setTimeout(() => {
    //         pri.print();
    //     }, 300);
    // };

    // const handlePrint = (type: "barcode" | "qrcode") => {
    //     const iframe = document.getElementById("ifmcontentstoprint") as HTMLIFrameElement;
    //     const pri = iframe?.contentWindow;
    //     if (!pri) return;

    //     let labelsHtml = "";

    //     for (let i = 0; i < printQty; i++) {
    //         const content =
    //             type === "barcode"
    //                 ? document.getElementById("barcode-print-box")?.innerHTML
    //                 : document.getElementById("qrcode-print-box")?.innerHTML;

    //         labelsHtml += `<div class="label">${content}</div>`;
    //     }

    //     pri.document.open();
    //     pri.document.write(`
    //         <html>
    //             <head>
    //                 <title>Print</title>
    //                 <style>
    //                     @page {
    //                         size: 110mm auto;
    //                         margin: 0;
    //                     }

    //                     body {
    //                         margin: 0;
    //                         padding: 0;
    //                         display: flex;
    //                         justify-content: center;
    //                         font-family: Arial, sans-serif;
    //                     }

    //                     /* 🔥 GRID */
    //                     .sheet {
    //                         display: grid;
    //                         grid-template-columns: repeat(3, 35mm);
    //                         grid-auto-rows: 25mm;
    //                         width: 110mm;
    //                         justify-content: center;
    //                         margin-top: 15mm;
    //                     }

    //                     /* 🔥 LABEL (NO GAP) */
    //                     .label {
    //                         width: 35mm;
    //                         height: 25mm;
    //                         display: flex;
    //                         flex-direction: column;
    //                         justify-content: flex-start; /* 🔥 FIX */
    //                         align-items: center;
    //                         box-sizing: border-box;
    //                         overflow: hidden;
    //                         text-align: center;
    //                         padding: 1mm;
    //                         gap: 0; /* 🔥 REMOVE SPACE */
    //                     }

    //                     /* 🔤 NAME */
    //                     .label h3 {
    //                         font-size: 6px;
    //                         margin: 0;
    //                         padding-left: 1mm;
    //                         padding-right: 1mm;
    //                         line-height: 1.1;
    //                         max-height: 2.2em;
    //                         overflow: hidden;
    //                     }

    //                     /* ❌ REMOVE BARCODE TEXT */
    //                     .label p {
    //                         display: none;
    //                     }

    //                     /* 🚀 BARCODE BIG + TIGHT */
    //                     svg {
    //                         width: 100%;
    //                         height: 75%;
    //                         margin: 0;
    //                         margin-right: 5px; 
    //                     }

    //                     /* QR */
    //                     canvas, svg.qr {
    //                         width: 36px !important;
    //                         height: 36px !important;
    //                     }

    //                 </style>
    //             </head>

    //             <body>
    //                 <div class="sheet">
    //                     ${labelsHtml}
    //                 </div>
    //             </body>
    //         </html>
    //     `);

    //     pri.document.close();
    //     pri.focus();

    //     setTimeout(() => {
    //         pri.print();
    //     }, 300);
    // };

    // const handlePrint = (type: "barcode" | "qrcode") => {
    //     const iframe = document.getElementById("ifmcontentstoprint") as HTMLIFrameElement;
    //     const pri = iframe?.contentWindow;
    //     if (!pri) return;

    //     let labelsHtml = "";

    //     for (let i = 0; i < printQty; i++) {
    //         const content =
    //             type === "barcode"
    //                 ? document.getElementById("barcode-print-box")?.innerHTML
    //                 : document.getElementById("qrcode-print-box")?.innerHTML;

    //         labelsHtml += `<div class="label">${content}</div>`;
    //     }

    //     pri.document.open();
    //     pri.document.write(`
    //         <html>
    //             <head>
    //                 <title>Print</title>
    //                 <style>
    //                     @page {
    //                         size: 110mm auto;
    //                         margin: 0;
    //                     }

    //                     body {
    //                         margin: 0;
    //                         padding: 0;
    //                         font-family: Arial, sans-serif;
    //                     }

    //                     /* 🔥 GRID PERFECT ALIGN */
    //                     .sheet {
    //                         display: grid;
    //                         grid-template-columns: repeat(3, 35mm);
    //                         grid-auto-rows: 25mm;
    //                         width: 110mm;
    //                     }

    //                     /* 🔥 LABEL */
    //                     .label {
    //                         width: 35mm;
    //                         height: 25mm;
    //                         display: flex;
    //                         flex-direction: column;
    //                         justify-content: flex-start;
    //                         align-items: center;
    //                         box-sizing: border-box;
    //                         overflow: hidden;
    //                         text-align: center;
    //                         padding: 1mm;
    //                     }

    //                     /* 🔤 NAME */
    //                     .label h3 {
    //                         font-size: 6px;
    //                         margin: 0;
    //                         padding: 0 1mm;
    //                         line-height: 1.1;
    //                         max-height: 2.2em;
    //                         overflow: hidden;
    //                     }

    //                     /* ❌ REMOVE TEXT */
    //                     .label p {
    //                         display: none;
    //                     }

    //                     /* 🚀 BARCODE PERFECT CENTER */
    //                     svg {
    //                         width: 100%;
    //                         height: 75%;
    //                         margin: 0; /* 🔥 IMPORTANT */
    //                         display: block;
    //                     }

    //                 </style>
    //             </head>

    //             <body>
    //                 <div class="sheet">
    //                     ${labelsHtml}
    //                 </div>
    //             </body>
    //         </html>
    //     `);

    //     pri.document.close();
    //     pri.focus();

    //     setTimeout(() => {
    //         pri.print();
    //     }, 300);
    // };

    // const handlePrint = (type: "barcode" | "qrcode") => {
    //     const iframe = document.getElementById("ifmcontentstoprint") as HTMLIFrameElement;
    //     const pri = iframe?.contentWindow;
    //     if (!pri) return;

    //     let labelsHtml = "";
    //     for (let i = 0; i < printQty; i++) {
    //         const content = type === "barcode"
    //                 ? document.getElementById("barcode-print-box")?.innerHTML
    //                 : document.getElementById("qrcode-print-box")?.innerHTML;
    //         labelsHtml += `<div class="label">${content}</div>`;
    //     }

    //     pri.document.open();
    //     pri.document.write(`
    //         <html>
    //             <head>
    //                 <style>
    //                     /* 1. Force exact page size and remove all browser chrome */
    //                     @page {
    //                         size: 105mm auto; /* 3 labels * 35mm = 105mm exactly */
    //                         margin: 0;
    //                     }

    //                     body {
    //                         margin: 0;
    //                         padding: 0;
    //                         -webkit-print-color-adjust: exact;
    //                     }

    //                     /* 2. Grid with NO gaps to prevent drifting */
    //                     .sheet {
    //                         display: grid;
    //                         grid-template-columns: repeat(3, 35mm);
    //                         width: 105mm;
    //                         margin: 0 auto;
    //                         margin-top: 10mm; 
    //                         column-gap: 0.5mm; /* Horizontal gap between stickers */
    //                         row-gap: 0.5mm;

    //                     }

    //                     /* 3. Strict Label Box */
    //                     .label {
    //                         width: 35mm;
    //                         height: 30mm;
    //                         display: flex;
    //                         flex-direction: column;
    //                         justify-content: center; /* Center everything vertically */
    //                         align-items: center;
    //                         box-sizing: border-box;
    //                         overflow: hidden;
    //                         padding: 1mm;
    //                         border: 0.1mm solid transparent; /* Keeps dimensions stable */
    //                     }

    //                     /* 4. Barcode/QR Scaling Fix */
    //                     .label svg {
    //                         width: 32mm !important; /* Slightly smaller than 35 to prevent clipping */
    //                         height: 14mm !important; /* Leave 11mm for text space */
    //                         margin: 0 auto !important;
    //                     }

    //                     /* 5. Text Size & Position Fix */
    //                     .label h3 {
    //                         font-size: 7px;
    //                         font-family: Arial, sans-serif;
    //                         font-weight: bold;
    //                         margin-top: 1mm;
    //                         margin-bottom: 0;
    //                         padding: 0;
    //                         line-height: 1;
    //                         text-align: center;
    //                         width: 33mm;
    //                         white-space: nowrap;
    //                         overflow: hidden;
    //                         text-overflow: ellipsis;
    //                     }

    //                     /* Hide any sub-text that might push layout */
    //                     .label p { display: none !important; }

    //                 </style>
    //             </head>
    //             <body>
    //                 <div class="sheet">${labelsHtml}</div>
    //             </body>
    //         </html>
    //     `);

    //     pri.document.close();
    //     pri.focus();

    //     // Give browser extra time to render SVG
    //     setTimeout(() => {
    //         pri.print();
    //     }, 500);
    // };

    // const handlePrint = (type: "barcode" | "qrcode") => {
    //     const iframe = document.getElementById("ifmcontentstoprint") as HTMLIFrameElement;
    //     const pri = iframe?.contentWindow;
    //     if (!pri) return;

    //     let labelsHtml = "";
    //     for (let i = 0; i < printQty; i++) {
    //         const content = type === "barcode"
    //                 ? document.getElementById("barcode-print-box")?.innerHTML
    //                 : document.getElementById("qrcode-print-box")?.innerHTML;
    //         labelsHtml += `<div class="label">${content}</div>`;
    //     }

    //     pri.document.open();
    //     pri.document.write(`
    //         <html>
    //             <head>
    //                 <style>
    //                     @page {
    //                         size: 106mm auto; 
    //                         margin: 0;
    //                     }

    //                     body {
    //                         margin: 0;
    //                         padding: 0;
    //                         -webkit-print-color-adjust: exact;
    //                     }

    //                     .sheet {
    //                         display: grid;
    //                         grid-template-columns: repeat(3, 35mm);
    //                         row-gap: 1.5mm;    
    //                         column-gap: 0.5mm; 
    //                         width: 106mm;
    //                         margin: 0 auto;
    //                         padding-top: 2mm; 
    //                     }

    //                     .label {
    //                         width: 35mm;
    //                         height: 25mm; 
    //                         display: flex;
    //                         flex-direction: column;
    //                         /* 🚀 START FROM BOTTOM FIX */
    //                         justify-content: flex-end; 
    //                         align-items: center;
    //                         box-sizing: border-box;
    //                         overflow: hidden;
    //                         /* Added bottom padding to keep it away from the edge */
    //                         padding: 1mm 1mm 2mm 1mm; 
    //                         border: 0.1mm solid transparent; 
    //                     }

    //                     .label svg {
    //                         width: 30mm !important; 
    //                         height: 12mm !important; 
    //                         margin: 0 auto !important;
    //                     }

    //                     .label h3 {
    //                         font-size: 7px;
    //                         font-family: Arial, sans-serif;
    //                         font-weight: bold;
    //                         /* Push text slightly below the barcode */
    //                         margin: 0.5mm 0 0 0; 
    //                         line-height: 1;
    //                         text-align: center;
    //                         width: 33mm;
    //                         white-space: nowrap;
    //                         overflow: hidden;
    //                         text-overflow: ellipsis;
    //                     }

    //                     .label p { display: none !important; }
    //                 </style>
    //             </head>
    //             <body>
    //                 <div class="sheet">${labelsHtml}</div>
    //             </body>
    //         </html>
    //     `);

    //     pri.document.close();
    //     pri.focus();

    //     setTimeout(() => {
    //         pri.print();
    //     }, 500);
    // };

    // const handlePrint = (type: "barcode" | "qrcode") => {
    //     const iframe = document.getElementById("ifmcontentstoprint") as HTMLIFrameElement;
    //     const pri = iframe?.contentWindow;
    //     if (!pri) return;

    //     let labelsHtml = "";

    //     for (let i = 0; i < printQty; i++) {
    //         const content =
    //             type === "barcode"
    //                 ? document.getElementById("barcode-print-box")?.innerHTML
    //                 : document.getElementById("qrcode-print-box")?.innerHTML;

    //         labelsHtml += `<div class="label">${content}</div>`;
    //     }

    //     pri.document.open();
    //     pri.document.write(`
    //         <html>
    //             <head>
    //                 <style>
    //                     @page {
    //                         size: 106mm auto;
    //                         margin: 0;
    //                     }

    //                     body {
    //                         margin: 0;
    //                         padding: 0;
    //                     }

    //                     /* 🔥 GRID */
    //                     .sheet {
    //                         display: grid;
    //                         grid-template-columns: repeat(3, 35mm);
    //                         grid-auto-rows: 25mm;
    //                         width: 106mm;
    //                         margin: 0 auto;
    //                     }

    //                     /* 🔥 LABEL (NO FLEX ISSUE) */
    //                     .label {
    //                         width: 35mm;
    //                         height: 25mm;
    //                         position: relative;   /* 🔥 KEY FIX */
    //                         box-sizing: border-box;
    //                         overflow: hidden;
    //                         padding: 1mm;
    //                     }

    //                     /* 🔥 BARCODE FIXED POSITION */
    //                     .label svg {
    //                         position: absolute;
    //                         top: 3mm;          /* 🔥 fixed position */
    //                         left: 50%;
    //                         transform: translateX(-50%);
    //                         width: 30mm !important;
    //                         height: 12mm !important;
    //                     }

    //                     /* 🔤 TEXT FIXED POSITION */
    //                     .label h3 {
    //                         position: absolute;
    //                         bottom: 2mm;       /* 🔥 always same place */
    //                         left: 50%;
    //                         transform: translateX(-50%);
    //                         width: 32mm;

    //                         font-size: 6.5px;
    //                         text-align: center;
    //                         line-height: 1.1;

    //                         display: -webkit-box;
    //                         -webkit-line-clamp: 2;
    //                         -webkit-box-orient: vertical;
    //                         overflow: hidden;
    //                     }

    //                     /* ❌ REMOVE NUMBER */
    //                     .label p {
    //                         display: none;
    //                     }

    //                 </style>
    //             </head>

    //             <body>
    //                 <div class="sheet">${labelsHtml}</div>
    //             </body>
    //         </html>
    //     `);

    //     pri.document.close();
    //     pri.focus();

    //     setTimeout(() => {
    //         pri.print();
    //     }, 400);
    // };

    // const handlePrint = (type: "barcode" | "qrcode") => {
    //     const iframe = document.getElementById("ifmcontentstoprint") as HTMLIFrameElement;
    //     const pri = iframe?.contentWindow;
    //     if (!pri) return;

    //     let labelsHtml = "";

    //     for (let i = 0; i < printQty; i++) {
    //         const content =
    //             type === "barcode"
    //                 ? document.getElementById("barcode-print-box")?.innerHTML
    //                 : document.getElementById("qrcode-print-box")?.innerHTML;

    //         labelsHtml += `<div class="label">${content}</div>`;
    //     }

    //     pri.document.open();
    //     pri.document.write(`
    //         <html>
    //             <head>
    //                 <style>
    //                     @page {
    //                         size: 105mm auto; /* 🔥 exact width fix */
    //                         margin: 0;
    //                     }

    //                     body {
    //                         margin: 0;
    //                         padding: 0;
    //                     }

    //                     /* 🔥 GRID FIX */
    //                     .sheet {
    //                         display: grid;
    //                         grid-template-columns: repeat(3, 35mm);
    //                         grid-auto-rows: 25mm;
    //                         width: 105mm; /* 🔥 FIX */
    //                         margin: 0 auto;
    //                         padding-bottom: mm; /* Adjust this to align the first row with the top of the sticker sheet */
    //                     }

    //                     /* 🔥 LABEL FIX (NO PADDING!) */
    //                     .label {
    //                         width: 35mm;
    //                         height: 25mm;
    //                         position: relative;
    //                         overflow: hidden;
    //                     }

    //                     /* 🔥 BARCODE */
    //                     .label svg {
    //                         position: absolute;
    //                         top: 2mm;
    //                         left: 50%;
    //                         transform: translateX(-50%);
    //                         width: 30mm !important;
    //                         height: 12mm !important;
    //                     }

    //                     /* 🔤 TEXT */
    //                     .label h3 {
    //                         position: absolute;
    //                         bottom: 2mm;
    //                         left: 50%;
    //                         transform: translateX(-50%);
    //                         width: 32mm;

    //                         font-size: 6px;
    //                         text-align: center;
    //                         line-height: 1.1;

    //                         display: -webkit-box;
    //                         -webkit-line-clamp: 2;
    //                         -webkit-box-orient: vertical;
    //                         overflow: hidden;
    //                     }

    //                     .label p {
    //                         display: none;
    //                     }

    //                 </style>
    //             </head>

    //             <body>
    //                 <div class="sheet">
    //                     ${labelsHtml}
    //                 </div>
    //             </body>
    //         </html>
    //     `);

    //     pri.document.close();
    //     pri.focus();

    //     setTimeout(() => {
    //         pri.print();
    //     }, 300);
    // };


    // const handlePrint = (type: "barcode" | "qrcode") => {
    //     const iframe = document.getElementById("ifmcontentstoprint") as HTMLIFrameElement;
    //     const pri = iframe?.contentWindow;
    //     if (!pri) return;

    //     let labelsHtml = "";

    //     for (let i = 0; i < printQty; i++) {
    //         const content =
    //             type === "barcode"
    //                 ? document.getElementById("barcode-print-box")?.innerHTML
    //                 : document.getElementById("qrcode-print-box")?.innerHTML;

    //         labelsHtml += `<div class="label">${content}</div>`;
    //     }

    //     pri.document.open();
    //     pri.document.write(`
    //         <html>
    //             <head>
    //                 <style>
    //                     @page {
    //                         size: 105mm auto;
    //                         margin: 0;
    //                     }

    //                     body {
    //                         margin: 0;
    //                         padding: 0;
    //                     }

    //                     /* 🔥 GRID FIX */
    //                     .sheet {
    //                         display: grid;
    //                         grid-template-columns: repeat(3, 35mm);
    //                         width: 105mm;
    //                         margin: 0 auto;
    //                     }

    //                     /* 🔥 FORCE EXACT ROW HEIGHT */
    //                     .label {
    //                         width: 35mm;
    //                         height: 25mm;
    //                         position: relative;
    //                         overflow: hidden;
    //                         display: block;
    //                     }

    //                     /* 🔥 BARCODE FIX */
    //                     .label svg {
    //                         position: absolute;
    //                         top: 2mm;
    //                         left: 50%;
    //                         transform: translateX(-50%);
    //                         width: 30mm !important;
    //                         height: 12mm !important;
    //                     }

    //                     /* 🔤 TEXT FIX */
    //                     .label h3 {
    //                         position: absolute;
    //                         bottom: 2mm;
    //                         left: 50%;
    //                         transform: translateX(-50%);
    //                         width: 32mm;

    //                         font-size: 6px;
    //                         text-align: center;
    //                         line-height: 1.1;

    //                         display: -webkit-box;
    //                         -webkit-line-clamp: 2;
    //                         -webkit-box-orient: vertical;
    //                         overflow: hidden;
    //                     }

    //                     .label p {
    //                         display: none;
    //                     }

    //                 </style>
    //             </head>

    //             <body>
    //                 <div class="sheet">
    //                     ${labelsHtml}
    //                 </div>

    //                 <script>
    //                     // 🔥 WAIT FOR SVG RENDER
    //                     setTimeout(() => {
    //                         window.print();
    //                     }, 300);
    //                 </script>
    //             </body>
    //         </html>
    //     `);

    //     pri.document.close();
    //     pri.focus();
    // };

    // const handlePrint = (type: "barcode" | "qrcode") => {
    //     const iframe = document.getElementById("ifmcontentstoprint") as HTMLIFrameElement;
    //     const pri = iframe?.contentWindow;
    //     if (!pri) return;

    //     let labelsHtml = "";
    //     for (let i = 0; i < printQty; i++) {
    //         const content = type === "barcode"
    //             ? document.getElementById("barcode-print-box")?.innerHTML
    //             : document.getElementById("qrcode-print-box")?.innerHTML;
    //         labelsHtml += `<div class="label">${content}</div>`;
    //     }

    //     pri.document.open();
    //     pri.document.write(`
    //         <html>
    //             <head>
    //                 <style>
    //                     @page {
    //                         /* 105mm is standard for 3-up labels (35mm x 3) */
    //                         size: 105mm auto;
    //                         margin: 0;
    //                     }

    //                     body {
    //                         margin: 0;
    //                         padding: 0;
    //                         -webkit-print-color-adjust: exact;
    //                     }

    //                     .sheet {
    //                         display: grid;
    //                         grid-template-columns: repeat(3, 35mm);

    //                         /* 🔥 DRIFT CORRECTION 🔥 */
    //                         /* Image-la paatha maari content keela pochu na intha value-ah kurainga (e.g., 0.2mm) */
    //                         /* Content mela yera aarambichu na intha value-ah yethunga (e.g., 0.5mm) */
    //                         row-gap: 0.3mm; 

    //                         column-gap: 0;
    //                         width: 105mm;
    //                         margin: 0;
    //                         padding: 0;
    //                     }

    //                     .label {
    //                         width: 35mm;
    //                         /* Strict physical height */
    //                         height: 25.3mm; 
    //                         position: relative;
    //                         overflow: hidden;
    //                         box-sizing: border-box;
    //                         /* Optional: check alignment during testing */
    //                         /* border: 0.1pt solid transparent; */ 
    //                     }

    //                     /* Barcode Position - Mela yethi vechiruken */
    //                     .label svg {
    //                         position: absolute;
    //                         top: 1.5mm; 
    //                         left: 50%;
    //                         transform: translateX(-50%);
    //                         width: 30mm !important;
    //                         height: 12mm !important;
    //                     }

    //                     /* Text Position - Barcode-ku tight-ah kela */
    //                     .label h3 {
    //                         position: absolute;
    //                         top: 14mm; 
    //                         left: 50%;
    //                         transform: translateX(-50%);
    //                         width: 33mm;
    //                         font-size: 6px;
    //                         font-family: 'Arial Narrow', sans-serif;
    //                         text-align: center;
    //                         margin: 0;
    //                         line-height: 1;
    //                         font-weight: bold;
    //                         display: -webkit-box;
    //                         -webkit-line-clamp: 2;
    //                         -webkit-box-orient: vertical;
    //                         overflow: hidden;
    //                     }

    //                     .label p { display: none; }
    //                 </style>
    //             </head>
    //             <body>
    //                 <div class="sheet">${labelsHtml}</div>
    //                 <script>
    //                     setTimeout(() => { window.print(); }, 500);
    //                 </script>
    //             </body>
    //         </html>
    //     `);
    //     pri.document.close();
    // };

    // const handlePrint = (type: "barcode" | "qrcode") => {
    //     const iframe = document.getElementById("ifmcontentstoprint") as HTMLIFrameElement;
    //     const pri = iframe?.contentWindow;
    //     if (!pri) return;

    //     let labelsHtml = "";
    //     for (let i = 0; i < printQty; i++) {
    //         const content = type === "barcode"
    //             ? document.getElementById("barcode-print-box")?.innerHTML
    //             : document.getElementById("qrcode-print-box")?.innerHTML;
    //         labelsHtml += `<div class="label">${content}</div>`;
    //     }

    //     pri.document.open();
    //     pri.document.write(`
    //         <html>
    //             <head>
    //                 <style>
    //                     @page {
    //                         /* 105mm width (35x3) and 25mm height + gap */
    //                         size: 105mm 25.4mm; 
    //                         margin: 0;
    //                     }

    //                     body {
    //                         margin: 0;
    //                         padding: 0;
    //                         -webkit-print-color-adjust: exact;
    //                     }

    //                     .sheet {
    //                         display: grid;
    //                         grid-template-columns: repeat(3, 35mm);

    //                         /* 🚀 DRIFT FIX: Added precise gap to match physical sheet */
    //                         row-gap: 0.4mm; 
    //                         column-gap: 0;
    //                         width: 105mm;
    //                         margin: 0;
    //                     }

    //                     .label {
    //                         width: 35mm;
    //                         /* Fixed height to prevent row overlap */
    //                         height: 25mm; 
    //                         position: relative;
    //                         overflow: hidden;
    //                         box-sizing: border-box;
    //                     }

    //                     .label svg {
    //                         position: absolute;
    //                         top: 2mm; 
    //                         left: 50%;
    //                         transform: translateX(-50%);
    //                         width: 30mm !important;
    //                         height: 12mm !important;
    //                     }

    //                     .label h3 {
    //                         position: absolute;
    //                         top: 15mm; 
    //                         left: 50%;
    //                         transform: translateX(-50%);
    //                         width: 33mm;
    //                         font-size: 6px;
    //                         font-family: Arial, sans-serif;
    //                         font-weight: bold;
    //                         text-align: center;
    //                         margin: 0;
    //                         line-height: 1.1;
    //                         display: -webkit-box;
    //                         -webkit-line-clamp: 2;
    //                         -webkit-box-orient: vertical;
    //                         overflow: hidden;
    //                     }

    //                     .label p { display: none; }
    //                 </style>
    //             </head>
    //             <body>
    //                 <div class="sheet">${labelsHtml}</div>
    //                 <script>
    //                     /* Longer delay to ensure browser prepares all labels */
    //                     setTimeout(() => { window.print(); }, 800);
    //                 </script>
    //             </body>
    //         </html>
    //     `);
    //     pri.document.close();
    // };


    const generateBarcodeImage = (value: string) => {
        const canvas = document.createElement("canvas");
        JsBarcode(canvas, value, {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: false,
        });
        return canvas.toDataURL("image/png");
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF({
            unit: "mm",
            format: [105, 297], // A4 height (long)
        });

        const labelWidth = 35;
        const labelHeight = 25;
        const cols = 3;

        let x = 0;
        let y = 0;

        for (let i = 0; i < printQty; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            x = col * labelWidth;
            y = row * labelHeight;

            const barcode = generateBarcodeImage(product?.barcode || "0000");

            // barcode
            doc.addImage(barcode, "PNG", x + 2, y + 2, 30, 12);

            // text
            doc.setFontSize(6);
            doc.text(product?.name || "", x + 17.5, y + 20, {
                align: "center",
                maxWidth: 30,
            });

            // auto new page if overflow
            if (y + labelHeight > 280) {
                doc.addPage();
                y = 0;
            }
        }

        doc.save("barcode-labels.pdf");
    };

    // FINAL 

    // const handlePrint = (type: "barcode" | "qrcode") => {
    //     const iframe = document.getElementById("ifmcontentstoprint") as HTMLIFrameElement;
    //     const pri = iframe?.contentWindow;
    //     if (!pri) return;

    //     let labelsHtml = "";

    //     for (let i = 0; i < printQty; i++) {
    //         const content =
    //             type === "barcode"
    //                 ? document.getElementById("barcode-print-box")?.innerHTML
    //                 : document.getElementById("qrcode-print-box")?.innerHTML;

    //         labelsHtml += `<div class="label">${content}</div>`;
    //     }

    //     const htmlContent = `
    //         <html>
    //             <head>
    //                 <style>
    //                     @page {
    //                         size: 105mm auto;
    //                         margin: 0;
    //                     }

    //                     body {
    //                         margin: 0;
    //                         padding: 0;
    //                     }

    //                     .sheet {
    //                         display: grid;
    //                         grid-template-columns: repeat(3, 35mm);
    //                         row-gap: 0;
    //                         column-gap: 0;
    //                         width: 105mm;
    //                     }

    //                     .label {
    //                         width: 35mm;
    //                         height: 25.3mm;
    //                         position: relative;
    //                         overflow: hidden;
    //                     }

    //                     .label svg {
    //                         position: absolute;
    //                         top: 2mm;
    //                         left: 50%;
    //                         transform: translateX(-50%);
    //                         width: 30mm !important;
    //                         height: 12mm !important;
    //                     }

    //                     .label h3 {
    //                         position: absolute;
    //                         top: 14.5mm;
    //                         left: 50%;
    //                         transform: translateX(-50%);
    //                         width: 33mm;
    //                         font-size: 6px;
    //                         text-align: center;
    //                         margin: 0;
    //                     }

    //                     .label p {
    //                         display: none;
    //                     }
    //                 </style>
    //             </head>

    //             <body>
    //                 <div class="sheet">
    //                     ${labelsHtml}
    //                 </div>

    //                 <script>
    //                     setTimeout(() => window.print(), 500);
    //                 </script>
    //             </body>
    //         </html>
    //     `;

    //     pri.document.open();
    //     pri.document.write(htmlContent);
    //     pri.document.close();
    //     pri.focus();
    // };

    // const handlePrint = (type: "barcode" | "qrcode") => {
    //     const iframe = document.getElementById("ifmcontentstoprint") as HTMLIFrameElement;
    //     const pri = iframe?.contentWindow;
    //     if (!pri) return;

    //     let labelsHtml = "";
    //     for (let i = 0; i < printQty; i++) {
    //         const content = type === "barcode"
    //                 ? document.getElementById("barcode-print-box")?.innerHTML
    //                 : document.getElementById("qrcode-print-box")?.innerHTML;
    //         labelsHtml += `<div class="label">${content}</div>`;
    //     }

    //     pri.document.open();
    //     pri.document.write(`
    //         <html>
    //             <head>
    //                 <style>
    //                     @page {
    //                         /* 35mm * 3 + gaps = approx 106mm */
    //                         size: 106mm auto; 
    //                         margin: 0;
    //                     }

    //                     body {
    //                         margin: 0;
    //                         padding: 0;
    //                         -webkit-print-color-adjust: exact;
    //                     }

    //                     /* 🚀 FIXED GRID LOGIC */
    //                     .sheet {
    //                         display: grid;
    //                         grid-template-columns: repeat(3, 35mm);
    //                         /* row-gap must match the physical vertical gap exactly */
    //                         row-gap: 0.5mm; 
    //                         column-gap: 0.5mm;
    //                         width: 106mm;
    //                         margin: 0 auto;
    //                         /* Adjust this padding-top to align the very first row */
    //                         padding-top: 2mm; 
    //                     }

    //                     .label {
    //                         /* Physical dimensions of your sticker */
    //                         width: 35mm;
    //                         height: 25mm; 
    //                         display: flex;
    //                         flex-direction: column;
    //                         justify-content: center; 
    //                         align-items: center;
    //                         box-sizing: border-box;
    //                         overflow: hidden;
    //                         padding: 1mm;
    //                         /* Remove border to avoid extra pixels */
    //                         border: none; 
    //                     }

    //                     .label svg {
    //                         /* Shrink barcode slightly so it doesn't push text down */
    //                         width: 30mm !important; 
    //                         height: 12mm !important; 
    //                         margin: 0 auto !important;
    //                     }

    //                     .label h3 {
    //                         font-size: 6px; /* Decreased font for tighter fit */
    //                         font-family: Arial, sans-serif;
    //                         font-weight: bold;
    //                         margin: 1mm 0 0 0;
    //                         padding: 0;
    //                         line-height: 1;
    //                         text-align: center;
    //                         width: 33mm;
    //                         white-space: nowrap;
    //                         overflow: hidden;
    //                         text-overflow: ellipsis;
    //                     }

    //                     .label p { display: none !important; }

    //                 </style>
    //             </head>
    //             <body>
    //                 <div class="sheet">${labelsHtml}</div>
    //             </body>
    //         </html>
    //     `);

    //     pri.document.close();
    //     pri.focus();

    //     setTimeout(() => {
    //         pri.print();
    //     }, 500);
    // };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <iframe id="ifmcontentstoprint" style={{ height: '0px', width: '0px', position: 'absolute' }}></iframe>

            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold">Product Details</h2>
                        <p className="text-xs text-gray-500">SKU: {product.sku || "N/A"}</p>
                    </div>
                    <button onClick={onClose} className="text-2xl p-2 hover:bg-gray-100 rounded-full transition leading-none">×</button>
                </div>

                {/* TABS */}
                <div className="flex border-b px-4 bg-gray-50/50">
                    <button onClick={() => setActiveTab("details")} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${activeTab === "details" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500"}`}>
                        <InfoIcon size={16} /> Details
                    </button>
                    <button onClick={() => setActiveTab("codes")} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${activeTab === "codes" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500"}`}>
                        <BarcodeIcon size={16} /> QR & Barcode
                    </button>
                </div>

                <div className="p-6 overflow-y-auto no-scrollbar flex-1 bg-white">
                    {activeTab === "details" ? (
                        <div>
                            {/* CONTENT - Exact match to OrderDetailsTabsModal structure */}
                            <div className="space-y-6">

                                {/* PRODUCT INFO - orange-tinted section */}
                                <section className="bg-orange-50/40 border border-orange-100 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-orange-600 mb-5">
                                        Product Information
                                    </h3>

                                    <div className="grid grid-cols-2 gap-8 text-sm">
                                        <Info label="Name" value={product.name} />
                                        <Info label="Model" value={product.model_name || "-"} />
                                        <Info label="Brand" value={product.brand_details?.name || "-"} />
                                        <Info label="Status" value={product.status} />
                                        <div className="col-span-2 text-gray-700">
                                            <Info label="Description" value={product.description || "-"} />
                                        </div>
                                        <div className="col-span-2 text-gray-700">
                                            <Info label="Description" value={product.barcode || "-"} />
                                        </div>
                                    </div>
                                </section>

                                {/* MEDIA SECTION */}
                                <section>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-5">
                                        Product Media
                                    </h3>
                                    <div className="flex flex-wrap gap-4">
                                        {product.media?.map((m: any, i: number) => (
                                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
                                                <img src={m.url} alt="product" className="w-32 h-32 object-cover rounded-lg" />
                                            </div>
                                        ))}
                                        {(!product.media || product.media.length === 0) && (
                                            <p className="text-sm text-gray-400">No images available</p>
                                        )}
                                    </div>
                                </section>

                                {/* ATTRIBUTES & CATEGORIES */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <section className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-blue-600 mb-5">Categories</h3>
                                        <div className="flex flex-wrap gap-2 text-sm">
                                            {product.categories?.map((cat: any) => (
                                                <span key={cat.id} className="px-3 py-1 bg-white border border-blue-200 rounded-full text-blue-700 font-medium">{cat.name}</span>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="bg-green-50 border border-green-100 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-green-600 mb-5">Attributes</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            {product.attributes_details?.map((attr: any, i: number) => (
                                                <Info key={i} label={attr.attribute_name} value={attr.value} />
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* PRICING summary blocks */}
                                <section className="bg-gray-900 text-white rounded-xl p-6">
                                    <h3 className="text-lg font-semibold mb-5">Pricing Summary</h3>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex gap-10">
                                            {product.product_pricing?.map((price: any, i: number) => (
                                                <div key={i}>
                                                    <span className="text-gray-400 block text-xs uppercase mb-1">{price.type}</span>
                                                    <span className="text-xl font-bold text-orange-400">₹{price.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* SPECIFICATIONS */}
                                {parsedSpecs.length > 0 && (
                                    <section className="bg-white border rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-5">Full Specifications</h3>
                                        <div className="grid grid-cols-2 gap-6 border-t pt-4">
                                            {parsedSpecs.map((spec, i) => (
                                                <Info key={i} label={spec.key} value={spec.value} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                            </div>


                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* PRINT CONTROLS */}
                            <div className="flex items-center gap-4 bg-slate-900 text-white p-4 rounded-xl shadow-lg">
                                <Printer size={20} className="text-orange-400" />
                                <span className="text-sm font-medium">Print Quantity:</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={printQty}
                                    onChange={(e) => setPrintQty(parseInt(e.target.value) || 1)}
                                    className="w-20 bg-slate-800 border-none rounded-lg px-3 py-1 text-orange-400 font-bold focus:ring-2 focus:ring-orange-500"
                                />
                                <p className="text-[10px] text-slate-400 italic">Set quantity before clicking print buttons below.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* BARCODE SECTION */}
                                <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-6 hover:shadow-md transition-shadow">
                                    <h4 className="font-bold text-gray-700 flex items-center gap-2"><BarcodeIcon size={18} /> Barcode Label</h4>
                                    <div id="barcode-print-box" className="p-4 bg-white border rounded-lg">
                                        <Barcode
                                            id="product-barcode-svg"
                                            value={product.barcode || product.sku || "N/A"}
                                            width={1.5} height={50} fontSize={12}
                                        />
                                        <h3 className="hidden-in-web text-center text-xs mt-1 font-bold">{product.name}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 w-full">
                                        <button onClick={() => downloadCode("barcode")} className="flex items-center justify-center gap-2 py-2 bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200">
                                            <Download size={16} /> Download
                                        </button>
                                        <button onClick={() => handlePrint("barcode")} className="flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                                            <Printer size={16} /> Print ({printQty})
                                        </button>
                                    </div>
                                </div>

                                {/* QR SECTION */}
                                <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-6 hover:shadow-md transition-shadow">
                                    <h4 className="font-bold text-gray-700 flex items-center gap-2"><QrCode size={18} /> QR Label</h4>
                                    <div id="qrcode-print-box" className="p-6 bg-white border rounded-lg flex flex-col items-center">
                                        <QRCodeSVG
                                            id="product-qrcode-svg"
                                            value={product.sku || "N/A"}
                                            size={100}
                                        />
                                        <p className="mt-2 text-[10px] font-bold">{product.sku}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 w-full">
                                        <button onClick={() => downloadCode("qrcode")} className="flex items-center justify-center gap-2 py-2 bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200">
                                            <Download size={16} /> Download
                                        </button>
                                        {/* <button onClick={() => handlePrint("qrcode")} className="flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">
                                            <Printer size={16} /> Print ({printQty})
                                        </button> */}
                                        <button onClick={handleDownloadPDF}>
                                            Download PDF
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700">Close</button>
                </div>
            </div>
        </div>
    );
};

const Info = ({ label, value }: any) => (
    <div>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">{label}</p>
        <p className="text-gray-800 font-semibold">{value || "-"}</p>
    </div>
);

export default ProductViewModal;