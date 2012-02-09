/*global window: false, localStorage: false */
/*jslint devel: true, regexp: true, browser: true, undef: true, continue: true, sloppy: true, eqeq: true, white: true, forin: true, plusplus: true, maxerr: 500 */

/*
	moneylog.js
	http://aurelio.net/moneylog/
*/

/*********************************************************************
* User Config
* -----------
*
* There is no need to change *anything*, but if you have special
* needs, here is the place to customize this script.
*
*********************************************************************/

var myPassword = '';              // Set up an access password
var lang = 'pt';                  // pt:Portuguese, en:English, ca:Catalan, es:Spanish (Argentina)
var reportType = 'd';             // Initial report type: d m y (daily, monthly, yearly)
var initFullScreen = false;       // Start app in Full Screen mode?
var checkMonthPartials = true;    // Monthly checkbox inits checked?
var checkTagNegate = false;       // Ignore tags checkbox inits checked?
var showRowCount = true;          // Show the row numbers at left?
var monthlyRowCount = true;       // The row numbers are reset each month?
var highlightWords = '';          // The words you may want to highlight (ie: 'XXX TODO')
var highlightTags = '';           // The tags you may want to highlight (ie: 'work kids')
var showEmptyTagInSummary = true; // The EMPTY tag sum should appear in Tag Summary?
var checkTagSummarySort = false;  // Sort by value checkbox inits checked?

// Search
var defaultSearch = '';           // Search for this text on init
var checkRegex = false;           // Search regex checkbox inits checked?
var checkNegate = false;          // Search negate checkbox inits checked?

// Date
var showLocaleDate = true;        // Show dates in the regional format? (ie: 12/31/2009)
var checkDateFrom = true;         // Date filter From: checkbox inits checked?
var checkDateUntil = true;        // Date filter To: checkbox inits checked?
var initMonthOffsetFrom = -2;     // From: month will be N months from now
var initMonthOffsetUntil = 0;     // To:   month will be N months from now
var initYearOffsetFrom;           // From: year will be N years from now (default OFF)
var initYearOffsetUntil;          // To:   year will be N years from now (default OFF)

// Widgets
var initViewWidgetOpen = true;    // Start app with the View widget opened?
var initTagCloudOpen = true;      // Start app with the Tag Cloud widget opened?
var initTagSummaryOpen = false;   // Start app with the Tag Summary widget opened?
var showViewWidget = true;        // Show View widget in the sidebar?
var showTagCloud = true;          // Show Tag Cloud widget in the sidebar?
var showTagSummary = true;        // Show Tag Summary widget in the sidebar?

// Charts
var showMiniBars = true;          // Show the percentage bars in monthly/yearly reports?
var showMiniBarsLabels = true;    // Show the labels inside the bars?
var miniBarWidth = 70;            // The percentage bar width, in pixels
var showCharts = true;            // Show the bar chart after the monthly/yearly report?
var showChartBarLabel = true;     // Show the labels above the bars?
var initChartDaily = 3;           // Initial selected item for the daily chart [1-4]
var initChartMonthly = 1;         // Initial selected item for the monthly chart [1-4]
var initChartYearly = 1;          // Initial selected item for the yearly chart [1-4]

// External TXT files (used in flavors TXT and Cloud)
// Note: The file encoding is UTF-8. Change to ISO-8859-1 if accents got mangled.
var dataFiles = ['moneylog.txt']; // The paths for the data files
var dataFilesDefault = '';        // Default selected file at init when using multiple TXT

// MoneyLog Browser config
var localStorageKey = 'moneylogData'; // Keyname for the localStorage database

// Ignore old or future data - Use with care!
var ignoreDataOlderThan = '';     // Ignore entries older than this date (ie: 2010-01-01)
var ignoreDataNewerThan = '';     // Ignore entries newer than this date (ie: 2020-12-31)

// Legacy options
var useLegacyDateFilter = false;  // Restore old options: Future Data, Recent Only
var maxLastMonths = 12;           // Number of months on the last months combo
var initLastMonths = 3;           // Initial value for last months combo
var defaultLastMonths = false;    // Last months combo inits checked?
var defaultFuture = false;        // Show future checkbox inits checked?


// The appMode sets the Moneylog flavor:
// txt          HTML, CSS, JS files are separated. Read user data from local TXT files.
// one          Full app is in a single moneylog.html file, with user data at the end.
// dropbox      Runs online, read/save user data from/to TXT files in a Dropbox account.
// localStorage Read/edit/save user data to the browser. Must always use the same browser.
var appMode = 'txt';

