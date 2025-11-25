// Apps Script - paste into script editor (Code.gs)
const SPREADSHEET_ID = "1S0H9hPelATSzHBmiQHOCUeHsi03106AfSHJENOR1aqA"; // <- replace
const SHEET_NAME = "Sheet1"; // <- replace if your sheet name differs
const EXPECTED_SECRET = ""; // optional: set same as GAS_SECRET env var

function doPost(e) {
  try {
    // parse payload
    let payload = {};
    if (
      e.postData &&
      e.postData.type &&
      e.postData.type.indexOf("application/json") !== -1
    ) {
      payload = JSON.parse(e.postData.contents || "{}");
    } else if (e.parameter && Object.keys(e.parameter).length) {
      payload = e.parameter;
    } else if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = {};
      }
    }

    // optional secret check
    if (EXPECTED_SECRET && payload.secret !== EXPECTED_SECRET) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Invalid secret" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error("Sheet not found: " + SHEET_NAME);

    // row layout: timestamp, name, email, phone, skills, availability, message
    const row = [
      Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss"),
      payload.name || "",
      payload.email || "",
      payload.phone || "",
      payload.skills || "",
      payload.availability || "",
      payload.message || "",
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
