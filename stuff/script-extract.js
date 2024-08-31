function extractReadableContent() {
    // Priority order: article tag, main tag, largest content div
    let content = '';
    let contentElement;
  
    // Check for article tag
    contentElement = document.querySelector('article');
    
    // If no article tag, look for main tag
    if (!contentElement) {
      contentElement = document.querySelector('main');
    }
    
    // If still no luck, find the largest div with substantial text
    if (!contentElement) {
      const contentDivs = Array.from(document.getElementsByTagName('div')).filter(div => {
        const text = div.innerText.trim();
        return text.length > 500 && text.split(' ').length > 100;
      });
      
      if (contentDivs.length > 0) {
        contentElement = contentDivs.reduce((largest, current) => 
          current.innerText.length > largest.innerText.length ? current : largest
        );
      }
    }
  
    // Extract content if we found a suitable element
    if (contentElement) {
      // Remove unwanted elements
      const unwantedSelectors = ['script', 'style', 'nav', 'header', 'footer', '.ad', '.advertisement', '.social-share'];
      unwantedSelectors.forEach(selector => {
        contentElement.querySelectorAll(selector).forEach(el => el.remove());
      });
  
      // Extract text content
      content = contentElement.innerText.trim();
  
      // Basic cleaning
      content = content.replace(/\s+/g, ' '); // Replace multiple spaces with single space
      content = content.replace(/\n+/g, '\n\n'); // Replace multiple newlines with double newline
    }
  
    return content;
  }
  
  // Usage
  const readableContent = extractReadableContent();
  console.log(readableContent);
  
  // Optional: Send content to background script if used in a browser extension
  if (typeof browser !== 'undefined' && browser.runtime) {
    browser.runtime.sendMessage({ action: "contentExtracted", content: readableContent });
  }