// Data format
var useBlankFieldSeparator = true; // Use blanks (TABs and spaces) as field separator?
var dataFieldSeparator = '\t';
var dataRecordSeparator = /\r?\n/;  // \r\n Windows, \n Linux/Mac
var dataTagTerminator = '|';
var dataTagSeparator = ',';
var commentChar = '#';   // Must be at line start (column 1)
var dataPatterns = {
	rowBlankSeparated:
		// Uses multiple TAB and spaces as field separators
		/^[ \t]*(\d{4}-\d\d-\d\d)[ \t]+([+\-]?[0-9.,*\/]+)[ \t]+(.*)$/,
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
		centsSeparator: '.',
		thousandSeparator: ',',
		dateFormat: 'b d, Y',
		dateFormatMonth: 'B Y',
		dateFormatYear: 'Y',
		monthNames: ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		appUrl: 'http://aurelio.net/soft/moneylog/',
		appUrlOnline: 'http://aurelio.net/soft/moneylog/online/',
		appDescription: 'Track your finances the practical way. Think simple!',
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
		labelFuture: 'Future Data',
		labelMonthPartials: 'Monthly Partials',
		// labelFilter: 'Search field',
		labelRegex: 'regex',
		labelNegate: 'negate',
		// labelHelp: 'Question mark',
		labelReload: 'Reload',
		labelViewOptions: 'View',
		// labelMonthRange: 'Month Range',
		labelDateFrom: 'From',
		labelDateUntil: 'Until',
		labelTagCloud: 'Tag Cloud',
		labelTagSummary: 'Tag Summary',
		labelNoData: 'No data.',
		labelsDetailed: ['Date', 'Amount', 'Tags', 'Description', 'Balance'],
		labelsOverview: ['Period', 'Incoming', 'Expense', 'Partial', 'Balance'],
		labelTotal: 'Total',
		labelAverage: 'Average',
		labelMinimum: 'Min',
		labelMaximum: 'Max',
		labelCount: 'Count',
		labelMonths: ['month', 'months'],
		labelTagEmpty: 'EMPTY',
		labelTagNegate: 'Ignore selected tags',
		labelTagGroup: 'Group selected tags',
		labelTagReset: 'Reset selection',
		labelTagSummarySort: 'Sort by value',
		labelEdit: 'Edit',
		labelClose: 'Close',
		labelCancel: 'Cancel',
		labelSave: 'Save',
		errorInvalidData: 'Invalid data at line ',
		errorNoFieldSeparator: 'No separator found:',
		errorTooManySeparators: 'Too many separators',
		errorInvalidDate: 'Invalid date:',
		errorInvalidAmount: 'Invalid amount:',
		errorNoLocalStorage: 'Sorry, your browser does not have localStorage support. %s will not work.',
		errorNoDropboxSupport: 'Cannot find the Dropbox support files. %s will not work.',
		errorRequirements: 'Minimum requirements:',
		msgLoading: 'Loading %s...',
		msgSaving: 'Saving...',
		msgTypePassword: 'Type your password:',
		msgWrongPassword: 'Wrong password.',
		helpFullScreen: 'Turns ON/OFF the Full Screen mode: only the report is shown, with no toolbar.',
		helpReports: 'Daily, monthly and yearly reports, with charts, balance and totals.',
		helpLastMonths: 'See only the latest data, ignoring oldies.',
		helpValueFilter: 'See only positive or negative values, or greater/lesser than some value.',
		helpFuture: 'Shows future incoming and expenses.',
		helpMonthPartials: 'Shows the monthly balance, with sums of your incoming and expenses on the period.',
		helpFilter: 'Filter the reports in real time, as you type.',
		helpRegex: 'Use regular expressions on the search field.',
		helpNegate: 'Remove the search results from the report.',
		// helpHelp: 'Show/hide the help text.',
		helpReload: 'Reload only the data, keeping the current view untouched.',
		// helpTags: 'Choose the desired tags for the report: food, health, education, trip, …',
		helpTagNegate: 'Remove from the report all the rows that match the selected tags.',
		helpTagGroup: 'Only match if the entry has ALL the selected tags.',
		helpTagReset: 'Undo all the selections you have made in the Tag Cloud.',
		helpTagSummarySort: 'Order the Tag Summary by values instead tag names.',
		helpTagSummary: 'Show/hide the tag summary.',
		helpTagCloud: 'Show/hide the tag cloud.',
		// helpMonthRange: 'Show/hide the month range controls.',
		helpEdit: 'Open the editor, for you to add/remove/edit your data.',
		helpClose: 'Close the editor (without saving!)',
		helpCancel: 'Discard changes and close the editor.',
		helpSave: 'Save your data.'

		// helpTip: 'Tip: On the reports, click the column header to sort the results. Click again for reverse sorting.',
		// helpInstall: 'Instructions: Save this page, use a plain text editor to add your own transactions and open it on the browser.',
		// helpTranslator: ''
	},
	pt: {
		centsSeparator: ',',
		thousandSeparator: '.',
		dateFormat: 'd b Y',
		dateFormatMonth: 'B Y',
		dateFormatYear: 'Y',
		monthNames: ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
		appUrl: 'http://aurelio.net/moneylog/beta.html',
		appUrlOnline: 'http://aurelio.net/moneylog/online/',
		appDescription: 'Acompanhe suas finanças de maneira simples e prática. Descomplique!',
		labelReports: 'Extratos',
		labelDaily: 'diário',
		labelMonthly: 'mensal',
		labelYearly: 'anual',
		labelLastMonths: 'Somente Recentes',
		labelValueFilter: 'Somente Valores',
		labelPositive: 'positivos',
		labelNegative: 'negativos',
		labelGreaterThan: 'maiores que',
		labelLessThan: 'menores que',
		labelFuture: 'Lançamentos Futuros',
		labelMonthPartials: 'Parciais Mensais',
		// labelFilter: 'Caixa de pesquisa',
		labelRegex: 'regex',
		labelNegate: 'excluir',
		// labelHelp: 'Ajuda',
		labelReload: 'Recarregar',
		labelViewOptions: 'Visualizar',
		// labelMonthRange: 'Meses',
		labelDateFrom: 'De',
		labelDateUntil: 'Até',
		labelTagCloud: 'Tags',
		labelTagSummary: 'Somatório de tags',
		labelNoData: 'Nenhum lançamento.',
		labelsDetailed: ['Data', 'Valor', 'Tags', 'Descrição', 'Acumulado'],
		labelsOverview: ['Período', 'Ganhos', 'Gastos', 'Saldo', 'Acumulado'],
		labelTotal: 'Total',
		labelAverage: 'Média',
		labelMinimum: 'Mínimo',
		labelMaximum: 'Máximo',
		labelCount: 'Linhas',
		labelMonths: ['mês', 'meses'],
		labelTagEmpty: 'VAZIO',
		labelTagNegate: 'Ignorar',
		labelTagGroup: 'Combinar',
		labelTagReset: 'Desmarcar todas',
		labelTagSummarySort: 'Ordenar por valor',
		labelEdit: 'Editar',
		labelClose: 'Fechar',
		labelCancel: 'Cancelar',
		labelSave: 'Salvar',
		errorInvalidData: 'Lançamento inválido na linha ',
		errorNoFieldSeparator: 'Separador não encontrado:',
		errorTooManySeparators: 'Há mais de 2 separadores',
		errorInvalidDate: 'Data inválida:',
		errorInvalidAmount: 'Valor inválido:',
		errorNoLocalStorage: 'Ops, seu navegador não tem localStorage. O %s não vai funcionar.',
		errorRequirements: 'Os requisitos mínimos são:',
		msgLoading: 'Carregando %s...',
		msgSaving: 'Salvando...',
		msgTypePassword: 'Digite a sua senha:',
		msgWrongPassword: 'Senha errada.',
		helpFullScreen: 'Liga/desliga o modo tela cheia: aparece somente o extrato, sem a barra de ferramentas.',
		helpReports: 'Extratos diário, mensal e anual, com gráficos, somatório, médias, mínimo, máximo e acumulado.',
		helpLastMonths: 'Veja somente os dados mais recentes, ignorando os antigos.',
		helpValueFilter: 'Veja somente valores positivos, negativos ou maiores/menores que um valor específico.',
		helpFuture: 'Veja quais lançamentos estão agendados para os meses seguintes.',
		helpMonthPartials: 'Resumo do mês, com saldo mensal e acumulado, e totais de ganhos e gastos.',
		helpFilter: 'Filtra os relatórios em tempo real, de acordo com o que você digita.',
		helpRegex: 'Usa expressões regulares na caixa de pesquisa.',
		helpNegate: 'Inverte o filtro, escondendo as transações pesquisadas.',
		// helpHelp: 'Mostra e esconde o texto de ajuda.',
		helpReload: 'Recarrega somente os dados, sem perder as opções de visualização.',
		// helpTags: 'Escolha que tipo de transações você quer ver: alimentação, saúde, educação, viagem, etc.',
		helpTagNegate: 'Remove do extrato os lançamentos que possuem as tags selecionadas.',
		helpTagGroup: 'Cada lançamento deve possuir TODAS as tags selecionadas, simultaneamente.',
		helpTagReset: 'Desmarca todas as tags que você selecionou, voltando ao estado inicial.',
		helpTagSummarySort: 'Ordena o sumário de tags pelos valores, não pelos nomes.',
		helpTagSummary: 'Mostra e esconde o somatório das tags.',
		helpTagCloud: 'Mostra e esconde a nuvem de tags.',
		// helpMonthRange: 'Mostra e esconde o seletor de meses.',
		helpEdit: 'Abre o editor de lançamentos, para você incluir/remover/alterar os dados do extrato.',
		helpClose: 'Fecha o editor de lançamentos (apenas fecha, não salva o texto!).',
		helpCancel: 'Descarta as alterações e fecha o editor sem salvar nada.',
		helpSave: 'Salva os lançamentos que você alterou.'

		// helpTip: 'Dica:	Nos relatórios, clique no título da coluna para mudar a ordenação. Clicando novamente a ordem é invertida.',
		// helpInstall: 'Instruções: Salve esta página, use um editor de textos para colocar seus lançamentos e abra no navegador. Para instruções detalhadas e várias outras dicas de uso, leia o FAQ: http://aurelio.net/moneylog/faq/'
	},
	ca: {
		centsSeparator: ',',
		thousandSeparator: '.',
		dateFormat: 'd-m-y',
		appDescription: 'Seguiu les vostres finances de manera pràctica. De forma simple!',
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
		// labelFilter: 'Camp de cerca',
		labelRegex: 'regex',
		labelNegate: 'nega-ho',
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
		helpReports: 'Informes: diari, mensual i anual, amb gràfics, balanç i totals.',
		helpLastMonths: 'Mostra només les dades més recents, omet les antigues.',
		helpValueFilter: 'Mostra només els valors positius o negatius, o major / menor que un cert valor.',
		helpFuture: 'Mostra els ingressos i despeses futures.',
		helpMonthPartials: 'Mostra el saldo mensual, amb sumes dels vostres ingressos i despeses del període.',
		helpFilter: 'Filtre dels informes en temps real, a mesura que escriu.',
		helpRegex: 'Utilitza expressions regulars en el camp de cerca.',
		helpNegate: "Eliminar els resultats de cerca de l'informe.",
		// helpHelp: "'Mostra / oculta aquest text d'ajuda.",
		helpReload: 'Actualitza només les dades, no la pàgina sencera.',
		// helpTags: "Escolliu el que voleu etiquetes per a l'informe: alimentació, salut, educació, viatges, …",
		helpTagGroup: 'Mostra només les entrades que tenen totes les etiquetes triades.'

		// helpTip: 'Consell: En els informes, feu clic a la capçalera de columna per ordenar els resultats. Feu clic de nou per a la classificació inversa.',
		// helpInstall: 'Instruccions: Deseu aquesta pàgina, utilitzeu un editor de text per afegir les vostres transaccions i obriu-ho al navegador.',
		// helpTranslator: 'Traducció: Paco Rivière, http://pacoriviere.cat'
	},
	es: {
		dateFormat: 'd/m/Y',
		centsSeparator: ',',
		thousandSeparator: '.',
		appUrl: 'http://aurelio.net/moneylog/beta.html',
		appDescription: 'Controle sus finanzas de forma práctica. Simple!',
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
		// labelFilter: 'Caja de búsqueda',
		labelRegex: 'regex',
		labelNegate: 'negar',
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
		helpReports: 'Reporte diario, mensual o anual, con gráficas, promedios, balances y totales.',
		helpLastMonths: 'Vea solo la información mas actual, escondiendo la información antigua.',
		helpValueFilter: 'Vea solo los montos positivos o los negativos, o los "mayores a" o los "menores a" cualquier valor dado.',
		helpFuture: 'Vea movimientos agendados a futuro.',
		helpMonthPartials: 'Vea el balance mensual, con el saldo mensual, el acumulado y totales de ingresos y egresos.',
		helpFilter: 'Evalue los reportes en tiempo real a medida que los va tipeando.',
		helpRegex: 'Use expresiones regulares en la caja de búsqueda.',
		helpNegate: 'Invierte el criterio de búsqueda.',
		// helpHelp: 'Mostrar/Esconder texto de ayuda.',
		helpReload: 'Recargar solo la información y no la página entera.',
		// helpTags: 'Seleccione que tipo de conceptos desea ver en el reporte: comida, salud, educación, viajes, …',
		helpTagGroup: 'Mostrar solo los movimientos rotulados con los conceptos seleccionados (debe seleccionar al menos 2 conceptos).',
		helpEdit: 'Abre el editor de movimientos para incluir/eliminar/editar los datos de un extracto.',
		helpClose: 'Cierra el editor de movimientos (solo cierra, no guarda los cambios!).',
		helpSave: 'Guarda las movimientos editados.'

		// helpTip: 'Consejo:	Haga click en los títulos de las columnas del reporte para ordenar la información de menor a mayor. Haga click nuevamente para mostrar la información en el orden inverso.',
		// helpInstall: 'Instrucciones: Guarde esta página, use un editor de texto simple para volcar sus movimientos y luego abrala en su navegador.',
		// helpTranslator: 'Traducción: Gonzalo Nemmi'
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
var appVersion = '5b';
var appName = 'MoneyLog';
var appFlavor = '';
var dropboxAppFolder = '/Apps/MoneyLog Cloud';
var dropboxTxtFolder = '/txt';
var sortColIndex = 0;
var sortColRev = false;
var oldSortColIndex;
var oldSortColRev;
var dataFirstDate;
var dataLastDate;
var highlightRegex;
var i18n;
var rawData = '';
var parsedData = [];
var overviewData = [];
var waitingToLoad = [];
var selectedRows = [];
var multiRawData = '';
var isFullScreen = false;
var isOpera = (window.opera) ? true : false;

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
		k += (k.indexOf('.') === -1) ? '.00' : '00';
		return k.substring(0, k.indexOf('.') + 3);
	};
}

// http://ejohn.org/blog/fast-javascript-maxmin/
if (!Array.prototype.max) {
	Array.prototype.max = function () {
		return Math.max.apply(null, this);
	};
}
if (!Array.prototype.min) {
	Array.prototype.min = function () {
		return Math.min.apply(null, this);
	};
}
// http://snippets.dzone.com/posts/show/769
// http://jsfromhell.com/array/sum
if (!Array.prototype.sum) {
	Array.prototype.sum = function () {
		var i, sum;
		// for (i = 0, sum = 0; i < this.length ; sum += this[i++]);
		for (sum = 0, i = this.length; i; sum += this[--i]);
		return sum;
	};
}
if (!Array.prototype.avg) {
	Array.prototype.avg = function () {
		return this.sum() / this.length;
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
	var i, leni;
	for (i = 0, leni = this.length; i < leni; i++) {
		if (item == this[i]) {
			return true;
		}
	}
	return false;
};

Array.prototype.removePattern = function (patt, n) { // n = number of removes
	var i, leni, count = 0, cleaned = [];

	if (!n) {
		n = Infinity;
	}

	for (i = 0, leni = this.length; i < leni; i++) {
		if (this[i] == patt && count < n) { // must remove
			count += 1;
		} else {
			cleaned.push(this[i]);          // otherwise save
		}
	}
	return cleaned;
};

// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
		"use strict";
		var t, len, n, k;
		if (this == null) {
			throw new TypeError();
		}
		t = Object(this);
		len = t.length >>> 0;
		if (len === 0) {
			return -1;
		}
		n = 0;
		if (arguments.length > 0) {
			n = Number(arguments[1]);
			if (n != n) { // shortcut for verifying if it's NaN
				n = 0;
			} else if (n != 0 && n != Infinity && n != -Infinity) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
		}
		if (n >= len) {
			return -1;
		}
		k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement) {
				return k;
			}
		}
		return -1;
	}
}
RegExp.escape = function (str) {
	var specials = new RegExp('[.*+?|\\^$()\\[\\]{}\\\\]', 'g');
	return str.replace(specials, '\\$&');
};

