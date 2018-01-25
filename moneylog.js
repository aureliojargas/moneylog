/*global window: false */
/*jslint devel: true, regexp: true, browser: true, undef: true, continue: true, sloppy: true, eqeq: true, white: true, forin: true, plusplus: true, maxerr: 500 */

/*
	moneylog.js
	http://aurelio.net/moneylog/
*/

// I hope someday I can move everything under this namespace.
// Until then, MoneyLog is a globals festival :(
var ml = {};

// shortcuts for config
var Y = true;
var S = true;
var N = false;


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
var showRowCount = true;          // Show the row numbers at left?
var monthlyRowCount = true;       // The row numbers are reset each month?
var highlightWords = '';          // The words you may want to highlight (ie: 'XXX TODO')
var showBalance = true;           // Show the Balance column in reports?

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
var initStorageWidgetOpen = true; // Start app with the Storage widget opened?
var initViewWidgetOpen = true;    // Start app with the View widget opened?
var initTagCloudOpen = true;      // Start app with the Tag Cloud widget opened?
var showStorageWidget = true;     // Show Storage widget in the sidebar?
var showViewWidget = true;        // Show View widget in the sidebar?
var showTagCloud = true;          // Show Tag Cloud widget in the sidebar?

// Tags
var highlightTags = '';           // The tags you may want to highlight (ie: 'work kids')
var ignoreTags = '';              // Ignore all entries that have one of these tags
var initSelectedTags = '';        // Tag Cloud: start app with these tags already selected
var initExcludedTags = '';        // Tag Cloud: start app with these tags already excluded
var checkHideRelatedTags = false; // Tag Report option [ ] Hide related inits checked?
var showTagReport = true;         // Show the Tag Report after monthly/yearly reports?

// Charts
var showMiniBars = true;          // Show the percentage bars in monthly/yearly reports?
var showMiniBarsLabels = true;    // Show the labels inside the bars?
var miniBarWidth = 70;            // The percentage bar width, in pixels
var showCharts = true;            // Show the bar chart after the report?
var showChartBarLabel = true;     // Show the labels above the bars?
var initChartDaily = 3;           // Initial selected item for the daily chart [1-4]
var initChartMonthly = 1;         // Initial selected item for the monthly chart [1-4]
var initChartYearly = 1;          // Initial selected item for the yearly chart [1-4]

// External TXT files (used in flavors TXT and Cloud)
// Note: The file encoding is UTF-8. Change to ISO-8859-1 if accents got mangled.
var dataFiles = [];               // The paths for the TXT data files
var dataFilesDefault = '';        // Default selected file at init when using multiple TXT

// Ignore old or future data - Use with care!
var ignoreDataOlderThan = '';     // Ignore entries older than this date (ie: 2010-01-01)
var ignoreDataNewerThan = '';     // Ignore entries newer than this date (ie: 2020-12-31)

// Legacy options
var useLegacyDataFormat = false;  // Use v4-style TAB-only as separator?
var useLegacyDateFilter = false;  // Restore old options: Future Data, Recent Only
var maxLastMonths = 12;           // Number of months on the last months combo
var initLastMonths = 3;           // Initial value for last months combo
var defaultLastMonths = false;    // Last months combo inits checked?
var defaultFuture = false;        // Show future checkbox inits checked?

// Default sort for all tables
// d=daily, m=monthly, y=yearly, index=column(one-based), reverse
var sortData = {'d':{}, 'm':{}, 'y':{}};
sortData.d.index = 1;
sortData.d.rev = false;
sortData.m.index = 1;
sortData.m.rev = false;
sortData.y.index = 1;
sortData.y.rev = false;

// Tag Report, DO NOT CHANGE
sortData.m.indexTag = 1;
sortData.m.revTag = false;
sortData.y.indexTag = 1;
sortData.y.revTag = false;

// Sort index limits, DO NOT CHANGE
sortData.d.min = 1;
sortData.m.min = 1;
sortData.y.min = 1;
sortData.d.max = 4;
sortData.m.max = 5;
sortData.y.max = 5;
sortData.m.minTag = 1;
sortData.y.minTag = 1;
// sortData.*.maxTag is variable


