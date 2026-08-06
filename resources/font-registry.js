// Font registry - maps font-family names to their file paths and styles
// Fonts are registered using the family names embedded in the font files

const FONT_ENTRIES = [
	{ family: 'Baskervville', file: 'resources/fonts/baskervvile/Baskervville-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Baskervville', file: 'resources/fonts/baskervvile/Baskervville-Italic.ttf', weight: 400, style: 'italic' },
	{ family: 'Baskervville', file: 'resources/fonts/baskervvile/Baskervville-Bold.ttf', weight: 700, style: 'normal' },
	{ family: 'Baskervville', file: 'resources/fonts/baskervvile/Baskervville-BoldItalic.ttf', weight: 700, style: 'italic' },
	{ family: 'Baskervville SemiBold', file: 'resources/fonts/baskervvile/Baskervville-SemiBold.ttf', weight: 600, style: 'normal' },
	{ family: 'Baskervville SemiBold', file: 'resources/fonts/baskervvile/Baskervville-SemiBoldItalic.ttf', weight: 600, style: 'italic' },
	{ family: 'Basteleur Bold', file: 'resources/fonts/basteleur-master/Basteleur-Bold.ttf', weight: 700, style: 'normal' },
	{ family: 'Basteleur Moonlight', file: 'resources/fonts/basteleur-master/Basteleur-Moonlight.ttf', weight: 400, style: 'normal' },
	{ family: 'Avara', file: 'resources/fonts/Avara-master/Avara-Bold.otf', weight: 700, style: 'normal' },
	{ family: 'Avara', file: 'resources/fonts/Avara-master/Avara-BoldItalic.otf', weight: 700, style: 'italic' },
	{ family: 'Avara Black', file: 'resources/fonts/Avara-master/Avara-Black.otf', weight: 900, style: 'normal' },
	{ family: 'Ballet', file: 'resources/fonts/Ballet/Ballet_28pt-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Bitcount Single', file: 'resources/fonts/Bitcount_Single/BitcountSingle-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Cut Me Out 2', file: 'resources/fonts/CutMeOut/CutMeOut2.ttf', weight: 400, style: 'normal' },
	{ family: 'Elb-Tunnel', file: 'resources/fonts/ElbtunnelTT/Elb-Tunnel.ttf', weight: 400, style: 'normal' },
	{ family: 'Elb-Tunnel Schatten', file: 'resources/fonts/ElbtunnelTT/Elb-Tunnel Schatten.ttf', weight: 400, style: 'normal' },
	{ family: 'Eagle Lake', file: 'resources/fonts/Eagle_Lake/EagleLake-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Eureka', file: 'resources/fonts/Eureka/Eureka.ttf', weight: 400, style: 'normal' },
	{ family: 'Feroniapi', file: 'resources/fonts/feroniapi-main/Feroniapi-MediumItalic.otf', weight: 500, style: 'italic' },
	{ family: 'Geostar Fill', file: 'resources/fonts/Geostar_Fill/GeostarFill-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Hyper Scrypt', file: 'resources/fonts/Hyper-Scrypt-master/HyperScrypt.otf', weight: 400, style: 'normal' },
	{ family: 'IBM Plex Serif', file: 'resources/fonts/IBM_Plex_Serif/IBMPlexSerif-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'IBM Plex Serif', file: 'resources/fonts/IBM_Plex_Serif/IBMPlexSerif-Italic.ttf', weight: 400, style: 'italic' },
	{ family: 'IBM Plex Serif', file: 'resources/fonts/IBM_Plex_Serif/IBMPlexSerif-Bold.ttf', weight: 700, style: 'normal' },
	{ family: 'IBM Plex Serif', file: 'resources/fonts/IBM_Plex_Serif/IBMPlexSerif-BoldItalic.ttf', weight: 700, style: 'italic' },
	{ family: 'Indira K', file: 'resources/fonts/Indira_K/Indira_K.ttf', weight: 400, style: 'normal' },
	{ family: 'Instrument Serif', file: 'resources/fonts/Instrument_Serif/InstrumentSerif-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Instrument Serif', file: 'resources/fonts/Instrument_Serif/InstrumentSerif-Italic.ttf', weight: 400, style: 'italic' },
	{ family: 'Jacquard 12', file: 'resources/fonts/Jacquard_12/Jacquard12-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Jacquarda Bastarda 9', file: 'resources/fonts/Jacquarda_Bastarda_9/JacquardaBastarda9-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Jgs Font', file: 'resources/fonts/jgs-main/jgs_Font.ttf', weight: 400, style: 'normal' },
	{ family: 'Jgs 5', file: 'resources/fonts/jgs-main/jgs5.ttf', weight: 400, style: 'normal' },
	{ family: 'Jgs 7', file: 'resources/fonts/jgs-main/jgs7.ttf', weight: 400, style: 'normal' },
	{ family: 'Jgs 9', file: 'resources/fonts/jgs-main/jgs9.ttf', weight: 400, style: 'normal' },
	{ family: 'Kaeru Kaeru', file: 'resources/fonts/kaerukaeru-master/kaerukaeru-Regular.otf', weight: 400, style: 'normal' },
	{ family: 'Kanalisirung', file: 'resources/fonts/Kanalisirung/Kanalisirung.otf', weight: 400, style: 'normal' },
	{ family: 'Karrik', file: 'resources/fonts/karrik_fonts-main/Karrik-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Karrik', file: 'resources/fonts/karrik_fonts-main/Karrik-Italic.ttf', weight: 400, style: 'italic' },
	{ family: 'Kings', file: 'resources/fonts/Kings/Kings-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Matemasie', file: 'resources/fonts/Matemasie/Matemasie-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Mess', file: 'resources/fonts/Mess-master/Mess.otf', weight: 300, style: 'normal' },
	{ family: 'Mon Hugo', file: 'resources/fonts/Mon_Hugo_freefont/MonHugo-in.ttf', weight: 400, style: 'normal' },
	{ family: 'Mon Hugo Out', file: 'resources/fonts/Mon_Hugo_freefont/MonHugo-out.ttf', weight: 400, style: 'normal' },
	{ family: 'Murrx', file: 'resources/fonts/Murrx/Murrx.ttf', weight: 400, style: 'normal' },
	{ family: 'Neo-castel', file: 'resources/fonts/Neo-castel/webfont/Neo-castel.woff2', weight: 400, style: 'normal' },
	{ family: 'Ouest', file: 'resources/fonts/OUEST/Ouest-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Princess Sofia', file: 'resources/fonts/Princess_Sofia/PrincessSofia-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Resistance', file: 'resources/fonts/resistance-generale-master/Resistance-generale.otf', weight: 400, style: 'normal' },
	{ family: 'Snowburst One', file: 'resources/fonts/Snowburst_One/SnowburstOne-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Special Elite', file: 'resources/fonts/Special_Elite/SpecialElite-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Special Gothic Expanded One', file: 'resources/fonts/Special_Gothic_Expanded_One/SpecialGothicExpandedOne-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Steps Mono', file: 'resources/fonts/steps-mono-main/Steps-Mono.otf', weight: 400, style: 'normal' },
	{ family: 'Steps Mono Thin', file: 'resources/fonts/steps-mono-main/Steps-Mono-Thin.otf', weight: 100, style: 'normal' },
	{ family: 'Terminal Grotesque', file: 'resources/fonts/Terminal-Grotesque-master/terminal-grotesque.ttf', weight: 400, style: 'normal' },
	{ family: 'Terminal Grotesque Open', file: 'resources/fonts/Terminal-Grotesque-master/terminal-grotesque_open.otf', weight: 400, style: 'normal' },
	{ family: 'Tiny5', file: 'resources/fonts/Tiny5/Tiny5-Regular.ttf', weight: 400, style: 'normal' },
	{ family: 'Trickster', file: 'resources/fonts/Trickster-master/Trickster-Reg.otf', weight: 400, style: 'normal' },
];

function formatForCSS(file) {
	if (file.endsWith('.woff2')) return `url('${file}') format('woff2')`;
	if (file.endsWith('.woff')) return `url('${file}') format('woff')`;
	if (file.endsWith('.otf')) return `url('${file}') format('opentype')`;
	return `url('${file}') format('truetype')`;
}

// Generate @font-face CSS for all registered fonts
export function generateFontFaceCSS() {
	return FONT_ENTRIES.map(entry =>
		`@font-face {
	font-family: '${entry.family}';
	src: ${formatForCSS(entry.file)};
	font-weight: ${entry.weight};
	font-style: ${entry.style};
	font-display: swap;
}`
	).join('\n');
}

// Get list of available font family names (deduplicated)
export function getAvailableFontFamilies() {
	return [...new Set(FONT_ENTRIES.map(e => e.family))];
}

// Preload all fonts so they're immediately available when used
export function preloadAllFonts() {
	for (const entry of FONT_ENTRIES) {
		const src = formatForCSS(entry.file);
		const font = new FontFace(entry.family, src, {
			weight: String(entry.weight),
			style: entry.style,
		});
		font.load().then(loaded => document.fonts.add(loaded)).catch(() => {});
	}
}