// Date helpers
Date.prototype.getYearML = function () {  // Returns as string
	return this.getFullYear().toString();
}
Date.prototype.getMonthML = function () {  // Returns as string and zero padded
	var m = this.getMonth() + 1;  // zero based
	return (m < 10) ? '0' + m : m.toString();
}
Date.prototype.getDateML = function () {  // Returns as string and zero padded
	var d = this.getDate();
	return (d < 10) ? '0' + d : d.toString();
}
Date.prototype.getFullMonthML = function () {  // Returns "YYYY-MM"
	return this.getYearML() + '-' + this.getMonthML();
}
Date.prototype.getMonthName = function () {
	return i18n.monthNames[this.getMonth() + 1];  // zero based
}
Date.prototype.getMonthShortName = function () {
	return this.getMonthName().slice(0, 3);
}
Date.prototype.fromML = function (str) {  // str: YYYY-MM-DD
	this.setFullYear(
		parseInt(str.slice(0,  4), 10),
		parseInt(str.slice(5,  7), 10) - 1,  // month is zero-based
		parseInt(str.slice(8, 10), 10) || 1);
}
Date.prototype.toML = function () {  // Returns "YYYY-MM-DD"
	return this.getYearML() + '-' + this.getMonthML() + '-' + this.getDateML();
}
Date.prototype.format = function (fmt) {
	// Available tokens (i.e. for 1999-12-31):
	// Y=1999, y=99, m=12, d=31, b=Dec, B=December

	var d = this;
	// http://code.google.com/p/datejs/source/browse/trunk/src/core.js?spec=svn197&r=194#810
	return fmt.replace(
			/(\\)?[YymdBb]/g,
			function (m) {
				// Ignore escaped chars as \Y, \b, ...
				if (m.charAt(0) === '\\') {
					return m.replace('\\', '');
				}
				switch (m) {
					case 'Y':
						return d.getYearML() || 'Y';
					case 'y':
						return d.getYearML().slice(2, 4) || 'y';
					case 'm':
						return d.getMonthML() || 'm';
					case 'd':
						return d.getDateML() || 'd';
					case 'B':
						return d.getMonthName() || 'B';
					case 'b':
						return d.getMonthShortName() || 'b';
					default:
						return m;
				}
			}
		);
}
Date.prototype.setMonthOffset = function (n) {  // negative n is ok
	// Beware: 2010-01-31 + 1 = 2010-03-03
	// Set day to 1 to make month-related operations
	this.setMonth(this.getMonth() + (n || 0));
}
String.prototype.toDate = function () {
	var z = new Date();
	z.fromML(this);
	return z;
}


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

function getCurrentDate() {
	return new Date().toML();
}

function getPastMonth(months) {
	// months=0 means current month
	// Returns: YYYY-MM-00
	return formatDate(addMonths(getCurrentDate(), -months), 'Y-m-00');
}

function addMonths(yyyymmdd, n) {
	// It's all about months, not taking days into account.
	// addMonths("2010-01-31", 1)  -> "2010-02-31"
	// addMonths("2010-01-31", -2) -> "2009-11-31"

	var z = yyyymmdd.toDate();
	z.setDate(1);  // set day 1st
	z.setMonthOffset(n);  // add
	return z.toML().slice(0, 8) + yyyymmdd.slice(8, 10);  // restore original day
}

function getDataUniqueDates(periodType) {  // periodType: d, m, y
	// Returns array with unique (dates|months|years) in parsedData.
	// Note: parsedData is already sorted ASC by date.
	var i, leni, theData, item, last, slices, results = [];

	theData = parsedData.slice();  // array copy
	slices = { 'y': 4, 'm': 7, 'd': 10 };
	for (i = 0, leni = theData.length; i < leni; i++) {
		item = theData[i][0].slice(0, slices[periodType]);  // get date
		if (item !== last) {
			results.push(item);
			last = item;
		}
	}
	return results;
}

function getYearRange(date1, date2) {
	// Given two dates, returns array with all the years between them, inclusive.
	// Dates are strings formatted as YYYY-MM-DD.
	var y, y1, y2, results = [];

	if (date1 > date2) {  // no deal
		return results;
	}

	y1 = date1.toDate().getFullYear();
	y2 = date2.toDate().getFullYear();

	for (y = y1; y <= y2; y++) {  // from year1 to year2, inclusive
		results.push(y.toString());
	}
	return results;
}

function getMonthRange(date1, date2) {
	// Given two dates, returns array with all the months between them, inclusive.
	// Dates are strings formatted as YYYY-MM-DD.
	var y, y1, y2, m, m1, m2, ini, end, results = [];

	if (date1 > date2) {  // no deal
		return results;
	}

	// str to Date
	date1 = date1.toDate();
	date2 = date2.toDate();

	y1 = date1.getFullYear();
	y2 = date2.getFullYear();
	m1 = date1.getMonth() + 1;  // zero based
	m2 = date2.getMonth() + 1;

	for (y = y1; y <= y2; y++) {  // from year1 to year2, inclusive

		// First year: start from month1
		// Last year: end in month2
		ini = (y === y1) ? m1 : 1;
		end = (y === y2) ? m2 : 12;

		for (m = ini; m <= end; m++) {  // months loop
			results.push(y + '-' + ((m < 10) ? '0' + m : m));  // add leading zero
		}
	}
	return results;
}

function formatDate(date, fmt) {
	// date: YYYY-MM-DD, fmt: see Date.prototype.format()
	return date.toDate().format(fmt);
}

