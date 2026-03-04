'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LuDownload, LuPrinter, LuLoader, LuFileSpreadsheet } from 'react-icons/lu';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

interface TimetableExportProps {
    targetId: string;
    filename: string;
    slots?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    config?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const TimetableExport: React.FC<TimetableExportProps> = ({ targetId, filename, slots, config }) => {
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        setIsExportingPdf(true);
        try {
            const element = document.getElementById(targetId);
            if (!element) throw new Error('Target element not found');

            // Temporarily modify styles for better render quality
            const originalStyle = element.style.cssText;
            element.style.padding = '20px';
            element.style.background = 'white';

            // Add print-specific class to hide certain elements if needed
            element.classList.add('pdf-rendering');

            const canvas = await html2canvas(element, {
                scale: 2, // Higher resolution
                useCORS: true,
                logging: false,
                windowWidth: 1600, // Ensure wide enough for desktop grid
            });

            // Revert styles
            element.classList.remove('pdf-rendering');
            element.style.cssText = originalStyle;

            const imgData = canvas.toDataURL('image/png');

            // A4 Landscape dimensions in mm
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Optional: If height exceeds A4 page height, we could scale down further,
            // but for a timetable, usually fit-to-width is fine.
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${filename}.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF', error);
            alert('Failed to construct PDF. Please use the Print function as an alternative.');
        } finally {
            setIsExportingPdf(false);
        }
    };

    const handleDownloadExcel = () => {
        if (!slots || !config) {
            alert("Timetable data not available for Excel export.");
            return;
        }

        setIsExportingExcel(true);
        try {
            // Group slots by batch
            const batchSlots = new Map<string, any[]>();
            slots.forEach(s => {
                if (s.isBreak) return;
                const batchName = s.batch?.name || s.batchId;
                if (!batchSlots.has(batchName)) batchSlots.set(batchName, []);
                batchSlots.get(batchName)!.push(s);
            });

            const days = config?.daysPerWeek || 6;
            const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].slice(0, days);

            const timeBlocks = config.timeBlocks || [];
            const sortedBlocks = [...timeBlocks].sort((a: any, b: any) => a.slotNumber - b.slotNumber);

            const wb = XLSX.utils.book_new();

            // Create a sheet for each batch
            Array.from(batchSlots.entries()).forEach(([batchName, bSlots]) => {
                const sheetData: any[][] = [];

                // Header Row
                const headerRow = ['Time'];
                dayLabels.forEach(d => headerRow.push(d));
                sheetData.push(headerRow);

                // Body Rows
                sortedBlocks.forEach((block: any) => {
                    if (block.isBreak) {
                        const breakRow = [`${block.startTime} - ${block.endTime}`];
                        daysArray(days).forEach(() => breakRow.push('BREAK'));
                        sheetData.push(breakRow);
                        return;
                    }

                    const rowData = [`${block.startTime} - ${block.endTime}`];
                    // Create cell for each day
                    for (let day = 1; day <= days; day++) {
                        const daySlots = bSlots.filter(s => s.dayOfWeek === day && s.slotNumber === block.slotNumber);

                        if (daySlots.length === 0) {
                            rowData.push('');
                        } else {
                            // Format slot content
                            const cellTexts = daySlots.map(s => {
                                const course = s.course?.code || s.courseCode;
                                const fac1 = s.faculty?.name || s.facultyName;
                                const fac2 = s.faculty2?.name ? ` / ${s.faculty2?.name}` : '';
                                const room = s.room?.name ? ` [${s.room?.name}]` : '';
                                const type = s.slotType || s.sessionType?.name || s.course?.type || '';
                                return `${course} - ${fac1}${fac2}${room} (${type})`;
                            });
                            rowData.push(cellTexts.join('\n\n'));
                        }
                    }
                    sheetData.push(rowData);
                });

                const ws = XLSX.utils.aoa_to_sheet(sheetData);

                // Set column widths
                ws['!cols'] = [{ wch: 15 }]; // Time column
                dayLabels.forEach(() => ws['!cols']!.push({ wch: 25 })); // Day columns

                // Add to workbook
                XLSX.utils.book_append_sheet(wb, ws, batchName.substring(0, 31)); // sheet names max 31 chars
            });

            // Summary Sheet (All Slots List)
            const summaryData = [
                ['Day', 'Slot', 'Time', 'Batch', 'Course', 'Type', 'Faculty', 'Room', 'Elective']
            ];

            let sortedSlots = [...slots].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.slotNumber - b.slotNumber);
            sortedSlots.forEach(s => {
                if (s.isBreak) return;

                const block = sortedBlocks.find((b: any) => b.slotNumber === s.slotNumber);
                const timeStr = block ? `${block.startTime} - ${block.endTime}` : `Slot ${s.slotNumber}`;
                const dayStr = dayLabels[s.dayOfWeek - 1] || s.dayOfWeek;
                const type = s.slotType || s.sessionType?.name || s.course?.type || '';

                summaryData.push([
                    dayStr,
                    s.slotNumber,
                    timeStr,
                    s.batch?.name || s.batchId,
                    s.course?.code || s.courseCode,
                    type,
                    `${s.faculty?.name || s.facultyName}${s.faculty2?.name ? ' / ' + s.faculty2?.name : ''}`,
                    s.room?.name || '',
                    s.isElective ? 'Yes' : 'No'
                ]);
            });

            const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, wsSummary, 'All Class List');

            // Download file
            XLSX.writeFile(wb, `${filename}.xlsx`);

        } catch (error) {
            console.error('Failed to generate Excel', error);
            alert('Failed to construct Excel file.');
        } finally {
            setIsExportingExcel(false);
        }
    };

    // Helper to generate array 1 to N
    const daysArray = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

    return (
        <div className="flex flex-wrap items-center gap-2 print:hidden z-10 relative">
            <Button
                variant="outline"
                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-9 font-semibold text-xs transition-colors dark:bg-slate-800 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={handlePrint}
            >
                <LuPrinter className="w-4 h-4 mr-2 text-slate-400" />
                Print
            </Button>
            <Button
                variant="outline"
                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-9 font-semibold text-xs transition-colors dark:bg-slate-800 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
            >
                {isExportingPdf ? <LuLoader className="w-4 h-4 mr-2 animate-spin text-indigo-500" /> : <LuDownload className="w-4 h-4 mr-2 text-indigo-500" />}
                {isExportingPdf ? 'Saving PDF...' : 'To PDF'}
            </Button>
            {slots && config && (
                <Button
                    className="bg-[#107c41] hover:bg-[#0b5a2f] text-white h-9 font-semibold text-xs shadow-sm transition-colors border-0"
                    onClick={handleDownloadExcel}
                    disabled={isExportingExcel}
                >
                    {isExportingExcel ? <LuLoader className="w-4 h-4 mr-2 animate-spin" /> : <LuFileSpreadsheet className="w-4 h-4 mr-2" />}
                    {isExportingExcel ? 'Saving Excel...' : 'To Excel'}
                </Button>
            )}
        </div>
    );
};
