/*global window: false, localStorage: false */
/*jslint browser: true, devel: true, undef: true, nomen: true, bitwise: true */

/*
	moneylog.js
	http://aurelio.net/moneylog
*/

/*********************************************************************
* User Config
* -----------
*
* There is no need to change *anything*, but if you have special
* needs, here is the place to customize this script.
*
*********************************************************************/
// Program interface
var lang = 'pt';                  // pt:Portuguese, en:English, ca:Catalan, es:Spanish (Argentina)
var maxLastMonths = 12;           // Number of months on the last months combo
var initLastMonths = 3;           // Initial value for last months combo
var defaultLastMonths = false;    // Last months combo inits checked?
var defaultMonthPartials = true;  // Monthly checkbox inits checked?
var defaultFuture = false;        // Show future checkbox inits checked?
var defaultRegex = false;         // Search regex checkbox inits checked?
var defaultNegate = false;        // Search negate checkbox inits checked?
var defaultSearch = '';           // Search for this text on init
var showRowCount = true;          // Show the row numbers at left?
var monthlyRowCount = true;       // The row numbers are reset each month?
var highlightWords = '';          // The words you may want to highlight (ie: 'XXX TODO')
var highlightTags = '';           // The tags you may want to highlight (ie: 'work kids')
var reportType = 'd';             // Initial report type: d m y (daily, monthly, yearly)
var showLocaleDate = false;       // Show dates in the regional format? (ie: 12/31/2009)

// Charts
var showMiniBars = true;          // Show the percentage bars in monthly/yearly reports?
var showMiniBarsLabels = true;    // Show the labels inside the bars?
var miniBarWidth = 70;            // The percentage bar width, in pixels
var showCharts = true;            // Show the bar chart after the monthly/yearly report?
var showChartBarLabel = true;     // Show the labels above the bars?

// Program structure and files
var oneFile = false;              // Full app is at moneylog.html single file?
var dataFiles = ['moneylog.txt']; // The paths for the data files (requires oneFile=false)

// localStorage allows editing in-place, saving your data on the browser (like cookies)
var useLocalStorage = false;      // Turn ON localStorage support?
var localStorageKey = 'moneylogData'; // Keyname for the localStorage database (don't change)

// Note: The dataFile encoding is UTF-8. Change to ISO-8859-1 if accents got mangled.

// Data format
var dataFieldSeparator = '\t';
var dataRecordSeparator = /\r?\n/;  // \r\n Windows, \n Linux/Mac
var dataTagTerminator = '|';
var dataTagSeparator = ',';
var commentChar = '#';   // Must be at line start (column 1)
var dataPatterns = {
	date:
		// YYYY-MM-DD
		/^ *(\d{4}-\d\d-\d\d) *$/,
	amountNumber:
		// 7  +7  -7  7.00  7,00  1234567,89  1.234.567,89  1,234,567.89 1234567,89
		/^ *([+\-]? *(\d+|\d{1,3}([.,]\d{3})*)([.,]\d\d)?) *$/,
	amountCents:
		// .12  ,12
		/[.,](\d\d) *$/,
	amountRecurrent:
		// *N or /N where N>0
		/([*\/])([1-9][0-9]*) *$/
};