// Data format
var dataFieldSeparator = '\t';  // Only used if useLegacyDataFormat=true
var dataRecordSeparator = /\r?\n/;  // \r\n Windows, \n Linux/Mac
var dataTagTerminator = '|';
var dataTagSeparator = ',';
var commentChar = '#';   // Must be at line start (column 1)
var dataPatterns = {
	rowBlankSeparated:
		// Uses multiple TAB and spaces as field separators
		/^(\d{4}-\d\d-\d\d)[ \t]+([+\-]?[0-9.,*\/]+)[ \t]*(.*)$/,
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
		labelNoData: 'No data.',
		labelTotal: 'Total',
		labelAverage: 'Average',
		labelMinimum: 'Min',
		labelMaximum: 'Max',
		labelCount: 'Count',
		labelMonths: ['month', 'months'],
		// Report headers
		labelsDetailed: ['Date', 'Amount', 'Tags', 'Description', 'Balance'],
		labelsOverview: ['Period', 'Incoming', 'Expense', 'Partial', 'Balance'],
		// Full Screen
		helpFullScreen: 'Turns ON/OFF the Full Screen mode: only the report is shown, with no toolbar.',
		// Storage
		labelStorage: 'Storage',
		labelReload: 'Reload',
		helpStorage: 'Choose the storage for your data.',
		helpReload: 'Reload only the data, keeping the current view untouched.',
		// Report types
		labelReports: 'Reports',
		labelDaily: 'daily',
		labelMonthly: 'monthly',
		labelYearly: 'yearly',
		helpReports: 'Daily, monthly and yearly reports, with charts, balance and totals.',
		// Search
		labelSearch: 'Search',
		labelSearchRegex: 'regex',
		labelSearchNegate: 'negate',
		helpSearch: 'Filter the reports in real time, as you type.',
		helpSearchRegex: 'Use regular expressions on the search field.',
		helpSearchNegate: 'Remove the search results from the report.',
		// View Options
		labelViewOptions: 'View',
		labelDateFrom: 'From',
		labelDateUntil: 'Until',
		labelMonthPartials: 'Monthly Partials',
		labelValueFilter: 'Filter Values',
		labelPositive: 'positive',
		labelNegative: 'negative',
		labelGreaterThan: 'greater than',
		labelLessThan: 'less than',
		helpViewOptions: 'Show/hide the view options.',
		helpMonthPartials: 'Shows the monthly balance, with sums of your incoming and expenses on the period.',
		helpValueFilter: 'See only positive or negative values, or greater/lesser than some value.',
		// Legacy
		labelLastMonths: 'Recent Only',
		labelShowFuture: 'Future Data',
		helpLastMonths: 'See only the latest data, ignoring oldies.',
		helpShowFuture: 'Shows future incoming and expenses.',
		// Tag Cloud
		labelTagCloud: 'Tag Cloud',
		labelTagCloudEmpty: '(no tag)',
		labelTagCloudReset: 'Reset',
		labelTagCloudGroup: 'Group selected tags',
		helpTagCloud: 'Show/hide the tag cloud.',
		helpTagCloudReset: 'Undo all the selections you have made in the Tag Cloud.',
		helpTagCloudGroup: 'Only match if the entry has ALL the selected tags.',
		// Tag Report
		labelTagReportRelated: 'Hide related tags',
		helpTagReportRelated: 'For entries with multiple tags, ignore the tags that are not explicitly selected in Tag Cloud.',
		// Rows Summary
		labelRowsSummaryReset: 'Reset',
		helpRowsSummaryReset: 'Undo all the selections you have made in the report.',
		// Editor
		labelEditorOpen: 'Edit',
		labelEditorClose: 'Close',
		labelEditorCancel: 'Cancel',
		labelEditorSave: 'Save',
		helpEditorOpen: 'Open the editor, for you to add/remove/edit your data.',
		helpEditorClose: 'Close the editor (without saving!)',
		helpEditorCancel: 'Discard changes and close the editor.',
		helpEditorSave: 'Save your data.',
		// Error
		errorInvalidData: 'Invalid data at line ',
		errorNoFieldSeparator: 'No separator found:',
		errorTooManySeparators: 'Too many separators',
		errorInvalidDate: 'Invalid date:',
		errorInvalidAmount: 'Invalid amount:',
		errorNoLocalStorage: 'Sorry, your browser does not have localStorage support. %s will not work.',
		errorRequirements: 'Minimum requirements:',
		// Message
		msgLoading: 'Loading %s...',
		msgSaving: 'Saving...',
		msgTypePassword: 'Type your password:',
		msgWrongPassword: 'Wrong password.',
		// App
		appUrl: 'http://aurelio.net/soft/moneylog/',
		appUrlOnline: 'http://aurelio.net/soft/moneylog/online/',
		appDescription: 'Track your finances the practical way. Think simple!',
		helpWebsite: 'Go to the MoneyLog website.'
	},
	pt: {
		centsSeparator: ',',
		thousandSeparator: '.',
		dateFormat: 'd b Y',
		dateFormatMonth: 'B Y',
		dateFormatYear: 'Y',
		monthNames: ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
		labelNoData: 'Nenhum lançamento.',
		labelTotal: 'Total',
		labelAverage: 'Média',
		labelMinimum: 'Mínimo',
		labelMaximum: 'Máximo',
		labelCount: 'Linhas',
		labelMonths: ['mês', 'meses'],
		// Report headers
		labelsDetailed: ['Data', 'Valor', 'Tags', 'Descrição', 'Acumulado'],
		labelsOverview: ['Período', 'Ganhos', 'Gastos', 'Saldo', 'Acumulado'],
		// Full Screen
		helpFullScreen: 'Liga/desliga o modo tela cheia: aparece somente o extrato, sem a barra de ferramentas.',
		// Storage
		labelStorage: 'Lançamentos',
		labelReload: 'Recarregar',
		helpStorage: 'Escolha a fonte dos seus dados (lançamentos).',
		helpReload: 'Recarrega somente os dados, sem perder as opções de visualização.',
		// Report types
		labelReports: 'Extratos',
		labelDaily: 'diário',
		labelMonthly: 'mensal',
		labelYearly: 'anual',
		helpReports: 'Extratos diário, mensal e anual, com gráficos, somatório, médias, mínimo, máximo e acumulado.',
		// Search
		labelSearch: 'Pesquisar',
		labelSearchRegex: 'regex',
		labelSearchNegate: 'excluir',
		helpSearch: 'Filtra os relatórios em tempo real, de acordo com o que você digita.',
		helpSearchRegex: 'Usa expressões regulares na caixa de pesquisa.',
		helpSearchNegate: 'Inverte o filtro, escondendo as transações pesquisadas.',
		// View Options
		labelViewOptions: 'Visualizar',
		labelDateFrom: 'De',
		labelDateUntil: 'Até',
		labelMonthPartials: 'Parciais Mensais',
		labelValueFilter: 'Somente Valores',
		labelPositive: 'positivos',
		labelNegative: 'negativos',
		labelGreaterThan: 'maiores que',
		labelLessThan: 'menores que',
		helpViewOptions: 'Mostra e esconde as opções de visualização.',
		helpMonthPartials: 'Resumo do mês, com saldo mensal e acumulado, e totais de ganhos e gastos.',
		helpValueFilter: 'Veja somente valores positivos, negativos ou maiores/menores que um valor específico.',
		// Legacy
		labelLastMonths: 'Somente Recentes',
		labelShowFuture: 'Lançamentos Futuros',
		helpLastMonths: 'Veja somente os dados mais recentes, ignorando os antigos.',
		helpShowFuture: 'Veja quais lançamentos estão agendados para os meses seguintes.',
		// Tag Cloud
		labelTagCloud: 'Tags',
		labelTagCloudEmpty: '(sem tag)',
		labelTagCloudReset: 'Desmarcar todas',
		labelTagCloudGroup: 'Combinar',
		helpTagCloud: 'Mostra e esconde a nuvem de tags.',
		helpTagCloudReset: 'Desmarca todas as tags que você selecionou, voltando ao estado inicial.',
		helpTagCloudGroup: 'Cada lançamento deve possuir TODAS as tags selecionadas, simultaneamente.',
		// Tag Report
		labelTagReportRelated: 'Esconder as tags relacionadas',
		helpTagReportRelated: 'Para os lançamentos com múltiplas tags, ignore as tags que não estejam explicitamente selecionadas.',
		// Rows Summary
		labelRowsSummaryReset: 'Limpar',
		helpRowsSummaryReset: 'Desmarca todas as linhas que você selecionou no extrato.',
		// Editor
		labelEditorOpen: 'Editar',
		labelEditorClose: 'Fechar',
		labelEditorCancel: 'Cancelar',
		labelEditorSave: 'Salvar',
		helpEditorOpen: 'Abre o editor de lançamentos, para você incluir/remover/alterar os dados do extrato.',
		helpEditorClose: 'Fecha o editor de lançamentos (apenas fecha, não salva o texto!).',
		helpEditorCancel: 'Descarta as alterações e fecha o editor sem salvar nada.',
		helpEditorSave: 'Salva os lançamentos que você alterou.',
		// Error
		errorInvalidData: 'Lançamento inválido na linha ',
		errorNoFieldSeparator: 'Separador não encontrado:',
		errorTooManySeparators: 'Há mais de 2 separadores',
		errorInvalidDate: 'Data inválida:',
		errorInvalidAmount: 'Valor inválido:',
		errorNoLocalStorage: 'Ops, seu navegador não tem localStorage. O %s não vai funcionar.',
		errorRequirements: 'Os requisitos mínimos são:',
		// Message
		msgLoading: 'Carregando %s...',
		msgSaving: 'Salvando...',
		msgTypePassword: 'Digite a sua senha:',
		msgWrongPassword: 'Senha errada.',
		// App
		appUrl: 'http://aurelio.net/moneylog/beta/',
		appUrlOnline: 'http://aurelio.net/moneylog/browser/app/',
		appDescription: 'Acompanhe suas finanças de maneira simples e prática. Descomplique!',
		helpWebsite: 'Visite o website do MoneyLog.'
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
		labelShowFuture: 'Mostra les dades futures',
		labelMonthPartials: 'Mostra els Parcials Mensuals',
		labelSearchRegex: 'regex',
		labelSearchNegate: 'nega-ho',
		labelReload: 'Carrega',
		labelNoData: 'No hi ha dades.',
		labelsDetailed: ['Data', 'Import', 'Etiquetes', 'Descripció', 'Balanç'],
		labelsOverview: ['Període', 'Ingressos', 'Despeses', 'Parcials', 'Balanç'],
		labelTotal: 'Total',
		labelAverage: 'Mitja',
		labelMinimum: 'Min',
		labelMaximum: 'Max',
		labelMonths: ['mes', 'mesos'],
		labelTagCloudEmpty: 'BUIT',
		labelTagCloudGroup: 'Etiquetes de grup triades',
		errorInvalidData: 'Hi ha un adada no vàlida a la línia ',
		errorNoFieldSeparator: 'No separator found:',
		errorTooManySeparators: 'Hi ha masses separadors',
		errorInvalidDate: 'La data no és vàlida:',
		errorInvalidAmount: "L'import no és vàlid:",
		msgLoading: "S'està carregant %s...",
		helpReports: 'Informes: diari, mensual i anual, amb gràfics, balanç i totals.',
		helpLastMonths: 'Mostra només les dades més recents, omet les antigues.',
		helpValueFilter: 'Mostra només els valors positius o negatius, o major / menor que un cert valor.',
		helpShowFuture: 'Mostra els ingressos i despeses futures.',
		helpMonthPartials: 'Mostra el saldo mensual, amb sumes dels vostres ingressos i despeses del període.',
		helpSearch: 'Filtre dels informes en temps real, a mesura que escriu.',
		helpSearchRegex: 'Utilitza expressions regulars en el camp de cerca.',
		helpSearchNegate: "Eliminar els resultats de cerca de l'informe.",
		helpReload: 'Actualitza només les dades, no la pàgina sencera.',
		helpTagCloudGroup: 'Mostra només les entrades que tenen totes les etiquetes triades.'
	},
	es: {
		centsSeparator: ',',
		thousandSeparator: '.',
		dateFormat: 'd/m/Y',
		monthNames: ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
		labelNoData: 'Sin movimientos.',
		labelTotal: 'Total',
		labelAverage: 'Promedio',
		labelMinimum: 'Min',
		labelMaximum: 'Max',
		labelCount: 'Cuenta',
		labelMonths: ['mes', 'meses'],
		// Report headers
		labelsDetailed: ['Fecha', 'Monto', 'Concepto', 'Descripción', 'Balance'],
		labelsOverview: ['Período', 'Ingresos', 'Egresos', 'Saldo', 'Balance'],
		// Full Screen
		helpFullScreen: 'Activa/Desactiva el modo Pantalla Completa: solo se muestra el reporte, sin la barra de herramientas.',
		// Datafile
		labelReload: 'Recargar',
		helpReload: 'Recargar solo la información y no la página entera.',
		// Report types
		labelReports: 'Reportes',
		labelDaily: 'diario',
		labelMonthly: 'mensual',
		labelYearly: 'anual',
		helpReports: 'Reporte diario, mensual o anual, con gráficas, promedios, balances y totales.',
		// Search
		labelSearch: 'Caja de búsqueda',
		labelSearchRegex: 'regex',
		labelSearchNegate: 'negar',
		helpSearch: 'Evalue los reportes en tiempo real a medida que los va tipeando.',
		helpSearchRegex: 'Usar expresiones regulares en la caja de búsqueda.',
		helpSearchNegate: 'Invertir el criterio de búsqueda.',
		// View Options
		labelViewOptions: 'Ver',
		labelDateFrom: 'Desde',
		labelDateUntil: 'Hasta',
		labelMonthPartials: 'Mostrar parcial mensual',
		labelValueFilter: 'Mostrar solo montos',
		labelPositive: 'positivos',
		labelNegative: 'negativos',
		labelGreaterThan: 'mayores a',
		labelLessThan: 'menores a',
		helpViewOptions: 'Mostrar/esconder opciones.',
		helpMonthPartials: 'Vea el balance con el saldo mensual, el acumulado y totales de ingresos y egresos.',
		helpValueFilter: 'Vea solo los montos positivos o los negativos, o los "mayores a" o los "menores a" cualquier valor dado.',
		// Legacy
		labelLastMonths: 'Mostrar solo últimos',
		labelShowFuture: 'Mostrar movimientos futuros',
		helpLastMonths: 'Vea solo la información mas actual, escondiendo la información antigua.',
		helpShowFuture: 'Vea movimientos agendados a futuro.',
		// Tag Cloud
		labelTagCloud: 'Conceptos',
		labelTagCloudEmpty: '(vacío)',
		labelTagCloudReset: 'Limpiar',
		labelTagCloudGroup: 'Unir conceptos seleccionados',
		helpTagCloud: 'Mostrar/esconder Conceptos.',
		helpTagCloudReset: 'Deshacer selección de Conceptos.',
		helpTagCloudGroup: 'Mostrar solo los movimientos rotulados con los conceptos seleccionados.',
		// Tag Report
		labelTagReportRelated: 'Esconder conceptos relacionados',
		helpTagReportRelated: 'Para opciones con vários conceptos, ignorar conceptos que no estén explícitamente seleccionados.',
		// Rows Summary
		labelRowsSummaryReset: 'Limpiar',
		helpRowsSummaryReset: 'Deshacer selección en el reporte.',
		// Editor
		labelEditorOpen: 'Editar',
		labelEditorClose: 'Cerrar',
		labelEditorCancel: 'Cancelar',
		labelEditorSave: 'Guardar',
		helpEditorOpen: 'Abre el editor de movimientos para incluir/eliminar/editar los datos de un extracto.',
		helpEditorClose: 'Cierra el editor de movimientos (solo cierra, no guarda los cambios!).',
		helpEditorCancel: 'Cerrar el editor sin guardar los cambios.',
		helpEditorSave: 'Guarda las movimientos editados.',
		// Error
		errorInvalidData: 'Información invalida en la línea ',
		errorNoFieldSeparator: 'No se encontraron separadores:',
		errorTooManySeparators: 'Demasiados separadores',
		errorInvalidDate: 'Fecha invalida:',
		errorInvalidAmount: 'Cantidad invalida:',
		errorNoLocalStorage: 'Lo sentimos, su navegador no tiene soporte para localStorage. %s no funcionará.',
		errorRequirements: 'Requisitos mínimos:',
		// Message
		msgLoading: 'Cargando %s...',
		msgSaving: 'Guardando ...',
		msgTypePassword: 'Ingrese su contraseña:',
		msgWrongPassword: 'Contraseña incorrecta.',
		// App
		appDescription: 'Controle sus finanzas de forma práctica. Simple!',
		helpWebsite: 'Ir al sitio web de MoneyLog.'
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

//// End of user Config


// Global vars
var appVersion = '6β';
var appYear = '2014';  // only used in official releases
var appName = 'MoneyLog';
var appCommit = '';  // set by util/gen-* scripts
var appRepository = 'https://github.com/aureliojargas/moneylog';
var dataFirstDate;
var dataLastDate;
var highlightRegex;
var i18n;
var rawData = '';
var parsedData = [];
var reportData = [];  // filtered by applyTags(filterData())
var selectedRows = [];
var savedDateRangeIndexes = [];  // used in TXT reload process
var isFullScreen = false;
var isBeta = /β$/.test(appVersion);  // beta if version ends with 'β'
var showReport;  // to make JSLint happy
var Widget;
var TagSummary;
var AboutWidget;

// We have special rules for tiny screens (480px or less)
var isMobile = (document.documentElement.clientWidth && document.documentElement.clientWidth < 481);

// Change some defaults for the mobile version.
// User can still overwrite those.
if (isMobile) {
	// Init with all widgets closed
	initStorageWidgetOpen = true;  // exception
	initViewWidgetOpen = false;
	initTagCloudOpen = false;
	// Note: Tag Summary is closed at Widget definition. Search for isMobile.
	// Save horizontal space in report table
	showRowCount = false;
	showMiniBars = false;
	// Use short month names in monthly report
	i18nDatabase.pt.dateFormatMonth = i18nDatabase.pt.dateFormatMonth.replace('B', 'b');
	i18nDatabase.en.dateFormatMonth = i18nDatabase.en.dateFormatMonth.replace('B', 'b');
}


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
// [[0,1,2], [3,4,5], [6,7,8]].getColumn(1) -> [1, 4, 7]
Array.prototype.getColumn = function (n) {
	var i, leni, results = [];
	for (i = 0, leni = this.length; i < leni; i++) {
		results.push(this[i][n]);
	}
	return results;
};

String.prototype.lstrip = function () {
	return this.replace(/^\s+/, '');
};
String.prototype.rstrip = function () {
	return this.replace(/\s+$/, '');
};
String.prototype.strip = function () {
	return this.lstrip().rstrip();
};

String.prototype.replaceAll = function (from, to) {
	return this.split(from).join(to);
	// http://stackoverflow.com/a/542305
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

Array.prototype.clone = function() {
	return [].concat(this);
};

Array.prototype.hasItem = function (item) {
	var i, leni;
	for (i = 0, leni = this.length; i < leni; i++) {
		if (item == this[i]) {  // using ==
			return true;
		}
	}
	return false;
};

Array.prototype.hasArrayItem = function (arr) {
	var i, leni, items;
	items = arr.clone();
	for (i = 0, leni = items.length; i < leni; i++) {
		if (this.hasItem(items[i])) {
			return true;
		}
	}
	return false;
};

Array.prototype.hasAllArrayItems = function (arr) {
	var i, leni, items;
	items = arr.clone();
	leni = items.length;
	if (leni === 0) {  // empty arr
		return false;
	}
	for (i = 0; i < leni; i++) {
		if (!this.hasItem(items[i])) {
			return false;
		}
	}
	return true;
};

// http://www.shamasis.net/2009/09/fast-algorithm-to-find-unique-items-in-javascript-array/
// I choose the "classic" version, it's more reliable.
Array.prototype.unique = function() {
	var i, j, a = [], l = this.length;
	for (i = 0; i < l; i++) {
		for (j = i+1; j < l; j++) {
			if (this[i] === this[j]) { j = ++i; }
		}
		a.push(this[i]);
	}
	return a;
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
	};
}
RegExp.escape = function (str) {
	var specials = new RegExp('[.*+?|\\^$()\\[\\]{}\\\\]', 'g');
	return str.replace(specials, '\\$&');
};

// Date helpers
Date.prototype.getYearML = function () {  // Returns as string
	return this.getFullYear().toString();
};
Date.prototype.getMonthML = function () {  // Returns as string and zero padded
	var m = this.getMonth() + 1;  // zero based
	return (m < 10) ? '0' + m : m.toString();
};
Date.prototype.getDateML = function () {  // Returns as string and zero padded
	var d = this.getDate();
	return (d < 10) ? '0' + d : d.toString();
};
Date.prototype.getFullMonthML = function () {  // Returns "YYYY-MM"
	return this.getYearML() + '-' + this.getMonthML();
};
Date.prototype.getMonthName = function () {
	return i18n.monthNames[this.getMonth() + 1];  // zero based
};
Date.prototype.getMonthShortName = function () {
	return this.getMonthName().slice(0, 3);
};
Date.prototype.getMonthDays = function () {  // How many days in this month?
	// http://stackoverflow.com/a/1185804
	var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
	return d.getDate();
};
Date.prototype.fromML = function (str) {  // str: YYYY-MM-DD
	// In MoneyLog we can have special dates with days like: 00 and 99.
	//   2000-01-00 turns to 2000-01-01 (first day)
	//   2000-01-99 turns to 2000-01-31 (last day)
	// So we always create the date with day=1, then set the day.
	var y, m, d, max;
	y = parseInt(str.slice(0,  4), 10);
	m = parseInt(str.slice(5,  7), 10) - 1;   // month is zero-based
	d = parseInt(str.slice(8, 10), 10) || 1;  // day zero -> day 1
	this.setFullYear(y, m, 1);                // create date
	max = this.getMonthDays();
	this.setDate((d > max) ? max : d);        // huge day -> last day
};
Date.prototype.toML = function () {  // Returns "YYYY-MM-DD"
	return this.getYearML() + '-' + this.getMonthML() + '-' + this.getDateML();
};
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
};
Date.prototype.setMonthOffset = function (n) {  // negative n is ok
	// Beware: 2010-01-31 + 1 = 2010-03-03
	// Set day to 1 to make month-related operations
	this.setMonth(this.getMonth() + (n || 0));
};
String.prototype.toDate = function () {
	var z = new Date();
	z.fromML(this);
	return z;
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

// Inspired by http://stackoverflow.com/a/979325
function sortByIndex(index, type) {
	switch (type) {
	case 'n':
		// number: int or float
		return function (a, b) {
			return a[index] - b[index];
		};
	case 'd':
		// date: 'YYYY-MM-DD'
		return function (a, b) {
			a = a[index];
			b = b[index];
			return ((a < b) ? -1 : ((a > b) ? 1 : 0));
		};
	case 't':
		// tags: ['tag1', 'tag2', ...]
		return function (a, b) {
			a = a[index].join(',').toLowerCase().unacccent();
			b = b[index].join(',').toLowerCase().unacccent();
			return ((a < b) ? -1 : ((a > b) ? 1 : 0));
		};
	default:
		// string: 'á'
		return function (a, b) {
			a = a[index].toLowerCase().unacccent();
			b = b[index].toLowerCase().unacccent();
			return ((a < b) ? -1 : ((a > b) ? 1 : 0));
		};
	}
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

function addMonths(yyyymmdd, n) {
	// It's all about months, not taking days into account.
	// addMonths("2010-01-31", 1)  -> "2010-02-31"
	// addMonths("2010-01-31", -2) -> "2009-11-31"

	var z = yyyymmdd.toDate();
	z.setDate(1);  // set day 1st
	z.setMonthOffset(n);  // add
	return z.toML().slice(0, 8) + yyyymmdd.slice(8, 10);  // restore original day
}

function getPastMonth(months) {
	// months=0 means current month
	// Returns: YYYY-MM-00
	return formatDate(addMonths(getCurrentDate(), -months), 'Y-m-00');
}

function getDataUniqueDates(periodType) {  // periodType: d, m, y
	// Returns array with unique (dates|months|years) in parsedData.
	// Note: parsedData is already sorted ASC by date.
	var i, leni, theData, item, last, slices, results = [];

	theData = parsedData.clone();
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

function selectOptionByText(combo, optionText) {
	for (var i = 0; i < combo.options.length; i++) {
		if (combo.options[i].text === optionText) {
			combo.selectedIndex = i;
			break;
		}
	}
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

// DO NOT append elements using el.innerHTML += "foo";
// This is extremely inefficient and removes previous onclick handlers.
// http://stackoverflow.com/a/1387475
// http://stackoverflow.com/a/6304927
//
function appendHTML(el, html) {
	var tempDiv = document.createElement('div');
	tempDiv.innerHTML = html;

	while (tempDiv.firstChild) {
		el.appendChild(tempDiv.firstChild);
	}
}

// http://unixpapa.com/js/dyna.html
// https://stackoverflow.com/a/22534608/1623438
function addScript(scriptUrl, callback) {
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.onload = callback;
	script.src = scriptUrl;
	head.appendChild(script);
}

// CSS stylesheet add/remove
//
// http://stackoverflow.com/q/524696
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

function computeTotals(arr) {  // arr = [1,2,3,4,5]
	var i, leni, n, o = {};

	if (!arr.length) { return; }

	o.min = 0;
	o.max = 0;
	o.sum = 0;
	o.average = 0;
	o.sumPositive = 0;
	o.sumNegative = 0;
	o.balance = [];

	for (i = 0, leni = arr.length; i < leni; i++) {
		n = arr[i];

		// sum
		if (n < 0) {
			o.sumNegative += n;
		} else {
			o.sumPositive += n;
		}
		o.sum += n;

		// balance
		if (i === 0) {
			o.balance.push(n);
		} else {
			o.balance.push(o.balance[o.balance.length - 1] + n);
		}

		// min/max
		if (i === 0) {
			// First value, store it as max and min
			o.min = o.max = n;
		} else {
			o.min = (n < o.min) ? n : o.min;
			o.max = (n > o.max) ? n : o.max;
		}
	}
	o.average = o.sum / arr.length;
	o.avg = o.average;  // alias
	return o;
}


/////////////////////////////////////////////////////////////////////
//                         TAGS
/////////////////////////////////////////////////////////////////////

function createTagCloud(names) {
	// Create all the <a> elements for the Tag Cloud
	var i, leni, results = [];

	for (i = 0, leni = names.length; i < leni; i++) {
		results.push('<a class="trigger unselected" href="#" onClick="return tagClicked(this);">' + names[i] + '</a>');
	}

	document.getElementById('tag-cloud-tags').innerHTML = results.join('\n');
}

function resetTagCloud() {
	var i, leni, els, el;

	els = document.getElementById('tag-cloud-tags').getElementsByTagName('a');
	for (i = 0, leni = els.length; i < leni; i++) {
		el = els[i];

		removeClass(el, 'selected');
		removeClass(el, 'excluded');
		addClass(el, 'unselected');
	}

	// The calling checkbox acts like a button, with temporary ON state
	this.checked = false;

	showReport();
}

function updateTagCloud(visibleTags) {
	// Show/hide the Tag Cloud elements, and set classes
	var i, leni, el, els;

	els = document.getElementById('tag-cloud-tags').getElementsByTagName('a');
	for (i = 0, leni = els.length; i < leni; i++) {
		el = els[i];

		if (visibleTags.hasItem(el.innerHTML)) {
			if (el.style.display === 'none') {
				// unhide element
				el.style.display = '';
			}
		} else {
			if (el.style.display !== 'none') {
				// hide element and reset classes
				el.style.display = 'none';
				removeClass(el, 'selected');
				removeClass(el, 'excluded');
				addClass(el, 'unselected');
			}
		}
	}
}

function getSelectedTags() {
	// Get currently selected tags (from interface)
	var i, leni, el, els, results = [];

	els = document.getElementById('tag-cloud-tags').getElementsByTagName('a');
	for (i = 0, leni = els.length; i < leni; i++) {
		el = els[i];

		if (hasClass(el, 'selected')) {
			results.push(el.innerHTML);
		}
	}
	return results;
}

function getExcludedTags() {
	// Get currently excluded tags (from interface)
	var i, leni, el, els, results = [];

	els = document.getElementById('tag-cloud-tags').getElementsByTagName('a');
	for (i = 0, leni = els.length; i < leni; i++) {
		el = els[i];

		if (hasClass(el, 'excluded')) {
			results.push(el.innerHTML);
		}
	}
	return results;
}

function setSelectedTags(tags) {
	// Force select some tags, used at start up or reload
	var i, leni, el, els;

	els = document.getElementById('tag-cloud-tags').getElementsByTagName('a');
	for (i = 0, leni = els.length; i < leni; i++) {
		el = els[i];

		if (tags.hasItem(el.innerHTML)) {
			// select
			removeClass(el, 'unselected');
			removeClass(el, 'excluded');
			addClass(el, 'selected');
			// force show
			el.style.display = '';
		}
	}
}

function setExcludedTags(tags) {
	// Force select some tags, used at start up or reload
	var i, leni, el, els;

	els = document.getElementById('tag-cloud-tags').getElementsByTagName('a');
	for (i = 0, leni = els.length; i < leni; i++) {
		el = els[i];

		if (tags.hasItem(el.innerHTML)) {
			// select
			removeClass(el, 'unselected');
			removeClass(el, 'selected');
			addClass(el, 'excluded');
			// force show
			el.style.display = '';
		}
	}
}

function tagClicked(el) {
	// Swap class: unselected -> selected -> excluded -> unselected
	if (hasClass(el, 'unselected')) {
		removeClass(el, 'unselected');
		addClass(el, 'selected');

	} else if (hasClass(el, 'selected')) {
		removeClass(el, 'selected');
		addClass(el, 'excluded');

	} else if (hasClass(el, 'excluded')) {
		removeClass(el, 'excluded');
		addClass(el, 'unselected');
	}
	// Update report
	showReport();
	return false;  // cancel link action
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
	var partial = [], results = [];

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

	results.push('<tr class="totals">');
	if (showRowCount) {
		results.push('<td class="row-count"><\/td>');
	}
	results.push('<td><\/td>');
	results.push('<td>' + partial + '<\/td>');
	results.push('<td class="monthtotal" colspan="2">' + monthTotal + '<\/td>');
	if (showBalance) {
		results.push('<td class="number">' + prettyFloat(total) + '<\/td>');
	}
	results.push('<\/tr>');

	return results.join('');
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
	if (showBalance) {
		theRow.push('<td class="number">' + prettyFloat(theTotal)  + '<\/td>');
	}

	if (showMiniBars) {
		theRow.push(getMiniBar(monthPos, monthNeg));
	}

	theRow.push('<\/tr>');
	return theRow.join('\n');
}

function getOverviewTotalsRow(label, n1, n2, n3, extraClass) {
	var theRow = [];
	if (extraClass) {
		theRow.push('<tr class="totals ' + extraClass + '">');
	} else {
		theRow.push('<tr class="totals">');
	}
	if (showRowCount) {
		theRow.push('<td class="row-count"><\/td>');
	}
	theRow.push('<td class="rowlabel">' + label + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(n1) + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(n2) + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(n3) + '<\/td>');
	if (showBalance) {
		theRow.push('<td><\/td>');
	}
	theRow.push('<\/tr>');
	return theRow.join('\n');
}


/////////////////////////////////////////////////////////////////////
//                       INTERFACE UPDATE
/////////////////////////////////////////////////////////////////////

function populateChartColsCombo() {
	var el = document.getElementById('chart-selector');
	el.options[0] = new Option(i18n.labelsOverview[1], 1);  // Incoming
	el.options[1] = new Option(i18n.labelsOverview[2], 2);  // Expense
	el.options[2] = new Option(i18n.labelsOverview[3], 3);  // Partial
	if (showBalance) {
		el.options[3] = new Option(i18n.labelsOverview[4], 4);  // Balance
	}
}

function populateRowsSummaryCombo() {
	var el = document.getElementById('rows-summary-index');
	el.options[0] = new Option(i18n.labelsOverview[1], 2);  // Incoming
	el.options[1] = new Option(i18n.labelsOverview[2], 3);  // Expense
	el.options[2] = new Option(i18n.labelsOverview[3], 4);  // Partial
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

function populateDateRangeCombos() {
	var el1, el2, i, leni, my, range, fmt, offset1, offset2, index1, index2;

	el1 = document.getElementById('opt-date-1-month-combo');
	el2 = document.getElementById('opt-date-2-month-combo');
	offset1 = initMonthOffsetFrom;
	offset2 = initMonthOffsetUntil;
	fmt = 'Y-m';
	range = getDataUniqueDates('m');

	//// Let's choose which items to select by default.
	//
	// Get user defaults
	if (typeof offset1 === 'number') {
		index1 = range.indexOf(
			formatDate(
				addMonths(getCurrentDate(), offset1),  // apply offset
				fmt));
	}
	if (typeof offset2 === 'number') {
		index2 = range.indexOf(
			formatDate(
				addMonths(getCurrentDate(), offset2),  // apply offset
				fmt));
	}
	//
	// Wait! Maybe we're just reloading?
	// Then we need to keep the currently selected items
	if (savedDateRangeIndexes.length === 2) {
		index1 = savedDateRangeIndexes[0];
		index2 = savedDateRangeIndexes[1];
		savedDateRangeIndexes = [];  // reset
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
		my = (range[i] + '-01').toDate().format('b Y');  // short month name
		el1.options[i] = new Option(my, range[i]);
		el2.options[i] = new Option(my, range[i]);
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

	// Daily
	if (reportType === 'd') {
		unhide = [
			'opt-monthly-box'
		];

	// Monthly
	} else if (reportType === 'm') {
		hide = [
			'opt-monthly-box'
		];

	// Yearly
	} else if (reportType === 'y') {
		hide = [
			'opt-monthly-box'
		];
	}

	// In Mobile toolbar we always add/remove, there's no hide.
	// We save vertical space, and the report jump is not an issue.
	if (isMobile) {
		add = add.concat(unhide);
		remove = remove.concat(hide);
		hide = [];
		unhide = [];
	}

	// Show/hide toolbar elements
	for (i = 0, leni = add.length; i < leni; i++) {
		document.getElementById(add[i]).style.display = 'block';
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
//                        DATA HANDLERS
/////////////////////////////////////////////////////////////////////

function resetData() {
	reportData = [];
	parsedData = [];
	rawData = '';
}

function reloadData() {
	// Save currently selected tags
	initSelectedTags = getSelectedTags();
	initExcludedTags = getExcludedTags();

	// Save currently selected date range
	savedDateRangeIndexes = [
		document.getElementById('opt-date-1-month-combo').selectedIndex,
		document.getElementById('opt-date-2-month-combo').selectedIndex
	];

	loadData();

	return false;  // cancel link action
}

function loadData() {
	// Hide charts when loading
	document.getElementById('charts').style.display = 'none';
	// Where to show the "loading..." message
	var messageBoard = document.getElementById('report');

	resetData();

	// Read user data, process it and show results
	if (ml.storage.isFileBased) {
		messageBoard.innerText = i18n.msgLoading.replace('%s', getSelectedFile().name);
		showHideEditButton();
		ml.storage.readAsyncMulti(getActiveDataFiles(), function (contents) {
			rawData = contents;
			parseData();
			showReport();
		});
	} else {
		messageBoard.innerText = i18n.msgLoading.replace('%s', '');
		rawData = ml.storage.read();
		parseData();
		showReport();
	}
}

function getSelectedFile() {
	var combo = document.getElementById('source-file');
	return {
		id:   combo.options[combo.selectedIndex].value,
		name: combo.options[combo.selectedIndex].text
	};
}

function getActiveDataFiles() {
	if (getSelectedFile().name === '*') {
		return ml.storage.userFiles;  // all files
	} else {
		return [getSelectedFile()];
	}
}

function showHideEditButton() {
	// Hide Edit button when current file is '*'
	if (ml.storage.isEditable && ml.storage.isFileBased) {
		document.getElementById('editor-open').style.visibility = (getSelectedFile().name === '*') ? 'hidden' : 'visible';
	}
}

function parseData() {
	var i, j, lenj, rows, thisRow, rowDate, rowAmount, rowText, rowTagsDescription, rowTags, rowDescription, recurrentAmount, recValue, recTimes, recOperator, lineno, fields, rowAmountErrorMsg, trash, tagNames;

	// Reset the data holders
	parsedData = [];
	tagNames = [];

	// Split lines
	rows = rawData.split(dataRecordSeparator);

	// Scan data rows
	for (i = 0; i < rows.length; i++) {
		lineno = i + 1;
		thisRow = rows[i].lstrip();  // Ignore left spacing
		rowDate = rowAmount = rowText = '';

		///////////////////////////////////////////////////////////// Firewall

		// Skip commented rows
		if (thisRow.indexOf(commentChar) === 0) {
			continue;
		}
		// Skip blank lines
		if (!thisRow) {
			continue;
		}

		// New style matching method: regex
		if (!useLegacyDataFormat) {

			fields = thisRow.match(dataPatterns.rowBlankSeparated);

			if (!fields) {
				invalidData(lineno, thisRow);
				return;  // abort at first error
			}

			trash = fields.shift();  // field[0] is the full match

		// Old style matching method: split
		} else {

			// Separate fields
			fields = thisRow.split(dataFieldSeparator);

			// Error: rows with no separator
			if (fields.length === 1) {
				invalidData(
					lineno,
					i18n.errorNoFieldSeparator + ' "' + dataFieldSeparator + '"\n\n' + thisRow
				);
				return;  // abort at first error

			// Error: too much separators
			} else if (fields.length - 1 > 2) {
				invalidData(
					lineno,
					i18n.errorTooManySeparators + ' "' + dataFieldSeparator + '"\n\n' + thisRow
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
			invalidData(lineno, i18n.errorInvalidDate + ' ' + fields[0] + '\n\n' + thisRow);
		}

		///////////////////////////////////////////////////////////// Amount

		rowAmountErrorMsg = i18n.errorInvalidAmount + ' ' + fields[1] + '\n\n' + thisRow;

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

			// Save to tag holder
			tagNames = tagNames.concat(rowTags);

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

		// Ignore tags?
		if (ignoreTags.length > 0 && rowTags.hasArrayItem(ignoreTags)) {
			continue;
		}

		// Save the validated data
		parsedData.push([rowDate, rowAmount, rowTags, rowDescription]);
	}

	// Sort by date
	parsedData.sort(sortByIndex(0, 'd'));

	// Save first and last date as globals
	if (parsedData.length > 0) {
		dataFirstDate = parsedData[0][0];
		dataLastDate = parsedData[parsedData.length-1][0];

		// Update the date range combos
		populateDateRangeCombos();
	} else {
		dataFirstDate = dataLastDate = undefined;
	}

	// Compose the tag cloud: sorted, append (no tag) item
	tagNames = tagNames.sort(sortIgnoreCase).unique();
	tagNames.push(i18n.labelTagCloudEmpty);
	createTagCloud(tagNames);

	// Already select some tags now?
	if (initSelectedTags.length > 0) {
		setSelectedTags(initSelectedTags);
	}
	// Already exclude some tags now?
	if (initExcludedTags.length > 0) {
		setExcludedTags(initExcludedTags);
	}
}

function filterData() {
	var i, leni, temp, theData, isRegex, isNegated, filter, filterPassed, firstDate, lastDate, showFuture, filteredData, thisDate, thisValue, thisTags, thisDescription, valueFilter, valueFilterArg;

	theData = parsedData.clone();
	isRegex = false;
	isNegated = false;
	filter = '';
	firstDate = 0;
	lastDate = '9999-99-99';
	filteredData = [];

	// New style date options
	if (!useLegacyDateFilter) {

		if (document.getElementById('opt-date-1-check').checked) {
			firstDate = document.getElementById('opt-date-1-month-combo').value + '-00';
		}
		if (document.getElementById('opt-date-2-check').checked) {
			lastDate = document.getElementById('opt-date-2-month-combo').value + '-99';
		}

	// Old style date options
	} else {

		// [X] Recent Only, works for daily/monthly
		if (document.getElementById('opt-last-months-check').checked) {
			firstDate = getPastMonth(parseInt(document.getElementById('opt-last-months-combo').value, 10) - 1);  // 1 = current
		}
		// [X] Future Data, works for all reports
		showFuture = document.getElementById('opt-future-check').checked;
		if (!showFuture) {
			lastDate = getCurrentDate();
		}
	}


	// Get filters data for the report
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
		thisTags = theData[i][2].clone();
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
	// Filter theData for the selected and excluded tags in Tag Cloud.
	// Also updates the Tag Cloud widget: tags and options.

	var i, leni, rowTags, tagCloud, dataTags, selectedTags, excludedTags, activeTags, filteredData, matchSelected, matchExcluded, groupSelected, groupExcluded;

	dataTags = [];
	tagCloud = [];
	selectedTags = [];
	excludedTags = [];
	filteredData = [];
	theData = theData.clone();

	// Get currently active tags (from interface)
	selectedTags = getSelectedTags();
	excludedTags = getExcludedTags();
	activeTags = selectedTags.concat(excludedTags);

	// These are the match conditions
	matchSelected = (selectedTags.length > 0);
	matchExcluded = (excludedTags.length > 0);
	groupSelected = document.getElementById('tag-cloud-opt-group-check').checked;
	groupExcluded = false;  // more intuitive and simple this way

	// Filter data to match current tags
	for (i = 0, leni = theData.length; i < leni; i++) {

		// Array order: date, amount, tags, desc
		rowTags = theData[i][2].clone();

		// No tag, set the "empty" tag so we can match it and add it to dataTags
		if (!rowTags.length) {
			rowTags = [i18n.labelTagCloudEmpty];
		}

		// Save all the rows tags for later
		dataTags = dataTags.concat(rowTags);

		// Ignore this row if it matches the excluded tags
		if (matchExcluded && (
				//  !group && matchedOne  ||  group && matchedAll
				(!groupExcluded && rowTags.hasArrayItem(excludedTags)) ||
				( groupExcluded && rowTags.hasAllArrayItems(excludedTags))
			)) {
			continue;
		}

		// Ignore this row if it does not match the selected tags
		if (matchSelected && (
				//  !group && !matchedOne  ||  group && !matchedAll
				(!groupSelected && !rowTags.hasArrayItem(selectedTags)) ||
				( groupSelected && !rowTags.hasAllArrayItems(selectedTags))
			)) {
			continue;
		}

		// Not ignored? Great, you rule.
		filteredData.push(theData[i]);
	}

	// The Tag Cloud is composed by all the tags in the current report
	// view AND the user selected tags.
	tagCloud = tagCloud.concat(dataTags, selectedTags);

	// Any tag? So let's unique them and update the cloud
	if (tagCloud.length > 0) {
		tagCloud = tagCloud.sort(sortIgnoreCase).unique();
		updateTagCloud(tagCloud);
	}

	// The options box is only shown if we have at least 1 active tag
	document.getElementById('tag-cloud-options').style.display = (activeTags.length > 0) ? 'block' : 'none';

	// The reset option is only shown if we have at least 1 active tag
	document.getElementById('tag-cloud-opt-reset-box').style.display = (activeTags.length > 0) ? 'block' : 'none';

	// The group option is only shown if we have at least 2 selected tags
	document.getElementById('tag-cloud-opt-group-box').style.display = (selectedTags.length > 1) ? 'block' : 'none';

	// Tag filter was active?
	if (matchSelected || matchExcluded) {
		return filteredData;
	} else {
		return theData;
	}
}

function groupByPeriod(arr, periodType) {  // m, y
	// Group data by months/years, returning an object.
	// Note: the input array may be unsorted
	//
	// groupByPeriod(
	//     [
	//         ['2012-02-15', '1.50', 'foo1'],
	//         ['2012-02-18', '7.00', 'foo2'],
	//         ['2012-03-04', '-4.44', 'bar1'],
	//         ['2012-03-18', '-5.55', 'bar2'],
	//     ], 'm')
	//
	// returns:
	// {
	//     '2012-02': [
	//         ['2012-02-15', '1.50', 'foo1'],
	//         ['2012-02-18', '7.00', 'foo2'],
	//     ],
	//     '2012-03': [
	//         ['2012-03-04', '-4.44', 'bar1'],
	//         ['2012-03-18', '-5.55', 'bar2']
	//     ],
	//     keys: ['2012-02', '2012-03']  // always sorted
	// }

	var i, leni, item, slices, results = {};

	results.keys = [];
	slices = { 'y': 4, 'm': 7, 'd': 10 };
	for (i = 0, leni = arr.length; i < leni; i++) {
		item = arr[i][0].slice(0, slices[periodType]);  // get date
		if (!results[item]) {
			results[item] = [];
			results.keys.push(item);
		}
		results[item].push(arr[i]);
	}
	results.keys.sort();
	return results;
}


/////////////////////////////////////////////////////////////////////
//                          REPORTS
/////////////////////////////////////////////////////////////////////

function updateSelectedRowsSummary() {
	var i, leni, data, arr, table, label, value, col_nr, col_index, tr_element, td_element;

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

function periodReport() {
	var i, leni, z, len, theData, overviewData, groupedData, balance, period, periods, periodValues, totals, results, allPos, allNeg, allTotal, sortIndex, sortRev, chart, chartCol, chartValues, chartLabels, colTypes;

	results = [];
	overviewData = [];
	balance = 0;
	allNeg = [];
	allPos = [];
	allTotal = [];
	theData = applyTags(filterData());
	reportData = theData.clone();
	sortIndex = sortData[reportType].index - 1;  // config is one-based
	sortRev = sortData[reportType].rev;

	if (theData.length) {

		// Group report data by period (month or year), to make things easier
		groupedData = groupByPeriod(theData, reportType);
		periods = groupedData.keys.clone();

		// Scan and calculate everything
		for (i = 0, leni = periods.length; i < leni; i++) {
			period = periods[i];
			periodValues = groupedData[period].getColumn(1);  // date, amount, tags, desc
			totals = computeTotals(periodValues);
			balance += totals.sum;

			// Save period totals for the grand total rows
			allNeg.push(totals.sumNegative);
			allPos.push(totals.sumPositive);
			allTotal.push(totals.sum);

			overviewData.push([period, totals.sumPositive, totals.sumNegative, totals.sum, balance]);
		}

		//// Report data is OK inside overviewData array
		//// Now we must compose the report table

		// Perform the user-selected sorting column and order
		colTypes = ['d', 'n', 'n', 'n', 'n'];
		overviewData.sort(sortByIndex(sortIndex, colTypes[sortIndex]));
		if (sortRev) {
			overviewData.reverse();
		}

		results.push('<table class="report overview">');

		// Table headings
		results.push('<tr>');
		if (showRowCount) {
			results.push('<th class="row-count"><\/th>');
		}
		results.push('<th onClick="sortCol(0)">' + i18n.labelsOverview[0] + '<\/th>');
		results.push('<th onClick="sortCol(1)">' + i18n.labelsOverview[1] + '<\/th>');
		results.push('<th onClick="sortCol(2)">' + i18n.labelsOverview[2] + '<\/th>');
		results.push('<th onClick="sortCol(3)">' + i18n.labelsOverview[3] + '<\/th>');
		if (showBalance) {
			results.push('<th onClick="sortCol(4)">' + i18n.labelsOverview[4] + '<\/th>');
		}
		if (showMiniBars) {
			results.push('<th class="percent">%<\/th>');
		}
		results.push('<\/tr>');

		// Array2Html
		for (i = 0, leni = overviewData.length; i < leni; i++) {
			z = overviewData[i].clone();
			// Save this row to the report table
			results.push(getOverviewRow(z[0], z[1], z[2], z[3], z[4], i + 1));
		}

		// Compose the final rows: total, avg, min, max
		len = overviewData.length;
		if (len > 1) {
			allNeg = computeTotals(allNeg);
			allPos = computeTotals(allPos);
			allTotal = computeTotals(allTotal);
			results.push(getOverviewTotalsRow(i18n.labelTotal, allPos.sum, allNeg.sum, allTotal.sum, 'total'));
			results.push(getOverviewTotalsRow(i18n.labelAverage, allPos.avg, allNeg.avg, allTotal.avg));
			results.push(getOverviewTotalsRow(i18n.labelMinimum, allPos.min, allNeg.max, allTotal.min));
			results.push(getOverviewTotalsRow(i18n.labelMaximum, allPos.max, allNeg.min, allTotal.max));
			// Note: Yes, allNeg.max and allNeg.min are swapped for better reading
		}

		// And we're done on the report table
		results.push('<\/table>');
		results = results.join('\n');

		// Always reset Rows Summary when generating reports
		selectedRows = [];
		updateSelectedRowsSummary();

		// Now charts!
		if (showCharts) {
			// Get all values for the selected column
			chartCol = parseInt(document.getElementById('chart-selector').value, 10) || 1;
			chartValues = overviewData.getColumn(chartCol);
			chartLabels = overviewData.getColumn(0);  // month or year

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

function dailyReport() {
	var i, leni, j, lenj, k, lenk, rowDate, rowAmount, rowTags, rowDescription, monthTotal, monthPos, monthNeg, rowCount, results, monthPartials, theData, sumPos, sumNeg, sumTotal, chart, chartCol, chartLabels, chartValues, chartValuesSelected, currentDate, colTypes, sortIndex, sortRev;

	sumTotal = sumPos = sumNeg = monthTotal = monthPos = monthNeg = rowCount = 0;
	results = [];
	chartValues = [];
	chartLabels = [];
	sortIndex = sortData.d.index - 1;  // config is one-based
	sortRev = sortData.d.rev;
	monthPartials = document.getElementById('opt-monthly-check');

	theData = applyTags(filterData());
	reportData = theData.clone();

	if (theData.length > 0) {

		currentDate = getCurrentDate();

		// If not the default sort (0, asc), turn OFF partials
		if (sortIndex !== 0 || sortRev) {
			monthPartials.checked = false;
		}

		// Perform the user-selected sorting column and order
		colTypes = ['d', 'n', 't', 's', 'n'];
		theData.sort(sortByIndex(sortIndex, colTypes[sortIndex]));
		if (sortRev) {
			theData.reverse();
		}

		results.push('<table class="report daily">');

		// Compose table headings
		results.push('<tr>');
		if (showRowCount) {
			results.push('<th class="row-count"><\/th>');
		}
		results.push('<th onClick="sortCol(0)">' + i18n.labelsDetailed[0] + '<\/th>');
		results.push('<th onClick="sortCol(1)">' + i18n.labelsDetailed[1] + '<\/th>');
		results.push('<th onClick="sortCol(2)" class="tags">' + i18n.labelsDetailed[2] + '<\/th>');
		results.push('<th onClick="sortCol(3)">' + i18n.labelsDetailed[3] + '<\/th>');
		if (showBalance) {
			results.push('<th class="balance">' + i18n.labelsDetailed[4] + '<\/th>');
		}
		results.push('<\/tr>');

		// Compose table rows
		for (i = 0, leni = theData.length; i < leni; i++) {

			rowDate        = theData[i][0];
			rowAmount      = theData[i][1];
			rowTags        = theData[i][2].clone();
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
			if (showBalance) {
				results.push('<td class="number">' + prettyFloat(sumTotal)     + '<\/td>');
			}
			results.push('<\/tr>');

		}

		// Should we show the full month partials at the last row?
		if (monthPartials.checked || !showBalance) {
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

		// Always reset Rows Summary when generating reports
		selectedRows = [];
		updateSelectedRowsSummary();

		// Now charts!
		// Note: monthPartials option is required to be ON
		if (showCharts && monthPartials.checked) {

			// Get all values for the selected column
			chartCol = parseInt(document.getElementById('chart-selector').value, 10) || 1;
			chartValuesSelected = chartValues.getColumn(chartCol);

			// Get chart and show it
			chart = drawChart(chartValuesSelected, chartLabels);
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

function tagReport() {
	var i, leni, j, lenj, results, hasRelated, hideRelated, tagNames, tagName, selectedTags, tagData, tableData, theData, groupedData, content, options, firstDate, lastDate, allDates, nDates, period, periodData, periodName, rowAmount, rowTags, index, total, tagless, tdClass, sortIndex, sortRev;

	results = [];
	tagNames = [];
	tagData = {};
	tableData = [];
	theData = reportData.clone();
	sortIndex = sortData[reportType].indexTag - 1;  // config is one-based
	sortRev = sortData[reportType].revTag;
	selectedTags = getSelectedTags();
	hasRelated = false;
	content = document.getElementById('tag-report-content');
	options = document.getElementById('tag-report-options');
	hideRelated = document.getElementById('tag-report-opt-related-check').checked;

	// Hide the Tag report when in Daily report
	if (!showTagReport || reportType === 'd') {
		document.getElementById('tag-report').style.display = 'none';
		return false;
	} else {
		document.getElementById('tag-report').style.display = 'block';
	}

	// Group report data by period (month or year), to make things easier
	groupedData = groupByPeriod(theData, reportType);

	/////////////////////////////////////////////////// MONTHS / YEARS

	// Compose the list of all months/years in the period
	// Note: can't use groupedData.keys because there may be gaps
	firstDate = groupedData.keys[0];
	lastDate = groupedData.keys[groupedData.keys.length - 1];

	if (reportType === 'm') {
		allDates = getMonthRange(firstDate + '-01', lastDate + '-01');
	} else {
		allDates = getYearRange(firstDate + '-01-01', lastDate + '-01-01');
	}
	nDates = allDates.length;

	/////////////////////////////////////////////////// TAG TOTALS

	// tagData = {
	//     tag1: {
	//         2012-01: 55,
	//         2012-02: 26,
	//         total: 81
	//     },
	//     tag2: {
	//         2012-01: 34,
	//         2012-02: 27,
	//         2012-05: 25,
	//         total: 86
	//     }
	// }

	// Loop each month/year
	for (period in groupedData) {
		periodData = groupedData[period];

		if (period === 'keys') { continue; }  // ignore

		// Scan report rows for this period
		for (i = 0, leni = periodData.length; i < leni; i++) {
			// rowDate        = periodData[i][0];
			rowAmount         = periodData[i][1];
			rowTags           = periodData[i][2].clone();
			// rowDescription = periodData[i][3];

			// No tags in this row? Add a fake one
			if (rowTags.length === 0) {
				rowTags = [i18n.labelTagCloudEmpty];
			}

			// Scan tags and sum
			for (j = 0, lenj = rowTags.length; j < lenj; j++) {
				tagName = rowTags[j];

				// New tag?
				if (!tagNames.hasItem(tagName)) {

					// Is this a related tag?
					if (selectedTags.length > 0 && !selectedTags.hasItem(tagName)) {
						hasRelated = true;
						if (hideRelated) {
							continue;  // ignore
						}
					}

					tagNames.push(tagName);
					tagData[tagName] = {};
					tagData[tagName].total = 0;
				}

				// First tag in this period?
				if (!tagData[tagName][period]) {
					tagData[tagName][period] = 0;
				}

				// Sum
				tagData[tagName][period] += rowAmount;
				tagData[tagName].total += rowAmount;
			}
		}
	}

	/////////////////////////////////////////////////// TABLE DATA

	// tableData = [
	//     ['tag1', 55, 26, 0, 0, 123, ...],
	//     ['tag2', 34, 27, 0, 0, 25, ...]
	// ]

	// Save the table array, grouped by tag names
	// This array will become the HTML table
	for (i = 0, leni = tagNames.length; i < leni; i++) {
		tagName = tagNames[i];
		tableData.push([tagName]);
		index = tableData.length - 1;
		for (j = 0, lenj = nDates; j < lenj; j++) {
			period = allDates[j];
			total = tagData[tagName][period];
			tableData[index].push(total || 0);
		}
		if (nDates > 1) {
			// total & average
			tableData[index].push(tagData[tagName].total);
			tableData[index].push(tagData[tagName].total / nDates);
		}
	}

	/////////////////////////////////////////////////// SORT

	if (sortIndex === 0) {
		// Sort by tag name, ignoring case and accents
		tableData.sort(sortByIndex(0, 's'));

		// Make sure the (no tag) row is always the last
		if (tableData.length > 1 && tableData[0][0] === i18n.labelTagCloudEmpty) {
			tagless = tableData.shift();
			tableData.push(tagless);
		}
	} else {
		// Sort by value
		tableData.sort(sortByIndex(sortIndex, 'n'));
	}
	if (sortRev) {
		tableData.reverse();
	}

	/////////////////////////////////////////////////// HTML

	results.push('<table class="report">');

	//// Table heading
	results.push('<tr>');

	// tag column
	results.push(
		'<th class="tagname" onClick="sortColTag(0)">' +
		i18n.labelsDetailed[2] +
		'<\/th>'
	);
	// dates
	for (i = 0, leni = nDates; i < leni; i++) {
		periodName = allDates[i];

		// Month names get special formatting
		if (reportType === 'm') {
			periodName = (allDates[i] + '-01').toDate().format('Y-b');
			periodName = periodName.
				replace(/^(....)/, '<i>$1<\/i>').
				replace('-', '<br>');
		}

		results.push(
			'<th onClick="sortColTag(' + (i+1) +  ')">' +
			periodName +
			'<\/th>'
		);
	}
	// total & average
	if (nDates > 1) {
		results.push(
			'<th onClick="sortColTag(' + (i+1) + ')" class="totals">' +
			i18n.labelTotal +
			'<\/th>'
		);
		results.push(
			'<th onClick="sortColTag(' + (i+2) + ')" class="totals">' +
			i18n.labelAverage +
			'<\/th>'
		);
	}
	results.push('<\/tr>');

	// Compose table body, one tag per row
	for (i = 0, leni = tableData.length; i < leni; i++) {
		results.push('<tr>');
		results.push('<td>' + tableData[i][0] +  '<\/td>');  // tag name

		// Now the numbers (Note: j=1)
		for (j = 1, lenj = tableData[i].length; j < lenj; j++) {

			// Mark the Totals columns
			if (nDates > 1 && j === lenj - 2) {  // penultimate
				tdClass = "number totals total";
			} else if (nDates > 1 && j === lenj - 1) {  // last
				tdClass = "number totals average";
			} else {
				tdClass = "number";
			}

			results.push(
				'<td class="' + tdClass + '">' +
				((tableData[i][j]) ? prettyFloat(tableData[i][j]) : '0') +
				'<\/td>'
			);
			// Note: empty cells become 0 and not 0.00 to make the report less polluted
		}
		results.push('<\/tr>');
	}

	results.push('<\/table>');

	// Show report (if we have tags)
	content.innerHTML = (tagNames.length > 0) ? results.join('\n') : '';

	// Show/hide options
	options.style.display = (hasRelated) ? 'block' : 'none';
}

function showReport() {
	var i;

	if (reportType === 'd') {
		dailyReport();
	} else {
		periodReport();
	}
	tagReport();

	// Widget hook: showReportPost
	for (i = 0; i < Widget.instances.length; i++) {
		Widget.instances[i].showReportPost();
	}
}


/////////////////////////////////////////////////////////////////////
//                        DATA EDITOR
/////////////////////////////////////////////////////////////////////

function editorOn() {
	var filepath;

	// Load the current data to the editor
	document.getElementById('editor-data').value = rawData;

	// Hide content to avoid scroll bars
	document.getElementById('content').style.display = 'none';

	// Set file name
	if (ml.storage.isFileBased) {
		filepath = getSelectedFile().name;
	} else {
		filepath = ml.storage.drivers[ml.storage.currentDriver].name;
	}
	document.getElementById('editor-file-name').innerHTML = filepath;

	// Show editor
	document.getElementById('editor').style.display = 'block';

	return false;  // cancel link action
}
function editorOff() {

	// Hide editor
	document.getElementById('editor').style.display = 'none';

	// Restore content
	document.getElementById('content').style.display = 'block';

	return false;  // cancel link action
}
function saveLocalData() {
	var editButton = document.getElementById('editor-open');

	editButton.innerHTML = i18n.msgSaving;
	ml.storage.write(document.getElementById('editor-data').value);

	// Reload report
	reloadData();

	editButton.innerHTML = i18n.labelEditorOpen;
}
function editorSave() {
	editorOff();
	saveLocalData();
	return false;  // cancel link action
}


/////////////////////////////////////////////////////////////////////
//                         EVENT HANDLERS
/////////////////////////////////////////////////////////////////////

function sortCol(index) {
	// Note: sortData config is one-based, sortCol() is zero-based

	// If the same index, flip current reverse state, else reverse=false
	sortData[reportType].rev =
		(sortData[reportType].index == (index + 1)) ?
		!sortData[reportType].rev :
		false;
	// Save new index
	sortData[reportType].index = index + 1;
	// Refresh table
	showReport();
}

function sortColTag(index) {
	// Note: sortData config is one-based, sortColTag() is zero-based

	// If the same index, flip current reverse state, else reverse=false
	sortData[reportType].revTag =
		(sortData[reportType].indexTag === (index + 1)) ?
		!sortData[reportType].revTag :
		false;
	// Save new index
	sortData[reportType].indexTag = index + 1;
	// Refresh table
	tagReport();
}

function changeReport() {
	var el, oldType, newType;

	el = this;
	oldType = reportType;
	newType = el.id;

	// Deactivate old report, activate new
	removeClass(document.getElementById(oldType), 'active');
	addClass(el, 'active');

	// Always reset Rows Summary when changing reports
	selectedRows = [];
	updateSelectedRowsSummary();

	reportType = newType;
	updateToolbar();
	showReport();

	return false;  // cancel link action
}

function lastMonthsChanged() {
	document.getElementById('opt-last-months-check').checked = true;
	showReport();
}

function dateRangeComboChanged() {
	document.getElementById(this.id.replace(/(month|year)-combo/, 'check')).checked = true;
	showReport();
}

function toggleFullScreen() {
	var toolbar, logo, content;

	toolbar = document.getElementById('toolbar-controls-wrapper');
	logo = document.getElementById('logo');
	content = document.getElementById('content');

	if (isFullScreen) {
		toolbar.style.display = 'block';
		logo.style.display = 'block';
		content.style.marginLeft = (isMobile) ? 0 : '217px';  // #toolbar width
		isFullScreen = false;
	} else {
		toolbar.style.display = 'none';
		logo.style.display = 'none';
		content.style.marginLeft = 0;
		isFullScreen = true;
	}
	return false;  // cancel link action
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
	return false;  // cancel link action
}

function toggleCheckboxOptionExtra(checkbox) {
	// Show/hide the "*-extra" DIV with aditional options
	var extra = document.getElementById(checkbox.id.replace('-check', '-extra'));
	if (hasClass(extra, 'auto-hide')) {
		extra.style.display = (checkbox.checked) ? 'block' : 'none';
	}
}

function toggleStorage() {
	return toggleToolbarBox('storage-header', 'storage-content');
}

function toggleViewOptions() {
	return toggleToolbarBox('view-options-header', 'view-options-content');
}

function toggleTagCloud() {
	return toggleToolbarBox('tag-cloud-header', 'tag-cloud-content');
}

function toggleLastMonths() {
	toggleCheckboxOptionExtra(this);
	showReport();
}

function toggleValueFilter() {
	toggleCheckboxOptionExtra(this);
	showReport();
}

function toggleMonthly() {
	if (document.getElementById('opt-monthly-check').checked === true) {
		// Restore default sort when activating Partials
		sortData.d.index = 1;
		sortData.d.rev = false;
	}
	showReport();
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

function resetRowsSummary() {
	showReport();
	return false;  // cancel link action
}


/////////////////////////////////////////////////////////////////////
//                            Widgets
/////////////////////////////////////////////////////////////////////

// Widget object, all widgets must use this type.
// Ex.:
//     var HelloWorld = new Widget('hello-world', 'Hello World', 'HelloWorld');
//     HelloWorld.populate = function () { this.content.innerHTML = 'Hellooo!'; };
//     console.log(HelloWorld);
//
function Widget(widgetId, widgetName, instanceName) {
	this.id = widgetId;
	this.widgetName = widgetName;
	this.instanceName = instanceName;
	this.initDone = false;
	this.created = false;

	// Save the instance into a global holder
	this.constructor.instances.push(this);
	// this.instanceIndex = this.constructor.instances.length - 1;

	// Holders for the widget's DOM elements
	this.box = undefined;     // #widgetId-box
	this.header = undefined;  // #widgetId-header
	this.content = undefined; // #widgetId-content

	// Widget Config
	this.config = {};
	this.config.active = true;
	this.config.opened = true;
	// Active and opened by default, so the user notices it

	// Note: using inline onclick="" in templates to avoid 'this' scope problems
	this.boxTemplate = [
		'<div id="{widgetId}-box" class="widget-box">',
		'	<a id="{widgetId}-header" class="button" href="#"',
		'		onclick="return Widget.toggle(\'{widgetId}\')">{widgetName}</a>',
		'	<div id="{widgetId}-content" class="widget-content" style="display:none;">',
		'	</div>',
		'</div>'
	].join('\n');
	this.checkboxTemplate = [
		'	<div class="checkbox-option">',
		'		<input id="{widgetId}-{idSuffix}" class="trigger" type="checkbox"',
		'			onclick="{instanceName}.checkboxClicked(this)">',
		'		<label id="{widgetId}-{idSuffix}-label" for="{widgetId}-{idSuffix}">{label}</label>',
		'	</div>'
	].join('\n');
}

// Global holder that automatically save all instances
Widget.instances = [];

Widget.tidyInstances = function () {
	// Remove inactive widgets from global namespace and Widget.instances array
	var i;
	for (i = 0; i < Widget.instances.length;) {
		if (!Widget.instances[i].config.active) {
			window[Widget.instances[i].instanceName] = undefined;
			Widget.instances.splice(i, 1);
		} else {
			i++;
		}
	}
};

Widget.toggle = function (widgetId) {
	// Show/hide Widget contents
	// Static, not available in instances

	var header, content;

	header = document.getElementById(widgetId + '-header');
	content = document.getElementById(widgetId + '-content');

	if (content.style.display === 'block') {
		content.style.display = 'none';
		removeClass(header, 'active');
	} else {
		content.style.display = 'block';
		addClass(header, 'active');
	}
	return false;  // cancel link action
};

Widget.prototype.toggle = function () {
	// Show/hide Widget contents
	//
	// this = Widget instance when called directly: InstanceName.toggle();
	// this = DOM element <a> when used in onclick: element.onclick = InstanceName.toggle;
	//
	// Do not use the second form. If you must, you can use this instead:
	// element.onclick = (function () { return InstanceName.toggle(); });

	return Widget.toggle(this.id);
};

Widget.prototype.init = function () {
	// Called automatically at the end of MoneyLog start up. At his point,
	// user config is applied and app UI is ready. But user data was not
	// read/parsed yet.

	if (this.initDone) { return; }  // already done

	// Create widget DIV if config allows
	this.create();
	if (!this.created) { return; }

	// Populate widget contents
	this.populate();

	// Open the widget, if necessary
	if (this.config.opened && this.config.active) {
		this.toggle();
	}

	this.initDone = true;
};

Widget.prototype.create = function () {
	// Append a new widget-box to the #widgets area

	if (!this.config.active) { return; }
	if (this.created) { return; }  // already done

	// Append elements to #widgets
	appendHTML(
		document.getElementById('widgets'),
		this.boxTemplate
			.replace(/\{widgetId\}/g, this.id)
			.replace(/\{widgetName\}/g, i18n[this.instanceName + 'HeaderLabel'] || this.widgetName)
	);

	this.box = document.getElementById(this.id + '-box');
	this.header = document.getElementById(this.id + '-header');
	this.content = document.getElementById(this.id + '-content');
	this.created = (this.box && this.header && this.content) ? true : false;

	// Set header tooltip
	this.header.title = i18n[this.instanceName + 'HeaderHelp'];
};

Widget.prototype.populate = function () {
	// Called right after create(), here you create the widget contents.
	// You must implement this function in your widget.
	return;
};

Widget.prototype.addCheckbox = function (idSuffix, label, checked) {
	// Append a new checkbox to the widget-box contents

	var template = this.checkboxTemplate;
	if (checked) {
		template = template.replace('<input', '<input checked="checked"');
	}

	appendHTML(
		this.content,
		template
			.replace(/\{widgetId\}/g, this.id)
			.replace(/\{idSuffix\}/g, idSuffix)
			.replace(/\{label\}/g, label)
			.replace(/\{instanceName\}/g, this.instanceName)
	);

	return document.getElementById(this.id + '-' + idSuffix);  // return the element
};

Widget.prototype.checkboxClicked = function (element) {  // Event handler
	// Called when a checkbox made with addCheckbox() is clicked.
	//   element = clicked checkbox
	//   this = Widget instance
	// You must implement this function in your widget.
	return element;
};

// Hooks
Widget.prototype.showReportPost = function () {};


/////////////////////////////////////////////////////////////////////
////
//// Tag Summary Widget

TagSummary = new Widget('tag-summary', 'Tag Summary', 'TagSummary');

// Widget config
TagSummary.config.active = true;       // Is this widget active?
TagSummary.config.opened = false;      // Start app with this widget opened?
TagSummary.config.checkSort = false;   // [X] Sort by value checkbox inits checked?
TagSummary.config.showTagless = true;  // The (no tag) sum should appear?

if (isMobile) { TagSummary.config.opened = false; }  // In mobile, always closed

// UI strings
i18nDatabase.en.TagSummaryHeaderLabel = 'Tag Summary';
i18nDatabase.en.TagSummaryHeaderHelp = 'Show/hide the tag summary.';
i18nDatabase.en.TagSummarySortLabel = 'Sort by value';
i18nDatabase.en.TagSummarySortHelp = 'Order the Tag Summary by values instead tag names.';
//
i18nDatabase.pt.TagSummaryHeaderLabel = 'Somatório de tags';
i18nDatabase.pt.TagSummaryHeaderHelp = 'Mostra e esconde o somatório das tags.';
i18nDatabase.pt.TagSummarySortLabel = 'Ordenar por valor';
i18nDatabase.pt.TagSummarySortHelp = 'Ordena o sumário de tags pelos valores, não pelos nomes.';
//
i18nDatabase.es.TagSummaryHeaderLabel = 'Sumario';
i18nDatabase.es.TagSummaryHeaderHelp = 'Mostrar/esconder Sumario.';
i18nDatabase.es.TagSummarySortLabel = 'Ordenar por valor';
i18nDatabase.es.TagSummarySortHelp = 'Ordenar Sumario por valor en lugar de Concepto.';

// Create elements
TagSummary.populate = function () {

	this.content.innerHTML = [
		'<div id="tag-summary-data"></div>',
		'',
		'<div id="tag-summary-options" class="widget-options">',
		'	<hr />',
		'	<div id="tag-summary-opt-nsort-box" class="checkbox-option">',
		'		<input id="tag-summary-opt-nsort-check" type="checkbox" class="trigger">',
		'		<label id="tag-summary-opt-nsort-label" for="tag-summary-opt-nsort-check"></label>',
		'	</div>',
		'</div>'
	].join('\n');

	// Set option label & tooltip
	document.getElementById('tag-summary-opt-nsort-label').title = i18n.TagSummarySortHelp;
	document.getElementById('tag-summary-opt-nsort-label').innerHTML = i18n.TagSummarySortLabel;

	// Save checkbox element for later use
	this.sortCheckbox = document.getElementById('tag-summary-opt-nsort-check');

	// Set checkbox action handler
	this.sortCheckbox.onclick = showReport;

	// Maybe the option should init checked?
	if (this.config.checkSort) {
		this.sortCheckbox.checked = true;
	}
};

// hook
TagSummary.showReportPost = function () {
	this.update();
};

// Updates the summary with the current report information
TagSummary.update = function () {
	var i, leni, j, lenj, tag, results, tagNames, tagData, theData, tableData, rowAmount, rowTags, noTagSum, valueSort;

	results = [];
	tagNames = [];
	tagData = {};
	tableData = [];
	valueSort = this.sortCheckbox.checked;
	noTagSum = undefined;  // Do not use 0. The final result may be zero.
	theData = reportData.clone();

	// Scan report rows
	for (i = 0, leni = theData.length; i < leni; i++) {
		// rowDate        = theData[i][0];
		rowAmount      = theData[i][1];
		rowTags        = theData[i][2].clone();
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
		if (noTagSum !== undefined && this.config.showTagless) {
			tagNames.push(i18n.labelTagCloudEmpty);
			tagData[i18n.labelTagCloudEmpty] = noTagSum;
		}

		// Save table data, sorted by tag name
		for (i = 0, leni = tagNames.length; i < leni; i++) {
			tag = tagNames[i];
			tableData.push([tag, tagData[tag]]);
		}

		// Sort by value?
		if (valueSort) {
			tableData.sort(sortByIndex(1, 'n'));
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
};



/////////////////////////////////////////////////////////////////////
////
//// About Widget

AboutWidget = new Widget('about', 'About', 'AboutWidget');

// Widget config
AboutWidget.config.active = true;       // Is this widget active?
AboutWidget.config.opened = false;      // Start app with this widget opened?

// UI strings
i18nDatabase.en.AboutWidgetHeaderLabel = 'About';
i18nDatabase.en.AboutWidgetHeaderHelp = 'Show/hide the about box.';
//
i18nDatabase.pt.AboutWidgetHeaderLabel = 'Sobre';
i18nDatabase.pt.AboutWidgetHeaderHelp = 'Mostra e esconde a caixa Sobre.';
//
i18nDatabase.es.AboutWidgetHeaderLabel = 'Acerca de';
i18nDatabase.es.AboutWidgetHeaderHelp = 'Mostrar/esconder Acerca de.';


// Create elements
AboutWidget.populate = function () {
	var version, commit, html = [];

	// When in β: always show the commit ID
	if (isBeta) {
		version = 'v' + appVersion;
		commit = linkme(appRepository + '/commit/' + appCommit, appCommit);

	// When stable: hide commit, version links to website
	} else {
		version = linkme('http://aurelio.net/moneylog/v' + appVersion + '/', 'v' + appVersion);
		commit = '';
	}

	// When in txt mode: link to repository since we can't get the commit hash
	if (ml.storage.currentDriver === 'filesystem') {
		version = linkme(appRepository, 'v' + appVersion);
	}

	html.push('<div id="about-app">');
	html.push(linkme('http://aurelio.net/moneylog/', appName));
	html.push('<span id="app-version">' + version + '</span>');
	if (isBeta && appCommit !== '') {
		html.push('<div>commit: ' + commit + '</div>');
	}
	html.push('</div>');

	html.push('<div id="about-copyright">');
	html.push(linkme('http://en.wikipedia.org/wiki/MIT_license', '©') + (isBeta ? new Date().getYearML() : appYear) + ',');
	html.push(linkme('http://twitter.com/oreio', '@oreio'));
	html.push('</div>');

	html.push('<div id="about-donate">');
	html.push(linkme('http://aurelio.net/moneylog/donate/', '♥'));
	html.push('</div>');

	html.push('<hr>');
	html.push('<div id="about-credits">');
	html.push('UI design:');
	html.push(linkme('http://twitter.com/xupisco', '@xupisco'));
	html.push('<br>');
	html.push('i18n ca:');
	html.push(linkme('http://twitter.com/pacoriviere', '@pacoriviere'));
	html.push('<br>');
	html.push('i18n es:');
	html.push(linkme('http://twitter.com/g_nemmi', '@g_nemmi'));
	html.push('</div>');

	this.content.innerHTML = html.join('\n');
};



/////////////////////////////////////////////////////////////////////
//                             INIT
/////////////////////////////////////////////////////////////////////

function init() {
	var i;

	// Load the i18n messages (must be the first)
	i18n = i18nDatabase.getLanguage(lang);

	// Set app URL
	i18n.appUrl = 'https://moneylog.aurelio.net';

	// Password protected?
	if (myPassword) {
		// Prompt user and check
		if (myPassword != prompt(appName + ' — ' + i18n.msgTypePassword)) {
			// Destroy full interface and show error
			document.getElementById('container').innerHTML = '<h2 style="padding:30px;">' + i18n.msgWrongPassword + '</h2>';
			return;  // abort
		}
	}

	// Prepare UI elements
	populateLastMonthsCombo();
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

	// Some configs may be set as strings or arrays.
	// If user choose string, let's convert it to an array now.
	if (typeof highlightTags === 'string') {
		highlightTags = (highlightTags) ? highlightTags.strip().split(/\s+/): [];
	}
	if (typeof ignoreTags === 'string') {
		ignoreTags = (ignoreTags) ? ignoreTags.strip().split(/\s+/) : [];
	}
	if (typeof initSelectedTags === 'string') {
		initSelectedTags = (initSelectedTags) ? initSelectedTags.strip().split(/\s+/) : [];
	}
	if (typeof initExcludedTags === 'string') {
		initExcludedTags = (initExcludedTags) ? initExcludedTags.strip().split(/\s+/) : [];
	}

	// Set interface labels
	document.getElementById('d'                        ).innerHTML = i18n.labelDaily;
	document.getElementById('m'                        ).innerHTML = i18n.labelMonthly;
	document.getElementById('y'                        ).innerHTML = i18n.labelYearly;
	document.getElementById('opt-last-months-label'    ).innerHTML = i18n.labelLastMonths + ':';
	document.getElementById('opt-value-filter-label'   ).innerHTML = i18n.labelValueFilter + ':';
	document.getElementById('opt-future-label'         ).innerHTML = i18n.labelShowFuture;
	document.getElementById('opt-monthly-label'        ).innerHTML = i18n.labelMonthPartials;
	document.getElementById('opt-regex-label'          ).innerHTML = i18n.labelSearchRegex;
	document.getElementById('opt-negate-label'         ).innerHTML = i18n.labelSearchNegate;
	document.getElementById('tag-cloud-opt-group-label').innerHTML = i18n.labelTagCloudGroup;
	document.getElementById('tag-cloud-opt-reset-label').innerHTML = i18n.labelTagCloudReset;
	document.getElementById('storage-header'           ).innerHTML = i18n.labelStorage;
	document.getElementById('source-reload'            ).innerHTML = i18n.labelReload;
	document.getElementById('editor-open'              ).innerHTML = i18n.labelEditorOpen;
	document.getElementById('editor-close'             ).innerHTML = i18n.labelEditorCancel;
	document.getElementById('editor-save'              ).innerHTML = i18n.labelEditorSave;
	document.getElementById('view-options-header'      ).innerHTML = i18n.labelViewOptions;
	document.getElementById('opt-date-1-label'         ).innerHTML = i18n.labelDateFrom + ':';
	document.getElementById('opt-date-2-label'         ).innerHTML = i18n.labelDateUntil + ':';
	document.getElementById('tag-cloud-header'         ).innerHTML = i18n.labelTagCloud;
	document.getElementById('tag-report-opt-related-label').innerHTML = i18n.labelTagReportRelated;
	document.getElementById('rows-summary-reset'       ).innerHTML = i18n.labelRowsSummaryReset;

	// Set interface tooltips
	document.getElementById('fullscreen'               ).title = i18n.helpFullScreen;
	document.getElementById('website'                  ).title = i18n.helpWebsite;
	document.getElementById('report-nav'               ).title = i18n.helpReports;
	document.getElementById('opt-last-months-label'    ).title = i18n.helpLastMonths;
	document.getElementById('opt-value-filter-label'   ).title = i18n.helpValueFilter;
	document.getElementById('opt-future-label'         ).title = i18n.helpShowFuture;
	document.getElementById('opt-monthly-label'        ).title = i18n.helpMonthPartials;
	document.getElementById('filter'                   ).title = i18n.helpSearch;
	document.getElementById('opt-regex-label'          ).title = i18n.helpSearchRegex;
	document.getElementById('opt-negate-label'         ).title = i18n.helpSearchNegate;
	document.getElementById('storage-header'           ).title = i18n.helpStorage;
	document.getElementById('source-reload'            ).title = i18n.helpReload;
	document.getElementById('tag-cloud-opt-group-label').title = i18n.helpTagCloudGroup;
	document.getElementById('tag-cloud-opt-reset-label').title = i18n.helpTagCloudReset;
	document.getElementById('view-options-header'      ).title = i18n.helpViewOptions;
	document.getElementById('tag-cloud-header'         ).title = i18n.helpTagCloud;
	document.getElementById('tag-report-opt-related-label').title = i18n.helpTagReportRelated;
	document.getElementById('rows-summary-reset'       ).title = i18n.helpRowsSummaryReset;
	document.getElementById('editor-open'              ).title = i18n.helpEditorOpen;
	document.getElementById('editor-close'             ).title = i18n.helpEditorCancel;
	document.getElementById('editor-save'              ).title = i18n.helpEditorSave;

	// Mark current report as active (CSS)
	addClass(document.getElementById(reportType), 'active');

	// Notice the user that we're ignoring some data
	if (ignoreDataOlderThan) {
		document.getElementById('footer-message').innerHTML += 'ignoreDataOlderThan = ' + ignoreDataOlderThan + '<br>';
	}
	if (ignoreDataNewerThan) {
		document.getElementById('footer-message').innerHTML += 'ignoreDataNewerThan = ' + ignoreDataNewerThan + '<br>';
	}
	if (ignoreTags.length > 0) {
		document.getElementById('footer-message').innerHTML += 'ignoreTags = ' + ignoreTags.join(', ') + '<br>';
	}

	// Set initial chart type for the reports (before event handlers)
	if (reportType === 'd') {
		document.getElementById('chart-selector').selectedIndex = initChartDaily - 1;
	} else if (reportType === 'm') {
		document.getElementById('chart-selector').selectedIndex = initChartMonthly - 1;
	} else {
		document.getElementById('chart-selector').selectedIndex = initChartYearly - 1;
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
	document.getElementById('opt-future-check'       ).onclick  = showReport;
	document.getElementById('opt-monthly-check'      ).onclick  = toggleMonthly;
	document.getElementById('filter'                 ).onkeyup  = showReport;
	document.getElementById('opt-regex-check'        ).onclick  = showReport;
	document.getElementById('opt-negate-check'       ).onclick  = showReport;
	document.getElementById('storage-driver'         ).onchange = ml.storage.driversComboChanged;
	document.getElementById('source-file'            ).onchange = loadData;
	document.getElementById('source-reload'          ).onclick  = reloadData;
	document.getElementById('opt-date-1-check'       ).onclick  = showReport;
	document.getElementById('opt-date-2-check'       ).onclick  = showReport;
	document.getElementById('opt-date-1-month-combo' ).onchange = dateRangeComboChanged;
	document.getElementById('opt-date-2-month-combo' ).onchange = dateRangeComboChanged;
	document.getElementById('tag-cloud-opt-group-check' ).onclick  = showReport;
	document.getElementById('tag-cloud-opt-reset-check' ).onclick  = resetTagCloud;
	document.getElementById('chart-selector'         ).onchange = showReport;
	document.getElementById('tag-report-opt-related-check').onclick = tagReport;
	document.getElementById('rows-summary-index'     ).onchange = updateSelectedRowsSummary;
	document.getElementById('rows-summary-reset'     ).onclick  = resetRowsSummary;
	document.getElementById('storage-header'         ).onclick  = toggleStorage;
	document.getElementById('view-options-header'    ).onclick  = toggleViewOptions;
	document.getElementById('tag-cloud-header'       ).onclick  = toggleTagCloud;
	document.getElementById('editor-open'            ).onclick  = editorOn;
	document.getElementById('editor-close'           ).onclick  = editorOff;
	document.getElementById('editor-save'            ).onclick  = editorSave;

	// Apply user defaults (this code must be after event handlers adding)
	if (initFullScreen)     { toggleFullScreen(); }
	if (checkRegex)         { document.getElementById('opt-regex-check'  ).checked = true; }
	if (checkNegate)        { document.getElementById('opt-negate-check' ).checked = true; }
	if (checkDateFrom)      { document.getElementById('opt-date-1-check' ).checked = true; }
	if (checkDateUntil)     { document.getElementById('opt-date-2-check' ).checked = true; }
	if (checkMonthPartials) { document.getElementById('opt-monthly-check').checked = true; }
	if (checkHideRelatedTags) {
		document.getElementById('tag-report-opt-related-check').checked = true;
	}
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
	if (initStorageWidgetOpen) {     toggleStorage(); }
	if (initViewWidgetOpen)    { toggleViewOptions(); }
	if (initTagCloudOpen)      {    toggleTagCloud(); }

	// Maybe hide some widgets?
	if (!showStorageWidget) {
		document.getElementById('storage-box').style.display = 'none';
	}
	if (!showViewWidget) {
		document.getElementById('view-options-box').style.display = 'none';
	}
	if (!showTagCloud) {
		document.getElementById('tag-cloud-box').style.display = 'none';
	}

	// Init all available Widgets one by one
	Widget.tidyInstances();
	for (i = 0; i < Widget.instances.length; i++) {
		Widget.instances[i].init();
	}

	// User choose other default report, let's update the toolbar accordingly
	if (reportType !== 'd') {
		updateToolbar();
	}

	// Validate the sort data config
	if (sortData.d.index < sortData.d.min) { sortData.d.index = sortData.d.min; }
	if (sortData.m.index < sortData.m.min) { sortData.m.index = sortData.m.min; }
	if (sortData.y.index < sortData.y.min) { sortData.y.index = sortData.y.min; }
	if (sortData.d.index > sortData.d.max) { sortData.d.index = sortData.d.max; }
	if (sortData.m.index > sortData.m.max) { sortData.m.index = sortData.m.max; }
	if (sortData.y.index > sortData.y.max) { sortData.y.index = sortData.y.max; }
	if (sortData.m.index < sortData.m.minTag) { sortData.m.index = sortData.m.minTag; }
	if (sortData.y.index < sortData.y.minTag) { sortData.y.index = sortData.y.minTag; }

	// UI is ok, so now let's setup storage and (maybe) load user data
	// Exception: some cloud storages defer user data loading after the file picker
	ml.storage.init();
	ml.storage.setDriver();

	// Uncomment this line to focus the search box at init
	// document.getElementById('filter').focus();
}
window.onload = init;
