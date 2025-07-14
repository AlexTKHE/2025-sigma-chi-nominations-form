# Secure Setup for Sigma Chi Nomination Form

## Understanding the Permissions

When you deploy a Google Apps Script, it asks for broad permissions because Google Apps Script can potentially access any Google Sheet. However, our script is designed to only access your specific spreadsheet.

## Option 1: Current Setup (Recommended for simplicity)

The current setup is secure because:
- ✅ Only accesses the specific spreadsheet ID you provide
- ✅ Only creates/modifies sheets named "Nominations Summary" and "Detailed Submissions"
- ✅ Uses your Google account, so you control the access

**To make it more secure:**
1. Make sure only YOU have edit access to the Google Sheet
2. Share the sheet with "View only" for others who need to see results
3. The script will only work with your specific spreadsheet

## Option 2: Service Account (Advanced - More Secure)

If you want even more restricted permissions, you can use a service account:

### Step 1: Create a Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Go to "IAM & Admin" > "Service Accounts"
5. Create a new service account
6. Download the JSON key file

### Step 2: Share Your Sheet
1. Open your Google Sheet
2. Click "Share" button
3. Add the service account email (ends with @project-id.iam.gserviceaccount.com)
4. Give it "Editor" access

### Step 3: Update the Script
Replace the current script with a version that uses the service account credentials.

## Option 3: Manual Setup (Most Secure)

If you're concerned about permissions, you can:

1. **Create the sheets manually** in your Google Sheet:
   - "Nominations Summary" with headers: Officer Position | Nominee | Total Nominations
   - "Detailed Submissions" with headers: Timestamp | Submitter | Position | Nominee | Signature | Submitted At

2. **Use a simpler script** that only appends data (no sheet creation)

## Current Security Features

The current script includes:
- ✅ Specific spreadsheet ID validation
- ✅ Error handling for access issues
- ✅ Only modifies specific sheet names
- ✅ Input validation

## Recommended Approach

For your Sigma Chi nomination form, **Option 1 (current setup)** is recommended because:
- It's simple to set up
- It's secure enough for your use case
- You control the Google Sheet access
- The script only works with your specific sheet

## Testing Security

You can test that the script only accesses your sheet:
1. Try changing the SPREADSHEET_ID to a fake ID
2. The script will fail with an error
3. This proves it's not accessing other sheets

## If You're Still Concerned

1. **Use a dedicated Google account** just for this project
2. **Create a new Google Sheet** specifically for nominations
3. **Don't share the sheet** with anyone else
4. **Export results manually** when needed

The current setup is secure and appropriate for a fraternity nomination form. The broad permissions message is a Google limitation, but the actual script behavior is restricted to your specific sheet. 