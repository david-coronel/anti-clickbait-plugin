// Global Variables
let articles = [];
let contents = [];
let page_average = '';

const promptEditorPorcentaje = `Se te va a compartir el título, contenido y nivel engañoso de una nota. Ese nivel engañoso será bajo (menos del 50%) o alto (más del 50%).

Vos deberás proporcionar el porcentaje exacto de Clickbait/nivel de engaño de la nota respetando ese nivel bajo/alto y teniendo en cuenta:

 0. Sensacionalismo del Título: El uso de palabras como "grave problema" para atraer clics.
 0. Desconexión con el Contenido: Si el problema mencionado no es tan serio como el título sugiere.
 0. Expectativa vs. Realidad: La expectativa generada por el título frente a la realidad descrita en el artículo.
 1. Relevancia del Título: El título refleja el contenido del artículo, aunque con exageración.
 2. Profundidad del Contenido: El artículo aborda el tema mencionado en el título, pero con menor gravedad.
 3. Coherencia: El problema se menciona, pero la percepción del lector sobre su gravedad puede diferir de lo sugerido en el título.;
`;
const promptAsistenteRedaccion = `Sos un chatbot que recibe el título y el contenido de una noticia. Tu tarea es identificar si el título es clickbait, es decir, si es engañoso con respecto al contenido, o impreciso, o muy subjetivo. Vas a responder únicamente con otro título para la noticia. Si el título original es muy clickbait, vas a responder con un título nuevo, modificado, con el mismo estilo que el original pero más acurado al contenido de la noticia. Si el título original no es demasiado engañoso, vas a responder con ese mismo título sin modificarlo.`;

async function main() {
  
  countH2Elements();
  await processArticles(); // Await to ensure async behavior
}

// Count number of H2 elements on the page
function countH2Elements() {
  const h2Count = document.getElementsByTagName('h2').length;
  console.log(`Number of h2 elements on this page: ${h2Count}`);
}

// Get and process articles
async function processArticles() {
  const h2Elements = document.getElementsByTagName('h2');
  const firsts = Array.from(h2Elements).slice(0, 3);
  
  for (const element of firsts) {
    const title = element.textContent.trim();
    const parentLink = findNearestLink(element);
    const content = extractReadableContent(getContent(parentLink));
    
    // Call AI for new title
    const new_title = await getNewTitle(title, content); // Awaiting async call

    

    // Determine engañosoMensaje based on whether new_title is different from title
    let engañosoMensaje = '';
    if (new_title !== title) {
      engañosoMensaje = "Tiene un porcentaje engañoso alto";
    } else {
      engañosoMensaje = "Tiene un porcentaje engañoso bajo";
    }

    // Construct userPrompt for callOpenAISync
    const userPrompt = `${engañosoMensaje}\nTitulo: ${title}\nContenido: ${content}`;
    let percents_text = callOpenAISync('gpt-3.5-turbo', promptEditorPorcentaje, userPrompt); // Await async function
    percents_text = percents_text.match(/\d+(?=%)/g);

    const newTitleElement = document.createElement('h2');
    newTitleElement.textContent = new_title;
    if (percents_text >= 70) {
      newTitleElement.style.color  = 'rgba(255, 0, 0, 0.5)'; // Red with 30% opacity
    } else if (percents_text >= 30 && percents_text < 70) {
        newTitleElement.style.color  = 'orange'; // Yellow with 30% opacity
    } else {
        newTitleElement.style.color  = 'rgba(0, 255, 0, 0.5)'; // Green with 30% opacity
    }  
    element.parentNode.insertBefore(newTitleElement, element);


    let overlayNumber = document.createElement('div');
    overlayNumber.textContent = percents_text + "%";
    overlayNumber.style.position = 'absolute';
    overlayNumber.style.top = '0';
    overlayNumber.style.left = '0';
    overlayNumber.style.width = '100%';
    overlayNumber.style.height = '100%';
    overlayNumber.style.display = 'flex';
    overlayNumber.style.justifyContent = 'center';
    overlayNumber.style.alignItems = 'center';
    overlayNumber.style.fontSize = '120px';
    if (percents_text >= 70) {
      overlayNumber.style.color = 'rgba(255, 0, 0, 0.5)'; // Red with 30% opacity
    } else if (percents_text >= 30 && percents_text < 70) {
        overlayNumber.style.color = 'orange'; // Yellow with 30% opacity
    } else {
        overlayNumber.style.color = 'rgba(0, 255, 0, 0.5)'; // Green with 30% opacity
    }  
    overlayNumber.style.zIndex = '2';
    overlayNumber.style.pointerEvents = 'none'; // Allows clicking through the overlay
    element.appendChild(overlayNumber);

    articles.push({
      element,
      title: new_title || title,
      link: parentLink,
      content,
      content_length: content.length,
      percents: percents_text
    });
  }

  page_average = calculateAverage(articles, 'percents');
  sendMessageToPopup(`${Math.trunc(page_average * 100) / 100}%`);
}

// Get new title using OpenAI API
async function getNewTitle(title, content) {
  const userPrompt = `${title}\nContenido: ${content}`;
  const newTitle =callOpenAISync('ft:gpt-3.5-turbo-0613:personal:chat-clickbait-news:A2lYZmqj', promptAsistenteRedaccion, userPrompt);
  return newTitle;
}

// Find nearest link to the H2 element
function findNearestLink(element) {
  const childLink = element.querySelector('a[href]');
  if (childLink) return childLink.href;

  let currentElement = element;
  while (currentElement && currentElement.tagName !== 'BODY') {
    if (currentElement.tagName === 'A' && currentElement.href) return currentElement.href;
    currentElement = currentElement.parentElement;
  }
  return null;
}

// Make synchronous API call to OpenAI
function callOpenAISync(model, systemPrompt, userPrompt) {
  let result = null;
  let error = null;
  let apiKey = 'YOUR_API_KEY'; // Reemplaza con tu clave de API real
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
    model: model,
    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    temperature: 0.7
  });

  try {
    xhr.send(data);
  } catch (e) {
    error = e.toString();
  }

  if (error) {
    console.log(error);
  }

  return result;
}

// Fetch article content from URL
function getContent(url) {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);

    return xhr.status === 200 ? xhr.responseText : `Error: ${xhr.status} ${xhr.statusText}`;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

// Extract readable content from HTML
function extractReadableContent(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  doc.querySelectorAll('script, style, link, meta, noscript, iframe').forEach(el => el.remove());

  return extractText(doc.body).replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim();
}

function extractText(element) {
  if (element.nodeType === Node.TEXT_NODE) return element.textContent.trim();
  if (element.nodeType !== Node.ELEMENT_NODE) return '';

  const tag = element.tagName.toLowerCase();
  if (['script', 'style', 'link', 'meta', 'noscript', 'iframe'].includes(tag)) return '';

  return Array.from(element.childNodes).map(extractText).join(' ').trim();
}

// Calculate the average of a key in an array of objects
function calculateAverage(objects, key) {
  if (!objects.length) return 0;

  const sum = objects.reduce((acc, obj) => {
    const value = parseFloat(obj[key]) || 0;
    return acc + value;
  }, 0);

  return sum / objects.length;
}

// Send a message to the popup
function sendMessageToPopup(message) {
  chrome.runtime.sendMessage({ message });
}

// Run the function when the page loads
window.addEventListener('load', main);
