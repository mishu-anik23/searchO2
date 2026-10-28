#!/usr/bin/env node
/**
 * sync_sharepoint_forms.mjs
 * 
 * Synchronizes Microsoft Word / SharePoint form templates with SearchO2 backend.
 * Can be run manually, via cron, or in GitHub Actions CI/CD.
 * 
 * Usage:
 *   node scripts/sync_sharepoint_forms.mjs --local
 *   node scripts/sync_sharepoint_forms.mjs --remote https://searcho2.online
 *   node scripts/sync_sharepoint_forms.mjs --graph
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const API_BASE = process.env.SEARCHO2_API_BASE || process.env.VITE_API_URL || 'http://localhost:3000';
const SYNC_SECRET = process.env.FORMS_SYNC_SECRET || 'searcho2_sharepoint_forms_secret_2026';

const FORM_FILES = [
  'SearchO2_Forms_Report_a_Problem.docx',
  'SearchO2_Forms_Chapter_Feedback.docx',
  'SearchO2_Forms_Full_Playtest_Review.docx'
];

async function syncLocalDocxFiles(targetBaseUrl = API_BASE) {
  console.log(`📡 Pushing local docx templates to SearchO2 backend at: ${targetBaseUrl}/api/forms/sync`);

  for (const filename of FORM_FILES) {
    const filePath = path.join(rootDir, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filename}, skipping.`);
      continue;
    }

    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');

    console.log(`📤 Syncing ${filename} (${buffer.length} bytes)...`);

    try {
      const response = await fetch(`${targetBaseUrl.replace(/\/$/, '')}/api/forms/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': SYNC_SECRET
        },
        body: JSON.stringify({
          filename,
          contentBase64: base64,
          updatedBy: 'sync_sharepoint_forms_cli'
        })
      });

      const data = await response.json();
      if (response.ok && data.ok) {
        console.log(`   ✅ [v${data.version}] ${data.formId} synced! (${data.questionsCount} questions)`);
      } else {
        console.error(`   ❌ Failed to sync ${filename}:`, data.error || response.statusText);
      }
    } catch (err) {
      console.error(`   ❌ Network error contacting ${targetBaseUrl}:`, err.message);
    }
  }
}

/**
 * Microsoft Graph API Sync Mode:
 * Downloads the updated file directly from SharePoint using Entra ID Client Credentials.
 */
async function syncViaMicrosoftGraph() {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const siteId = process.env.SHAREPOINT_SITE_ID; // CogniForge site ID
  const fileId = process.env.SHAREPOINT_FILE_ID; // {9D9EDD7D-ED90-4CF5-B0D9-6B09032EA298}

  if (!tenantId || !clientId || !clientSecret) {
    console.error('❌ Missing Azure App Registration environment variables:');
    console.error('   Please provide AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET.');
    process.exit(1);
  }

  console.log(`🔐 Requesting Microsoft Graph OAuth token for tenant ${tenantId}...`);
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });

  const tokenRes = await fetch(tokenUrl, { method: 'POST', body: params });
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(`OAuth authentication failed: ${tokenData.error_description || tokenRes.statusText}`);
  }

  const accessToken = tokenData.access_token;
  console.log('✅ Microsoft Graph OAuth token acquired.');

  // Download target docx from SharePoint drive item
  const downloadUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/items/${fileId}/content`;
  console.log(`📥 Downloading latest SearchO2_Forms_Import_04_Report_a_Problem.docx from SharePoint...`);

  const downloadRes = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!downloadRes.ok) {
    throw new Error(`Failed to download SharePoint document: ${downloadRes.status} ${downloadRes.statusText}`);
  }

  const fileBuffer = Buffer.from(await downloadRes.arrayBuffer());
  console.log(`✅ Downloaded ${fileBuffer.length} bytes from SharePoint. Pushing to SearchO2 backend...`);

  // Write local copy to keep repo updated
  fs.writeFileSync(path.join(rootDir, 'SearchO2_Forms_Report_a_Problem.docx'), fileBuffer);

  // Push to live API
  await syncLocalDocxFiles();
}

async function main() {
  const args = process.argv.slice(2);
  const targetIdx = args.indexOf('--remote');
  const targetBase = targetIdx !== -1 && args[targetIdx + 1] ? args[targetIdx + 1] : API_BASE;

  if (args.includes('--graph')) {
    await syncViaMicrosoftGraph();
  } else {
    await syncLocalDocxFiles(targetBase);
  }
}

main().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
