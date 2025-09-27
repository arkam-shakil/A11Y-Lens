(function () {
	// Unique class for highlighted elements
	const HIGHLIGHT_CLASS = "___bookmarklet_highlight___";

	// State
	let captureMode = false;
	let clickHandlerAttached = false;

	// Create and inject highlight CSS if not already present
	if (!document.getElementById("___bookmarklet_highlight_style___")) {
		const style = document.createElement("style");
		style.id = "___bookmarklet_highlight_style___";
		style.textContent = `
			.${HIGHLIGHT_CLASS} {
				outline: 5px solid red !important;
			}
			.___bookmarklet_message___, .___bookmarklet_message___.show {
				position: absolute;
				left: -9999px;
				top: auto;
				width: 1px;
				height: 1px;
				overflow: hidden;
			}
		`;
		document.head.appendChild(style);
	}

	// Show floating message
	function showMessage(msg) {
		let box = document.createElement("div");
		box.className = "___bookmarklet_message___";
		box.textContent = msg;
		box.setAttribute("role", "alert");
		document.body.appendChild(box);

		requestAnimationFrame(() => box.classList.add("show"));
		setTimeout(() => {
			box.classList.remove("show");
			setTimeout(() => box.remove(), 300);
		}, 1500);
	}

	// Click handler when capture mode is active
	function captureClick(e) {
		e.preventDefault();
		e.stopPropagation();

		// Add highlight
		e.target.classList.add(HIGHLIGHT_CLASS);

		// Determine element "name"
		let name =
			e.target.getAttribute("name") ||
			e.target.innerText ||
			e.target.getAttribute("id") ||
			e.target.tagName.toLowerCase();
		showMessage(`Highlight added around element with name "${name}"`);
	}

	// Toggle capture mode
	function toggleCapture() {
		captureMode = !captureMode;
		if (captureMode && !clickHandlerAttached) {
			document.addEventListener("click", captureClick, true);
			clickHandlerAttached = true;
			showMessage("Capture mode enabled");
		} else if (!captureMode && clickHandlerAttached) {
			document.removeEventListener("click", captureClick, true);
			clickHandlerAttached = false;
			showMessage("Capture mode disabled");
		}
	}

	// Remove all highlights
	function removeHighlights() {
		const els = document.querySelectorAll("." + HIGHLIGHT_CLASS);
		let count = els.length;
		els.forEach((el) => el.classList.remove(HIGHLIGHT_CLASS));
		showMessage(`Removed highlight from ${count} elements`);
	}

	// Attach keydown listener once
	if (!window.___bookmarklet_listener_attached___) {
		window.addEventListener("keydown", (e) => {
			if (e.altKey && e.code === "KeyC") {
				e.preventDefault();
				toggleCapture();
			}
			if (e.altKey && e.code === "KeyR") {
				e.preventDefault();
				removeHighlights();
			}
		});
		window.___bookmarklet_listener_attached___ = true;
		showMessage("Bookmarklet active: ALT+C to toggle, ALT+R to clear");
	}
})();
