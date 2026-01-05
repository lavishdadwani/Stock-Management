import { google } from "googleapis";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
// const credentials = require("../stock-management-471511-891e7af6825b");

const credentials = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSAE_DOMAIN,
};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [process.env.spreadSheetScope],
});

const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = process.env.sheetID; // sheetID
const range = process.env.sheetRange; // 10 columns (A to J)

// 1️⃣ Add new record
const addRecord = async (payload) => {
  const values = [payload];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values },
  });
  return "Row added";
  console.log("✅ Row added!");
};

// 2️⃣ Read all data
const readData = async () => {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  // console.log("📌 Current Stock Data:", res.data.values);
  return res.data.values;
};

// 3️⃣ Update/Edit
const updateCell = async () => {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Sheet1!H2", // Row 2, Col H → Qty Produced
    valueInputOption: "RAW",
    requestBody: { values: [[550]] },
  });

  // console.log("✅ Cell updated!");
};

export { addRecord, updateCell, readData };
