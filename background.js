console.log("Background script running...");

// Function to update all tab titles with their index numbers
function updateAllTabTitles() {
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach((tab, index) => {
      const tabNumber = index + 1; // Start counting from 1
      
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: updateTabTitle,
        args: [tabNumber, tab.title]
      }).catch(error => {
        // Some tabs like chrome:// pages can't be modified - just log the error
        console.log(`Couldn't update tab ${tab.id}: ${error.message}`);
      });
    });
  });
}

// Function that runs in the context of the tab
function updateTabTitle(number, originalTitle) {
  // Extract original title without any previous numbering
  let cleanTitle = originalTitle;
  // If title already has a number prefix like "X. ", remove it
  if (/^\d+\.\s/.test(originalTitle)) {
    cleanTitle = originalTitle.replace(/^\d+\.\s/, '');
  }
  
  // Set the new numbered title
  document.title = number + ". " + cleanTitle;
  return document.title;
}

// Update titles when extension loads
updateAllTabTitles();

// Listen for tab events
chrome.tabs.onCreated.addListener(() => {
  // When a new tab is created, update all tabs
  setTimeout(updateAllTabTitles, 500); // slight delay to ensure tab is ready
});

chrome.tabs.onRemoved.addListener(() => {
  // When a tab is closed, update all remaining tabs
  updateAllTabTitles();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // Only update if the title changed
  if (changeInfo.title) {
    updateAllTabTitles();
  }
});