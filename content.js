articles = []
contents = []

function main(){
  countH2Elements();
  get_articles();
}

page_average = ''

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
    new_title = '' //callOpenAISync(promptAsistenteRedaccion + ' Titulo:' + title + " Contenido: " + content);
    percents_text = callOpenAISync(promptEditorPorcentaje + ' Titulo:' + title + " Contenido: " + content);
    percents_int = percents_text.match(/\d+(?=%)/g);

    let overlayNumber = document.createElement('div');
    overlayNumber.textContent = percents_int[0] + "%";
    overlayNumber.style.position = 'absolute';
    overlayNumber.style.top = '0';
    overlayNumber.style.left = '0';
    overlayNumber.style.width = '100%';
    overlayNumber.style.height = '100%';
    overlayNumber.style.display = 'flex';
    overlayNumber.style.justifyContent = 'center';
    overlayNumber.style.alignItems = 'center';
    overlayNumber.style.fontSize = '120px';
    if (percents_int[0] >= 70) {
      overlayNumber.style.color = 'rgba(255, 0, 0, 0.5)'; // Red with 30% opacity
    } else if (percents_int[0] >= 30 && percents_int[0] < 70) {
        overlayNumber.style.color = 'rgba(255, 255, 0, 0.5)'; // Yellow with 30% opacity
    } else {
        overlayNumber.style.color = 'rgba(0, 255, 0, 0.5)'; // Green with 30% opacity
    }  
    overlayNumber.style.zIndex = '2';
    overlayNumber.style.pointerEvents = 'none'; // Allows clicking through the overlay
    element.appendChild(overlayNumber);

    articles.push({
      'element': element,
      'title': title,
      'link': parentLink,
      'content': content,
      'content_length': content.length,
      'new_title': new_title,
      'percents': percents_text,
      'clickbait': percents_int[0],
      'relacion': percents_int[1],
      }
    )
  });

  console.log(articles);
  page_average = calculateAverage(articles,'clickbait');
  console.log('El promedio de clickbait es:' + page_average);  
  let trunc = Math.trunc(page_average * 100) / 100;
  sendMessageToPopup(trunc + "%");
  console.log('Message sent ' + trunc + "%")
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

Deberas proporcionar el porcentaje de Clickbait de la nota y, por otro lado la relación entre el titulo y el cuerpo de la siguiente forma:

1. Porcentaje de Clickbait:

2. El titulo y el cuerpo tienen una relacion del:

En caso que el título y el contenido tengan una diferencia entre 70% y 100%, sugerir un título nuevo respetándo las reglas de SEO. 

Para analizar tanto el porcentaje de clickbait como la relacion entre titulo y cuerpo debes tener en cuenta esto:

Porcentaje de Clickbait:

 0. Sensacionalismo del Título: El uso de palabras como "grave problema" para atraer clics.
 0. Desconexión con el Contenido: Si el problema mencionado no es tan serio como el título sugiere.
 0. Expectativa vs. Realidad: La expectativa generada por el título frente a la realidad descrita en el artículo.

Relación Título-Cuerpo:

 1. Relevancia del Título: El título refleja el contenido del artículo, aunque con exageración.
 2. Profundidad del Contenido: El artículo aborda el tema mencionado en el título, pero con menor gravedad.
 3. Coherencia: El problema se menciona, pero la percepción del lector sobre su gravedad puede diferir de lo sugerido en el título.`;

let promptAsistenteRedaccion = `Tenés el título y el contenido de una noticia. Escaneá ambos para determinar si están relacionados o si el título es clickbait. Si el título es clickbait, devolvé una versión modificada que refleje con mayor precisión el contenido de la noticia. Si no es clickbait, devolvé el título tal como está.`;


apiKey = 'replace_key'

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

function calculateAverage(objects, key) {
  if (objects.length === 0) return 0;
  
  const sum = objects.reduce((acc, obj) => {
    const value = obj[key];
    if (typeof value === 'number') {
      return acc + value;
    } else if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? acc : acc + num;
    }
    return acc;
  }, 0);
  
  return sum / objects.length;
}

// Function to send a message to the popup
function sendMessageToPopup(message) {
  chrome.runtime.sendMessage({ message: message });
}


// Run the function when the page loads
window.addEventListener('load', main);