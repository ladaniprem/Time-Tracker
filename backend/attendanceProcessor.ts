import { promises as fs } from 'fs';
import path from 'path';
import { Workbook } from 'exceljs';
import { syncData } from './crm/sync_data';
import { sendEmail } from './notification/send_email';
import { sendWhatsApp } from './notification/send_whatsapp';

// --- Configuration ---
const PROCESSED_FILE_PATH = "processed_files.json";
const ATTENDANCE_FOLDER = path.join(process.env.HOME || process.env.USERPROFILE || '', "Desktop", "Time tracker", "past_files");

const STAFF_EMAILS: Record<string, string> = {
    "Piyush Shrimali": "premladani33453@gmail.com",
    // "Rohan Patel": "rohan@xexcellence.com",
    // "Shubham Goswami": "shubham@xexcellence.com",
    // "Rahi Shah": "rahi@xexcellence.com",
    // "Rishi Verma": "rishi@xexcellence.com",
    // "Priya Sheth": "priya@xexcellence.com",
    // "Vivek Shah": "vivek@xexcellence.com",
    // "Shreya Shah": "shreya@xexcellence.com",
};
const STAFF_WHATSAPP_NUMBERS: Record<string, string> = {
    "Piyush Shrimali": "8849412299",
    // "Rohan Patel": "8849710229",
    // "Shubham Goswami": "7359910637",
    // "Rahi Shah": "7567372688",
    // "Rishi Verma": "6203657455",
    // "Priya Sheth": "9429134711",
    // "Vivek Shah": "7567372688",
    //"Shreya Shah": "9898108607",
};

// --- Utility Functions ---

function loadProcessedFiles(): Set<string> {
    try {
        try {
            fs.access(PROCESSED_FILE_PATH);
        } catch (error) {
            return new Set();
        }
        const fileContent = fs.readFileSync(PROCESSED_FILE_PATH, 'utf-8');
        return new Set(JSON.parse(fileContent));
    } catch {
        console.warn('Could not load processed files, starting with empty set');
        return new Set();
    }

function saveProcessedFiles(processedFiles: Set<string>): void {
    fs.writeFile(PROCESSED_FILE_PATH, JSON.stringify(Array.from(processedFiles)));
}

function parseTime(value: any): Date | null {
    if (!value || value === '' || value === '-') {
        return null;
    }
    if (value instanceof Date) {
        return value;
    }
    if (typeof value === 'string') {
        const cleanedValue = value.trim();
        const timeRegex = /^(\d{1,2}):(\d{2})$/;
        const ampmRegex = /^(\d{1,2}):(\d{2})\s?([ap]m)$/i;

        if (cleanedValue.match(timeRegex)) {
            const [hours, minutes] = cleanedValue.split(':').map(Number);
            const today = new Date();
            today.setHours(hours, minutes, 0, 0);
            return today;
        }

        const match = cleanedValue.match(ampmRegex);
        if (match) {
            let [_, hours, minutes, ampm] = match;
            let hour = parseInt(hours, 10);
            if (ampm.toLowerCase() === 'pm' && hour < 12) {
                hour += 12;
            }
            if (ampm.toLowerCase() === 'am' && hour === 12) {
                hour = 0;
            }
            const today = new Date();
            today.setHours(hour, parseInt(minutes, 10), 0, 0);
            return today;
        }
    }

    console.warn(`Unrecognized time: ${value}`);
    return null;
}

async function readAttendance(file_path: string): Promise<any[]> {
    try {
        const workbook = new Workbook();
        await workbook.xlsx.readFile(file_path);
        const worksheet = workbook.getWorksheet('Details');
        if (!worksheet) {
            console.error(`Error: 'Details' sheet not found in ${file_path}`);
            return [];
        }

        const employees: any[] = [];
        const columns = worksheet.getRow(1).values as string[];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
                const rowValues = row.values as any[];
                const employee: any = {};
                columns.forEach((colName, index) => {
                    const value = rowValues[index];
                    if (colName) {
                        employee[colName.replace(/\s+/g, '-')] = value;
                    }
                });
                employees.push({
                    "Staff Name": employee['Staff-Name'],
                    "Attendance": employee['Attendance'],
                    "In-Time": parseTime(employee['In-Time']),
                    "Out-Time": parseTime(employee['Out-Time']),
                    "late_minutes": employee['Late-Minutes'] || 0,
                    "early_minutes": employee['Early-Minutes'] || 0,
                });
            }
        });
        return employees;
    } catch (e) {
        console.error(`Error reading ${file_path}: ${e}`);
        return [];
    }
}

