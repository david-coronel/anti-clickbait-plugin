chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message) {
      document.getElementById('percentage').textContent = request.message;
    }
  });
  