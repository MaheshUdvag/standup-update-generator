require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { format, parseISO, isValid } = require('date-fns');
const { enUS } = require('date-fns/locale');
const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const TICKET_DATA = {};
const TICKETS_WORKED_ON = [];
const inputDate = process.argv[2];
const targetDate = inputDate ? parseISO(inputDate) : new Date();

if (!isValid(targetDate)) {
    console.error(":x: Invalid date. Use YYYY-MM-DD");
    process.exit(1);
}

const dateStr = format(targetDate, 'yyyy-MM-dd');

/**
 * Replace the API logic to fetch ticketing data based on your ticketing system.
 */
async function fetchTicketingData() {
    try {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': AUTH_TOKEN, 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        const ticketData = data.issues;
        ticketData.forEach(issue => {
            TICKET_DATA[issue.key] = {
                description: issue.description,
                title: issue.title
            };
        });

        const ticketLines = TICKETS_WORKED_ON.length
            ? TICKETS_WORKED_ON.map((key) => {
                const t = TICKET_DATA[key];
                return `- [Ticket: ${key}] ${t ? t.title : '(unknown)'} - ${t ? t.description : ''}`;
            }).join('\n')
            : '_No tickets inferred from branch names._';

        return ticketLines;

    } catch (error) {
        console.error(":warning: Failed to fetch ticketing data:", error.message);
        return "_No tickets inferred from branch names._";
    }
}

function getGitCommits(date) {
    try {
        const userName = execSync('git config user.name').toString().trim();
        const command = `cd ../My-Project-Path && git log --all --author="${userName}" --since="${date} 00:00:00" --until="${date} 23:59:59" --pretty=format:"%h|%s"`;
        const logs = execSync(command).toString().trim();
        return logs.split('\n').map(line => {
            const [hash, subject] = line.split('|');
            // Find which branches contain this specific commit hash
            let branch = "detached";
            try {
                const branchCmd = `cd ../../Code/itildesk && git branch --contains ${hash} --format="%(refname:short)"`;
                const branches = execSync(branchCmd).toString().trim().split('\n');
                // Filter out 'origin/' and pick the first local branch if possible
                branch = branches.find(b => !b.includes('origin/')) || branches[0];
                if(!branch) {
                    branch = "detached";
                }

                if(branch.includes('nucleus_')) {
                    const key = branch.replace('nucleus_', '');
                    if(!TICKETS_WORKED_ON.includes(key)) {
                        TICKETS_WORKED_ON.push(key);
                    }
                }
            } catch (e) { /* ignore */ }
            return `- [Branch: ${branch}] ${subject} (${hash})`;
        }).join('\n');
    } catch (e) {
        console.error(e);
        return '';
    }
}

function writeUpdateMarkdown(date, ticketLines, gitCommits) {
    const monthYearFolder = format(date, 'MMMM-yyyy', { locale: enUS }).replace(/\s+/g, '-');
    const dayFolder = format(date, 'yyyy-MM-dd');
    const outDir = path.join(__dirname, 'updates', monthYearFolder, dayFolder);
    const outFile = path.join(outDir, 'update.md');

    let md = fs.readFileSync(path.join(__dirname, 'update-prompt.md'), 'utf8');
    md = md.replaceAll('[date]', dateStr);
    md = md.replace('[ticketData]', ticketLines);
    md = md.replace('[gitCommits]', gitCommits);

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, md, 'utf8');
    return path.relative(process.cwd(), outFile);
}

async function generateUpdatePrompt() {
    try {
        const ticketLines = await fetchTicketingData();
        const commits = getGitCommits(dateStr);

        const relativePath = writeUpdateMarkdown(targetDate, ticketLines, commits || '_No commits._');
        console.log(`Prompt generated: ${relativePath}`);
    } catch (error) {
        console.error('Failed to generate update file:', error);
        process.exit(1);
    }
}

console.log(`\n:date: SUMMARY FOR: ${dateStr}`);
console.log('==========================================');

generateUpdatePrompt();