// Internationalisation (i18n) - Screen Labels and formatting
var i18nDatabase = {
	defaultLanguage: 'en',
	en: {
		dateFormat: 'm/d/y',
		centsSeparator: '.',
		thousandSeparator: ',',
		appUrl: 'http://aurelio.net/soft/moneylog',
		appDescription: 'Track your finances the practical way. Think simple!',
		labelFullScreen: 'Dot',
		labelReports: 'Reports',
		labelDaily: 'daily',
		labelMonthly: 'monthly',
		labelYearly: 'yearly',
		labelLastMonths: 'Recent Only',
		labelValueFilter: 'Filter Values',
		labelPositive: 'positive',
		labelNegative: 'negative',
		labelGreaterThan: 'greater than',
		labelLessThan: 'less than',
		labelFuture: 'Show Future Data',
		labelMonthPartials: 'Show Monthly Partials',
		labelFilter: 'Search field',
		labelRegex: 'regex',
		labelNegate: 'negate',
		labelHelp: 'Question mark',
		labelReload: 'Reload',
		labelNoData: 'No data.',
		labelsDetailed: ['Date', 'Amount', 'Tags', 'Description', 'Balance'],
		labelsOverview: ['Period', 'Incoming', 'Expense', 'Partial', 'Balance'],
		labelTotal: 'Total',
		labelAverage: 'Average',
		labelMinimum: 'Min',
		labelMaximum: 'Max',
		labelMonths: ['month', 'months'],
		labelTagEmpty: 'EMPTY',
		labelTagGroup: 'Group selected tags',
		labelEdit: 'Edit',
		labelClose: 'Close',
		labelSave: 'Save',
		errorInvalidData: 'Invalid data at line ',
		errorNoFieldSeparator: 'No separator found:',
		errorTooManySeparators: 'Too many separators',
		errorInvalidDate: 'Invalid date:',
		errorInvalidAmount: 'Invalid amount:',
		errorNoLocalStorage: 'Sorry, your browser does not have localStorage support. %s will not work.',
		errorRequirements: 'Minimum requirements:',
		msgLoading: 'Loading %s...',
		helpFullScreen: 'Turns ON/OFF the clean mode: only the report is shown, with no toolbars.',
		helpReports: 'Daily, monthly and yearly reports, with charts, balance and totals.',
		helpLastMonths: 'See only the latest data, ignoring oldies.',
		helpValueFilter: 'See only positive or negative values, or greater/lesser than some value.',
		helpFuture: 'Shows future incoming and expenses.',
		helpMonthPartials: 'Shows the monthly balance, with sums of your incoming and expenses on the period.',
		helpFilter: 'Filter the reports in real time, as you type.',
		helpRegex: 'Use regular expressions on the search field.',
		helpNegate: 'Remove the search results from the report.',
		helpHelp: 'Show/hide the help text.',
		helpReload: 'Reload only the data, not the full page. This button only appears when using an external TXT file for data.',
		helpTags: 'Choose the desired tags for the report: food, health, education, trip, …',
		helpTagGroup: 'Show only the entries that have all the selected tags.',
		helpEdit: 'Open the editor, for you to add/remove/edit your data.',
		helpClose: 'Close the editor (without saving!)',
		helpSave: 'Save your data.',
		helpTip: 'Tip: On the reports, click the column header to sort the results. Click again for reverse sorting.',
		helpInstall: 'Instructions:	Save this page, use a plain text editor to add your own transactions and open it on the browser.',
		helpTranslator: ''
	},
	pt: {
		dateFormat: 'd/m/Y',
		centsSeparator: ',',
		thousandSeparator: '.',
		appUrl: 'http://aurelio.net/moneylog/beta.html',
		appDescription: 'Acompanhe suas finanças de maneira simples e prática. Descomplique!',
		labelFullScreen: 'Bolinha',
		labelReports: 'Extratos',
		labelDaily: 'diário',
		labelMonthly: 'mensal',
		labelYearly: 'anual',
		labelLastMonths: 'Somente Recentes',
		labelValueFilter: 'Somente Valores',
		labelPositive: 'positivo',
		labelNegative: 'negativo',
		labelGreaterThan: 'maior que',
		labelLessThan: 'menor que',
		labelFuture: 'Mostrar Lançamentos Futuros',
		labelMonthPartials: 'Mostrar Parciais Mensais',
		labelFilter: 'Caixa de pesquisa',
		labelRegex: 'regex',
		labelNegate: 'excluir',
		labelHelp: 'Interrogação',
		labelReload: 'Recarregar',
		labelNoData: 'Nenhum lançamento.',
		labelsDetailed: ['Data', 'Valor', 'Tags', 'Descrição', 'Acumulado'],
		labelsOverview: ['Período', 'Ganhos', 'Gastos', 'Saldo', 'Acumulado'],
		labelTotal: 'Total',
		labelAverage: 'Média',
		labelMinimum: 'Mínimo',
		labelMaximum: 'Máximo',
		labelMonths: ['mês', 'meses'],
		labelTagEmpty: 'VAZIO',
		labelTagGroup: 'Unir as tags escolhidas',
		labelEdit: 'Editar',
		labelClose: 'Fechar',
		labelSave: 'Salvar',
		errorInvalidData: 'Lançamento inválido na linha ',
		errorNoFieldSeparator: 'Separador não encontrado:',
		errorTooManySeparators: 'Há mais de 2 sepadarores',
		errorInvalidDate: 'Data inválida:',
		errorInvalidAmount: 'Valor inválido:',
		errorNoLocalStorage: 'Ops, seu navegador não tem localStorage. O %s não vai funcionar.',
		errorRequirements: 'Os requisitos mínimos são:',
		msgLoading: 'Carregando %s...',
		helpFullScreen: 'Liga/desliga o modo limpo: aparece somente o extrato, sem as barras de ferramentas.',
		helpReports: 'Extratos diário, mensal e anual, com gráficos, somatório, médias, mínimo, máximo e acumulado.',
		helpLastMonths: 'Veja somente os dados mais recentes, ignorando os antigos.',
		helpValueFilter: 'Veja somente valores positivos, negativos ou maiores/menores que um valor específico.',
		helpFuture: 'Veja quais lançamentos estão agendados para os meses seguintes.',
		helpMonthPartials: 'Resumo do mês, com saldo mensal e acumulado, e totais de ganhos e gastos.',
		helpFilter: 'Filtra os relatórios em tempo real, de acordo com o que você digita.',
		helpRegex: 'Usa expressões regulares na caixa de pesquisa.',
		helpNegate: 'Inverte o filtro, escondendo as transações pesquisadas.',
		helpHelp: 'Mostra e esconde o texto de ajuda.',
		helpReload: 'Recarrega somente os dados (só aparece quando se utiliza arquivo TXT externo).',
		helpTags: 'Escolha que tipo de transações você quer ver: alimentação, saúde, educação, viagem, etc.',
		helpTagGroup: 'Mostra lançamentos que possuem todas as tags selecionadas (deve haver 2+ selecionadas).',
		helpEdit: 'Abre o editor de lançamentos, para você incluir/remover/alterar os dados do extrato.',
		helpClose: 'Fecha o editor de lançamentos (apenas fecha, não salva o texto!).',
		helpSave: 'Salva os lançamentos que você alterou.',
		helpTip: 'Dica:	Nos relatórios, clique no título da coluna para mudar a ordenação. Clicando novamente a ordem é invertida.',
		helpInstall: 'Instruções: Salve esta página, use um editor de textos para colocar seus lançamentos e abra no navegador. Para instruções detalhadas e várias outras dicas de uso, leia o FAQ: http://aurelio.net/moneylog/faq'
	},
	ca: {
		centsSeparator: ',',
		thousandSeparator: '.',
		dateFormat: 'd-m-y',
		appDescription: 'Seguiu les vostres finances de manera pràctica. De forma simple!',
		labelFullScreen: '',
		labelReports: 'Informes',
		labelDaily: 'diari',
		labelMonthly: 'mensual',
		labelYearly: 'anual',
		labelLastMonths: 'Només els Darrers',
		labelValueFilter: 'Valors Filtrats',
		labelPositive: 'positiu',
		labelNegative: 'negatiu',
		labelGreaterThan: 'més gran que',
		labelLessThan: 'més petit que',
		labelFuture: 'Mostra les dades futures',
		labelMonthPartials: 'Mostra els Parcials Mensuals',
		labelFilter: 'Camp de cerca',
		labelRegex: 'regex',
		labelNegate: 'nega-ho',
		labelHelp: "Signe d'interrogació",
		labelReload: 'Carrega',
		labelNoData: 'No hi ha dades.',
		labelsDetailed: ['Data', 'Import', 'Etiquetes', 'Descripció', 'Balanç'],
		labelsOverview: ['Període', 'Ingressos', 'Despeses', 'Parcials', 'Balanç'],
		labelTotal: 'Total',
		labelAverage: 'Mitja',
		labelMinimum: 'Min',
		labelMaximum: 'Max',
		labelMonths: ['mes', 'mesos'],
		labelTagEmpty: 'BUIT',
		labelTagGroup: 'Etiquetes de grup triades',
		errorInvalidData: 'Hi ha un adada no vàlida a la línia ',
		errorNoFieldSeparator: 'No separator found:',
		errorTooManySeparators: 'Hi ha masses separadors',
		errorInvalidDate: 'La data no és vàlida:',
		errorInvalidAmount: "L'import no és vàlid:",
		msgLoading: "S'està carregant %s...",
		helpFullScreen: '',
		helpReports: 'Informes: diari, mensual i anual, amb gràfics, balanç i totals.',
		helpLastMonths: 'Mostra només les dades més recents, omet les antigues.',
		helpValueFilter: 'Mostra només els valors positius o negatius, o major / menor que un cert valor.',
		helpFuture: 'Mostra els ingressos i despeses futures.',
		helpMonthPartials: 'Mostra el saldo mensual, amb sumes dels vostres ingressos i despeses del període.',
		helpFilter: 'Filtre dels informes en temps real, a mesura que escriu.',
		helpRegex: 'Utilitza expressions regulars en el camp de cerca.',
		helpNegate: "Eliminar els resultats de cerca de l'informe.",
		helpHelp: "'Mostra / oculta aquest text d'ajuda.",
		helpReload: 'Actualitza només les dades, no la pàgina sencera. Aquest botó només apareix quan es fa servir un arxiu TXT de dades extern.',
		helpTags: "Escolliu el que voleu etiquetes per a l'informe: alimentació, salut, educació, viatges, …",
		helpTagGroup: 'Mostra només les entrades que tenen totes les etiquetes triades.',
		helpEdit: '',
		helpClose: '',
		helpSave: '',
		helpTip: 'Consell: En els informes, feu clic a la capçalera de columna per ordenar els resultats. Feu clic de nou per a la classificació inversa.',
		helpInstall: 'Instruccions: Deseu aquesta pàgina, utilitzeu un editor de text per afegir les vostres transaccions i obriu-ho al navegador.',
		helpTranslator: 'Traducció: Paco Rivière, http://pacoriviere.cat'
	},
	es: {
		dateFormat: 'd/m/Y',
		centsSeparator: ',',
		thousandSeparator: '.',
		appUrl: 'http://aurelio.net/moneylog/beta.html',
		appDescription: 'Controle sus finanzas de forma práctica. Simple!',
		labelFullScreen: 'Punto',
		labelReports: 'Reportes',
		labelDaily: 'diario',
		labelMonthly: 'mensual',
		labelYearly: 'anual',
		labelLastMonths: 'Mostrar solo últimos',
		labelValueFilter: 'Mostrar solo montos',
		labelPositive: 'positivos',
		labelNegative: 'negativos',
		labelGreaterThan: 'mayores a',
		labelLessThan: 'menores a',
		labelFuture: 'Mostrar movimientos futuros',
		labelMonthPartials: 'Mostrar parcial mensual',
		labelFilter: 'Caja de búsqueda',
		labelRegex: 'regex',
		labelNegate: 'negar',
		labelHelp: 'Signo de interrogación',
		labelReload: 'Recargar',
		labelNoData: 'Sin movimientos.',
		labelsDetailed: ['Fecha', 'Monto', 'Concepto', 'Descripción', 'Balance'],
		labelsOverview: ['Período', 'Ingresos', 'Egresos', 'Saldo', 'Balance'],
		labelTotal: 'Total',
		labelAverage: 'Promedio',
		labelMinimum: 'Min',
		labelMaximum: 'Max',
		labelMonths: ['mes', 'meses'],
		labelTagEmpty: 'VACÍOS',
		labelTagGroup: 'Unir conceptos seleccionados',
		errorInvalidData: 'Información invalida en la línea ',
		errorNoFieldSeparator: 'No se encontraron separadores:',
		errorTooManySeparators: 'Demasiados separadores',
		errorInvalidDate: 'Fecha invalida:',
		errorInvalidAmount: 'Cantidad invalida:',
		msgLoading: 'Cargando %s...',
		helpFullScreen: 'Mostrar/Esconder encabezado y pie de página.',
		helpReports: 'Reporte diario, mensual o anual, con gráficas, promedios, balances y totales.',
		helpLastMonths: 'Vea solo la información mas actual, escondiendo la información antigua.',
		helpValueFilter: 'Vea solo los montos positivos o los negativos, o los "mayores a" o los "menores a" cualquier valor dado.',
		helpFuture: 'Vea movimientos agendados a futuro.',
		helpMonthPartials: 'Vea el balance mensual, con el saldo mensual, el acumulado y totales de ingresos y egresos.',
		helpFilter: 'Evalue los reportes en tiempo real a medida que los va tipeando.',
		helpRegex: 'Use expresiones regulares en la caja de búsqueda.',
		helpNegate: 'Invierte el criterio de búsqueda.',
		helpHelp: 'Mostrar/Esconder texto de ayuda.',
		helpReload: 'Recargar solo la información y no la página entera. Este botón solo aparecerá cuando se este utilizando un archivo TXT externo para almacenar la información.',
		helpTags: 'Seleccione que tipo de conceptos desea ver en el reporte: comida, salud, educación, viajes, …',
		helpTagGroup: 'Mostrar solo los movimientos rotulados con los conceptos seleccionados (debe seleccionar al menos 2 conceptos).',
		helpEdit: 'Abre el editor de movimientos para incluir/eliminar/editar los datos de un extracto.',
		helpClose: 'Cierra el editor de movimientos (solo cierra, no guarda los cambios!).',
		helpSave: 'Guarda las movimientos editados.',
		helpTip: 'Consejo:	Haga click en los títulos de las columnas del reporte para ordenar la información de menor a mayor. Haga click nuevamente para mostrar la información en el orden inverso.',
		helpInstall: 'Instrucciones: Guarde esta página, use un editor de texto simple para volcar sus movimientos y luego abrala en su navegador.',
		helpTranslator: 'Traducción: Gonzalo Nemmi'
	},
	getLanguage: function (lang) {
		var phrase, defaultLang = this.defaultLanguage;

		if (defaultLang !== lang) {
			if (this[lang]) {
				// check if all attributes from 'defaultLang' are in 'lang'
				// if not, copy from 'defaultLang'
				for (phrase in this[defaultLang]) {
					if (!this[lang][phrase] || this[lang][phrase].length === 0) {
						this[lang][phrase] = this[defaultLang][phrase];
					}
				}
			} else {
				// unknown lang, show default instead
				lang = defaultLang;
			}
		}
		return this[lang];
	}
};
// End of user Config


// Global vars
var appName = 'Moneylog Experience ß';
var sortColIndex = 0;
var sortColRev = false;
var oldSortColIndex;
var oldSortColRev;
var oldValueFilterArgShow;
var currentDate;
var highlightRegex;
var i18n;
var rawData = '';
var parsedData = [];
var overviewData = [];
var waitingToLoad = [];
var multiRawData = '';
var isOpera = (window.opera) ? true : false;
var isOnline = false;

