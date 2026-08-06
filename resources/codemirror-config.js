import { ZINE_BOILERPLATE, getBoilerplateCursorPos } from './constants.js';
import { loadContent, loadEditorSettings, saveEditorSetting } from './storage.js';
import { getAvailableFontFamilies } from './font-registry.js';

let lineNumbersCompartment;
let lineWrappingCompartment;
let showLineNumbers = false;
let enableLineWrapping = false;

function compareNatural(a, b) {
	return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

const fontFamilies = getAvailableFontFamilies().sort(compareNatural);
let fontPickerState = null; // { selectedIndex, originalTail, fonts }
let applyingFont = false; // suppresses the filter refresh our own edits would trigger
let updatePreviewCb = null;

function isInCSSContext(state, pos) {
	const before = state.doc.sliceString(0, pos);

	// Inside an open <style> block?
	const styleOpen = before.lastIndexOf('<style');
	if (styleOpen !== -1 && before.lastIndexOf('</style') < styleOpen) {
		const tagEnd = before.indexOf('>', styleOpen);
		if (tagEnd !== -1) return true;
	}

	// Inside an unterminated style="..." attribute of the tag we're still in?
	const tagOpen = before.lastIndexOf('<');
	if (tagOpen === -1) return false;
	const tagText = before.slice(tagOpen);
	if (tagText.includes('>')) return false;
	return /style\s*=\s*(['"])(?:(?!\1)[\s\S])*$/i.test(tagText);
}

function getFontValueRange(state) {
	const pos = state.selection.main.head;
	const line = state.doc.lineAt(pos);
	const text = line.text;
	const propMatch = text.match(/font-family:/i);
	if (!propMatch) return null;
	// anchorPos is right after "font-family:" (dropdown anchors here)
	const anchorPos = line.from + propMatch.index + propMatch[0].length;
	// valueStart skips any whitespace after the colon
	const afterColon = text.slice(propMatch.index + propMatch[0].length);
	const leadingSpace = afterColon.match(/^\s*/)[0].length;
	const valueStart = anchorPos + leadingSpace;
	// A quoted value runs to its closing quote; an unquoted one stops at the
	// first ; or " (the latter ends an inline style="..." attribute)
	const afterValue = text.slice(valueStart - line.from);
	const endMatch = afterValue.match(/^(?:'[^']*'?|"[^"]*"?|[^;"']*);?/);
	const valueEnd = valueStart + (endMatch ? endMatch[0].length : 0);
	return { from: valueStart, to: valueEnd, anchorPos };
}

// Everything the user typed after "font-family:", including leading whitespace
function getTypedTail(state) {
	const range = getFontValueRange(state);
	return range ? state.doc.sliceString(range.anchorPos, range.to) : '';
}

function isQuoteClosed(typedTail) {
	const value = typedTail.trim().replace(/;$/, '').trim();
	const quote = value[0];
	return (quote === "'" || quote === '"') && value.length > 1 && value.endsWith(quote);
}

function matchingFonts(typedTail) {
	const query = typedTail.replace(/[;'"]/g, '').trim().toLowerCase();
	if (!query) return fontFamilies;
	return fontFamilies.filter(font => font.toLowerCase().startsWith(query));
}

function replaceFontValue(view, from, to, text, cursor) {
	applyingFont = true;
	view.dispatch({
		changes: { from, to, insert: text },
		selection: { anchor: cursor }
	});
	applyingFont = false;
	// Immediate preview (bypass debounce)
	clearTimeout(window.updateTimer);
	if (updatePreviewCb) updatePreviewCb(view.state.doc.toString());
}

function applyFont(view, fontName) {
	const range = getFontValueRange(view.state);
	if (!range) return;
	const needsSpace = range.from === range.anchorPos;
	const text = (needsSpace ? ' ' : '') + `'${fontName}';`;
	replaceFontValue(view, range.from, range.to, text, range.from + text.length);
}

// Put back whatever the user had typed before they arrowed into the list
function restoreTypedValue(view) {
	const range = getFontValueRange(view.state);
	if (!range) return;
	const tail = fontPickerState.originalTail;
	replaceFontValue(view, range.anchorPos, range.to, tail, range.anchorPos + tail.length);
}

// Open, re-filter, or dismiss the picker in response to the user's own typing
function refreshFontPicker(view) {
	if (applyingFont) return;
	const range = getFontValueRange(view.state);
	const pos = view.state.selection.main.head;
	if (!range || pos < range.anchorPos || pos > range.to || !isInCSSContext(view.state, range.anchorPos)) {
		closeFontPicker();
		return;
	}
	const typedTail = view.state.doc.sliceString(range.anchorPos, range.to);
	if (isQuoteClosed(typedTail)) {
		closeFontPicker();
		return;
	}
	const fonts = matchingFonts(typedTail);
	if (fonts.length === 0) {
		closeFontPicker();
		return;
	}
	fontPickerState = { selectedIndex: -1, originalTail: '', fonts };
	renderFontPicker(view);
}

export function closeFontPicker() {
	fontPickerState = null;
	document.querySelector('.font-picker-dropdown')?.remove();
}

function renderFontPicker(view) {
	if (!fontPickerState) return;

	let dropdown = document.querySelector('.font-picker-dropdown');
	if (!dropdown) {
		dropdown = document.createElement('div');
		dropdown.className = 'font-picker-dropdown';
		document.getElementById('editor').appendChild(dropdown);
	}

	// Position anchored to right after "font-family:"
	const range = getFontValueRange(view.state);
	const anchorCoords = range && view.coordsAtPos(range.anchorPos);
	if (anchorCoords) {
		const editorRect = view.dom.getBoundingClientRect();
		dropdown.style.left = `${anchorCoords.left - editorRect.left}px`;
		dropdown.style.top = `${anchorCoords.bottom - editorRect.top + 4}px`;
	}

	dropdown.innerHTML = '';
	const ul = document.createElement('ul');
	fontPickerState.fonts.forEach((font, i) => {
		const li = document.createElement('li');
		li.textContent = font;
		if (i === fontPickerState.selectedIndex) li.classList.add('selected');
		li.addEventListener('mousedown', (e) => {
			e.preventDefault();
			if (fontPickerState.selectedIndex === -1) {
				fontPickerState.originalTail = getTypedTail(view.state);
			}
			fontPickerState.selectedIndex = i;
			applyFont(view, font);
			closeFontPicker();
		});
		ul.appendChild(li);
	});
	dropdown.appendChild(ul);

	const selectedLi = ul.children[fontPickerState.selectedIndex];
	if (selectedLi) selectedLi.scrollIntoView({ block: 'nearest' });
	else ul.scrollTop = 0;
}

function cycleFontPickerSelection(view, delta) {
	if (!fontPickerState) return false;
	const fonts = fontPickerState.fonts;
	if (fontPickerState.selectedIndex === -1) {
		fontPickerState.originalTail = getTypedTail(view.state);
	}
	if (fonts.length === 1) {
		applyFont(view, fonts[0]);
		closeFontPicker();
		return true;
	}
	const last = fonts.length - 1;
	const current = fontPickerState.selectedIndex;
	fontPickerState.selectedIndex = current === -1
		? (delta > 0 ? 0 : last)
		: (current + delta + fonts.length) % fonts.length;
	applyFont(view, fonts[fontPickerState.selectedIndex]);
	renderFontPicker(view);
	return true;
}

function moveFontPickerSelection(view, delta) {
	if (!fontPickerState) return false;
	const newIndex = fontPickerState.selectedIndex + delta;
	if (newIndex < -1 || newIndex >= fontPickerState.fonts.length) return true;
	if (fontPickerState.selectedIndex === -1) {
		fontPickerState.originalTail = getTypedTail(view.state);
	}
	fontPickerState.selectedIndex = newIndex;
	if (newIndex === -1) {
		restoreTypedValue(view);
	} else {
		applyFont(view, fontPickerState.fonts[newIndex]);
	}
	renderFontPicker(view);
	return true;
}

export function toggleLineNumbers(editorView) {
	const {lineNumbers} = window.CodeMirror;
	showLineNumbers = !showLineNumbers;
	saveEditorSetting('zine-editor-line-numbers', showLineNumbers);
	editorView.dispatch({
		effects: lineNumbersCompartment.reconfigure(showLineNumbers ? lineNumbers() : [])
	});
}

function createLineWrappingExtension() {
	const {EditorView, Decoration} = window.CodeMirror;

	return [
		EditorView.lineWrapping,
		EditorView.decorations.of((view) => {
			const decorations = [];
			for (let {from, to} of view.visibleRanges) {
				for (let pos = from; pos <= to;) {
					const line = view.state.doc.lineAt(pos);
					const lineText = line.text;
					let indentChars = 0;
					for (let i = 0; i < lineText.length; i++) {
						if (lineText[i] === '\t') {
							indentChars += 2;
						} else if (lineText[i] === ' ') {
							indentChars += 1;
						} else {
							break;
						}
					}
					if (indentChars > 0) {
						const indentDecoration = Decoration.line({
							attributes: {
								style: `text-indent: -${indentChars}ch; padding-left: calc(${indentChars}ch + 6px);`
							}
						});
						decorations.push(indentDecoration.range(line.from));
					}
					pos = line.to + 1;
				}
			}
			return decorations.length > 0 ? Decoration.set(decorations) : Decoration.none;
		}),
	];
}

export function toggleLineWrapping(editorView) {
	enableLineWrapping = !enableLineWrapping;
	saveEditorSetting('zine-editor-line-wrapping', enableLineWrapping);
	const lineWrappingExtension = enableLineWrapping ? createLineWrappingExtension() : [];
	editorView.dispatch({
		effects: lineWrappingCompartment.reconfigure(lineWrappingExtension)
	});
}

// Initialize CodeMirror
export async function initializeCodeMirror(saveToStorageCallback, updatePreviewCallback) {
	if (!window.CodeMirror) {
		setTimeout(() => initializeCodeMirror(saveToStorageCallback, updatePreviewCallback), 100);
		return;
	}

	updatePreviewCb = updatePreviewCallback;

	const {EditorView, EditorState, Compartment, keymap, defaultKeymap, indentWithTab, html, githubDark, indentUnit, placeholder, undo, redo, history, closeBrackets, search, searchKeymap, lineNumbers} = window.CodeMirror;

	const customPhrases = EditorState.phrases.of({
		"Find": "Find..."
	});

	const { content: savedContent, isBoilerplate } = await loadContent();
	const settings = loadEditorSettings();
	showLineNumbers = settings.showLineNumbers;
	enableLineWrapping = settings.enableLineWrapping;

	lineNumbersCompartment = new Compartment();
	lineWrappingCompartment = new Compartment();

	const initialLineWrappingExtension = enableLineWrapping ? createLineWrappingExtension() : [];

	const stateConfig = {
		doc: savedContent,
		extensions: [
			customPhrases,
			history(),
			search(),
			closeBrackets(),
			keymap.of([
				// Font picker keys (only active when picker is open)
				{key: "ArrowDown", run: (view) => moveFontPickerSelection(view, 1)},
				{key: "ArrowUp", run: (view) => moveFontPickerSelection(view, -1)},
				// Tab drives the picker when it's open; falls through to indentWithTab otherwise
				{key: "Tab", run: (view) => cycleFontPickerSelection(view, 1)},
				{key: "Shift-Tab", run: (view) => cycleFontPickerSelection(view, -1)},
				{key: "Enter", run: () => {
					if (!fontPickerState) return false;
					closeFontPicker();
					return true;
				}},
				{key: "Escape", run: (view) => {
					if (!fontPickerState) return false;
					// Escape backs out of a highlighted font, like arrowing all the way up
					if (fontPickerState.selectedIndex !== -1) restoreTypedValue(view);
					closeFontPicker();
					return true;
				}},
				{key: "Mod-z", run: undo},
				{key: "Mod-y", run: redo},
				{key: "Mod-Shift-z", run: redo},
				{key: "Mod-o", run: () => { window.loadFile(); return true; }},
				{key: "Mod-s", run: () => { window.saveFile(); return true; }},
				{key: "F1", run: (view) => { toggleLineNumbers(view); return true; }},
				{key: "F2", run: (view) => { toggleLineWrapping(view); return true; }},
				indentWithTab,
				...searchKeymap.filter(binding => binding.key !== "Mod-f"),
				...defaultKeymap
			]),
			html(),
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					const content = update.state.doc.toString();
					clearTimeout(window.updateTimer);
					window.updateTimer = setTimeout(() => updatePreviewCallback(content), 600);
					saveToStorageCallback(content);

					refreshFontPicker(update.view);
				}
				// Close if the cursor moves off the font-family value
				if (fontPickerState && update.selectionSet && !applyingFont) {
					const range = getFontValueRange(update.state);
					const pos = update.state.selection.main.head;
					if (!range || pos < range.anchorPos || pos > range.to) closeFontPicker();
				}
			}),
			EditorView.inputHandler.of((view, from, to, text) => {
				if (text !== '>') return false;
				const before = view.state.doc.sliceString(Math.max(0, from - 20), from);
				if (before.endsWith('<!')) {
					const startPos = from - 2;
					view.dispatch({
						changes: { from: startPos, to: from, insert: ZINE_BOILERPLATE },
						selection: { anchor: getBoilerplateCursorPos(startPos) }
					});
					return true;
				}
				const match = before.match(/<(style|script)(\s[^>]*)?$/i);
				if (!match) return false;
				const tagName = match[1].toLowerCase();
				const closingTag = `</${tagName}>`;
				view.dispatch({
					changes: { from, to, insert: '>' + closingTag },
					selection: { anchor: from + 1 }
				});
				return true;
			}),
			githubDark,
			indentUnit.of("\t"),
			placeholder("Type <!> to insert zine boilerplate..."),
			EditorView.contentAttributes.of({
				'autocomplete': 'off',
				'autocorrect': 'off',
				'autocapitalize': 'off',
				'spellcheck': 'false'
			}),
			lineNumbersCompartment.of(showLineNumbers ? lineNumbers() : []),
			lineWrappingCompartment.of(initialLineWrappingExtension)
		]
	};

	const editorView = new EditorView({
		state: EditorState.create(stateConfig),
		parent: document.getElementById('editor')
	});

	if (isBoilerplate) {
		editorView.dispatch({
			selection: { anchor: getBoilerplateCursorPos() }
		});
	}

	// Disable browser autocomplete on search panel inputs
	const editorElement = document.getElementById('editor');
	const searchInputObserver = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					const searchInputs = node.querySelectorAll?.('.cm-search input[name="search"], .cm-search input[name="replace"]');
					searchInputs?.forEach(input => input.setAttribute('autocomplete', 'off'));
				}
			}
		}
	});
	searchInputObserver.observe(editorElement, { childList: true, subtree: true });

	return editorView;
}
