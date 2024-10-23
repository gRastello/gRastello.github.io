var presenting = false;
var onDisplay;
var slides;

/* set slide i on display */
function setSlideOnDisplay(i) {
	for (let j = 0; j < slides.length; j++) {
		if (j == i) slides[j].classList.remove("hidden");
		else slides[j].classList.add("hidden");
	}

	slides[i].scrollIntoView({
		behavior: 'smooth',
		block: 'center'
	});
}

/* go to the next or previous slide */
function nextSlide() {
	onDisplay++;
	if (onDisplay >= slides.length) onDisplay = slides.length - 1;
	setSlideOnDisplay(onDisplay);
}

function prevSlide() {
	onDisplay--;
	if (onDisplay < 0) onDisplay = 0;
	setSlideOnDisplay(onDisplay);
}

/* toggle presentation mode */
function togglePresentation() {
	if (presenting) {
		slides.forEach((slide) => slide.classList.remove("hidden"));
		presenting = false;
	} else {
		onDisplay = 0;
		setSlideOnDisplay(onDisplay);
		presenting = true;
	}
}
 
/* keyboard listeners */
document.addEventListener('keydown', (e) => {
	switch (e.code) {
	case "ArrowRight":
		if (presenting) nextSlide();
		break;
	case "ArrowLeft":
		if (presenting) prevSlide();
		break;
	case "KeyS":
		togglePresentation();
		break;
	default:
		break;
	}
});


function init() {
	slides = Array.from(document.querySelectorAll(".slide"));	
}

init();
