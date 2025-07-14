/**
 * Google Apps Script for Sigma Chi Nomination Form
 * This script creates a web API endpoint that receives form data and updates a Google Sheet
 * Organized by officer positions with nomination counts
 */

// Replace this with your actual Google Sheet ID
const SPREADSHEET_ID = '1NlASAq2VJIV9nvR5Z5JO8EOulqYN7lpaRSIkqVb_HoA';

function doPost(e) {
  try {
    // Parse the incoming JSON data
    const formData = JSON.parse(e.postData.contents);
    
    // Validate that we're only accessing our specific spreadsheet
    if (!SPREADSHEET_ID || SPREADSHEET_ID === '1NlASAq2VJIV9nvR5Z5JO8EOulqYN7lpaRSIkqVb_HoA') {
      throw new Error('Invalid spreadsheet ID configuration');
    }
    
    // Get the specific spreadsheet by ID (this is more secure than using active sheet)
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (error) {
      throw new Error('Cannot access the specified spreadsheet. Please check the ID and permissions.');
    }
    
    // Verify we can access the spreadsheet
    if (!spreadsheet) {
      throw new Error('Spreadsheet not found or access denied');
    }
    
    // Process the nominations and update the sheet
    processNominations(spreadsheet, formData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing form data:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to process form data',
        details: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function processNominations(spreadsheet, formData) {
  const submitterName = formData.submitterName || 'Anonymous';
  const timestamp = new Date().toISOString();
  
  // Get or create the main sheet
  let mainSheet = spreadsheet.getSheetByName('Nominations Summary');
  if (!mainSheet) {
    mainSheet = spreadsheet.insertSheet('Nominations Summary');
    setupMainSheet(mainSheet);
  }
  
  // Get or create the detailed submissions sheet
  let detailsSheet = spreadsheet.getSheetByName('Detailed Submissions');
  if (!detailsSheet) {
    detailsSheet = spreadsheet.insertSheet('Detailed Submissions');
    setupDetailsSheet(detailsSheet);
  }
  
  // Add detailed submission record
  addDetailedSubmission(detailsSheet, formData, timestamp);
  
  // Update nomination counts
  updateNominationCounts(mainSheet, formData);
}

function setupMainSheet(sheet) {
  // Clear existing content
  sheet.clear();
  
  // Set up headers
  sheet.getRange('A1:C1').setValues([['Officer Position', 'Nominee', 'Total Nominations']]);
  
  // Style headers
  sheet.getRange('A1:C1').setFontWeight('bold');
  sheet.getRange('A1:C1').setBackground('#0033A0');
  sheet.getRange('A1:C1').setFontColor('#FFFFFF');
  
  // Set column widths
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 150);
}

function setupDetailsSheet(sheet) {
  // Clear existing content
  sheet.clear();
  
  // Set up headers
  sheet.getRange('A1:F1').setValues([['Timestamp', 'Submitter Name', 'Officer Position', 'Nominee', 'Signature', 'Submitted At']]);
  
  // Style headers
  sheet.getRange('A1:F1').setFontWeight('bold');
  sheet.getRange('A1:F1').setBackground('#FFD100');
  sheet.getRange('A1:F1').setFontColor('#0033A0');
  
  // Set column widths
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
  
  // Add each nomination as a separate row
  if (formData.nominations) {
    Object.keys(formData.nominations).forEach(position => {
      const positionNominations = formData.nominations[position];
      if (positionNominations && positionNominations.length > 0) {
        positionNominations.forEach(nomination => {
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
  // Get existing data
  const data = sheet.getDataRange().getValues();
  const existingNominations = {};
  
  // Parse existing nominations (skip header row)
  for (let i = 1; i < data.length; i++) {
    const position = data[i][0];
    const nominee = data[i][1];
    const count = parseInt(data[i][2]) || 0;
    
    if (position && nominee) {
      if (!existingNominations[position]) {
        existingNominations[position] = {};
      }
      existingNominations[position][nominee] = count;
    }
  }
  
  // Add new nominations
  if (formData.nominations) {
    Object.keys(formData.nominations).forEach(position => {
      const positionNominations = formData.nominations[position];
      if (positionNominations && positionNominations.length > 0) {
        if (!existingNominations[position]) {
          existingNominations[position] = {};
        }
        
        positionNominations.forEach(nomination => {
          if (nomination.name && nomination.name.trim() !== '') {
            const nominee = nomination.name.trim();
            existingNominations[position][nominee] = (existingNominations[position][nominee] || 0) + 1;
          }
        });
      }
    });
  }
  
  // Clear existing data (except header)
  if (data.length > 1) {
    sheet.getRange(2, 1, data.length - 1, 3).clear();
  }
  
  // Add updated data
  const newData = [];
  Object.keys(existingNominations).sort().forEach(position => {
    const nominees = existingNominations[position];
    Object.keys(nominees).sort().forEach(nominee => {
      newData.push([position, nominee, nominees[nominee]]);
    });
  });
  
  if (newData.length > 0) {
    sheet.getRange(2, 1, newData.length, 3).setValues(newData);
  }
  
  // Add some styling
  if (newData.length > 0) {
    // Alternate row colors for better readability
    for (let i = 0; i < newData.length; i++) {
      const row = i + 2; // +2 because we start after header
      if (i % 2 === 0) {
        sheet.getRange(row, 1, 1, 3).setBackground('#F8F9FA');
      }
    }
  }
}

function doGet(e) {
  // Handle GET requests (for testing)
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'API is running',
      message: 'Sigma Chi Nomination Form API is active',
      sheets: 'Creates two sheets: Nominations Summary and Detailed Submissions',
      spreadsheetId: SPREADSHEET_ID
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * SECURITY NOTES:
 * 
 * This script only accesses the specific spreadsheet defined by SPREADSHEET_ID.
 * The broad permissions message is a Google Apps Script limitation, but the script
 * is designed to only work with your specific sheet.
 * 
 * To further secure this:
 * 1. Make sure only you have edit access to the Google Sheet
 * 2. The script will only modify sheets named "Nominations Summary" and "Detailed Submissions"
 * 3. Consider using a service account for production use
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Go to https://script.google.com/
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Replace 'YOUR_SPREADSHEET_ID_HERE' with your actual Google Sheet ID
 * 5. Save the project
 * 6. Deploy as a web app:
 *    - Click "Deploy" > "New deployment"
 *    - Choose "Web app" as the type
 *    - Set "Execute as" to "Me"
 *    - Set "Who has access" to "Anyone"
 *    - Click "Deploy"
 * 7. Copy the web app URL and replace 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' in your React app
 * 
 * GOOGLE SHEET STRUCTURE:
 * The script will automatically create two sheets:
 * 
 * 1. "Nominations Summary" - Shows each nominee with their total nomination count:
 *    | Officer Position | Nominee | Total Nominations |
 *    | Consul          | John Doe| 3                 |
 *    | Consul          | Jane Smith| 2               |
 *    | Pro-Consul      | Bob Johnson| 1              |
 * 
 * 2. "Detailed Submissions" - Shows each individual submission:
 *    | Timestamp | Submitter | Position | Nominee | Signature | Submitted At |
 *    | ...       | John      | Consul   | Jane    | [base64]  | ...         |
 * 
 * The script automatically:
 * - Counts nominations for each person
 * - Organizes by officer position
 * - Maintains detailed submission history
 * - Updates counts in real-time
 */ 