articles = []
contents = []

function main(){
  countH2Elements();
  get_articles();
}


function countH2Elements() {
  const h2Count = document.getElementsByTagName('h2').length;
  console.log(`Number of h2 elements on this page: ${h2Count}`);
}

function get_articles(){
  const h2Elements = document.getElementsByTagName('h2')
  firsts = Array.from(h2Elements).slice(0,3)
  Array.from(firsts).forEach((element, index) => {
    console.log(`${index + 1}. ${element.textContent.trim()}`);
    parentLink = findNearestLink(element)
    content = extractReadableContent(getContent(parentLink))
    title = element.textContent.trim()
    articles.push({
      'title': title,
      'link': parentLink,
      'content': content,
      'content_length': content.length,
      'new_title': callOpenAISync(promptAsistenteRedaccion + ' Titulo:' + title + " Contenido: " + content),
      'percents': callOpenAISync(promptEditorPorcentaje + ' Titulo:' + title + " Contenido: " + content),
      }
    )
  });

  console.log(articles);

}



function findNearestLink(element) {
  // First, search for child links
  const childLink = element.querySelector('a[href]');
  if (childLink) {
    return childLink.href;
  }

  // If no child links, search for parent links
  let currentElement = element;
  while (currentElement !== null && currentElement.tagName !== 'BODY') {
    if (currentElement.tagName === 'A' && currentElement.href) {
      return currentElement.href;
    }
    currentElement = currentElement.parentElement;
  }

  return null;
}

function getContent(url){
  output = '';
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);  // false makes the request synchronous
    xhr.send(null);
  
    if (xhr.status === 200) {
      output = xhr.responseText;
    } else {
      output = 'Error: ' + xhr.status + ' ' + xhr.statusText;
    }
  } catch (error) {
    output = 'Error: ' + error.message;
  }
  return output;
}



function extractReadableContent(htmlString) {
  // Create a new DOMParser
  const parser = new DOMParser();
  
  // Parse the HTML string
  const doc = parser.parseFromString(htmlString, 'text/html');
  
  // Remove scripts, styles, and other non-content elements
  const elementsToRemove = doc.querySelectorAll('script, style, link, meta, noscript, iframe');
  elementsToRemove.forEach(el => el.remove());
  
  // Function to extract text from an element
  function extractText(element) {
    if (element.nodeType === Node.TEXT_NODE) {
      return element.textContent.trim();
    }
    
    if (element.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }
    
    const tag = element.tagName.toLowerCase();
    
    // Ignore certain elements
    if (['script', 'style', 'link', 'meta', 'noscript', 'iframe'].includes(tag)) {
      return '';
    }
    
    let text = '';
    for (let child of element.childNodes) {
      text += extractText(child) + ' ';
    }
    
    // Add line breaks for block-level elements
    if (['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tag)) {
      text += '\n';
    }
    
    return text.trim();
  }
  
  // Extract text from the body
  const readableContent = extractText(doc.body);
  
  // Clean up the extracted text
  return readableContent
    .replace(/\s+/g, ' ')  // Replace multiple spaces with a single space
    .replace(/\n+/g, '\n')  // Replace multiple newlines with a single newline
    .trim();  // Remove leading and trailing whitespace
}


let promptEditorPorcentaje = `Deberias comportarte como un editor de un medio periodístico que es totalmente Anti Clickbait.
Deberas proporcionar el porcentaje de Clickbait de la nota y la realcion entre el titulo y el cuerpo de la siguiente forma:
1. Porcentaje de Clickbait:
2. El titulo y el contenido tienen una relacion del:
En caso que el título y el contenido tengan una diferencia de mas del 50%, sugerir un título correcto (Respetando las reglas de SEO) (Solo poner el titulo sugerido, no explicación)`;

let promptAsistenteRedaccion = `Tenés el título y el contenido de una noticia. Escaneá ambos para determinar si están relacionados o si el título es clickbait. Si el título es clickbait, devolvé una versión modificada que refleje con mayor precisión el contenido de la noticia. Si no es clickbait, devolvé el título tal como está.`;


apiKey = 'replace_your_key'

function callOpenAISync(prompt) {
  let result = null;
  let error = null;

  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api.openai.com/v1/chat/completions', false);  // false makes the request synchronous
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);

  xhr.onload = function() {
    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      result = response.choices[0].message.content;
    } else {
      error = `HTTP error! status: ${xhr.status}`;
    }
  };

  xhr.onerror = function() {
    error = 'Request failed';
  };

  const data = JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{role: "user", content: prompt}],
    temperature: 0.7
  });

  try {
    xhr.send(data);
  } catch (e) {
    error = e.toString();
  }

  if (error) {
    throw new Error(error);
  }

  return result;
}    
 
// Run the function when the page loads
window.addEventListener('load', main);


