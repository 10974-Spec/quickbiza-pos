/**
 * QuickBiza Brand Rename Script
 * Renames SokoFlow / Aroma (as brand) → QuickBiza across all source files.
 * Run from project root: node scripts/rename_brand.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

const ROOT = '/home/nyakoe/Desktop/aroma';

// File extensions to process
const EXTS = new Set(['.ts', '.tsx', '.js', '.json', '.html', '.css', '.md', '.txt']);

// Paths (relative to ROOT) that should be excluded
const EXCLUDE_DIRS = new Set([
    'node_modules', '.git', 'dist', '.vite', 'build',
    'scripts', // this script itself
]);

// Specific files to skip (basenames)
const EXCLUDE_FILES = new Set([
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    'aroma.db', 'rename_brand.mjs',
]);

// Ordered replacement pairs (order matters — more specific first)
const REPLACEMENTS = [
    // Deep link protocol
    ["sokoflow://", "quickbiza://"],

    // App title + window name
    ["SokoFlow POS", "QuickBiza POS"],
    ["Sokoflow POS", "QuickBiza POS"],

    // Full brand phrases — Aroma Bakery as product name (not example business)
    ["Aroma Bakery POS Server", "QuickBiza POS Server"],
    ["Aroma Bakery POS", "QuickBiza POS"],
    ["Aroma Bakery System", "QuickBiza System"],
    ["Connected to Aroma Cloud", "Connected to QuickBiza Cloud"],
    ["Aroma Cloud", "QuickBiza Cloud"],

    // License / auth error messages
    ["SokoFlow.", "QuickBiza."],   // "Please get a license... to access SokoFlow."
    ["access SokoFlow", "access QuickBiza"],

    // Package names & protocol
    ["sokoflow-backend", "quickbiza-backend"],
    ["sokoflow-frontend", "quickbiza-frontend"],
    ['"sokoflow"', '"quickbiza"'],     // package.json name field

    // Mixed-case brand references
    ["SokoFlow", "QuickBiza"],  // capital S capital F
    ["Sokoflow", "Quickbiza"],  // capital S lower f

    // Server log strings mentioning Aroma as app brand
    ["Aroma Bakery POS", "QuickBiza POS"],
    ["🚀 Aroma", "🚀 QuickBiza"],

    // Tagline / description  
    ["sokoflow", "quickbiza"],   // lowercase (protocol refs, package names, analytics slugs)

    // Comments / strings with "Aroma" used as the product name
    // Be conservative — only replace explicit product-name usages
    ["Aroma POS", "QuickBiza POS"],
    ["© 2026 Aroma", "© 2026 QuickBiza"],
    ["by Aroma", "by QuickBiza"],
    ["from Aroma", "from QuickBiza"],

    // Cloud / DB connection logs
    ["✅ Connected to Aroma", "✅ Connected to QuickBiza"],
];

function processFile(filePath) {
    let content = readFileSync(filePath, 'utf8');
    const original = content;

    for (const [from, to] of REPLACEMENTS) {
        // Simple global string replace (no regex to avoid accidental matches)
        content = content.split(from).join(to);
    }

    if (content !== original) {
        writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

function walk(dir) {
    let changed = 0;
    for (const entry of readdirSync(dir)) {
        if (EXCLUDE_DIRS.has(entry)) continue;
        if (EXCLUDE_FILES.has(entry)) continue;

        const full = join(dir, entry);
        const stat = statSync(full);

        if (stat.isDirectory()) {
            changed += walk(full);
        } else if (stat.isFile() && EXTS.has(extname(entry).toLowerCase())) {
            if (processFile(full)) {
                console.log(`  ✏️  ${relative(ROOT, full)}`);
                changed++;
            }
        }
    }
    return changed;
}

console.log('🔄 QuickBiza brand rename starting...\n');
const total = walk(ROOT);
console.log(`\n✅ Done — ${total} file(s) updated.`);