// The iframe loading occurs in parallel with the main execution, we need to know when it's done
var iframeIsLoaded = true;


/////////////////////////////////////////////////////////////////////
//                              PROTOTYPES
/////////////////////////////////////////////////////////////////////

if (!Array.prototype.push) { // IE5...
	Array.prototype.push = function (item) {
		this[this.length] = item;
		return this.length;
	};
}

if (!Number.prototype.toFixed) { // IE5...
	Number.prototype.toFixed = function (n) { // precision hardcoded to 2
		var k = (Math.round(this * 100) / 100).toString();
		k += (k.indexOf('.') == -1) ? '.00' : '00';
		return k.substring(0, k.indexOf('.') + 3);
	};
}

String.prototype.strip = function () {
	return this.replace(/^\s+/, '').replace(/\s+$/, '');
};

String.prototype.unacccent = function () {
	if (!this.match(/[^a-z0-9 ]/)) { // no accented char
		return this;
	}
	return this.replace(
		/[àáâãäå]/g, 'a').replace(
		/[èéêë]/g, 'e').replace(
		/[ìíîï]/g, 'i').replace(
		/[òóôõö]/g, 'o').replace(
		/[ùúûü]/g, 'u').replace(
		/[ýÿ]/g, 'y').replace(
		/ç/g, 'c').replace(
		/ñ/g, 'n');
};

Array.prototype.hasItem = function (item) {
	var i;
	for (i = 0; i < this.length; i++) {
		if (item == this[i]) {
			return true;
		}
	}
	return false;
};

Array.prototype.removePattern = function (patt) {
	var i, cleaned = [];
	for (i = 0; i < this.length; i++) {
		if (this[i] != patt) {
			cleaned.push(this[i]);
		}
	}
	return cleaned;
};

RegExp.escape = function (str) {
	var specials = new RegExp('[.*+?|\\^$()\\[\\]{}\\\\]', 'g');
	return str.replace(specials, '\\$&');
};


/////////////////////////////////////////////////////////////////////
//                              TOOLS
/////////////////////////////////////////////////////////////////////

function showError(title, msg) {
	document.getElementById('error').style.display = 'block';
	document.getElementById('error').innerHTML = '<h2>' + title + '<\/h2>' + msg;
}
function invalidData(lineno, message) {
	alert(i18n.errorInvalidData + lineno + '\n' + message.replace(/\t/g, '<TAB>'));
}

function sortArray(a, b) {
	a = a[sortColIndex];
	b = b[sortColIndex];
	try {
		if (sortColIndex == 2) {
			a = a.toLowerCase();
			b = b.toLowerCase();
		}
	} catch (e1) { }
	try { // IE6...
		if (a < b) {
			return -1;
		} else if (a > b) {
			return 1;
		}
	} catch (e2) { }
	return 0;
}

function sortIgnoreCase(a, b) {
	try {
		a = a.toLowerCase().unacccent();
		b = b.toLowerCase().unacccent();
	} catch (e1) { }
	try { // IE6...
		if (a < b) {
			return -1;
		} else if (a > b) {
			return 1;
		}
	} catch (e2) { }
	return 0;
}

function setCurrentDate() {
	var z, m, d;
	z = new Date();
	m = z.getMonth() + 1;
	d = z.getDate();
	m = (m < 10) ? '0' + m : m;
	d = (d < 10) ? '0' + d : d;
	currentDate = z.getFullYear() + '-' + m + '-' + d;
}

function getPastMonth(months) {
	var z, m, y;
	z = new Date();
	m = z.getMonth() + 1 - months; // zero based
	y = z.getFullYear();
	if (m < 1) { // past year
		m = 12 + m;
		y = y - 1;
	}
	m = (m < 10) ? '0' + m : m;
	return y + '-' + m + '-' + '00';
}

function addMonths(yyyymmdd, n) {
	var y, m, d;
	yyyymmdd = yyyymmdd.replace(/-/g, '');
	y = parseInt(yyyymmdd.slice(0, 4), 10);
	m = parseInt(yyyymmdd.slice(4, 6), 10);
	d = yyyymmdd.slice(6, 8);
	m = m + n;
	if (m > 12) {
		y = y + Math.floor(m / 12);
		m = m % 12;
		if (m === 0) { // Exception for n=24, n=36, ...
			m = 12;
			y = y - 1;
		}
	}
	m = (m < 10) ? '0' + m : m;
	return y + '-' + m + '-' + d;
}

function formatDate(date) {
	var m;
	m = date.match(/(..(..))-(..)-(..)/); // Y-M-D

	return i18n.dateFormat.replace(
		'Y', m[1]).replace(
		'y', m[2]).replace(
		'm', m[3]).replace(
		'd', m[4]);
}
function prettyFloat(num, noHtml) {
	var myClass = (num < 0) ? 'neg' : 'pos';
	num = num.toFixed(2).replace('.', i18n.centsSeparator);
	while (i18n.thousandSeparator && num.search(/[0-9]{4}/) > -1) {
		num = num.replace(/([0-9])([0-9]{3})([^0-9])/,
			'$1' + i18n.thousandSeparator + '$2$3');
	}
	return (noHtml) ? num : '<span class="' + myClass + '">' + num + '<\/span>';
	// Note: all html *end* tags have the / escaped to pass on validator
}

function prettyBarLabel(n) {
	var negative;
	negative = (n < 0);
	if (negative) {
		n = Math.abs(n);
	}
	if (n < 1000) {
		n = n.toString().replace(/\.(\d).*/, ''); // 123,45 > 123
	} else if (n >= 1000 && n < 1000000) {
		n = (n / 1000).toString().replace(/\.(\d).*/, 'k$1'); // 1.234,45 > 1k2
	} else if (n >= 1000000) {
		n = (n / 1000).toString().replace(/\.(\d).*/, 'm$1'); // 1.234.567,89 > 1m2
	}
	if (negative) {
		n = '-' + n;
	}
	return n.replace(/([km])0/, '$1'); // 2k0 > 2k
}

function array2ul(a) {
	return '<ul><li>' + a.join('<\/li><li>') + '<\/li><\/ul>';
}
function wrapme(tag, text) {
	return '<' + tag + '>' + text + '</' + tag + '>';
}
function linkme(url, text) {
	return '<a href="' + url + '">' + text + '<\/a>';
}


/////////////////////////////////////////////////////////////////////
//                         REPORT HELPERS
/////////////////////////////////////////////////////////////////////

function getMiniBar(pos, neg) {
	var roof, posPx, negPx, posLabel, negLabel, posMargin, negMargin, labels, labelTemplate;

	// The total amount for this period
	roof = pos + Math.abs(neg);
	// The size of each bar (pixels)
	posPx = parseInt(pos * miniBarWidth / roof, 10);
	negPx = miniBarWidth - posPx;
	// The percentage of each bar (%)
	posLabel = parseInt(pos * 100 / roof, 10);
	negLabel = 100 - posLabel;

	// Labels
	labels = '';
	if (showMiniBarsLabels) {
		labelTemplate = '<span class="label" style="margin-left:-{margin}">{label}<\/span>';

		// The label positioning (negative margin)
		posMargin = (miniBarWidth - 2) + 'px';                // full bar width
		negMargin = ((negLabel == 100) ? '2' : '1.4') + 'em'; // 1.4em or 2em

		// Hide label when it's zero
		if (posLabel > 0) {
			labels += labelTemplate.replace('{margin}', posMargin).replace('{label}', posLabel);
		}
		if (negLabel > 0) {
			labels += labelTemplate.replace('{margin}', negMargin).replace('{label}', negLabel);
		}
	}

	// Kinda complicated layout
	// DIVs and SPANs are float:left to be aligned in order, at the same line
	// SPANs (labels) are moved left (negative margin) precisely to "enter" the bars
	// The TD width *must* be set to accomodate these tricks
	//
	return '<td class="minibar" style="width:' + (miniBarWidth + 2) + 'px">' +
		'<div class="minibar posbar" style="width:' + posPx + 'px">&nbsp;<\/div>' +
		'<div class="minibar negbar" style="width:' + negPx + 'px">&nbsp;<\/div>' +
		labels +
		'<\/td>';
}

function getTotalsRow(total, monthTotal, monthNeg, monthPos) {
	var partial, theRow;

	partial = [];
	partial.push('<table class="posneg number"><tr>');
	partial.push('<td> +');
	partial.push(prettyFloat(monthPos, true) + '<br>');
	partial.push(prettyFloat(monthNeg, true));
	partial.push('<\/td><\/tr><\/table>');
	partial = partial.join('');

	// Show month total?
	if (monthTotal !== '') {
		monthTotal = '<span class="arrow">→<\/span>' + prettyFloat(monthTotal);
	}

	theRow = '<tr class="total">';
	if (showRowCount) {
		theRow += '<td class="row-count"><\/td>';
	}
	theRow += '<td><\/td>';
	theRow += '<td>' + partial + '<\/td>';
	theRow += '<td class="monthtotal" colspan="2">' + monthTotal + '<\/td>';
	theRow += '<td class="number">' + prettyFloat(total) + '<\/td>';
	theRow += '<\/tr>';
	return theRow;
}

function getOverviewRow(theMonth, monthPos, monthNeg, monthTotal, theTotal, rowCount) {
	var theRow = [];

	theRow.push((theMonth <= currentDate.slice(0, 7)) ?
			'<tr onClick="toggleRowHighlight(this)">' :
			'<tr onClick="toggleRowHighlight(this)" class="future">');
	if (showRowCount) {
		theRow.push('<td class="row-count">' + rowCount + '<\/td>');
	}
	theRow.push('<td>' + theMonth + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(monthPos)  + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(monthNeg)  + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(monthTotal) + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(theTotal)  + '<\/td>');

	if (showMiniBars) {
		theRow.push(getMiniBar(monthPos, monthNeg));
	}

	theRow.push('<\/tr>');
	return theRow.join('\n');
}

