// Google Sheets API endpoint for handling both contact form and property inquiry
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(e.postData.contents);
    
    // Get current timestamp
    const timestamp = new Date().toISOString();
    
    // Determine which sheet to use based on data
    let targetSheet;
    if (data.propertyId) {
      // Property inquiry - use or create a sheet for this property
      const propertyName = `Property_${data.propertyId}`;
      targetSheet = sheet.getSheetByName(propertyName);
      if (!targetSheet) {
        targetSheet = sheet.insertSheet(propertyName);
        // Initialize headers for property inquiries
        targetSheet.appendRow([
          'Timestamp',
          'Name',
          'Email',
          'Phone',
          'Message',
          'Property ID',
          'Property Title',
          'Property Link'
        ]);
      }
      // Append inquiry data
      targetSheet.appendRow([
        timestamp,
        data.name,
        data.email,
        data.phone,
        data.message,
        data.propertyId,
        data.propertyTitle,
        data.propertyLink
      ]);
    } else {
      // Contact form - use main Contact sheet or create it
      targetSheet = sheet.getSheetByName('Contact');
      if (!targetSheet) {
        targetSheet = sheet.insertSheet('Contact');
        // Initialize headers for contact form
        targetSheet.appendRow([
          'Timestamp',
          'Name',
          'Email',
          'Contact Number',
          'Location',
          'Query'
        ]);
      }
      // Append contact form data
      targetSheet.appendRow([
        timestamp,
        data.name,
        data.email,
        data.contactNumber,
        data.location || '',
        data.query
      ]);
    }
    
    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: 'Data saved successfully' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error:', error);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Initialize default sheets (run once manually)
function initializeSheets() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create Contact sheet if it doesn't exist
  let contactSheet = sheet.getSheetByName('Contact');
  if (!contactSheet) {
    contactSheet = sheet.insertSheet('Contact');
    contactSheet.appendRow([
      'Timestamp',
      'Name',
      'Email',
      'Contact Number',
      'Location',
      'Query'
    ]);
  }
}