function formatReportDate(date) {
	// This key controls if the report date should be formatted
	if (!showLocaleDate) {
		return date;  // nothing to do
	}

	switch (date.length) {
		case 10:  // YYYY-MM-DD
			return formatDate(date, i18n.dateFormat);
		case 7:  // YYYY-MM
			return formatDate(date + '-01', i18n.dateFormatMonth);
		case 4:  // YYYY
			return formatDate(date + '-01-01', i18n.dateFormatYear);
		default:  // unknown format
			return date;
	}
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

function prettyFloatUndo(str) {
	str = str.replace(/<[^>]*>/g, '');              // remove HTML
	str = str.replace(i18n.thousandSeparator, '');  // remove separator chars
	str = str.replace(i18n.centsSeparator, '.');    // restore floating point
	return parseFloat(str);                         // str2float
}

function prettyBarLabel(n) { // Convert float to short strings: 1k2, 1m2, ...
	var negative;

	// Remove the signal for easier calculation
	negative = (n < 0);
	if (negative) {
		n = Math.abs(n);
	}

	// Less than 1,000: discard the cents and make the value integer
	if (n < 1000) {
		n = n.toString().replace(/\.(\d).*/, ''); // 123.45 > 123

	// From 1,000 to 999,999: discard the cents, then round the last 3 digits to 1 digit
	} else if (n >= 1000 && n < 1000000) {
		n = (n / 1000).toString();
		if (n.indexOf('.') !== -1) {
			n = n.replace(/\.(\d).*/, 'k$1');     // 1234.45 > 1k2
		} else {
			n = n + 'k';                          // 1000 > 1k
		}

	// From 1,000,000: discard the cents, then round the last 6 digits to 1 digit
	} else if (n >= 1000000) {
		n = (n / 1000000).toString();
		if (n.indexOf('.') !== -1) {
			n = n.replace(/\.(\d).*/, 'm$1');     // 1234567.89 > 1m2
		} else {
			n = n + 'm';                          // 1000000 > 1m
		}
	}

	// Maybe we have a (undesired) trailing zero?
	n = n.replace(/([km])0/, '$1'); // 2k0 > 2k

	// Restore signal (if needed)
	if (negative) {
		n = '-' + n;
	}

	return n;
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

// DOM Class helpers
function getClass(el) {
	if (el.className) {
		return el.className.strip().split(' ');
	} else {
		return [];
	}
}
function setClass(el, arr) {
	el.className = arr.join(' ');
}
function hasClass(el, klass) {
	return getClass(el).hasItem(klass);
}
function addClass(el, klass) {
	var arr = getClass(el);
	if (!arr.hasItem(klass)) {
		arr.push(klass);
		setClass(el, arr);
	}
}
function removeClass(el, klass) {
	var arr = getClass(el);
	if (arr.hasItem(klass)) {
		setClass(el, arr.removePattern(klass));
	}
}
function toggleClass(el, klass) {
	var arr = getClass(el);
	if (arr.hasItem(klass)) {
		setClass(el, arr.removePattern(klass));
		return false;
	} else {
		arr.push(klass);
		setClass(el, arr);
		return true;
	}
}

// CSS stylesheet add/remove
//
// http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
// http://dev.opera.com/articles/view/dynamic-style-css-javascript/
//
function addStyleSheet(element_id, contents) {
	var head, style, rules;

	head = document.getElementsByTagName('head')[0];
	style = document.createElement('style');
	rules = document.createTextNode(contents);

	style.id = element_id;
	style.type = 'text/css';
	if (style.styleSheet) {
		style.styleSheet.cssText = rules.nodeValue;
	} else {
		style.appendChild(rules);
	}
	head.appendChild(style);
}
function removeStyleSheet(element_id) {
	var el = document.getElementById(element_id);
	el.parentNode.removeChild(el);
}

function drawChart(values, labels) {
	var i, leni, label, height, value, valueShort, roof, chart, chartData, barType;

	chart = [];
	chartData = [];

	// Get the maximum absolute value
	// That will be the highest chart bar, using 100px
	// Other bars will be lower, proportionally
	roof = Math.max(
		Math.abs(values.max()),
		Math.abs(values.min())
	);

	// Calculate and format chart data
	for (i = 0, leni = values.length; i < leni; i++) {

		// This bar height = percentage of roof (but in pixels)
		height = parseInt(Math.abs(values[i]) * 100 / roof, 10);

		// Format the float value. For example 1234.56 turns to...
		value = prettyFloat(values[i], true);   // 1.234,56
		valueShort = prettyBarLabel(values[i]); // 1k2

		// Date: 2010-12 -> 2010<br>12
		label =  labels[i].replace('-', '<br>');

		chartData.push([label, height, value, valueShort]);
	}

	// Compose the chart table
	chart.push('<table class="chart">');

	// First line: the bars (label at top)
	chart.push('<tr>');

	// Compose each table column (== chart bar)
	for (i = 0, leni = chartData.length; i < leni; i++) {

		chart.push('<td class="bar">');

		// Will show bar value at top?
		if (showChartBarLabel) {
			chart.push(
				'<span class="label" title="' + chartData[i][2] + '">' +
				chartData[i][3] +
				'<\/span>'
				// Showing short value. Real value is stored as a tooltip.
			);
		}

		// The bar, a painted div with exact height
		barType = (chartData[i][3].substring(0, 1) === '-') ? 'negbar' : 'posbar';
		chart.push('<div class="bar ' + barType + '" style="height:' + chartData[i][1] + 'px"><\/div>');

		chart.push('<\/td>');
	}
	chart.push('<\/tr>');

	// Second line: the labels
	chart.push('<tr class="label">');
	for (i = 0, leni = chartData.length; i < leni; i++) {
		chart.push('<td>' + chartData[i][0] + '<\/td>');
	}
	chart.push('<\/tr>');

	// And we're done
	chart.push('<\/table>');
	chart = chart.join('\n');

	return chart;
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

	theRow.push((theMonth <= getCurrentDate().slice(0, 7)) ?
			'<tr onClick="toggleRowHighlight(this)">' :
			'<tr onClick="toggleRowHighlight(this)" class="future">');
	if (showRowCount) {
		theRow.push('<td class="row-count">' + rowCount + '<\/td>');
	}
	theRow.push('<td>' + formatReportDate(theMonth) + '<\/td>');
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
	var filepath;

	// Load the current data to the editor
	// Note: already loaded when localStorage
	if (appMode !== 'localStorage') {
		document.getElementById('editor-data').value = rawData;
	}

	// Hide content to avoid scroll bars
	document.getElementById('content').style.display = 'none';

	// Set file name
	if (appMode === 'localStorage') {
		filepath = 'Browser localStorage: ' + localStorageKey;
	} else if (appMode === 'dropbox') {
		filepath = 'Dropbox: ' + dropboxAppFolder + dropboxTxtFolder + '/' + getSelectedFile();
	} else {
		filepath = getSelectedFile();
	}
	document.getElementById('editor-file-name').innerHTML = filepath;

	// Show editor
	document.getElementById('editor').style.display = 'block';
}
function editorOff() {

	// Hide editor
	document.getElementById('editor').style.display = 'none';

	// Restore content
	document.getElementById('content').style.display = 'block';
}
function editorSave() {
	editorOff();
	saveLocalData();
}
function saveLocalData() {
	var editButton = document.getElementById('editor-open');

	editButton.innerHTML = i18n.msgSaving;
	localStorage.setItem(localStorageKey, document.getElementById('editor-data').value);
	// reload report
	resetData();
	readData();
	parseData();
	showReport();
	editButton.innerHTML = i18n.labelEdit;
}
function loadLocalData() {
	// first time using localStorage (or empty), load default data from #data (PRE)
	if (!localStorage.getItem(localStorageKey) || localStorage.getItem(localStorageKey).strip() === "") {
		localStorage.setItem(localStorageKey, document.getElementById('data').innerHTML);
	}
	document.getElementById('editor-data').value = localStorage.getItem(localStorageKey);
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
	document.getElementById('charts').style.display = 'none';  // hide charts when loading
	document.getElementById('report').innerHTML = i18n.msgLoading.replace('%s', filePath);
	resetData();
	iframeIsLoaded = false;
	document.getElementById('data-frame').src = filePath;
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
function getSelectedFile() {
	return dataFiles[document.getElementById('source-file').selectedIndex];
	// Note: IE7/8 fail at <select>.value, so we must use selectedIndex
}
function loadSelectedFile() {
	var filePath;

	// Reset multifile data
	multiRawData = '';
	waitingToLoad = [];

	filePath = getSelectedFile();

	showHideEditButton();

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
	if (appMode === 'localStorage') {
		loadLocalData();
		rawData = document.getElementById('editor-data').value;
	} else if (appMode === 'one' || appMode === 'dropbox') {
		rawData = document.getElementById('data').innerHTML;
	} else {
		// Note: Firefox/Camino won't read if the TXT file is in a parent folder.
		iframeDoc = document.getElementById('data-frame').contentWindow.document;
		rawData = iframeDoc.getElementsByTagName('pre')[0].innerHTML;
	}
}

function parseData() {
	var i, leni, j, lenj, rows, rowDate, rowAmount, rowText, rowTagsDescription, rowTags, rowDescription, recurrentAmount, recValue, recTimes, recOperator, lineno, fields, rowAmountErrorMsg, oldSort, trash;

	// Reset the data holder
	parsedData = [];

	// Split lines
	rows = rawData.split(dataRecordSeparator);

	// Scan data rows
	for (i = 0, leni = rows.length; i < leni; i++) {
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

		// New style matching method: regex
		if (useBlankFieldSeparator) {

			fields = rows[i].match(dataPatterns.rowBlankSeparated);

			if (!fields) {
				invalidData(lineno, rows[i]);
				return;  // abort at first error
			}

			trash = fields.shift();  // field[0] is the full match

		// Old style matching method: split
		} else {

			// Separate fields
			fields = rows[i].split(dataFieldSeparator);

			// Error: rows with no separator
			if (fields.length === 1) {
				invalidData(
					lineno,
					i18n.errorNoFieldSeparator + ' "' + dataFieldSeparator + '"\n\n' + rows[i]
				);
				return;  // abort at first error

			// Error: too much separators
			} else if (fields.length - 1 > 2) {
				invalidData(
					lineno,
					i18n.errorTooManySeparators + ' "' + dataFieldSeparator + '"\n\n' + rows[i]
				);
				return;  // abort at first error
			}
		}

		//// At this point we have:
		// fields[0] -> date
		// fields[1] -> amount
		// fields[2] -> text (tags + description)
		//
		// The contents will be validated in the following lines.

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

			if (recOperator === '/') {
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
			for (j = 0, lenj = rowTags.length; j < lenj; j++) {
				rowTags[j] = rowTags[j].strip();
			}
			// Remove empty tags
			rowTags = rowTags.removePattern('');

		// No tags
		} else {
			rowTags = [];
			rowDescription = rowText || '&nbsp;';
		}

		/////////////////////////////////////////////////////////////

		// Ignore old or future data?
		// Note: This code *must* be here at the end of the loop,
		//       specially after the recurring data code. If not,
		//       recurring data could be lost.
		if (ignoreDataOlderThan && rowDate < ignoreDataOlderThan) {
			continue;
		}
		if (ignoreDataNewerThan && rowDate > ignoreDataNewerThan) {
			continue;
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

	// Save first and last date as globals
	if (parsedData.length > 0) {
		dataFirstDate = parsedData[0][0];
		dataLastDate = parsedData[parsedData.length-1][0];

		// Update the date range combos
		populateDateRangeCombos('m');
		populateDateRangeCombos('y');
	} else {
		dataFirstDate = dataLastDate = undefined;
	}
}

function filterData() {
	var i, leni, temp, theData, isRegex, isNegated, filter, filterPassed, firstDate, lastDate, showFuture, filteredData, thisDate, thisValue, thisTags, thisDescription, valueFilter, valueFilterArg;

	theData = parsedData.slice();  // array copy
	isRegex = false;
	isNegated = false;
	filter = '';
	firstDate = 0;
	lastDate = '9999-99-99';
	filteredData = [];

	// New style date options
	if (!useLegacyDateFilter) {

		if (document.getElementById('opt-date-1-check').checked) {
			if (reportType === 'y') {
				firstDate = document.getElementById('opt-date-1-year-combo').value + '-00-00';
			} else {
				firstDate = document.getElementById('opt-date-1-month-combo').value + '-00';
			}
		}
		if (document.getElementById('opt-date-2-check').checked) {
			if (reportType === 'y') {
				lastDate = document.getElementById('opt-date-2-year-combo').value + '-99-99';
			} else {
				lastDate = document.getElementById('opt-date-2-month-combo').value + '-99';
			}
		}

	// Old style date options
	} else {

		// [X] Recent Only, works for daily/monthly
		if (document.getElementById('opt-last-months-check').checked && reportType !== 'y') {
			firstDate = getPastMonth(parseInt(document.getElementById('opt-last-months-combo').value, 10) - 1);  // 1 = current
		}
		// [X] Future Data, works for all reports
		showFuture = document.getElementById('opt-future-check').checked;
		if (!showFuture) {
			lastDate = getCurrentDate();
		}
	}


	// Get filters data for the detailed report
	if (reportType === 'd') {
		filter = document.getElementById('filter').value;
		isRegex = document.getElementById('opt-regex-check').checked;
		isNegated = document.getElementById('opt-negate-check').checked;

		if (document.getElementById('opt-value-filter-check').checked) {
			valueFilter = document.getElementById('opt-value-filter-combo').value;
			valueFilterArg = parseInt(document.getElementById('opt-value-filter-number').value, 10) || 0;
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
	for (i = 0, leni = theData.length; i < leni; i++) {

		// date value [tags] description
		thisDate = theData[i][0];
		thisValue = theData[i][1];
		thisTags = theData[i][2].slice();  // array copy
		thisDescription = theData[i][3];

		///////////////////////////////////////////////////////////// Filters

		// Apply date filter
		if (thisDate < firstDate) {
			continue;
		}
		if (thisDate > lastDate) {
			break;  // theData is ordered by date, we can safely break here
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
				filterPassed = filter.test(theData[i].join('\t'));
			} else {
				filterPassed = (theData[i].join('\t').toLowerCase().indexOf(filter) !== -1);
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

	var i, leni, j, lenj, rowTags, thisTag, tagMatched, tagName, tagId, checked, tagCount, tagElement, tagsMenu, selectedTags, filteredData, tagMustGroup, tagNegate;

	tagsMenu = [];
	selectedTags = [];
	filteredData = [];
	theData = theData.slice();  // array copy

	// Get multiple selection mode (true=AND, false=OR)
	tagMustGroup = document.getElementById('tag-cloud-opt-group-check').checked;
	tagNegate = document.getElementById('tag-cloud-opt-negate-check').checked;

	// Get currently selected tags (from interface)
	try {
		tagCount = parseInt(document.getElementById('tag-cloud-count').value, 10);
		for (i = 1; i <= tagCount; i++) {
			tagElement = document.getElementById('tag_' + i);
			if (tagElement && tagElement.checked) {
				selectedTags.push(tagElement.value);
			}
		}
	} catch (e) { }

	// Filter data to match current tags
	for (i = 0, leni = theData.length; i < leni; i++) {

		// Array order: date, amount, tags, desc
		rowTags = theData[i][2].slice();  // array copy

		// Populate tags array with UNIQUE row tags
		for (j = 0, lenj = rowTags.length; j < lenj; j++) {
			if (!tagsMenu.hasItem(rowTags[j])) {
				tagsMenu.push(rowTags[j]);
			}
		}

		// Tag Filter is active. This line matches it?
		if (selectedTags.length > 0) {

			for (j = 0, lenj = selectedTags.length; j < lenj; j++) {

				thisTag = selectedTags[j];
				tagMatched = (rowTags.hasItem(thisTag) ||
					(thisTag === i18n.labelTagEmpty && rowTags.length === 0));
					// Tip: space means no tag

				if (tagMatched && (!tagMustGroup)) { break; } // OR
				if (!tagMatched && (tagMustGroup)) { break; } // AND
			}
			if ((tagMatched && !tagNegate) || (!tagMatched && tagNegate)) {
				filteredData.push(theData[i]);
			}
		}
	}

	// Make sure the menu has all the selected tags
	for (i = 0, leni = selectedTags.length; i < leni; i++) {
		if (!tagsMenu.hasItem(selectedTags[i]) && selectedTags[i] !== i18n.labelTagEmpty) {
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
		document.getElementById('tag-cloud-count').value = tagsMenu.length;

		// Add one checkbox for each tag
		for (i = 0, leni = tagsMenu.length; i < leni; i++) {
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
	document.getElementById('tag-cloud-tags').innerHTML = tagsMenu;

	// The options box is only shown if we have at least 1 selected tag
	document.getElementById('tag-cloud-options').style.display = (selectedTags.length > 0) ? 'block' : 'none';

	// The group option is only shown if we have at least 2 selected tags
	document.getElementById('tag-cloud-opt-group-box').style.display = (selectedTags.length > 1) ? 'block' : 'none';

	// The reset option is only shown if we have at least 3 selected tags
	document.getElementById('tag-cloud-opt-reset-box').style.display = (selectedTags.length > 2) ? 'block' : 'none';

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

function updateSelectedRowsSummary() {
	var i, leni, data, arr, table, label, value, col_nr, col_index;

	data = [];
	arr = [];
	table = [];

	if (selectedRows.length > 1) {  // Summary for 2 or more rows

		// Ok. We have a selectedRows array filled with all the selected TR elements.
		// Now we will scan these elements to extract data and calculate everything.

		// First we need to find out which column we will get of each of this rows.
		// Diary report: when only have the (2) Amount column to query
		// Monthly/Yearly: we have (2) Incoming, (3) Expense, (4) Partial
		//
		if (reportType === 'd') {
			col_nr = 2;
		} else {
			col_nr = parseInt(document.getElementById('rows-summary-index').value, 10);
		}

		// The column number is affected by the presence of the row count column
		if (showRowCount) {
			col_nr += 1;
		}

		// We will soon query each TR element for a specific child TD.
		// Our column count is one-based, but the TR children array is ZERO-based.
		col_index = col_nr - 1;

		for (i = 0, leni = selectedRows.length; i < leni; i++) {
			tr_element = selectedRows[i];
			td_element = tr_element.getElementsByTagName('td')[col_index];

			// Inside the TD, the number is inside a SPAN tag, examples:
			//     <td class="number"><span class="neg">-123,45</span></td>
			//     <td class="number"><span class="pos">123,45</span></td>
			//
			value = td_element.getElementsByTagName('span')[0].firstChild.nodeValue;

			// The value is a formatted string, we need to convert it to float
			value = prettyFloatUndo(value);

			data.push(value);
		}

		// Now the 'data' array is filled. We can proceed to the math.

		// Calculate
		arr.push([i18n.labelTotal,   prettyFloat(data.sum())]);
		arr.push([i18n.labelAverage, prettyFloat(data.avg())]);
		arr.push([i18n.labelMinimum, prettyFloat(data.min())]);
		arr.push([i18n.labelMaximum, prettyFloat(data.max())]);
		arr.push([i18n.labelCount,   data.length]);

		// Compose the HTML table
		table.push('<table>');
		for (i = 0, leni = arr.length; i < leni; i++) {
			label = arr[i][0];
			value = arr[i][1];
			table.push(
				'<tr>' +
				'<td>' + label +  '<\/td>' +
				'<td class="number"> ' + value + '<\/td>' +
				'<\/tr>'
			);
		}
		table.push('<\/table>');

		// Show summary
		document.getElementById('rows-summary-content').innerHTML = table.join('\n');
		document.getElementById('rows-summary').style.display = 'block';

		// Hide combo in diary report, since there's only one available column
		document.getElementById('rows-summary-index').style.display = (reportType === 'd') ? 'none' : 'inline';

	} else {
		// No data, hide summary
		document.getElementById('rows-summary').style.display = 'none';
	}
}

function updateTagSummary(theData) {
	var i, leni, j, lenj, tag, value, results, tagNames, tagData, rowAmount, rowTags, noTagSum, valueSort, oldSort;

	results = [];
	tagNames = [];
	tagData = {};
	tableData = [];
	valueSort = document.getElementById('tag-summary-opt-nsort-check').checked;
	noTagSum = undefined;  // Do not use 0. The final result may be zero.
	theData = theData.slice();  // array copy

	// Scan report rows
	for (i = 0, leni = theData.length; i < leni; i++) {
		// rowDate        = theData[i][0];
		rowAmount      = theData[i][1];
		rowTags        = theData[i][2].slice();  // array copy
		// rowDescription = theData[i][3];

		if (rowTags.length === 0) {
			// No tag in this row
			if (noTagSum === undefined) {
				noTagSum = 0;
			}
			noTagSum += rowAmount;

		} else {
			// Sum all values for the same tag
			for (j = 0, lenj = rowTags.length; j < lenj; j++) {
				tag = rowTags[j];

				// New tag?
				if (!tagNames.hasItem(tag)) {
					tagData[tag] = 0;
					tagNames.push(tag);
				}
				tagData[tag] = tagData[tag] + rowAmount;
			}
		}
	}

	// We have tags?
	if (tagNames.length || noTagSum !== undefined) {

		// Sort tag names
		tagNames.sort(sortIgnoreCase);

		// Append no-tag data to the end of the table
		if (noTagSum !== undefined && showEmptyTagInSummary) {
			tagNames.push(i18n.labelTagEmpty);
			tagData[i18n.labelTagEmpty] = noTagSum;
		}

		// Save table data, sorted by tag name
		for (i = 0, leni = tagNames.length; i < leni; i++) {
			tag = tagNames[i];
			tableData.push([tag, tagData[tag]]);
		}

		// Sort by value?
		if (valueSort) {
			// Note: save/restore the global var contents
			oldSort = sortColIndex;
			sortColIndex = 1;
			tableData.sort(sortArray);
			sortColIndex = oldSort;
		}

		// Compose the HTML table
		results.push('<table>');
		for (i = 0, leni = tableData.length; i < leni; i++) {
			results.push(
				'<tr>' +
				'<td>' + tableData[i][0] +  '<\/td>' +
				'<td class="number"> ' + prettyFloat(tableData[i][1]) + '<\/td>' +
				'<\/tr>'
			);
		}
		results.push('<\/table>');
	}

	// Save results to the respective DIV
	results = results.join('\n');
	document.getElementById('tag-summary-data').innerHTML = results;

	// The options box is only shown if we have at least 2 tags
	document.getElementById('tag-summary-options').style.display = (tableData.length > 1) ? 'block' : 'none';
}

function showOverview() {
	var i, leni, z, len, rowDate, rowAmount, theData, thead, results, grandTotal, dateSize, rangeDate, rangeTotal, rangePos, rangeNeg, sumPos, sumNeg, sumTotal, currSortIndex, minPos, minNeg, minPartial, minBalance, maxPos, maxNeg, maxPartial, maxBalance, maxNumbers, minNumbers, chart, chartCol, chartValues, chartLabels;


	results = [];
	grandTotal = rangeTotal = rangePos = rangeNeg = sumPos = sumNeg = sumTotal = 0;
	minPos = minNeg = minPartial = minBalance = maxPos = maxNeg = maxPartial = maxBalance = 0;
	currSortIndex = sortColIndex;

	// Table headings
	thead = '<th onClick="sortCol(0)">' + i18n.labelsOverview[0] + '<\/th>';
	thead += '<th onClick="sortCol(1)">' + i18n.labelsOverview[1] + '<\/th>';
	thead += '<th onClick="sortCol(2)">' + i18n.labelsOverview[2] + '<\/th>';
	thead += '<th onClick="sortCol(3)">' + i18n.labelsOverview[3] + '<\/th>';
	thead += '<th onClick="sortCol(4)">' + i18n.labelsOverview[4] + '<\/th>';
	if (showMiniBars) {
		thead += '<th class="percent">%<\/th>';
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

			for (i = 0, leni = theData.length; i < leni; i++) {
				rowDate        = theData[i][0];
				rowAmount      = theData[i][1];
				// rowTags        = theData[i][2].slice();  // array copy
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
		for (i = 0, leni = overviewData.length; i < leni; i++) {

			// Calculate overall totals
			z = overviewData[i].slice();  // array copy
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

		// Always reset Rows Summary when generating reports
		selectedRows = [];
		updateSelectedRowsSummary();

		// Now charts!
		if (showCharts) {

			chartValues = [];
			chartLabels = [];

			// Get all values for the selected column
			chartCol = parseInt(document.getElementById('chart-data').value, 10) || 1;
			for (i = 0, leni = overviewData.length; i < leni; i++) {
				chartValues.push(overviewData[i][chartCol]);
				chartLabels.push(overviewData[i][0]);  // month or year
			}

			// Get chart and show it
			chart = drawChart(chartValues, chartLabels);
			document.getElementById('chart-content').innerHTML = chart;
			document.getElementById('charts').style.display = 'block';
		} else {
			document.getElementById('charts').style.display = 'none';
		}

	} else {
		results = '<p>' + i18n.labelNoData + '<\/p>';

		// Hide charts when there's no data
		document.getElementById('charts').style.display = 'none';
	}
	document.getElementById('report').innerHTML = results;
}

function showDetailed() {
	var thead, i, leni, j, lenj, k, lenk, rowDate, rowAmount, rowTags, rowDescription, monthTotal, monthPos, monthNeg, rowCount, results, monthPartials, theData, sumPos, sumNeg, sumTotal, chart, chartCol, chartLabels, chartValues, chartValuesSelected, currentDate;

	sumTotal = sumPos = sumNeg = monthTotal = monthPos = monthNeg = rowCount = 0;
	results = [];
	chartValues = [];
	chartLabels = [];

	monthPartials = document.getElementById('opt-monthly-check');
	theData = applyTags(filterData());

	if (theData.length > 0) {

		currentDate = getCurrentDate();

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
		for (i = 0, leni = theData.length; i < leni; i++) {

			rowDate        = theData[i][0];
			rowAmount      = theData[i][1];
			rowTags        = theData[i][2].slice();  // array copy
			rowDescription = theData[i][3];
			rowCount      += 1;

			// This row starts a new month? Must we show the partials?
			if (monthPartials.checked && i > 0 &&
					rowDate.slice(0, 7) !=
					theData[i - 1][0].slice(0, 7)) {
				results.push(getTotalsRow(sumTotal, monthTotal, monthNeg, monthPos));
				// Save month data for the chart (-1 is a fake entry, one-based array)
				chartValues.push([-1, monthPos, monthNeg, monthTotal, sumTotal]);
				chartLabels.push(theData[i - 1][0].slice(0, 7)); // month
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
			for (j = 0, lenj = highlightTags.length; j < lenj; j++) {
				for (k = 0, lenk = rowTags.length; k < lenk; k++) {
					if (rowTags[k] === highlightTags[j]) {
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

			results.push('<td class="date">'   + formatReportDate(rowDate) + '<\/td>');
			results.push('<td class="number">' + prettyFloat(rowAmount)    + '<\/td>');
			results.push('<td class="tags">'   + rowTags.join(', ')        + '<\/td>');
			results.push('<td>'                + rowDescription            + '<\/td>');
			results.push('<td class="number">' + prettyFloat(sumTotal)     + '<\/td>');
			results.push('<\/tr>');

		}

		// Should we show the full month partials at the last row?
		if (monthPartials.checked) {
			results.push(getTotalsRow(sumTotal, monthTotal, monthNeg, monthPos));
		} else {
			results.push(getTotalsRow(sumTotal, '', sumNeg, sumPos));
		}

		// Save chart data for this last month
		chartValues.push([-1, monthPos, monthNeg, monthTotal, sumTotal]);
		chartLabels.push(theData[theData.length - 1][0].slice(0, 7)); // month

		results.push('<\/table>');
		results = results.join('\n');

		// Real dirty hack to insert totals row at the table beginning (UGLY!)
		// results = results.replace('<\/th><\/tr>', '<\/th><\/tr>' + getTotalsRow(sumTotal, '', sumNeg, sumPos));


		// Tag Summary
		updateTagSummary(theData);

		// Always reset Rows Summary when generating reports
		selectedRows = [];
		updateSelectedRowsSummary();

		// Now charts!
		// Note: monthPartials option is required to be ON
		if (showCharts && monthPartials.checked) {

			// Get all values for the selected column
			chartValuesSelected = [];
			chartCol = parseInt(document.getElementById('chart-data').value, 10) || 1;
			for (i = 0, leni = chartValues.length; i < leni; i++) {
				chartValuesSelected.push(chartValues[i][chartCol]);
			}

			// Get chart and show it
			chart = drawChart(chartValuesSelected, chartLabels);
			document.getElementById('chart-content').innerHTML = chart;
			document.getElementById('charts').style.display = 'block';
		} else {
			document.getElementById('charts').style.display = 'none';
		}

	} else {
		results = '<p>' + i18n.labelNoData + '<\/p>';

		// Clear Tag Summary contents
		updateTagSummary([]);

		// Hide charts when there's no data
		document.getElementById('charts').style.display = 'none';

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
	var el = document.getElementById('chart-data');
	el.options[0] = new Option(i18n.labelsOverview[1], 1);  // Incoming
	el.options[1] = new Option(i18n.labelsOverview[2], 2);  // Expense
	el.options[2] = new Option(i18n.labelsOverview[3], 3);  // Partial
	el.options[3] = new Option(i18n.labelsOverview[4], 4);  // Balance
}

function populateRowsSummaryCombo() {
	var el = document.getElementById('rows-summary-index');
	el.options[0] = new Option(i18n.labelsOverview[1], 2);  // Incoming
	el.options[1] = new Option(i18n.labelsOverview[2], 3);  // Expense
	el.options[2] = new Option(i18n.labelsOverview[3], 4);  // Partial
}

function populateDataFilesCombo() {
	var el, i, leni;
	if (appMode === 'txt' || appMode === 'dropbox') {
		el = document.getElementById('source-file');
		for (i = 0, leni = dataFiles.length; i < leni; i++) {
			el.options[i] = new Option(dataFiles[i]);
		}
	}
}

function populateLastMonthsCombo() {
	var el, label, i;
	el = document.getElementById('opt-last-months-combo');
	label = i18n.labelMonths[0];
	for (i = 1; i <= maxLastMonths; i++) {
		if (i > 1) {
			label = i18n.labelMonths[1];
		}
		el.options[i - 1] = new Option(i + ' ' + label, i);
	}
	el.selectedIndex = (initLastMonths > 0) ? initLastMonths - 1 : 0;
}

function populateDateRangeCombos(comboType) {  // comboType: m, y
	var el1, el2, i, leni, my, range, fmt, offset1, offset2, index1, index2;

	if (comboType === 'y') {
		el1 = document.getElementById('opt-date-1-year-combo');
		el2 = document.getElementById('opt-date-2-year-combo');
		offset1 = initYearOffsetFrom;
		offset2 = initYearOffsetUntil;
		fmt = 'Y';
		range = getDataUniqueDates('y');
	} else {
		el1 = document.getElementById('opt-date-1-month-combo');
		el2 = document.getElementById('opt-date-2-month-combo');
		offset1 = initMonthOffsetFrom;
		offset2 = initMonthOffsetUntil;
		fmt = 'Y-m';
		range = getDataUniqueDates('m');
	}

	//// Let's choose which items to select by default.
	//
	// Get user defaults
	if (typeof offset1 === 'number') {
		offset1 = (comboType === 'y') ? offset1 * 12 : offset1;
		index1 = range.indexOf(
			formatDate(
				addMonths(getCurrentDate(), offset1),  // apply offset
				fmt));
	}
	if (typeof offset2 === 'number') {
		offset2 = (comboType === 'y') ? offset2 * 12 : offset2;
		index2 = range.indexOf(
			formatDate(
				addMonths(getCurrentDate(), offset2),  // apply offset
				fmt));
	}
	//
	// If unset or out of range, we'll select the oldest and newer
	if (index1 === -1) {
		index1 = 0;
	}
	if (index2 === -1) {
		index2 = range.length - 1;
	}

	// First, make sure the combo is empty
	el1.options.length = 0;
	el2.options.length = 0;

	// Both combos 1 and 2 will have the same items
	for (i = 0, leni = range.length; i < leni; i++) {
		if (comboType === 'y') {
			el1.options[i] = new Option(range[i]);
			el2.options[i] = new Option(range[i]);
		} else {
			my = (range[i] + '-01').toDate().format('b Y');  // short month name
			el1.options[i] = new Option(my, range[i]);
			el2.options[i] = new Option(my, range[i]);
		}
	}

	// Set selected items
	el1.selectedIndex = index1;
	el2.selectedIndex = index2;
}

function populateValueFilterCombo() {
	var el;
	el = document.getElementById('opt-value-filter-combo');
	el.options[0] = new Option('+ ' + i18n.labelPositive, '+');
	el.options[1] = new Option('- ' + i18n.labelNegative, '-');
	el.options[2] = new Option('> ' + i18n.labelGreaterThan, '>');
	el.options[3] = new Option('< ' + i18n.labelLessThan, '<');
}

function updateToolbar() {
	var i, leni, add, remove, hide, unhide;

	// Visibility On/Off
	// Monthly/Yearly report hides some controls from the toolbar.
	//
	// Some fields are just hidden to preserve the page layout.
	// Others must be removed to free vertical space.

	add = [];
	remove = [];
	hide = [];
	unhide = [];
	add_exceptions = [];

	if (!showViewWidget) { add_exceptions.push('view-options-box'); }
	if (!showTagCloud)   { add_exceptions.push('tag-cloud-box'   ); }
	if (!showTagSummary) { add_exceptions.push('tag-summary-box' ); }

	// Daily
	if (reportType === 'd') {
		unhide = [
			'search-box',
			'opt-monthly-box',
			'opt-value-filter-box',
			'opt-last-months-box',
			'tag-cloud-box',
			'tag-summary-box'
		];
		add = [
			'opt-date-1-month-combo',
			'opt-date-2-month-combo'
		];
		remove = [
			'opt-date-1-year-combo',
			'opt-date-2-year-combo'
		];
	// Monthly
	} else if (reportType === 'm') {
		hide = [
			'search-box',
			'opt-monthly-box',
			'opt-value-filter-box',
			'tag-cloud-box',
			'tag-summary-box'
		];
		unhide = [
			'opt-last-months-box',
		];
		add = [
			'opt-date-1-month-combo',
			'opt-date-2-month-combo'
		];
		remove = [
			'opt-date-1-year-combo',
			'opt-date-2-year-combo'
		];
	// Yearly
	} else if (reportType === 'y') {
		hide = [
			'search-box',
			'opt-monthly-box',
			'opt-value-filter-box',
			// Recent *months* doesn't make sense in yearly report
			'opt-last-months-box',
			'tag-cloud-box',
			'tag-summary-box'
		];
		add = [
			'opt-date-1-year-combo',
			'opt-date-2-year-combo'
		];
		remove = [
			'opt-date-1-month-combo',
			'opt-date-2-month-combo'
		];
	}

	// Show/hide toolbar elements
	for (i = 0, leni = add.length; i < leni; i++) {
		if (!add_exceptions.hasItem(add[i])) {
			document.getElementById(add[i]).style.display = 'block';
		}
	}
	for (i = 0, leni = remove.length; i < leni; i++) {
		document.getElementById(remove[i]).style.display = 'none';
	}
	for (i = 0, leni = hide.length; i < leni; i++) {
		document.getElementById(hide[i]).style.visibility = 'hidden';
	}
	for (i = 0, leni = unhide.length; i < leni; i++) {
		document.getElementById(unhide[i]).style.visibility = 'visible';
	}
}


/////////////////////////////////////////////////////////////////////
//                         EVENT HANDLERS
/////////////////////////////////////////////////////////////////////

function sortCol(index) {
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
	removeClass(document.getElementById(oldType), 'active');
	addClass(el, 'active');

	//// Save / restore information

	// From Daily to Monthly/Yearly
	if (oldType === 'd' && newType !== 'd') {
		oldSortColIndex = sortColIndex;
		oldSortColRev = sortColRev;
		sortColIndex = 0; // Default by date
		sortColRev = false;
	//
	// From Monthly/Yearly to Daily
	} else if (newType === 'd' && oldType !== 'd') {
		sortColIndex = oldSortColIndex || 0;
		sortColRev = oldSortColRev || false;
	}

	// Always reset Rows Summary when changing reports
	selectedRows = [];
	updateSelectedRowsSummary();

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
	document.getElementById('opt-last-months-check').checked = true;
	overviewData = [];
	showReport();
}

function dateRangeComboChanged() {
	document.getElementById(this.id.replace(/(month|year)-combo/, 'check')).checked = true;
	toggleDateRange();
}

function toggleFullScreen() {
	var toolbar, logo, content;

	toolbar = document.getElementById('toolbar-controls-wrapper');
	logo = document.getElementById('logo');
	content = document.getElementById('content');

	if (isFullScreen) {
		toolbar.style.display = 'block';
		logo.style.display = 'block';
		content.style.marginLeft = '217px';  // #toolbar width
		isFullScreen = false;
	} else {
		toolbar.style.display = 'none';
		logo.style.display = 'none';
		content.style.marginLeft = 0;
		isFullScreen = true;
	}
}

function toggleFuture() {
	overviewData = [];  // clear cache
	showReport();
}

function toggleDateRange() {
	overviewData = [];  // clear cache
	showReport();
}

function toggleToolbarBox(header_id, content_id) {
	// Handle toolbar box header clicking: show/hide contents
	var header, content;
	header = document.getElementById(header_id);
	content = document.getElementById(content_id);
	if (content.style.display === 'block') {
		content.style.display = 'none';
		removeClass(header, 'active');
	} else {
		content.style.display = 'block';
		addClass(header, 'active');
	}
	return false; // cancel default link action
}
function toggleViewOptions() {
	return toggleToolbarBox('view-options-header', 'view-options-content');
}
function toggleTagCloud() {
	return toggleToolbarBox('tag-cloud-header', 'tag-cloud-content');
}
function toggleTagSummary() {
	return toggleToolbarBox('tag-summary-header', 'tag-summary-content');
}

function toggleLastMonths() {
	toggleCheckboxOptionExtra(this);
	overviewData = [];  // clear cache
	showReport();
}

function toggleValueFilter() {
	toggleCheckboxOptionExtra(this);
	showReport();
}

function toggleMonthly() {
	if (document.getElementById('opt-monthly-check').checked === true) {
		sortColIndex = 0;
		sortColRev = false;
	}
	showReport();
}

function toggleCheckboxOptionExtra(checkbox) {
	// Show/hide the "*-extra" DIV with aditional options
	var extra = document.getElementById(checkbox.id.replace('-check', '-extra'));
	if (hasClass(extra, 'auto-hide')) {
		extra.style.display = (checkbox.checked) ? 'block' : 'none';
	}
}

function toggleRowHighlight(el) {
	// This function is called when user clicks a report row.
	// The visual highlight is turned ON by the class 'selected'.
	// The selected clicked rows are saved to the global holder selectedRows.

	if (hasClass(el, 'selected')) {
		// turn OFF
		removeClass(el, 'selected');
		selectedRows = selectedRows.removePattern(el, 1);
	} else {
		// turn ON
		addClass(el, 'selected');
		selectedRows.push(el);
	}

	// Refresh the summary
	updateSelectedRowsSummary();
}

function valueFilterChanged() {
	overviewData = [];

	// autocheck checkbox
	document.getElementById('opt-value-filter-check').checked = true;

	// show/hide the filter argument textbox
	if (document.getElementById('opt-value-filter-combo').value.match(/[+\-]/)) {
		document.getElementById('opt-value-filter-number').style.display = 'none';
	} else {
		document.getElementById('opt-value-filter-number').style.display = 'inline';
	}

	showReport();
}

function resetTagCloud() {
	var i, leni, tagcloud, checkboxes;

	tagcloud = document.getElementById('tag-cloud-tags');
	checkboxes = tagcloud.getElementsByTagName('input');

	for (i = 0, leni = checkboxes.length; i < leni; i++) {
		checkboxes[i].checked = false;
		checkboxes[i].removeAttribute('checked');
		// Note: Since I'm using CSS rule "input[checked]+span", checked=false is not enough.
	}

	// The calling checkbox acts like a button, with temporary ON state
	this.checked = false;

	showReport();
}
function showHideEditButton() {
	var el;
	if (appMode === 'dropbox') {
		// Hide Edit button when current file is '*'
		el = document.getElementById('editor-open');
		el.style.visibility = (getSelectedFile() === '*') ? 'hidden' : 'visible';
	}
}


/////////////////////////////////////////////////////////////////////
//                             INIT
/////////////////////////////////////////////////////////////////////

function initAppMode() {
	switch(appMode) {

		case 'one':
			appFlavor = 'Portable';
			i18n.appUrl = 'http://aurelio.net/moneylog/moneylog5.html';
			break;

		case 'localStorage':
			appFlavor = 'Browser';
			i18n.appUrl = i18n.appUrlOnline;
			break;

		case 'dropbox':
			// Can't use the word Dropbox in app name
			// https://www.dropbox.com/developers/reference/branding
			appFlavor = 'Cloud';
			i18n.appUrl = 'http://moneylog-cloud.appspot.com';
			break;

		case 'txt':
			appFlavor = 'TXT';
			appVersion = '∞';
			i18n.appUrl = 'http://aurelio.net/moneylog/beta.html';
			break;

		default:
			alert('FATAL ERROR: Invalid setting appMode = ' + appMode);
	}
}

function init() {

	// Load the i18n messages (must be the first)
	i18n = i18nDatabase.getLanguage(lang);

	// Legacy: discover app mode using obsoleted settings
	if (!appMode) {
		if (oneFile) {
			appMode = 'one';
		} else if (useLocalStorage) {
			appMode = 'localStorage';
		} else if (useDropboxStorage) {
			appMode = 'dropbox';
		} else {  // local TXT
			appMode = 'txt';
		}
	}

	// Check app mode
	initAppMode();

	// Password protected?
	if (myPassword) {
		// Prompt user and check
		if (myPassword != prompt(appName + ' ' + appFlavor + ' — ' + i18n.msgTypePassword)) {
			// Destroy full interface and show error
			document.getElementById('container').innerHTML = '<h2 style="padding:30px;">' + i18n.msgWrongPassword + '</h2>';
			return;  // abort
		}
	}

	// UI surgery for each mode
	switch(appMode) {
		case 'one':
			// Remove all file-related options
			document.getElementById('source-file-box').style.display = 'none';
			document.getElementById('toolbar-sep-1').style.display = 'none';
			break;

		case 'localStorage':
			// Hide Reload button and files combo. Not needed.
			document.getElementById('source-reload').style.display = 'none';
			document.getElementById('source-file').style.display = 'none';
			// Stretch Edit button
			addClass(document.getElementById('editor-open'), 'wide');
			document.getElementById('editor-open').style.marginTop = 0;
			break;

		case 'dropbox':
			showHideEditButton();
			break;

		case 'txt':
			// Hide Edit button. Not functional.
			document.getElementById('editor-open').style.display = 'none';
			// Stretch Reload button
			addClass(document.getElementById('source-reload'), 'wide');
			break;
	}

	// Set page title
	document.title = appName + ' ' + appFlavor;

	// Prepare UI elements
	populateLastMonthsCombo();
	populateDataFilesCombo();
	populateChartColsCombo();
	populateRowsSummaryCombo();
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
	if (typeof highlightTags === 'string') {
		highlightTags = highlightTags.strip().split(/\s+/);
	}

	// Set interface labels
	document.getElementById('app-flavor'               ).innerHTML = appFlavor;
	document.getElementById('d'                        ).innerHTML = i18n.labelDaily;
	document.getElementById('m'                        ).innerHTML = i18n.labelMonthly;
	document.getElementById('y'                        ).innerHTML = i18n.labelYearly;
	document.getElementById('opt-last-months-label'    ).innerHTML = i18n.labelLastMonths + ':';
	document.getElementById('opt-value-filter-label'   ).innerHTML = i18n.labelValueFilter + ':';
	document.getElementById('opt-future-label'         ).innerHTML = i18n.labelFuture;
	document.getElementById('opt-monthly-label'        ).innerHTML = i18n.labelMonthPartials;
	document.getElementById('opt-regex-label'          ).innerHTML = i18n.labelRegex;
	document.getElementById('opt-negate-label'         ).innerHTML = i18n.labelNegate;
	document.getElementById('tag-cloud-opt-negate-label').innerHTML = i18n.labelTagNegate;
	document.getElementById('tag-cloud-opt-group-label').innerHTML = i18n.labelTagGroup;
	document.getElementById('tag-cloud-opt-reset-label').innerHTML = i18n.labelTagReset;
	document.getElementById('tag-summary-opt-nsort-label').innerHTML = i18n.labelTagSummarySort;
	document.getElementById('source-reload'            ).innerHTML = i18n.labelReload;
	document.getElementById('editor-open'              ).innerHTML = i18n.labelEdit;
	document.getElementById('editor-close'             ).innerHTML = i18n.labelCancel;
	document.getElementById('editor-save'              ).innerHTML = i18n.labelSave;
	document.getElementById('view-options-header'      ).innerHTML = i18n.labelViewOptions;
	document.getElementById('opt-date-1-label'         ).innerHTML = i18n.labelDateFrom + ':';
	document.getElementById('opt-date-2-label'         ).innerHTML = i18n.labelDateUntil + ':';
	document.getElementById('tag-cloud-header'         ).innerHTML = i18n.labelTagCloud;
	document.getElementById('tag-summary-header'       ).innerHTML = i18n.labelTagSummary;

	// Set interface tooltips
	document.getElementById('fullscreen'               ).title = i18n.helpFullScreen;
	document.getElementById('sitelink'                 ).href  = i18n.appUrl;
	document.getElementById('sitelink'                 ).title = i18n.appDescription;
	document.getElementById('report-nav'               ).title = i18n.helpReports;
	document.getElementById('opt-last-months-label'    ).title = i18n.helpLastMonths;
	document.getElementById('opt-value-filter-label'   ).title = i18n.helpValueFilter;
	document.getElementById('opt-future-label'         ).title = i18n.helpFuture;
	document.getElementById('opt-monthly-label'        ).title = i18n.helpMonthPartials;
	document.getElementById('filter'                   ).title = i18n.helpFilter;
	document.getElementById('opt-regex-label'          ).title = i18n.helpRegex;
	document.getElementById('opt-negate-label'         ).title = i18n.helpNegate;
	document.getElementById('source-reload'            ).title = i18n.helpReload;
	document.getElementById('tag-cloud-opt-negate-label').title = i18n.helpTagNegate;
	document.getElementById('tag-cloud-opt-group-label').title = i18n.helpTagGroup;
	document.getElementById('tag-cloud-opt-reset-label').title = i18n.helpTagReset;
	document.getElementById('tag-summary-opt-nsort-label').title = i18n.helpTagSummarySort;
	document.getElementById('view-options-header'      ).title = i18n.helpViewoptions;
	document.getElementById('tag-cloud-header'         ).title = i18n.helpTagCloud;
	document.getElementById('tag-summary-header'       ).title = i18n.helpTagSummary;
	document.getElementById('editor-open'              ).title = i18n.helpEdit;
	document.getElementById('editor-close'             ).title = i18n.helpCancel;
	document.getElementById('editor-save'              ).title = i18n.helpSave;

	// Mark current report as active (CSS)
	addClass(document.getElementById(reportType), 'active');

	// Notice the user that we're ignoring some data
	if (ignoreDataOlderThan) {
		document.getElementById('footer-message').innerHTML += 'ignoreDataOlderThan = ' + ignoreDataOlderThan + '<br>';
	}
	if (ignoreDataNewerThan) {
		document.getElementById('footer-message').innerHTML += 'ignoreDataNewerThan = ' + ignoreDataNewerThan + '<br>';
	}

	// localStorage browser support check
	if (appMode === 'localStorage' && !window.localStorage) {
		document.getElementById('editor-open').style.display = 'none'; // hide button
		showError(
			i18n.errorNoLocalStorage.replace('%s', appName),
			'<p>' + i18n.errorRequirements +
				array2ul('Internet Explorer 8, Firefox 3, Google Chrome 3, Safari 4, Opera 10.50'.split(', '))
		);
		return; // abort
	}

	// Set initial chart type for the reports (before event handlers)
	if (reportType === 'd') {
		document.getElementById('chart-data').selectedIndex = initChartDaily - 1;
	} else if (reportType === 'm') {
		document.getElementById('chart-data').selectedIndex = initChartMonthly - 1;
	} else {
		document.getElementById('chart-data').selectedIndex = initChartYearly - 1;
	}

	// Add event handlers
	document.getElementById('fullscreen'             ).onclick  = toggleFullScreen;
	document.getElementById('d'                      ).onclick  = changeReport;
	document.getElementById('m'                      ).onclick  = changeReport;
	document.getElementById('y'                      ).onclick  = changeReport;
	document.getElementById('opt-last-months-check'  ).onclick  = toggleLastMonths;
	document.getElementById('opt-last-months-combo'  ).onchange = lastMonthsChanged;
	document.getElementById('opt-value-filter-check' ).onclick  = toggleValueFilter;
	document.getElementById('opt-value-filter-combo' ).onchange = valueFilterChanged;
	document.getElementById('opt-value-filter-number').onkeyup  = showReport;
	document.getElementById('opt-future-check'       ).onclick  = toggleFuture;
	document.getElementById('opt-monthly-check'      ).onclick  = toggleMonthly;
	document.getElementById('filter'                 ).onkeyup  = showReport;
	document.getElementById('opt-regex-check'        ).onclick  = showReport;
	document.getElementById('opt-negate-check'       ).onclick  = showReport;
	document.getElementById('source-file'            ).onchange = loadSelectedFile;
	document.getElementById('source-reload'          ).onclick  = loadSelectedFile;
	document.getElementById('opt-date-1-check'       ).onclick  = toggleDateRange;
	document.getElementById('opt-date-2-check'       ).onclick  = toggleDateRange;
	document.getElementById('opt-date-1-month-combo' ).onchange = dateRangeComboChanged;
	document.getElementById('opt-date-2-month-combo' ).onchange = dateRangeComboChanged;
	document.getElementById('opt-date-1-year-combo'  ).onchange = dateRangeComboChanged;
	document.getElementById('opt-date-2-year-combo'  ).onchange = dateRangeComboChanged;
	document.getElementById('tag-cloud-opt-negate-check').onclick  = showReport;
	document.getElementById('tag-cloud-opt-group-check' ).onclick  = showReport;
	document.getElementById('tag-cloud-opt-reset-check' ).onclick  = resetTagCloud;
	document.getElementById('tag-summary-opt-nsort-check').onclick  = showReport;
	document.getElementById('chart-data'             ).onchange = showReport;
	document.getElementById('rows-summary-index'     ).onchange = updateSelectedRowsSummary;
	document.getElementById('view-options-header'    ).onclick  = toggleViewOptions;
	document.getElementById('tag-cloud-header'       ).onclick  = toggleTagCloud;
	document.getElementById('tag-summary-header'     ).onclick  = toggleTagSummary;
	document.getElementById('editor-open'            ).onclick  = editorOn;
	document.getElementById('editor-close'           ).onclick  = editorOff;
	document.getElementById('editor-save'            ).onclick  = editorSave;
	document.getElementById('editor-data')[(isOpera) ? 'onkeypress' : 'onkeydown'] = insertTab;

	// Apply user defaults (this code must be after event handlers adding)
	if (initFullScreen)     { toggleFullScreen(); }
	if (checkRegex)         { document.getElementById('opt-regex-check'  ).checked = true; }
	if (checkNegate)        { document.getElementById('opt-negate-check' ).checked = true; }
	if (checkDateFrom)      { document.getElementById('opt-date-1-check' ).checked = true; }
	if (checkDateUntil)     { document.getElementById('opt-date-2-check' ).checked = true; }
	if (checkMonthPartials) { document.getElementById('opt-monthly-check').checked = true; }
	if (checkTagNegate)     { document.getElementById('tag-cloud-opt-negate-check').checked = true; }
	if (checkTagSummarySort){ document.getElementById('tag-summary-opt-nsort-check').checked = true; }
	document.getElementById('filter').value = defaultSearch;

	// Apply user defaults - Legacy
	if (defaultFuture) {
		document.getElementById('opt-future-check' ).checked = true;
	}
	if (defaultLastMonths) {
		document.getElementById('opt-last-months-check').checked = true;
		document.getElementById('opt-last-months-extra').style.display = 'block';
	}

	// User wants old style date filters?
	if (useLegacyDateFilter) {
		// restore old
		document.getElementById('opt-future-box').style.display = 'block';
		document.getElementById('opt-last-months-box').style.display = 'block';
		// disable new
		document.getElementById('opt-date-1-box').style.display = 'none';
		document.getElementById('opt-date-2-box').style.display = 'none';
		document.getElementById('opt-date-1-check').checked = false;
		document.getElementById('opt-date-2-check').checked = false;
	} else {
		// disable old
		document.getElementById('opt-last-months-check').checked = false;
		document.getElementById('opt-future-check').checked = false;
		// disable auto-hide since now we have only one option who uses it
		removeClass(document.getElementById('opt-value-filter-extra'), 'auto-hide');
	}

	// Always show these toolbar boxes opened at init
	if (initViewWidgetOpen)  { toggleViewOptions(); }
	if (initTagCloudOpen)    {    toggleTagCloud(); }
	if (initTagSummaryOpen)  {  toggleTagSummary(); }

	// Maybe hide some widgets?
	if (!showViewWidget) {
		document.getElementById('view-options-box').style.display = 'none';
	}
	if (!showTagCloud) {
		document.getElementById('tag-cloud-box').style.display = 'none';
	}
	if (!showTagSummary) {
		document.getElementById('tag-summary-box').style.display = 'none';
	}

	// User choose other default report, let's update the toolbar accordingly
	if (reportType !== 'd') {
		updateToolbar();
	}

	// Set the default file to load when using multiple files: dataFilesDefault or first
	if (dataFiles.length > 1) {
		if (dataFilesDefault && dataFiles.indexOf(dataFilesDefault) !== -1) {
			document.getElementById('source-file').selectedIndex = dataFiles.indexOf(dataFilesDefault);
		} else {
			document.getElementById('source-file').selectedIndex = 0;
		}
	}

	// Everything is ok, time to read/parse/show the user data
	if (appMode === 'dropbox') {
		if (typeof initDropbox === 'undefined') {
			showError(i18n.errorNoDropboxSupport.replace('%s', appName), '');
			return; // abort
		} else {
			initDropbox();
		}
	} else if (appMode === 'one' || appMode === 'localStorage') {
		readData();
		parseData();
		showReport();
	} else {  // txt
		loadSelectedFile();
	}

	// Uncomment this line to focus the search box at init
	// document.getElementById('filter').focus();
}
window.onload = init;

