(function () {
	let count = 1;

	function isVisible(el) {
		const style = getComputedStyle(el);
		if (
			style.display === 'none' ||
			style.visibility === 'hidden' ||
			style.opacity === '0' ||
			el.hasAttribute('aria-hidden')
		) return false;
		const rect = el.getClientRects();
		if (!rect.length || el.offsetWidth === 0 || el.offsetHeight === 0) return false;
		return true;
	}

	function getFocusableElements(doc) {
		const selector = `
			a[href]:not([tabindex="-1"]),
			area[href]:not([tabindex="-1"]),
			input:not([disabled]):not([tabindex="-1"]),
			select:not([disabled]):not([tabindex="-1"]),
			textarea:not([tabindex="-1"]),
			button:not([disabled]):not([tabindex="-1"]),
			iframe:not([tabindex="-1"]),
			[tabindex]:not([tabindex="-1"]),
			[contenteditable="true"]:not([tabindex="-1"])
		`;
		let raw = Array.from(doc.querySelectorAll(selector)).filter(el => isVisible(el));
		let list = [];

		for (const el of raw) {
			if (el.tagName.toLowerCase() === 'iframe') {
				list.push({ el, doc });
				try {
					if (el.contentDocument && el.contentWindow) {
						const nested = getFocusableElements(el.contentDocument);
						list.push(...nested);
					}
				} catch (e) {
					console.warn('Cross-origin iframe skipped:', el);
				}
			} else {
				list.push({ el, doc });
			}
		}
		return list;
	}

	function sortByTabOrder(focusables) {
		const withPositive = focusables.filter(f => +f.el.tabIndex > 0).sort((a, b) => a.el.tabIndex - b.el.tabIndex);
		const normal = focusables.filter(f => f.el.tabIndex === 0 || !f.el.hasAttribute('tabindex'));
		return [...withPositive, ...normal];
	}

	function insertBadge(el, number, doc) {
		const badge = doc.createElement('span');
		badge.textContent = `[${number}]`;
		badge.className = 'a11y-focus-tracer-badge';
		badge.style.position = 'absolute';
		badge.style.top = '0';
		badge.style.left = '0';
		badge.style.background = '#fff';
		badge.style.border = '1px solid #333';
		badge.style.color = '#000';
		badge.style.fontSize = '11px';
		badge.style.fontWeight = 'bold';
		badge.style.padding = '2px 4px';
		badge.style.borderRadius = '4px';
		badge.style.zIndex = '2147483647';
		badge.style.fontFamily = 'monospace';
		badge.style.boxShadow = '0 1px 3px rgba(0,0,0,0.4)';
		badge.style.pointerEvents = 'none';

		const tag = el.tagName.toLowerCase();
		const needsSibling = ['input', 'select', 'textarea', 'iframe'].includes(tag);

		if (needsSibling) {
			const parent = el.parentElement;
			if (!parent) return;

			parent.style.position = 'relative';
			parent.prepend(badge);

			const rect = el.getBoundingClientRect();
			badge.style.position = 'absolute';
			badge.style.left = el.offsetLeft + 'px';
			badge.style.top = el.offsetTop + 'px';
		} else {
			const computed = getComputedStyle(el);
			if (computed.position === 'static') {
				el.style.position = 'relative';
			}
			el.prepend(badge); // PREPEND instead of append
		}
	}

	const flatList = getFocusableElements(document);
	const ordered = sortByTabOrder(flatList);

	for (const item of ordered) {
		insertBadge(item.el, count++, item.doc);
	}
})();