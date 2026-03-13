// Updated Google Sheets API endpoint for handling both contact form and property inquiry
function doPost(e) {
  try {
    Logger.log('Received request: ' + e.postData.contents);
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(e.postData.contents);
    
    // Get current timestamp
    const timestamp = new Date().toISOString();
    
    // Determine which sheet to use based on data
    let targetSheet;
    
    if (data.propertyId) {
      Logger.log('Property inquiry detected');
      
      // Property inquiry - use or create a sheet for this property
      const propertyName = `Property_${data.propertyId}`;
      targetSheet = sheet.getSheetByName(propertyName);
      
      if (!targetSheet) {
        Logger.log('Creating new sheet: ' + propertyName);
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
      Logger.log('Appending data to property sheet');
      targetSheet.appendRow([
        timestamp,
        data.name || '',
        data.email || '',
        data.phone || '',
        data.message || '',
        data.propertyId,
        data.propertyTitle || '',
        data.propertyLink || ''
      ]);
      
    } else {
      Logger.log('Contact form submission detected');
      
      // Contact form - use main Contact sheet or create it
      targetSheet = sheet.getSheetByName('Contact');
      if (!targetSheet) {
        Logger.log('Creating new Contact sheet');
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
      Logger.log('Appending data to Contact sheet');
      targetSheet.appendRow([
        timestamp,
        data.name || '',
        data.email || '',
        data.contactNumber || '',
        data.location || '',
        data.query || ''
      ]);
    }
    
    Logger.log('Data saved successfully');
    
    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: 'Data saved successfully' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    
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

// Function to log active sheets (for debugging)
function logActiveSheets() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = sheet.getSheets();
  
  Logger.log('Active sheets:');
  sheets.forEach(s => {
    Logger.log('- ' + s.getName());
  });
}