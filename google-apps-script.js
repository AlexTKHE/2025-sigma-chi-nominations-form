const SPREADSHEET_ID = '1W4tn0ZX54R-dFx-tJSYPEQPeGFnb7PZ23hBXta7nyXU';

function doPost(e) {
  try {
    const formData = JSON.parse(e.postData.contents);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    processNominations(spreadsheet, formData);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'API is running',
      message: 'Sigma Chi Nomination Form API is active',
      sheets: 'Creates two sheets: Nominations Summary and Detailed Submissions',
      spreadsheetId: SPREADSHEET_ID
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function processNominations(spreadsheet, formData) {
  const submitterName = formData.submitterName || 'Anonymous';
  const timestamp = new Date().toISOString();
  
  let mainSheet = spreadsheet.getSheetByName('Nominations Summary');
  if (!mainSheet) {
    mainSheet = spreadsheet.insertSheet('Nominations Summary');
    setupMainSheet(mainSheet);
  }
  
  let detailsSheet = spreadsheet.getSheetByName('Detailed Submissions');
  if (!detailsSheet) {
    detailsSheet = spreadsheet.insertSheet('Detailed Submissions');
    setupDetailsSheet(detailsSheet);
  }
  
  addDetailedSubmission(detailsSheet, formData, timestamp);
  updateNominationCounts(mainSheet, formData);
}

function setupMainSheet(sheet) {
  sheet.clear();
  sheet.getRange('A1:C1').setValues([['Officer Position', 'Nominee', 'Total Nominations']]);
  sheet.getRange('A1:C1').setFontWeight('bold');
  sheet.getRange('A1:C1').setBackground('#0033A0');
  sheet.getRange('A1:C1').setFontColor('#FFFFFF');
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 150);
}

function setupDetailsSheet(sheet) {
  sheet.clear();
  sheet.getRange('A1:F1').setValues([['Timestamp', 'Submitter Name', 'Officer Position', 'Nominee', 'Signature', 'Submitted At']]);
  sheet.getRange('A1:F1').setFontWeight('bold');
  sheet.getRange('A1:F1').setBackground('#FFD100');
  sheet.getRange('A1:F1').setFontColor('#0033A0');
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 200);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 180);
}

function addDetailedSubmission(sheet, formData, timestamp) {
  const submitterName = formData.submitterName || 'Anonymous';
  const submittedAt = formData.submittedAt || timestamp;
  const signature = formData.signature || '';
  
  if (formData.nominations) {
    Object.keys(formData.nominations).forEach(position => {
      const nominations = formData.nominations[position];
      if (nominations && nominations.length > 0) {
        nominations.forEach(nomination => {
          if (nomination.name && nomination.name.trim() !== '') {
            sheet.appendRow([
              timestamp,
              submitterName,
              position,
              nomination.name,
              signature,
              submittedAt
            ]);
          }
        });
      }
    });
  }
}

function updateNominationCounts(sheet, formData) {
  const data = sheet.getDataRange().getValues();
  const existing = {};
  
  for (let i = 1; i < data.length; i++) {
    const [position, nominee, count] = data[i];
    if (!existing[position]) existing[position] = {};
    existing[position][nominee] = parseInt(count) || 0;
    }

  if (formData.nominations) {
    Object.keys(formData.nominations).forEach(position => {
      if (!existing[position]) existing[position] = {};
      formData.nominations[position].forEach(nom => {
        if (nom.name && nom.name.trim()) {
          const name = nom.name.trim();
          existing[position][name] = (existing[position][name] || 0) + 1;
          }
        });
    });
  }
  
  if (data.length > 1) {
    sheet.getRange(2, 1, data.length - 1, 3).clear();
  }
  
  const newData = [];
  Object.keys(existing).sort().forEach(position => {
    Object.keys(existing[position]).sort().forEach(nominee => {
      newData.push([position, nominee, existing[position][nominee]]);
    });
  });
  
  if (newData.length > 0) {
    sheet.getRange(2, 1, newData.length, 3).setValues(newData);
    for (let i = 0; i < newData.length; i++) {
      if (i % 2 === 0) {
        sheet.getRange(i + 2, 1, 1, 3).setBackground('#F8F9FA');
      }
    }
  }
}
