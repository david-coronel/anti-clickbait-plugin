async function fetchHTML(url) {
  try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();
      return text;
  } catch (error) {
      console.error(`Failed to fetch page at ${url}:`, error);
      return null;
  }
}

async function scrapeTitlesAndLinks() {
  const titles = [];
  const links = [];
  const htmlCollection = document.querySelectorAll('h2, h4');

  htmlCollection.forEach(element => {
      const linkElement = element.querySelector('a') || element.previousElementSibling?.tagName === 'A' && element.previousElementSibling;

      if (linkElement) {
          titles.push(element.textContent.trim());
          links.push(linkElement.href);
      }
  });

  const pagesHTML = await Promise.all(links.map(link => fetchHTML(link)));

  return titles.map((title, index) => ({
      title: title,
      url: links[index],
      pageHTML: pagesHTML[index]
  }));
}

scrapeTitlesAndLinks().then(data => {
  console.log(data);
});