function getOverviewTotalsRow(label, n1, n2, n3) {
	var theRow = [];
	theRow.push('<tr class="total">');
	if (showRowCount) {
		theRow.push('<td class="row-count"><\/td>');
	}
	theRow.push('<td class="rowlabel">' + label + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(n1) + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(n2) + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(n3) + '<\/td>');
	theRow.push('<td><\/td>');
	theRow.push('<\/tr>');
	return theRow.join('\n');
}


/////////////////////////////////////////////////////////////////////
//                        DATA EDITOR
/////////////////////////////////////////////////////////////////////

function editorOn() {
	// show editor, hide Edit button
	document.getElementById('editor').style.display = 'block';
	document.getElementById('editoropen').style.display = 'none';
}
function editorOff() {
	// hide editor, show Edit button
	document.getElementById('editor').style.display = 'none';
	document.getElementById('editoropen').style.display = 'inline';
}
function saveLocalData() {
	localStorage.setItem(localStorageKey, document.getElementById('editordata').value);
	// reload report
	resetData();
	readData();
	parseData();
	showReport();
}
function loadLocalData() {
	// first time using localStorage (or empty), load default data from #data (PRE)
	if (!localStorage.getItem(localStorageKey) || localStorage.getItem(localStorageKey).strip() === "") {
		localStorage.setItem(localStorageKey, document.getElementById('data').innerHTML);
	}
	document.getElementById('editordata').value = localStorage.getItem(localStorageKey);
}
// Allows to insert TABs inside textarea
// Opera bug: needs to be attached to onkeypress instead onkeydown
// Original from: http://pallieter.org/Projects/insertTab/ (see <script> at page source)
function insertTab(e) {
	var kC, oS, sS, sE, o = this; // aurelio: make jslint happy

	if (!e) { e = window.event; } // IE - aurelio: removed event on calling
	o = this; // aurelio: removed this on calling

	kC = e.keyCode ? e.keyCode : e.charCode ? e.charCode : e.which;
	if (kC == 9 && !e.shiftKey && !e.ctrlKey && !e.altKey) {
		oS = o.scrollTop; // Set the current scroll position.
		if (o.setSelectionRange) {
			// For: Opera + FireFox + Safari
			sS = o.selectionStart;
			sE = o.selectionEnd;
			o.value = o.value.substring(0, sS) + '\t' + o.value.substr(sE);
			o.setSelectionRange(sS + 1, sS + 1);
			o.focus();
		} else if (o.createTextRange) {
			// For: MSIE
			document.selection.createRange().text = '\t'; // String.fromCharCode(9)
			// o.onblur = function() { o.focus(); o.onblur = null; };
		}
		o.scrollTop = oS; // Return to the original scroll position.
		if (e.preventDefault) {  // aurelio change
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
		return false; // Not needed, but good practice.
	}
	return true;
}


/////////////////////////////////////////////////////////////////////
//                        DATA HANDLERS
/////////////////////////////////////////////////////////////////////

function resetData() {
	overviewData = [];
	parsedData = [];
	rawData = '';
}

function loadDataFile(filePath) {
	document.getElementById('report').innerHTML = i18n.msgLoading.replace('%s', filePath);
	resetData();
	iframeIsLoaded = false;
	document.getElementById('dataFrame').src = filePath;
	// This triggers the onLoad iframe event, handled by iframeLoaded()
}

function loadWaitingDataFiles() {
	var filePath;

	// This is a pooling function that keeps calling itself until the
	// waitingToLoad array is empty. I have to do this instead a simple
	// while loop because the iframe loading occurs in parallel, the
	// JavaScript engine don't hang up waiting for it to complete.
	//
	// See also: iframeLoaded()

	// The last file has finished loading, so now we can load the next
	if (iframeIsLoaded) {
		filePath = waitingToLoad.shift();
		loadDataFile(filePath);
	}

	// There is another file to load? Schedule it
	if (waitingToLoad.length > 0) {
		setTimeout(loadWaitingDataFiles, 100);
	}
}
function loadSelectedFile() {
	var filePath;

	// Reset multifile data
	multiRawData = '';
	waitingToLoad = [];

	filePath = dataFiles[document.getElementById('datafiles').selectedIndex];
	// Note: IE7/8 fail at <select>.value, so we must use selectedIndex

	// We will load a single file or all of them?
	if (filePath === '*') {
		waitingToLoad = dataFiles.removePattern('*');
		if (waitingToLoad.length > 0) {
			loadWaitingDataFiles();
		}
	} else {
		loadDataFile(filePath);
	}
	return false; // cancel default link action
}

function readData() {
	var iframeDoc;

	// Read raw data from localStorage, #data (<PRE>) or from external dataFile (<IFRAME><PRE>)
	if (useLocalStorage) {
		loadLocalData();
		rawData = document.getElementById('editordata').value;
	} else if (oneFile) {
		rawData = document.getElementById('data').innerHTML;
	} else {
		// Note: Firefox/Camino won't read if the TXT file is in a parent folder.
		iframeDoc = document.getElementById('dataFrame').contentWindow.document;
		rawData = iframeDoc.getElementsByTagName('pre')[0].innerHTML;
	}
}

function parseData() {
	var i, j, rows, rowDate, rowAmount, rowText, rowTagsDescription, rowTags, rowDescription, recurrentAmount, recValue, recTimes, recOperator, lineno, fields, rowAmountErrorMsg, oldSort;

	// Reset the data holder
	parsedData = [];

	// Split lines
	rows = rawData.split(dataRecordSeparator);

	// Scan data rows
	for (i = 0; i < rows.length; i++) {
		lineno = i + 1;
		rowDate = rowAmount = rowText = '';

		///////////////////////////////////////////////////////////// Firewall

		// Skip commented rows
		if (rows[i].indexOf(commentChar) === 0) {
			continue;
		}
		// Skip blank lines
		if (!rows[i].strip()) {
			continue;
		}

		// Separate fields
		fields = rows[i].split(dataFieldSeparator);

		// Error: rows with no separator
		if (fields.length === 1) {
			invalidData(
				lineno,
				i18n.errorNoFieldSeparator + ' "' + dataFieldSeparator + '"\n\n' + rows[i]
			);
			return;

		// Error: too much separators
		} else if (fields.length - 1 > 2) {
			invalidData(
				lineno,
				i18n.errorTooManySeparators + ' "' + dataFieldSeparator + '"\n\n' + rows[i]
			);
			return;
		}

		///////////////////////////////////////////////////////////// Text

		rowText = (fields.length > 2) ? fields[2].strip() : '';

		///////////////////////////////////////////////////////////// Date

		rowDate = fields[0].match(dataPatterns.date);
		if (rowDate) {
			rowDate = rowDate[1]; // group 1
		} else {
			invalidData(lineno, i18n.errorInvalidDate + ' ' + fields[0] + '\n\n' + rows[i]);
		}

		///////////////////////////////////////////////////////////// Amount

		rowAmountErrorMsg = i18n.errorInvalidAmount + ' ' + fields[1] + '\n\n' + rows[i];

		// Extract (and remove) recurrent information from the amount (if any)
		recurrentAmount = fields[1].match(dataPatterns.amountRecurrent);
		if (recurrentAmount) {
			recTimes = parseInt(recurrentAmount[2], 10);
			recOperator = recurrentAmount[1];
			fields[1] = fields[1].replace(dataPatterns.amountRecurrent, '');
		}

		// Validade the amount value
		rowAmount = fields[1].match(dataPatterns.amountNumber);
		if (rowAmount) {
			rowAmount = rowAmount[1].replace(/\s+/g, ''); // group 1, no blanks

			// Normalize Value
			// Force '.' as internal cents separator, remove other punctuation
			// Ex.: 1.234,56 > 1.234@56 > 1234@56 > 1234.56
			rowAmount = rowAmount.replace(
				dataPatterns.amountCents, '@$1').replace(
				/[.,]/g, '').replace(
				'@', '.');

			// Now we can validate the number (str2float)
			rowAmount = parseFloat(rowAmount);

			// Ops, we don't have a valid number
			if (isNaN(rowAmount)) {
				invalidData(lineno, rowAmountErrorMsg);
				return;
			}
		} else {
			invalidData(lineno, rowAmountErrorMsg);
			return;
		}

		///////////////////////////////////////////////////////////// Recurrent Value

		// A value of -100/10 means I've spent 100 and will pay it in 10x
		// A value of -100*10 means I'll spent 100/month in the next 10 months
		// This idea came from myMoneyLog. Thanks Nishimura!
		//
		// Compose each payment row, changing: date, value and description
		// 2009-12-25  -90/3  Foo        |    2009-12-25  -90*3  Foo
		// turns to                      |    turns to
		// 2009-12-25  -30    Foo 1/3    |    2009-12-25  -90    Foo 1/3
		// 2010-01-25  -30    Foo 2/3    |    2010-01-25  -90    Foo 2/3
		// 2010-02-25  -30    Foo 3/3    |    2010-02-25  -90    Foo 3/3
		//
		// XXX It doesn't fix end-of-month day. Uses 2009-02-31 instead 2009-02-28. But it's OK.
		//
		// Note: the date/value filters must appear *after* the recurrent processing
		//
		if (recurrentAmount) {
			recValue = rowAmount;

			if (recOperator == '/') {
				recValue = (recValue / recTimes);
			}

			// Make sure we have a valid money value (not float)
			recValue = recValue.toFixed(2);

			// Compose and append each new row
			for (j = 1; j <= recTimes; j++) {
				rows.push([
					addMonths(rowDate, j - 1),
					recValue,
					rowText + ' ' + j + '/' + recTimes
				].join(dataFieldSeparator));
			}

			// Ignore the original recurring row
			continue;
		}

		///////////////////////////////////////////////////////////// Tags + Description

		// Parse tags
		if (rowText.indexOf(dataTagTerminator) !== -1) {

			// Get tags
			// Note: tag terminator in description is allowed
			rowTagsDescription = rowText.split(dataTagTerminator);
			rowTags = rowTagsDescription.shift().split(dataTagSeparator);
			rowDescription = rowTagsDescription.join(dataTagTerminator).strip();

			// Strip all tags
			for (j = 0; j < rowTags.length; j++) {
				rowTags[j] = rowTags[j].strip();
			}
			// Remove empty tags
			rowTags = rowTags.removePattern('');

		// No tags
		} else {
			rowTags = [];
			rowDescription = rowText || '&nbsp;';
		}

		// Save the validated data
		parsedData.push([rowDate, rowAmount, rowTags, rowDescription]);
	}

	// Sort by date
	// Note: save/restore the global var contents
	oldSort = sortColIndex;
	sortColIndex = 0;
	parsedData.sort(sortArray);
	sortColIndex = oldSort;
}

function filterData() {
	var i, temp, isRegex, isNegated, filter, filterPassed, firstDate, showFuture, filteredData, thisDate, thisValue, thisTags, thisDescription, valueFilter, valueFilterArg;

	isRegex = false;
	isNegated = false;
	filter = '';
	firstDate = 0;
	filteredData = [];

	if (document.getElementById('optlastmonths').checked && reportType !== 'y') {
		firstDate = getPastMonth(document.getElementById('lastmonths').value - 1);
	}

	// Show future works for both views
	showFuture = document.getElementById('optfuture').checked;

	// Get filters data for the detailed report
	if (reportType === 'd') {
		filter = document.getElementById('filter').value;
		isRegex = document.getElementById('optregex').checked;
		isNegated = document.getElementById('optnegate').checked;

		if (document.getElementById('optvaluefilter').checked) {
			valueFilter = document.getElementById('valuefilter').value;
			valueFilterArg = document.getElementById('valuefilterarg').value || 0;
		}

		// Hack: Value filtering on the search box!
		// Examples: v:+  v:-  v:=50  v:>100  v:<=-100
		temp = filter.match(/^v:([\-+>=<][=]?)([+\-]?\d*)$/);
		if (temp) {
			valueFilter = temp[1];
			valueFilterArg = temp[2] || 0;
			filter = ''; // The filter was (ab)used, now we can discard it
		}
	}

	// Prepare filter contents as /regex/ or string, always ignore case
	if (filter) {
		if (isRegex) {
			filter = new RegExp(filter.replace('/', '\\/'), 'i');
		} else {
			filter = filter.toLowerCase();
		}
	}

	// Scan data rows
	for (i = 0; i < parsedData.length; i++) {

		// date value [tags] description
		thisDate = parsedData[i][0];
		thisValue = parsedData[i][1];
		thisTags = parsedData[i][2];
		thisDescription = parsedData[i][3];

		///////////////////////////////////////////////////////////// Filters

		// Ignore dates older than "last N months" option (if checked)
		if (thisDate < firstDate) {
			continue;
		}

		// Ignore future dates
		if (!showFuture && thisDate > currentDate) {
			break;
		}

		// Apply value filter
		if (valueFilter) {
			if (valueFilter === '+' && thisValue < 0) { continue; }
			if (valueFilter === '-' && thisValue >= 0) { continue; }
			if (valueFilter === '>' && thisValue <= valueFilterArg) { continue; }
			if (valueFilter === '<' && thisValue >= valueFilterArg) { continue; }
			if (valueFilter === '=' && thisValue != valueFilterArg) { continue; }
			if (valueFilter === '>=' && thisValue < valueFilterArg) { continue; }
			if (valueFilter === '<=' && thisValue > valueFilterArg) { continue; }
		}

		// Search filter firewall - Will this line pass it?
		if (filter) {
			if (isRegex) {
				filterPassed = filter.test(parsedData[i].join('\t'));
			} else {
				filterPassed = (parsedData[i].join('\t').toLowerCase().indexOf(filter) !== -1);
			}
			if ((!filterPassed && !isNegated) || (filterPassed && isNegated)) {
				continue;
			}
		}

		// Save the results
		filteredData.push([thisDate, thisValue, thisTags, thisDescription]);
	}

	return filteredData;
}

function applyTags(theData) {
	// This function composes the full tag menu and
	// also filters theData if some tag is selected

	var i, j, rowTags, thisTag, tagMatched, tagName, tagId, checked, tagCount, tagElement, tagsMenu, selectedTags, filteredData, tagMultiAll;

	tagsMenu = [];
	selectedTags = [];
	filteredData = [];

	// Get multiple selection mode (true=AND, false=OR)
	tagMultiAll = document.getElementById('tagMultiAllCheck').checked;

	// Get currently selected tags (from interface)
	try {
		tagCount = document.getElementById('tagCount').value;
		for (i = 1; i <= tagCount; i++) {
			tagElement = document.getElementById('tag_' + i);
			if (tagElement && tagElement.checked) {
				selectedTags.push(tagElement.value);
			}
		}
	} catch (e) { }

	// Filter data to match current tags
	for (i = 0; i < theData.length; i++) {

		// Array order: date, amount, tags, desc
		rowTags = theData[i][2];

		// Populate tags array with UNIQUE row tags
		for (j = 0; j < rowTags.length; j++) {
			if (!tagsMenu.hasItem(rowTags[j])) {
				tagsMenu.push(rowTags[j]);
			}
		}

		// Tag Filter is active. This line matches it?
		if (selectedTags.length > 0) {

			for (j = 0; j < selectedTags.length; j++) {

				thisTag = selectedTags[j];
				tagMatched = (rowTags.hasItem(thisTag) ||
					(thisTag == i18n.labelTagEmpty && rowTags.length === 0));
					// Tip: space means no tag

				if (tagMatched && (!tagMultiAll)) { break; } // OR
				if (!tagMatched && (tagMultiAll)) { break; } // AND
			}
			if (tagMatched) {
				filteredData.push(theData[i]);
			}
		}
	}

	// Make sure the menu has all the selected tags
	for (i = 0; i < selectedTags.length; i++) {
		if (!tagsMenu.hasItem(selectedTags[i]) && selectedTags[i] != i18n.labelTagEmpty) {
			tagsMenu.push(selectedTags[i]);
		}
	}

	// Compose the tags menu HTML code (if we have at least one tag)
	if (tagsMenu.length > 0) {

		// Sorted tags are nice
		tagsMenu.sort(sortIgnoreCase);

		// Add a last empty item to match the rows with no tag
		tagsMenu.push(i18n.labelTagEmpty);

		// Save the total tag count
		document.getElementById('tagCount').value = tagsMenu.length;

		// Add one checkbox for each tag
		for (i = 0; i < tagsMenu.length; i++) {
			tagName = tagsMenu[i];
			tagId = 'tag_' + (i + 1);

			// Selected tags remain selected
			checked = selectedTags.hasItem(tagName) ? 'checked="checked"' : '';

			// The ugly code (but better than DOM-walking nightmares)
			tagsMenu[i] = '<input type="checkbox" class="trigger" onClick="showReport()" ' +
				checked + ' id="' + tagId + '" value="' + tagName + '">' +
				'<span class="trigger" onClick="document.getElementById(\'' + tagId + '\').click()">' + tagName + '<\/span>';
			// Note: Tried to use <label> instead <span>, but IE8 failed at CSS input:checked+label
		}

		// All tags in one single line
		tagsMenu = tagsMenu.join('\n');
	}

	// Save the tags menu (or make it empty)
	document.getElementById('tagList').innerHTML = tagsMenu;

	// Show the tags menu if we have at least one tag
	document.getElementById('tagsArea').style.display = (tagsMenu.length > 0) ? 'block' : 'none';

	// The '+' checkbox is only shown if we have multiple selected tags
	document.getElementById('tagMultiAll').style.display = (selectedTags.length > 1) ? 'block' : 'none';

	// Tag filter was active?
	if (selectedTags.length > 0) {
		return filteredData;
	} else {
		return theData;
	}
}


/////////////////////////////////////////////////////////////////////
//                          REPORTS
/////////////////////////////////////////////////////////////////////

function showOverview() {
	var i, z, len, rowDate, rowAmount, theData, thead, results, grandTotal, dateSize, rangeDate, rangeTotal, rangePos, rangeNeg, sumPos, sumNeg, sumTotal, currSortIndex, minPos, minNeg, minPartial, minBalance, maxPos, maxNeg, maxPartial, maxBalance, maxNumbers, minNumbers, chart, chartBars, chartLabels, chartCol, chartRoof, chartBarSize, chartBarLabel, chartBarValue, chartBarClass;

	results = [];
	grandTotal = rangeTotal = rangePos = rangeNeg = sumPos = sumNeg = sumTotal = 0;
	minPos = minNeg = minPartial = minBalance = maxPos = maxNeg = maxPartial = maxBalance = 0;
	currSortIndex = sortColIndex;

	// Table headings
	thead = '<th onClick="sortCol(0, true)">' + i18n.labelsOverview[0] + '<\/th>';
	thead += '<th onClick="sortCol(1, true)">' + i18n.labelsOverview[1] + '<\/th>';
	thead += '<th onClick="sortCol(2, true)">' + i18n.labelsOverview[2] + '<\/th>';
	thead += '<th onClick="sortCol(3, true)">' + i18n.labelsOverview[3] + '<\/th>';
	thead += '<th onClick="sortCol(4, true)">' + i18n.labelsOverview[4] + '<\/th>';
	if (showMiniBars) {
		thead += '<th>%<\/th>';
	}
	if (showRowCount) {
		thead = '<th class="row-count"><\/th>' + thead;
	}

	if (!overviewData.length) { // Data not cached
		theData = filterData();
	}

	if (overviewData.length || theData.length) {
		results.push('<table class="overview">');
		results.push('<tr>' + thead + '<\/tr>');

		// The cache is empty. Scan and calculate everything.
		if (!overviewData.length) {

			for (i = 0; i < theData.length; i++) {
				rowDate        = theData[i][0];
				rowAmount      = theData[i][1];
				// rowTags        = theData[i][2];
				// rowDescription = theData[i][3];

				// rowDate.slice() size, to extract 2000 or 2000-01
				dateSize = (reportType === 'y') ? 4 : 7;

				// First row, just save the month/year date
				if (i === 0) {
					rangeDate = rowDate.slice(0, dateSize);
				}

				// Other rows, detect if this is a new month/year
				if (i > 0 &&
						rowDate.slice(0, dateSize) !=
						theData[i - 1][0].slice(0, dateSize)) {

					// Send old month/year totals to the report
					overviewData.push([rangeDate, rangePos, rangeNeg, rangeTotal, grandTotal]);
					// Reset totals
					rangeTotal = rangePos = rangeNeg = 0;
					// Save new month/year date
					rangeDate = rowDate.slice(0, dateSize);
				}

				// Common processing for all rows: update totals
				grandTotal += rowAmount;
				rangeTotal += rowAmount;
				if (rowAmount < 0) {
					rangeNeg += rowAmount;
				} else {
					rangePos += rowAmount;
				}
			}
			// No more rows. Send the last range totals to the report.
			overviewData.push([rangeDate, rangePos, rangeNeg, rangeTotal, grandTotal]);
		}
		// End of cache filling

		//// Report data is OK inside overviewData array
		//// Now we must compose the report table

		// Perform the user-selected sorting column and order
		sortColIndex = currSortIndex;
		overviewData.sort(sortArray);
		if (sortColRev) {
			overviewData.reverse();
		}

		// Array2Html
		for (i = 0; i < overviewData.length; i++) {

			// Calculate overall totals
			z = overviewData[i];
			sumPos   += z[1];
			sumNeg   += z[2];
			sumTotal += z[3];

			// Store min/max values
			if (i === 0) {
				// First value, store it as max and min
				minPos     = maxPos     = z[1];
				minNeg     = maxNeg     = z[2];
				minPartial = maxPartial = z[3];
				minBalance = maxBalance = z[4];
			} else {
				// Minimum
				minPos     = (z[1] < minPos)     ? z[1] : minPos;
				minNeg     = (z[2] < minNeg)     ? z[2] : minNeg;
				minPartial = (z[3] < minPartial) ? z[3] : minPartial;
				minBalance = (z[4] < minBalance) ? z[4] : minBalance;
				// Maximum
				maxPos     = (z[1] > maxPos)     ? z[1] : maxPos;
				maxNeg     = (z[2] > maxNeg)     ? z[2] : maxNeg;
				maxPartial = (z[3] > maxPartial) ? z[3] : maxPartial;
				maxBalance = (z[4] > maxBalance) ? z[4] : maxBalance;
			}

			// Save this row to the report table
			results.push(getOverviewRow(z[0], z[1], z[2], z[3], z[4], i + 1));
		}
		maxNumbers = [0, maxPos, maxNeg, maxPartial, maxBalance];
		minNumbers = [0, minPos, minNeg, minPartial, minBalance];

		// Compose the final rows: total, avg, min, max
		len = overviewData.length;
		results.push(getOverviewTotalsRow(i18n.labelTotal, sumPos, sumNeg, sumPos + sumNeg));
		results.push(getOverviewTotalsRow(i18n.labelAverage, sumPos / len, sumNeg / len, sumTotal / len));
		results.push(getOverviewTotalsRow(i18n.labelMinimum, minPos, maxNeg, minPartial));
		results.push(getOverviewTotalsRow(i18n.labelMaximum, maxPos, minNeg, maxPartial, maxBalance));
		// Note: Yes, maxNeg and minNeg are swapped for better reading

		// And we're done on the report table
		results.push('<\/table>');
		results = results.join('\n');

		// Now charts!
		if (showCharts) {
			chart = [];
			chartBars = [];
			chartLabels = [];
			chartCol = document.getElementById('chartcol').value || 1;

			// Get the maximum absolute value for this column
			chartRoof = (Math.abs(minNumbers[chartCol]) > maxNumbers[chartCol]) ?
					Math.abs(minNumbers[chartCol]) :
					maxNumbers[chartCol];

			// Calculate each bar size and format labels
			for (i = 0; i < overviewData.length; i++) {
				z = overviewData[i];
				chartBarSize = parseInt(Math.abs(z[chartCol]) * 100 / chartRoof, 10);
				chartBarLabel = prettyBarLabel(z[chartCol]);
				chartBarValue = prettyFloat(z[chartCol], true);
				chartBars.push([chartBarLabel, chartBarSize, chartBarValue]);
				chartLabels.push(z[0].replace('-', '<br>')); // date
			}

			// Compose the chart table
			chart.push('<table class="chart">');

			// First line is for the bars (label at top)
			chart.push('<tr>');
			for (i = 0; i < chartBars.length; i++) {
				chartBarClass = (chartBars[i][0].substring(0, 1) === '-') ? 'negbar' : 'posbar';
				chart.push('<td class="bar">');
				if (showChartBarLabel) {
					chart.push('<span class="label" title="' + chartBars[i][2] + '">' + chartBars[i][0] + '<\/span>');
				}
				chart.push('<div class="bar ' + chartBarClass + '" style="height:' + chartBars[i][1] + 'px"><\/div>');
				chart.push('<\/td>');
			}
			chart.push('<\/tr>');

			// Second line is for the labels
			chart.push('<tr class="label">');
			for (i = 0; i < chartLabels.length; i++) {
				chart.push('<td>' + chartLabels[i] + '<\/td>');
			}
			chart.push('<\/tr>');

			// And we're done
			chart.push('<\/table>');
			chart = chart.join('\n');

			document.getElementById('chart').innerHTML = chart;
			document.getElementById('charts').style.display = 'block';
		}
	} else {
		results = '<p>' + i18n.labelNoData + '<\/p>';

		// Hide charts when there's no data
		document.getElementById('charts').style.display = 'none';
	}
	document.getElementById('report').innerHTML = results;
}

function showDetailed() {
	var thead, i, j, k, rowDate, rowAmount, rowTags, rowDescription, monthTotal, monthPos, monthNeg, rowCount, results, monthPartials, theData, sumPos, sumNeg, sumTotal;

	sumTotal = sumPos = sumNeg = monthTotal = monthPos = monthNeg = rowCount = 0;
	results = [];

	monthPartials = document.getElementById('optmonthly');
	theData = applyTags(filterData());

	if (theData.length > 0) {

		// Data sorting procedures
		if (sortColIndex !== 0 || sortColRev) {
			monthPartials.checked = false;
		}
		theData.sort(sortArray);
		if (sortColRev) {
			theData.reverse();
		}

		// Compose table headings
		thead = '<th onClick="sortCol(0)">' + i18n.labelsDetailed[0] + '<\/th>';
		thead += '<th onClick="sortCol(1)">' + i18n.labelsDetailed[1] + '<\/th>';
		thead += '<th onClick="sortCol(2)" class="tags">' + i18n.labelsDetailed[2] + '<\/th>';
		thead += '<th onClick="sortCol(3)">' + i18n.labelsDetailed[3] + '<\/th>';
		thead += '<th class="balance">' + i18n.labelsDetailed[4] + '<\/th>';
		if (showRowCount) {
			thead = '<th class="row-count"><\/th>' + thead;
		}
		results.push('<table class="daily">');
		results.push('<tr>' + thead + '<\/tr>');

		// Compose table rows
		for (i = 0; i < theData.length; i++) {

			rowDate        = theData[i][0];
			rowAmount      = theData[i][1];
			rowTags        = theData[i][2];
			rowDescription = theData[i][3];
			rowCount      += 1;

			// This row starts a new month? Must we show the partials?
			if (monthPartials.checked && i > 0 &&
					rowDate.slice(0, 7) !=
					theData[i - 1][0].slice(0, 7)) {
				results.push(getTotalsRow(sumTotal, monthTotal, monthNeg, monthPos));
				// Partials row shown, reset month totals
				monthTotal = 0;
				monthPos = 0;
				monthNeg = 0;
				if (monthlyRowCount) {
					rowCount = 1;
				}
			}

			// Update totals
			sumTotal += rowAmount;
			monthTotal += rowAmount;
			if (rowAmount < 0) {
				monthNeg += rowAmount;
				sumNeg += rowAmount;
			} else {
				monthPos += rowAmount;
				sumPos += rowAmount;
			}

			// There are some words to highlight on the Description?
			if (highlightRegex) {
				rowDescription = rowDescription.replace(
					highlightRegex,
					'<span class="hl">$&<\/span>'
				);
			}

			// There are some tags to highlight?
			for (j = 0; j < highlightTags.length; j++) {
				for (k = 0; k < rowTags.length; k++) {
					if (rowTags[k] == highlightTags[j]) {
						rowTags[k] = '<span class="hl">' + rowTags[k] + '<\/span>';
						break;
					}
				}
			}

			// This row is in the future?
			if (rowDate <= currentDate) {
				results.push('<tr onClick="toggleRowHighlight(this)">');
			} else {
				results.push('<tr onClick="toggleRowHighlight(this)" class="future">');
			}

			if (showRowCount) {
				results.push('<td class="row-count">' + (rowCount) + '<\/td>');
			}

			// Use local date format?
			if (showLocaleDate) {
				rowDate = formatDate(rowDate);
			}

			results.push('<td class="date">'   + rowDate                + '<\/td>');
			results.push('<td class="number">' + prettyFloat(rowAmount) + '<\/td>');
			results.push('<td class="tags">'   + rowTags.join(', ')     + '<\/td>');
			results.push('<td>'                + rowDescription         + '<\/td>');
			results.push('<td class="number">' + prettyFloat(sumTotal)  + '<\/td>');
			results.push('<\/tr>');

		}

		// Should we show the full month partials at the last row?
		if (monthPartials.checked) {
			results.push(getTotalsRow(sumTotal, monthTotal, monthNeg, monthPos));
		} else {
			results.push(getTotalsRow(sumTotal, '', sumNeg, sumPos));
		}

		results.push('<\/table>');
		results = results.join('\n');

		// Real dirty hack to insert totals row at the table beginning (UGLY!)
		// results = results.replace('<\/th><\/tr>', '<\/th><\/tr>' + getTotalsRow(sumTotal, '', sumNeg, sumPos));
	} else {
		results = '<p>' + i18n.labelNoData + '<\/p>';
	}
	document.getElementById('report').innerHTML = results;
}

function showReport() {
	if (reportType === 'd') {
		showDetailed();
	} else {
		showOverview();
	}
}

/////////////////////////////////////////////////////////////////////
//                       INTERFACE UPDATE
/////////////////////////////////////////////////////////////////////

function populateChartColsCombo() {
	var el, i;
	el = document.getElementById('chartcol');
	for (i = 0; i < i18n.labelsOverview.length; i++) {
		if (i === 0) {
			continue; // ignore date column
		}
		el.options[i - 1] = new Option(i18n.labelsOverview[i], i);
	}
}

function populateDataFilesCombo() {
	var el, i;
	if (!oneFile && !useLocalStorage) {
		el = document.getElementById('datafiles');
		for (i = 0; i < dataFiles.length; i++) {
			el.options[i] = new Option(dataFiles[i]);
		}
	}
}

function populateMonthsCombo() {
	var el, label, i;
	el = document.getElementById('lastmonths');
	label = i18n.labelMonths[0];
	for (i = 1; i <= maxLastMonths; i++) {
		if (i > 1) {
			label = i18n.labelMonths[1];
		}
		el.options[i - 1] = new Option(i + ' ' + label, i);
	}
	el.selectedIndex = (initLastMonths > 0) ? initLastMonths - 1 : 0;
}

function populateValueFilterCombo() {
	var el;
	el = document.getElementById('valuefilter');
	el.options[0] = new Option('+ ' + i18n.labelPositive, '+');
	el.options[1] = new Option('- ' + i18n.labelNegative, '-');
	el.options[2] = new Option('> ' + i18n.labelGreaterThan, '>');
	el.options[3] = new Option('< ' + i18n.labelLessThan, '<');
}

function updateToolbar() {
	var i, add, remove, hide, unhide;

	// Visibility On/Off
	// Monthly/Yearly report hides some controls from the toolbar.
	//
	// Some fields are just hidden to preserve the page layout.
	// Others must be removed to free some space for the report.

	add = [];
	remove = [];
	hide = [];
	unhide = [];

	// Daily
	if (reportType === 'd') {
		add = ['tagsArea'];
		remove = ['charts'];
		unhide = [
			'filterbox',
			'optmonthly', 'optmonthlylabel',
			'optvaluefilter', 'optvaluefilterlabel', 'valuefilter',
			'optlastmonths', 'optlastmonthslabel', 'lastmonths'
		];
	// Monthly
	} else if (reportType === 'm') {
		add = ['charts'];
		remove = ['tagsArea'];
		hide = [
			'filterbox',
			'optmonthly', 'optmonthlylabel',
			'optvaluefilter', 'optvaluefilterlabel', 'valuefilter'
		];
		unhide = [
			'optlastmonths', 'optlastmonthslabel', 'lastmonths'
		];
	// Yearly
	} else if (reportType === 'y') {
		add = ['charts'];
		remove = ['tagsArea'];
		hide = [
			'filterbox',
			'optmonthly', 'optmonthlylabel',
			'optvaluefilter', 'optvaluefilterlabel', 'valuefilter',
			// Recent *months* doesn't make sense in yearly report
			'optlastmonths', 'optlastmonthslabel', 'lastmonths'
		];
	}

	// Show/hide toolbar elements
	for (i = 0; i < add.length; i++) {
		document.getElementById(add[i]).style.display = 'block';
	}
	for (i = 0; i < remove.length; i++) {
		document.getElementById(remove[i]).style.display = 'none';
	}
	for (i = 0; i < hide.length; i++) {
		document.getElementById(hide[i]).style.visibility = 'hidden';
	}
	for (i = 0; i < unhide.length; i++) {
		document.getElementById(unhide[i]).style.visibility = 'visible';
	}
}


/////////////////////////////////////////////////////////////////////
//                         EVENT HANDLERS
/////////////////////////////////////////////////////////////////////

function sortCol(index, isOverview) {
	// if the same, flip reverse state
	sortColRev = (sortColIndex == index) ? !sortColRev : false;
	sortColIndex = index;
	showReport();
}

function changeReport(el) {
	var oldType, newType;

	el = this;
	oldType = reportType;
	newType = el.id;

	// Deactivate old report, activate new
	document.getElementById(oldType).className = '';
	el.className = 'active';

	//// Save / restore information
	//
	// From Daily to Monthly/Yearly
	if (oldType === 'd' && newType !== 'd') {
		oldValueFilterArgShow = document.getElementById('valuefilterarg').style.visibility;
		document.getElementById('valuefilterarg').style.visibility = 'hidden';
		oldSortColIndex = sortColIndex;
		oldSortColRev = sortColRev;
		sortColIndex = 0; // Default by date
		sortColRev = false;
	//
	// From Monthly/Yearly to Daily
	} else if (newType === 'd' && oldType !== 'd') {
		document.getElementById('valuefilterarg').style.visibility = oldValueFilterArgShow;
		sortColIndex = oldSortColIndex || 0;
		sortColRev = oldSortColRev || false;
	}

	reportType = newType;
	overviewData = [];
	updateToolbar();
	showReport();

	return false; // cancel default link action
}

function iframeLoaded(el) {
	// Note: This function is attached to the iframe onLoad event.

	// Discard the first iframe load, it's always blank, on the initial page load.
	// The other loads are for real.
	if (typeof el.loadCount == 'undefined') {
		el.loadCount = 1;
		return;
	}
	el.loadCount++;

	// Read iframe contents
	readData();
	iframeIsLoaded = true;

	if (waitingToLoad.length > 0) {
		// We're on multifiles mode, just append the new data to the temporary holder.
		multiRawData = multiRawData + '\n' + rawData;
	} else {
		if (multiRawData) {
			// We're on multifiles mode and the last file was loaded.
			// Join the new data to the holder and save it all to rawData.
			rawData = multiRawData + '\n' + rawData;
		}
		// One file or multifile, now it's time to process what we've read
		parseData();
		showReport();
	}
}

function lastMonthsChanged() {
	document.getElementById('optlastmonths').checked = true;
	overviewData = [];
	showReport();
}

function toggleFullScreen() {
	var toolbar, tagbar, content;

	toolbar = document.getElementById('toolbarwrapper');
	tagbar = document.getElementById('tagsArea');
	content = document.getElementById('content');

	// Note:
	// This toolbar wrapper is needed because #toolbar is a table (not a div).
	// When doing the display:block on it, the table cells don't expand to full width.
	// So we need this silly DIV wrapper so things work as expected.
	// The only browser who got it right without the wrapper was... IE7/8 (surprise!)

	if (toolbar.style.display === 'none') {
		toolbar.style.display = 'block';
		if (reportType === 'd') {
			tagbar.style.display = 'block';
		}
		content.style.marginTop = '8em';
	} else {
		toolbar.style.display = 'none';
		tagbar.style.display = 'none';
		content.style.marginTop = 0;
	}
}
function toggleFuture() {
	overviewData = [];
	showReport();
}

function toggleHelp() {
	var el = document.getElementById('help');
	el.style.display = (el.style.display === 'block') ? 'none' : 'block';
	return false; // cancel default link action
}

function toggleLastMonths() {
	overviewData = [];
	showReport();
}

function toggleMonthly() {
	if (document.getElementById('optmonthly').checked === true) {
		sortColIndex = 0;
		sortColRev = false;
	}
	showReport();
}

function toggleRowHighlight(el) {
	var names = [];

	if (el.className) {
		names = el.className.split(' ');
	}

	// Add or remove the class 'selected' for this row
	if (names.hasItem('selected')) {
		names = names.removePattern('selected');
	} else {
		names.push('selected');
	}

	el.className = names.join(' ');
}

function valueFilterChanged() {
	overviewData = [];

	// autocheck checkbox
	document.getElementById('optvaluefilter').checked = true;

	// show/hide the filter argument textbox
	if (document.getElementById('valuefilter').value.match(/[+\-]/)) {
		document.getElementById('valuefilterarg').style.visibility = 'hidden';
	} else {
		document.getElementById('valuefilterarg').style.visibility = '';
	}

	showReport();
}


/////////////////////////////////////////////////////////////////////
//                             INIT
/////////////////////////////////////////////////////////////////////

function init() {

	// Load the i18n messages (must be the first)
	i18n = i18nDatabase.getLanguage(lang);
	i18n.labelTags = i18n.labelsDetailed[2]; // Tags

	// Online mode uses localStorage
	isOnline = useLocalStorage;

	setCurrentDate();
	populateMonthsCombo();
	populateDataFilesCombo();
	populateChartColsCombo();
	populateValueFilterCombo();

	// Sanitize and regexize user words: 'Foo Bar+' turns to 'Foo|Bar\+'
	// Note: Using regex to allow ignorecase and global *atomic* replace
	if (highlightWords) {
		highlightRegex = new RegExp(
			RegExp.escape(highlightWords).replace(/\s+/g, '|'),
			'ig'
		);
	}

	// Split highlight string into words
	highlightTags = highlightTags.strip().split(/\s+/);

	// Just show the files combo when there are 2 or more files
	if (oneFile || useLocalStorage || dataFiles.length < 2) {
		document.getElementById('datafiles').style.display = 'none';
	}

	// Hide Reload button in oneFile mode. No iframe, so we can't reload.
	if (oneFile || useLocalStorage) {
		document.getElementById('reload').style.visibility = 'hidden';
	}

	if (isOnline) {
		appName = 'Moneylog Online';
		i18n.appUrl = 'http://aurelio.net/moneylog/online';

		// The Edit button only appears in online mode
		document.getElementById('editoropen').style.display = 'inline';
		document.getElementById('operabug').style.paddingRight = i18n.labelEdit.length + 'em';
	} else {
		appName = appName.replace('og ', 'og<br>'); // dirty layout fix
	}

	// Set interface labels
	document.getElementById('sitelink'           ).innerHTML = appName;
	document.getElementById('d'                  ).innerHTML = i18n.labelDaily;
	document.getElementById('m'                  ).innerHTML = i18n.labelMonthly;
	document.getElementById('y'                  ).innerHTML = i18n.labelYearly;
	document.getElementById('optlastmonthslabel' ).innerHTML = i18n.labelLastMonths + ':';
	document.getElementById('optvaluefilterlabel').innerHTML = i18n.labelValueFilter + ':';
	document.getElementById('optfuturelabel'     ).innerHTML = i18n.labelFuture;
	document.getElementById('optmonthlylabel'    ).innerHTML = i18n.labelMonthPartials;
	document.getElementById('optregexlabel'      ).innerHTML = i18n.labelRegex;
	document.getElementById('optnegatelabel'     ).innerHTML = i18n.labelNegate;
	document.getElementById('tagsLabel'          ).innerHTML = i18n.labelTags + ':';
	document.getElementById('tagMultiAllLabel'   ).innerHTML = i18n.labelTagGroup;
	document.getElementById('editoropen'         ).innerHTML = i18n.labelEdit;
	document.getElementById('editorclose'        ).innerHTML = i18n.labelClose;
	document.getElementById('editorsave'         ).innerHTML = i18n.labelSave;

	// Set interface tooltips
	document.getElementById('fullscreen'         ).title = i18n.helpFullScreen;
	document.getElementById('sitelink'           ).href  = i18n.appUrl;
	document.getElementById('sitelink'           ).title = i18n.appDescription;
	document.getElementById('report-nav'         ).title = i18n.helpReports;
	document.getElementById('optlastmonthslabel' ).title = i18n.helpLastMonths;
	document.getElementById('optvaluefilterlabel').title = i18n.helpValueFilter;
	document.getElementById('optfuturelabel'     ).title = i18n.helpFuture;
	document.getElementById('optmonthlylabel'    ).title = i18n.helpMonthPartials;
	document.getElementById('filter'             ).title = i18n.helpFilter;
	document.getElementById('optregexlabel'      ).title = i18n.helpRegex;
	document.getElementById('optnegatelabel'     ).title = i18n.helpNegate;
	document.getElementById('helpbutton'         ).title = i18n.helpHelp;
	document.getElementById('reload'             ).title = i18n.helpReload;
	document.getElementById('tagsLabel'          ).title = i18n.helpTags;
	document.getElementById('tagMultiAllLabel'   ).title = i18n.helpTagGroup;
	document.getElementById('editoropen'         ).title = i18n.helpEdit;
	document.getElementById('editorclose'        ).title = i18n.helpClose;
	document.getElementById('editorsave'         ).title = i18n.helpSave;

	// Mark current report as active (CSS)
	document.getElementById(reportType).className = 'active';

	// localStorage browser support check
	if (useLocalStorage && !window.localStorage) {
		document.getElementById('editoropen').style.display = 'none'; // hide button
		showError(
			i18n.errorNoLocalStorage.replace('%s', appName),
			'<p>' + i18n.errorRequirements +
				array2ul('Internet Explorer 8, Firefox 3, Google Chrome 3, Safari 4, Opera 10.50'.split(', '))
		);
		return; // abort
	}

	// Add event handlers
	document.getElementById('fullscreen'      ).onclick  = toggleFullScreen;
	document.getElementById('d'               ).onclick  = changeReport;
	document.getElementById('m'               ).onclick  = changeReport;
	document.getElementById('y'               ).onclick  = changeReport;
	document.getElementById('optlastmonths'   ).onclick  = toggleLastMonths;
	document.getElementById('lastmonths'      ).onchange = lastMonthsChanged;
	document.getElementById('optvaluefilter'  ).onclick  = showReport;
	document.getElementById('valuefilter'     ).onchange = valueFilterChanged;
	document.getElementById('valuefilterarg'  ).onkeyup  = showReport;
	document.getElementById('optfuture'       ).onclick  = toggleFuture;
	document.getElementById('optmonthly'      ).onclick  = toggleMonthly;
	document.getElementById('helpbutton'      ).onclick  = toggleHelp;
	document.getElementById('filter'          ).onkeyup  = showReport;
	document.getElementById('optregex'        ).onclick  = showReport;
	document.getElementById('optnegate'       ).onclick  = showReport;
	document.getElementById('datafiles'       ).onchange = loadSelectedFile;
	document.getElementById('reload'          ).onclick  = loadSelectedFile;
	document.getElementById('tagMultiAllCheck').onclick  = showReport;
	document.getElementById('chartcol'        ).onchange = showReport;
	if (isOnline) {
		document.getElementById('editoropen' ).onclick = editorOn;
		document.getElementById('editorclose').onclick = editorOff;
		document.getElementById('editorsave' ).onclick = saveLocalData;
		document.getElementById('editordata' )[(isOpera) ? 'onkeypress' : 'onkeydown'] = insertTab;
	}

	// Apply user defaults (this code must be after event handlers adding)
	if (defaultLastMonths)    { document.getElementById('optlastmonths').checked = true; }
	if (defaultMonthPartials) { document.getElementById('optmonthly'   ).checked = true; }
	if (defaultFuture)        { document.getElementById('optfuture'    ).checked = true; }
	if (defaultRegex)         { document.getElementById('optregex'     ).checked = true; }
	if (defaultNegate)        { document.getElementById('optnegate'    ).checked = true; }
	document.getElementById('filter').value = defaultSearch;

	// Compose help contents (dirty, but handy)
	document.getElementById('help').innerHTML = (
		wrapme('b', linkme(i18n.appUrl, appName) + ': ') + i18n.appDescription +
		array2ul([wrapme('b', i18n.labelReports + ': ') + i18n.helpReports]) +
		array2ul([
				wrapme('b', i18n.labelLastMonths + ': ') + i18n.helpLastMonths,
				wrapme('b', i18n.labelValueFilter + ': ') + i18n.helpValueFilter,
				wrapme('b', i18n.labelFuture + ': ') + i18n.helpFuture,
				wrapme('b', i18n.labelMonthPartials + ': ') + i18n.helpMonthPartials
			]) +
		array2ul([
				wrapme('b', i18n.labelFullScreen + ': ') + i18n.helpFullScreen,
				wrapme('b', i18n.labelHelp + ': ') + i18n.helpHelp,
				wrapme('b', '®: ') + i18n.helpReload,
				wrapme('b', i18n.labelFilter + ': ') + i18n.helpFilter +
					array2ul([
						wrapme('b', i18n.labelRegex + ': ') + i18n.helpRegex,
						wrapme('b', i18n.labelNegate + ': ') + i18n.helpNegate
					])
			]) +
		array2ul([
				wrapme('b', i18n.labelTags + ': ') + i18n.helpTags +
					array2ul([
						wrapme('b', i18n.labelTagGroup + ': ') + i18n.helpTagGroup
					])
			]) +
		wrapme('p', i18n.helpTip) +
		((oneFile) ? wrapme('p', i18n.helpInstall) : '') +
		wrapme('p', i18n.helpTranslator.replace(/(http:.*)/, '<a href="$1">$1<\/a>'))
	);

	// User choose other default report, let's update the toolbar accordingly
	if (reportType !== 'd') {
		updateToolbar();
	}

	// Everything is ok, time to read/parse/show the user data
	if (oneFile || useLocalStorage) {
		readData();
		parseData();
		showReport();
	} else {
		// By default show the first file
		document.getElementById('datafiles').selectedIndex = 0;
		loadSelectedFile();
	}

	// Uncomment this line to focus the search box at init
	// document.getElementById('filter').focus();
}
window.onload = init;

