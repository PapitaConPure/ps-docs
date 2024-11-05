var currentPage;
var currentFocused;

/**
 * @param {HTMLElement} main
 * @param {string} html
 */
function prepareMain(main, html) {
	main.id = 'content';
	document.body.onkeydown = function(e) {
		const key = e.key;
		
		switch(key.toLowerCase()) {
		case 'enter':
			if(document.activeElement.tagName.toLowerCase() === 'button') {
				document.activeElement.click();
				return false;
			}

		case 'a':
		case 'z':
		case 'r':
			const elements = document.querySelectorAll('button[href]');
			if(!elements.length) return true;
			
			if(elements.length === 1) {
				elements[0].click();
				return false;
			}

			if(currentFocused < elements.length - 1)
				currentFocused++;
			else
				currentFocused = 0;

			elements[currentFocused].focus();
			return false;
			
		case 's':
		case 'x':
		case 'h':
			document.querySelector('button[page]')?.click();
			return false;
		}
	}

	if(!html) return main;
	
	const innerMainHTML = html.trim()
		.replace(/^<main[A-Za-z0-9=\"\'()\s]*>/, '')
		.replace(/<\/main>$/, '');
	main.innerHTML = innerMainHTML;
	
	//Configurar botones internos en nuevo contenido de página
	main.querySelectorAll('button[page]').forEach(button => {
		button.addEventListener('click', async () => {
			const page = button.getAttribute('page');
			await loadPage(page);
			return false;
		});
	});
	
	//Configurar botones internos en nuevo contenido de página
	main.querySelectorAll('button[href]').forEach(button => {
		button.addEventListener('click', async () => {
			const href = button.getAttribute('href');
			window.open(href, '_blank', );
			return false;
		});
	});

	return main;
}

//Asegurar que exista una etiqueta main de contenido de página válida
(() => {
	let main = document.getElementById('content') || document.getElementsByTagName('main').item(0);
	if(!main)
		main = document.createElement('main');
	prepareMain(main);
	document.body.appendChild(main);
})();

/**
 * Carga una nueva etiqueta main con nuevo contenido de página, intercambiándola por la anterior etiqueta main de contenido
 * @param {string} page 
 * @param {number} x 
 * @param {number} y 
 */
async function loadPage(page, x = null, y = null) {
	if(!page)
		throw new TypeError('Page path string was not provided');

	if(!page.endsWith('.html'))
		page += '.html';

	if(currentPage === page)
		return;

	currentPage = page;
	currentFocused = -1;

	try {
		const main = document.getElementById('content');
		if(!main)
			throw new TypeError('Page content element was not found');

		//Fallback a página de 404
		let response = await fetch(`pages/${page}`);
		if(response.status === 404) {
			console.error(`Page: ${page}`);
			response = await fetch('pages/404.html');
		}
		
		//Preparar nueva página
		const newMain = document.createElement('main');
		const newMainHTML = await response.text();
		prepareMain(newMain, newMainHTML);

		//Intercambiar contenidos de página
		document.body.insertBefore(newMain, main);
		main.remove();
	} catch(error) {
		console.error(error);
	}
}

//Modificar URL y título
(async () => {
	const response = await fetch('index.html');
	const data = await response.text();
	const html = document.createElement('html');
	html.innerHTML = data;

	document.title = html.getElementsByTagName('title').item(0).textContent;
	window.history.replaceState({}, '', './');
})();
