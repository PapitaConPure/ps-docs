fetch('components/footer.html')
.then(response => response.text())
.then(footer => {
	const template = document.createElement('template');
	template.innerHTML = footer.trim();
	document.body.appendChild(template.content);
})
.catch(console.error);