function extractDateFromFilename(filename: string): string | null {
    const processedFiles = loadProcessedFiles();
    if (processedFiles.has(filename)) {
        console.info(`✅ File already processed: ${filename}`);
        return null;
    }

    const match = filename.match(/\d{4}-\d{2}-\d{2}/);
    if (match) {
        return match[0];
    }

    const fallbackDate = new Date().toISOString().slice(0, 10);
    console.warn(`⚠️ No date in filename '${filename}'. Using today's date: ${fallbackDate}`);
    return fallbackDate;
}

async function processAttendanceFile(filePath: string): Promise<void> {
    const processedFiles = loadProcessedFiles();
    const fileName = path.basename(filePath);

    if (processedFiles.has(fileName)) {
        console.info(`⏩ Skipping already processed file: ${fileName}`);
        return;
    }

    const dateStr = extractDateFromFilename(fileName);
    if (!dateStr) {
        return;
    }

    console.info(`🗓️ Extracted date: ${dateStr}`);
    const employees = await readAttendance(filePath);

    // Prepare attendance data for the simulated sync_data_api
    const attendanceRecords = employees.map(emp => ({
        name: emp["Staff Name"],
        date: new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
        punch_in_time: emp["In-Time"] ? emp["In-Time"].toTimeString().slice(0, 5) : '',
        punch_out_time: emp["Out-Time"] ? emp["Out-Time"].toTimeString().slice(0, 5) : '',
        late_minutes: emp["late_minutes"],
        early_minutes: emp["early_minutes"],
    }));

    // Sync data to the CRM using the simulated API
    const syncResponse = await syncData({ dataType: "attendance", data: attendanceRecords });
    console.info(`CRM Sync Response: ${JSON.stringify(syncResponse)}`);

    // Send notifications using the simulated APIs
    for (const emp of employees) {
        const email = STAFF_EMAILS[emp["Staff Name"]];
        const whatsapp = STAFF_WHATSAPP_NUMBERS[emp["Staff Name"]];

        const emailBody = `Hello ${emp['Staff Name']},

📅 *Attendance Date:* ${dateStr}

📌 *Attendance Update*
    - Late by: ${emp['late_minutes']} minutes
    - Left early by: ${emp['early_minutes']} minutes

⏰ *Recorded Timings*
    - In-Time: ${emp['In-Time'] ? emp['In-Time'].toTimeString().slice(0, 5) : 'N/A'}
    - Out-Time: ${emp['Out-Time'] ? emp['Out-Time'].toTimeString().slice(0, 5) : 'N/A'}

🔔 *Please ensure timely attendance in the future.*`;

        const whatsappMsg = `Date:${dateStr},Hello ${emp['Staff Name']},Late:${emp['late_minutes']}min,Early:${emp['early_minutes']}min,In:${emp['In-Time'] ? emp['In-Time'].toTimeString().slice(0, 5) : 'N/A'},Out:${emp['Out-Time'] ? emp['Out-Time'].toTimeString().slice(0, 5) : 'N/A'}.`;

        if (email) {
            await sendEmail({ to: email, subject: "Daily Attendance Notification", body: emailBody });
        }
        if (whatsapp) {
            await sendWhatsApp({ to: whatsapp, message: whatsappMsg });
        }
    }

    processedFiles.add(fileName);
    saveProcessedFiles(processedFiles);
}

function getExcelFiles(folderPath: string): string[] {
    try {
        try {
            await fs.access(folderPath);
        } catch (error) {
            throw error;
        }
    } catch {
        console.error(`Folder not found: ${folderPath}`);
        return [];
    }
    return fs.readdirSync(folderPath)
        .filter(f => f.toLowerCase().endsWith(".xlsx"))
        .map(f => path.join(folderPath, f));
}

async function main(): Promise<void> {
    const files = getExcelFiles(ATTENDANCE_FOLDER);
    if (files.length === 0) {
        console.warn("⚠️ No Excel files found in the attendance folder.");
        return;
    }

    for (const file of files) {
        console.info(`📂 Processing file: ${file}`);
        await processAttendanceFile(file);
    }

    console.info("✅ All attendance files processed.");
}
}
