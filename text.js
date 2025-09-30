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

	// Show floating message (screen reader friendly)
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

	// Copy text to clipboard
	function copyToClipboard(text) {
		navigator.clipboard.writeText(text).catch(() => {
			// fallback
			const textarea = document.createElement("textarea");
			textarea.value = text;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			textarea.remove();
		});
	}

	// Generate unique selector
	function getUniqueSelector(el) {
		if (el.id) return `#${el.id}`;
		if (el === document.body) return "body";

		let path = [];
		while (el && el.nodeType === 1 && el !== document.body) {
			let selector = el.nodeName.toLowerCase();
			if (el.className) {
				let classes = el.className.trim().split(/\s+/).join(".");
				if (classes) selector += "." + classes;
			}
			let sibling = el;
			let nth = 1;
			while ((sibling = sibling.previousElementSibling)) {
				if (sibling.nodeName.toLowerCase() === el.nodeName.toLowerCase()) nth++;
			}
			selector += `:nth-of-type(${nth})`;
			path.unshift(selector);
			el = el.parentNode;
		}
		return path.length ? path.join(" > ") : null;
	}

	// Remove all highlights
	function removeHighlights() {
		const els = document.querySelectorAll("." + HIGHLIGHT_CLASS);
		let count = els.length;
		els.forEach((el) => el.classList.remove(HIGHLIGHT_CLASS));
		showMessage(`Removed highlight from ${count} elements`);
	}

	// Copy outerHTML
	function copyOuterHTML() {
		const els = document.querySelectorAll("." + HIGHLIGHT_CLASS);
		if (els.length > 0) {
			let htmlList = [];
			els.forEach((el, idx) => {
				htmlList.push(`${idx + 1}. ${el.outerHTML}`);
			});
			copyToClipboard(htmlList.join("\n\n"));
			showMessage(`Copied outerHTML of ${els.length} elements`);
		} else {
			showMessage("No highlights found for source code");
		}
	}

	// Copy unique selectors
	function copySelectors() {
		const els = document.querySelectorAll("." + HIGHLIGHT_CLASS);
		if (els.length > 0) {
			const selectors = Array.from(els).map(getUniqueSelector);
			copyToClipboard(selectors.join(", "));
			showMessage(`Copied selectors of ${els.length} elements`);
		} else {
			showMessage("No highlights found for selectors");
		}
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
			if (e.altKey && e.code === "KeyS") {
				e.preventDefault();
				copyOuterHTML();
			}
			if (e.altKey && e.code === "KeyE") {
				e.preventDefault();
				copySelectors();
			}
		});
		window.___bookmarklet_listener_attached___ = true;
		showMessage(
			"Bookmarklet active: ALT+C toggle, ALT+R clear, ALT+S copy HTML, ALT+E copy selectors"
		);
	}
})();
