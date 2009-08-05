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
var lang = 'pt';                  // 'pt' or 'en' for Portuguese or English
var maxLastMonths = 12;           // Number of months on the last months combo
var initLastMonths = 3;           // Initial value for last months combo
var defaultLastMonths = false;    // Last months combo inits checked?
var defaultMonthPartials = true;  // Monthly checkbox inits checked?
var defaultFuture = true;         // Show future checkbox inits checked?
var defaultRegex = false;         // Search regex checkbox inits checked?
var defaultNegate = false;        // Search negate checkbox inits checked?
var defaultSearch = '';           // Search for this text on init
var showRowCount = true;          // Show the row numbers at left?
var monthlyRowCount = true;       // The row numbers are reset each month?
var highlightWords = '';          // The words you may want to highlight (ie: 'XXX TODO')
var highlightTags = '';           // The tags you may want to highlight (ie: 'work kids')
var reportType = 'd';             // Initial report type: d m y (daily, monthly, yearly)

// Program structure and files
var oneFile = false;              // Full app is at moneylog.html single file?
var dataFiles = ['moneylog.txt']; // The paths for the data files (requires oneFile=false)
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
	pt: {
		labelLastMonths: 'Somente Recentes:',
		labelMonthPartials: 'Mostrar Parciais Mensais',
		labelFuture: 'Mostrar Lançamentos Futuros',
		labelNoData: 'Nenhum lançamento.',
		labelsDetailed: ['Data', 'Valor', 'Tags', 'Descrição', 'Acumulado'],
		labelsOverview: ['Período', 'Ganhos', 'Gastos', 'Saldo', 'Acumulado'],
		labelTotal: 'Total',
		labelAverage: 'Média',
		labelMonths: ['mês', 'meses'],
		labelRegex: 'regex',
		labelNegate: 'excluir',
		labelDaily: 'diário',
		labelMonthly: 'mensal',
		labelYearly: 'anual',
		labelHelp: 'Ajuda',
		labelReload: 'Recarregar',
		labelValueFilter: 'Somente Valores:',
		labelPositive: 'positivo',
		labelNegative: 'negativo',
		labelGreaterThan: 'maior que',
		labelLessThan: 'menor que',
		labelTagEmpty: 'VAZIO',
		labelTagGroup: 'unir',
		errorInvalidData: 'Lançamento inválido na linha ',
		errorNoFieldSeparator: 'Separador não encontrado:',
		errorTooManySeparators: 'Há mais de 2 sepadarores',
		errorInvalidDate: 'Data inválida:',
		errorInvalidAmount: 'Valor inválido:',
		appUrl: 'http://aurelio.net/moneylog',
		appDescription: 'Uma página. Um programa.',
		centsSeparator: ',',
		thousandSeparator: '.'
	},
	en: {		
		labelLastMonths: 'Recent Only:',
		labelMonthPartials: 'Show Monthly Partials',
		labelFuture: 'Show Future Data',
		labelNoData: 'No data.',
		labelsDetailed: ['Date', 'Amount', 'Tags', 'Description', 'Balance'],
		labelsOverview: ['Period', 'Incoming', 'Expense', 'Partial', 'Balance'],
		labelTotal: 'Total',
		labelAverage: 'Average',
		labelMonths: ['month', 'months'],
		labelRegex: 'regex',
		labelNegate: 'negate',
		labelDaily: 'daily',
		labelMonthly: 'monthly',
		labelYearly: 'yearly',
		labelHelp: 'Help',
		labelReload: 'Reload',
		labelValueFilter: 'Filter Values:',
		labelPositive: 'positive',
		labelNegative: 'negative',
		labelGreaterThan: 'greater than',
		labelLessThan: 'less than',
		labelTagEmpty: 'EMPTY',
		labelTagGroup: 'group',
		errorInvalidData: 'Invalid data at line ',
		errorNoFieldSeparator: 'No separator found:',
		errorTooManySeparators: 'Too many separators',
		errorInvalidDate: 'Invalid date:',
		errorInvalidAmount: 'Invalid amount:',
		appUrl: 'http://aurelio.net/soft/moneylog',
		appDescription: 'A webpage. A software.',
		centsSeparator: '.',
		thousandSeparator: ','
	}
};
// End of user Config


var sortColIndex = 0;
var sortColRev = false;
var oldSortColIndex;
var oldValueFilterArgShow;
var currentDate;
var overviewData = [];
var highlightRegex;
var i18n;

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
	if (!this.match(/[^a-z0-9 ]/)) { return this; } // no accented char
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
	for (var i = 0; i < this.length; i++) {
		if (item == this[i]) { return true; }
	}
	return false;
};
Array.prototype.removePattern = function (patt) {
	var i, cleaned = [];
	for (i = 0; i < this.length; i++) {
		if (this[i] != patt) { cleaned.push(this[i]); }
	}
	return cleaned;
};
RegExp.escape = function (str) {
	var specials = new RegExp('[.*+?|\\^$()\\[\\]{}\\\\]', 'g');
	return str.replace(specials, '\\$&');
};

function invalidData(lineno, message) {
	alert(i18n.errorInvalidData + lineno + '\n' + message.replace(/\t/g, '<TAB>'));
}
function sortCol(index, isOverview) { // if the same, flip reverse state
	sortColRev = (sortColIndex == index) ? sortColRev ^= true : false;
	sortColIndex = index;
	showReport();
}
function sortArray(a, b)  {
	a = a[sortColIndex];
	b = b[sortColIndex];
	try {
		if (sortColIndex == 2) {
			a = a.toLowerCase();
			b = b.toLowerCase();
		}
	} catch (e) { }
	try { // IE6...
		if (a < b) { return -1; }
		else if (a > b) { return 1; }
	} catch (e) { }
	return 0;
}
function sortIgnoreCase(a, b) {
	try {
		a = a.toLowerCase().unacccent();
		b = b.toLowerCase().unacccent();
	} catch (e) { }
	try { // IE6...
		if (a < b) { return -1; }
		else if (a > b) { return 1; }
	} catch (e) { }
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
	if (m < 1) {  // past year
		m = 12 + m;
		y = y - 1;
	}
	m = (m < 10) ? '0' + m : m;
	return y + '-' + m + '-' + '00';
}
function addMonths(yyyymmdd, n) {
	var y, m, d;
	yyyymmdd = yyyymmdd.replace(/-/g, '');
	y = parseInt(yyyymmdd.slice(0,4), 10);
	m = parseInt(yyyymmdd.slice(4,6), 10);
	d = yyyymmdd.slice(6,8);
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
function populateOverviewRangeCombo() {
	var el;
	el = document.getElementById('overviewrange');
	el.options[0] = new Option(i18n.labelMonthly, 'month');
	el.options[1] = new Option(i18n.labelYearly, 'year');
}
function populateValueFilterCombo() {
	var el;
	el = document.getElementById('valuefilter');
	el.options[0] = new Option('+ ' + i18n.labelPositive, '+');
	el.options[1] = new Option('- ' + i18n.labelNegative, '-');
	el.options[2] = new Option('> ' + i18n.labelGreaterThan, '>');
	el.options[3] = new Option('< ' + i18n.labelLessThan, '<');
}
function populateMonthsCombo() {
	var el, label, i;
	el = document.getElementById('lastmonths');
	label = i18n.labelMonths[0];
	for (i = 1; i <= maxLastMonths; i++) {
		if (i > 1) { label = i18n.labelMonths[1]; }
		el.options[i - 1] = new Option(i + ' ' + label, i);
	}
	el.selectedIndex = (initLastMonths > 0) ? initLastMonths - 1 : 0;
}
function populateDataFilesCombo() {
	var el, i;
	if (!oneFile) {
		el = document.getElementById('datafiles');
		for (i = 0; i < dataFiles.length; i++) {
			el.options[i] = new Option(dataFiles[i]);
		}
	}
}
function getTotalsRow(total, monthTotal, monthNeg, monthPos) {
	var partial, theRow;
	
	partial = [];
	partial.push('<table class="monthsubtotal number" align="left"><tr>');
	partial.push('<td class="mini"> +');
	partial.push(prettyFloat(monthPos, true) + '<br>');
	partial.push(prettyFloat(monthNeg, true) + '<\/td>');
	partial.push('<\/tr><\/table>');
	partial = partial.join('');

	// Show month total?
	if (monthTotal != '') {
		monthTotal = '=  ' + prettyFloat(monthTotal);
	}

	theRow = '<tr class="monthtotal">';
	if (showRowCount) {
		theRow += '<td class="row-count"><\/td>';
	}
	theRow += '<td><\/td>';
	theRow += '<td>' + partial + '<\/td>';
	theRow += '<td colspan="2" align="left">' + monthTotal + '<\/td>';
	theRow += '<td class="number">' + prettyFloat(total) + '<\/td>';
	theRow += '<\/tr>';
	return theRow;
}
function getOverviewRow(theMonth, monthPos, monthNeg, monthTotal, theTotal, rowCount) {
	var theRow = [];
	theRow.push((theMonth <= currentDate.slice(0, 7)) ? '<tr>' : '<tr class="future">');
	if (showRowCount) {
		theRow.push('<td class="row-count">' + rowCount + '<\/td>');
	}
	theRow.push('<td>' + theMonth + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(monthPos)  + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(monthNeg)  + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(monthTotal) + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(theTotal)  + '<\/td>');
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
	theRow.push('<td class="number">' + prettyFloat(n1)  + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(n2)  + '<\/td>');
	theRow.push('<td class="number">' + prettyFloat(n3) + '<\/td>');
	theRow.push('<td><\/td>');
	theRow.push('<\/tr>');
	return theRow.join('\n');
}
function toggleOverview() {
	var i, hide, remove, show;
	
	// Visibility On/Off - Overview report hides some controls from the toolbar
	//
	// Some fields are just hidden to preserve the page layout.
	// Others must be removed to free some space for the report.
	
	remove = ['tagsArea'];
	hide = ['filterbox', 'optmonthly', 'optmonthlylabel', 'optvaluefilter', 'optvaluefilterlabel', 'valuefilter'];

	show = (reportType != 'd');
	for (i = 0; i < hide.length; i++) {
		document.getElementById(hide[i]).style.visibility = (show) ? '' : 'hidden';
	}
	for (i = 0; i < remove.length; i++) {
		document.getElementById(remove[i]).style.display = (show) ? 'block' : 'none';
	}

	// Save / restore information
	if (reportType == 'd') {
		// Special case that needs to save previous state
		oldValueFilterArgShow = document.getElementById('valuefilterarg').style.visibility;
		document.getElementById('valuefilterarg').style.visibility = 'hidden';
		oldSortColIndex = sortColIndex; // save state
		sortColIndex = 0; // Default by date
	} else {
		document.getElementById('valuefilterarg').style.visibility = oldValueFilterArgShow;
		sortColIndex = oldSortColIndex || 0;
		overviewData = [];
	}
}
function changeReport(el) {
	var oldType, newType;
	
	oldType = reportType;
	newType = el.id;
	
	// Deactivate old report, activate new
	document.getElementById(oldType).className = '';
	el.className = 'active';
	
	// XXX rework the toggleOverview() function
	if (oldType == 'd' && newType != 'd') {
		toggleOverview();
	}
	if (newType == 'd' && oldType != 'd') {
		toggleOverview();
	}
	
	// Recent *months* doesn't make sense in yearly report
	// TODO make a "recent years" feature
	if (newType == 'y' || oldType == 'y') {
		show = (newType != 'y');
		document.getElementById('optlastmonths').style.visibility = (show) ? '' : 'hidden';
		document.getElementById('optlastmonthslabel').style.visibility = (show) ? '' : 'hidden';
		document.getElementById('lastmonths').style.visibility = (show) ? '' : 'hidden';
	}
	
	reportType = newType;
	overviewData = [];
	showReport();	
}
function toggleLastMonths() {
	overviewData = [];
	showReport();
}
function lastMonthsChanged() {
	document.getElementById('optlastmonths').checked = true;
	overviewData = [];
	showReport();
}
function toggleFuture() {
	overviewData = [];
	showReport();
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
function toggleMonthly() {
	if (document.getElementById('optmonthly').checked === true) {
		sortColIndex = 0;
		sortColRev = false;
	}
	showReport();
}
function toggleHelp() {
	var el = document.getElementById('help');
	el.style.display = (el.style.display == 'block') ? 'none' : 'block';
}
function loadDataFile(filePath) {
	if (!filePath) { return; }
	document.getElementById("dataFrame").src = filePath;
	overviewData = [];
	setTimeout("showReport()", 100);
	// The browser won't load the iframe contents unless we schedule it (strange...)
}
function reloadData() {
	loadDataFile(document.getElementById('datafiles').value);
}
function readData() {
	var i, j, temp, isRegex, isNegated, filter, filterPassed, firstDate, showFuture, theData, rawData, rowDate, rowAmount, rowText, rowTagsDescription, rowTags, rowDescription, recurrentAmount, recValue, recTimes, recOperator, valueFilter, valueFilterArg, lineno, fields, rowAmountErrorMsg;

	isRegex = false;
	isNegated = false;
	filter = '';
	firstDate = 0;
	theData = [];

	// Read raw data from #data block or from external dataFile (iframe)
	if (oneFile) {
		rawData = document.getElementById('data').innerHTML;
		
	} else {
		rawData = frames[0].document.getElementsByTagName('pre')[0].innerHTML;
	}

	rawData = rawData.split(dataRecordSeparator);
	
	if (document.getElementById('optlastmonths').checked && reportType != 'y') {
		firstDate = getPastMonth(document.getElementById('lastmonths').value - 1);
	}
	
	// Show future works for both views
	showFuture = document.getElementById('optfuture').checked;
	
	// Get filters data for the detailed report
	if (reportType == 'd') {
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
			filter = eval('/' + filter.replace('/', '\\/') + '/i');
		} else {
			filter = filter.toLowerCase();
		}
	}

	// Scan data rows
	for (i = 0; i < rawData.length; i++) {
		lineno = i + 1;
		rowDate = rowAmount = rowText = '';

		///////////////////////////////////////////////////////////// Firewall

		// Skip commented rows
		if (rawData[i].indexOf(commentChar) === 0) { continue; }
		// Skip blank lines
		if (!rawData[i].strip()) { continue; }

		// Separate fields
		fields = rawData[i].split(dataFieldSeparator);

		// Error: rows with no separator
		if (fields.length == 1) {
			invalidData(
				lineno,
				i18n.errorNoFieldSeparator + ' "' + dataFieldSeparator + '"\n\n' + rawData[i]
			);
			return [];

		// Error: too much separators
		} else if (fields.length - 1 > 2) {
			invalidData(
				lineno,
				i18n.errorTooManySeparators + ' "' + dataFieldSeparator + '"\n\n' + rawData[i]
			);
			return [];			
		}

		///////////////////////////////////////////////////////////// Text

		rowText = (fields.length > 2) ? fields[2].strip() : '';

		///////////////////////////////////////////////////////////// Date
		
		rowDate = fields[0].match(dataPatterns.date);
		if (rowDate) {
			rowDate = rowDate[1]; // group 1
		} else {
			invalidData(lineno, i18n.errorInvalidDate + ' ' + fields[0] + '\n\n' + rawData[i]);
		}

		///////////////////////////////////////////////////////////// Amount
		
		rowAmountErrorMsg = i18n.errorInvalidAmount + ' ' + fields[1] + '\n\n' + rawData[i];

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
			if(isNaN(rowAmount)) {
				invalidData(lineno, rowAmountErrorMsg);
				return [];
			}
		} else {
			invalidData(lineno, rowAmountErrorMsg);
			return [];
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
				recValue = (recValue / recTimes).toFixed(2);
			}

			// Compose and append each new row
			for (j = 1; j <= recTimes; j++) {
				rawData.push([
					addMonths(rowDate, j - 1),
					recValue,
					rowText + ' ' + j + '/' + recTimes
				].join(dataFieldSeparator));
			}
			
			// Ignore the original recurring row
			continue;
		}
		
		///////////////////////////////////////////////////////////// Filters
		
		// Ignore dates older than "last N months" option (if checked)
		if (rowDate < firstDate) { continue; }

		// Ignore future dates
		if (!showFuture && rowDate > currentDate) { continue; }

		// Apply value filter
		if (valueFilter) {
			if (valueFilter == '+' && rowAmount < 0) { continue; }
			if (valueFilter == '-' && rowAmount >= 0) { continue; }
			if (valueFilter == '>' && rowAmount <= valueFilterArg) { continue; }
			if (valueFilter == '<' && rowAmount >= valueFilterArg) { continue; }
			if (valueFilter == '=' && rowAmount != valueFilterArg) { continue; }
			if (valueFilter == '>=' && rowAmount < valueFilterArg) { continue; }
			if (valueFilter == '<=' && rowAmount > valueFilterArg) { continue; }
		}

		// Search filter firewall - Will this line pass it?
		if (filter) {
			if (isRegex) {
				filterPassed = filter.test(rawData[i]);
			} else {
				filterPassed = (rawData[i].toLowerCase().indexOf(filter) != -1);
			}
			if ((!filterPassed && !isNegated) || (filterPassed && isNegated)) { continue; }
		}
		
		///////////////////////////////////////////////////////////// Tags + Description

		// Parse tags
		if (rowText.indexOf(dataTagTerminator) != -1) {

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
		
		// Save the parsed data
		theData.push([rowDate, rowAmount, rowTags, rowDescription]);
	}
	
	return theData;
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
		}

		// All tags in one single line
		tagsMenu = tagsMenu.join('\n');
	}
	
	// Save the tags menu (or make it empty)
	document.getElementById('tagList').innerHTML = tagsMenu;
	
	// Show the tags menu if we have at least one tag
	document.getElementById('tagsArea').style.display = (
		tagsMenu.length > 0) ? 'block' : 'none';

	// The '+' checkbox is only shown if we have multiple selected tags
	document.getElementById('tagMultiAll').style.display = (
		selectedTags.length > 1) ? 'inline' : 'none';

	// Tag filter was active?
	if (selectedTags.length > 0) {
		return filteredData;
	} else {
		return theData;
	}
}
function showOverview() {
	var i, z, len, rowDate, rowAmount, theData, thead, results, grandTotal, dateSize, rangeDate, rangeTotal, rangePos, rangeNeg, sumPos, sumNeg, sumTotal, currSortIndex;

	results = [];
	grandTotal = rangeTotal = rangePos = rangeNeg = sumPos = sumNeg = sumTotal = 0;
	currSortIndex = sortColIndex;

	// Table headings
	thead = '<th onClick="sortCol(0, true)">' + i18n.labelsOverview[0] + '<\/th>';
	thead += '<th onClick="sortCol(1, true)">' + i18n.labelsOverview[1] + '<\/th>';
	thead += '<th onClick="sortCol(2, true)">' + i18n.labelsOverview[2] + '<\/th>';
	thead += '<th onClick="sortCol(3, true)">' + i18n.labelsOverview[3] + '<\/th>';
	thead += '<th onClick="sortCol(4, true)">' + i18n.labelsOverview[4] + '<\/th>';
	if (showRowCount) {
		thead = '<th class="row-count"><\/th>' + thead;
	}

	if (!overviewData.length) { // Data not cached
		theData = readData();
		sortColIndex = 0; // Always scan by date order
		theData.sort(sortArray);
	}

	if (overviewData.length || theData.length) {
		results.push('<table class="overview">');
		results.push('<tr>' + thead + '<\/tr>');

		// The cache is empty. Scan and calculate everything.
		if (!overviewData.length) {
						
			for (i = 0; i < theData.length; i++) {
				rowDate        = theData[i][0];
				rowAmount      = theData[i][1];
				/* rowTags        = theData[i][2]; */
				/* rowDescription = theData[i][3]; */

				// rowDate.slice() size, to extract 2000 or 2000-01
				dateSize = (reportType == 'y') ? 4 : 7;
				
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
			// Save this row to the report table
			results.push(getOverviewRow(z[0], z[1], z[2], z[3], z[4], i + 1));
		}
		
		// Compose the final average row
		len = overviewData.length;
		results.push(getOverviewTotalsRow(i18n.labelTotal, sumPos, sumNeg, sumPos + sumNeg));
		results.push(getOverviewTotalsRow(i18n.labelAverage, sumPos / len, sumNeg / len, sumTotal / len));
		
		// And we're done
		results.push('<\/table>');
		results = results.join('\n');
	} else {
		results = i18n.labelNoData;
	}
	document.getElementById('report').innerHTML = results;
}

function showDetailed() {
	var thead, i, j, k, rowDate, rowAmount, rowTags, rowDescription, monthTotal, monthPos, monthNeg, rowCount, results, monthPartials, theData, sumPos, sumNeg, sumTotal;
	
	sumTotal = sumPos = sumNeg = monthTotal = monthPos = monthNeg = rowCount = 0;
	results = [];
	
	monthPartials = document.getElementById('optmonthly');
	theData = applyTags(readData());
	
	if (theData.length > 0) {

		// Data sorting procedures
		if (sortColIndex !== 0 || sortColRev) {
			monthPartials.checked = false;
		}
		theData.sort(sortArray);
		if (sortColRev) { theData.reverse(); }

		// Compose table headings
		thead = '<th onClick="sortCol(0)">' + i18n.labelsDetailed[0] + '<\/th>';
		thead += '<th onClick="sortCol(1)">' + i18n.labelsDetailed[1] + '<\/th>';
		thead += '<th onClick="sortCol(2)" class="tags">' + i18n.labelsDetailed[2] + '<\/th>';
		thead += '<th onClick="sortCol(3)">' + i18n.labelsDetailed[3] + '<\/th>';
		thead += '<th onClick="sortCol(4)">' + i18n.labelsDetailed[4] + '<\/th>';
		if (showRowCount) {
			thead = '<th class="row-count"><\/th>' + thead;
		}
		results.push('<table>');
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
					'<span class="hl">$&</span>');
			}
			
			// There are some tags to highlight?
			for (j = 0; j < highlightTags.length; j++) {
				for (k = 0; k < rowTags.length; k++) {
					if (rowTags[k] == highlightTags[j]) {
						rowTags[k] = '<span class="hl">' + rowTags[k] + '</span>';
						break;
					}
				}
			}
			
			// This row is in the future?
			if (rowDate <= currentDate) {
				results.push('<tr>');
			} else {
				results.push('<tr class="future">');
			}
			
			if (showRowCount) {
				results.push('<td class="row-count">' + (rowCount) + '<\/td>');
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
	}
	else {
		results = i18n.labelNoData;
	}
	document.getElementById('report').innerHTML = results;
}

function showReport() {
	if (reportType == 'd') {
		showDetailed();
	} else {
		showOverview();
	}
}
function init() {
	
	// Load the i18n messages (must be the first)
	i18n = i18nDatabase[lang];

	setCurrentDate();
	populateMonthsCombo();
	populateDataFilesCombo();
	populateValueFilterCombo();
	
	// Sanitize and regexize user words: 'Foo Bar+' turns to 'Foo|Bar\+'
	// Note: Using regex to allow ignorecase and global *atomic* replace
	if (highlightWords) {
		highlightRegex = new RegExp(
			RegExp.escape(highlightWords).replace(/\s+/g,'|'),
			'ig');
	}
	
	// Split highlight string into words 
	highlightTags = highlightTags.strip().split(/\s+/);
	
	// Just show files combo when there are 2 or more
	if (oneFile || dataFiles.length < 2) {
		document.getElementById('datafiles').style.display = 'none';
	}
	
	// Hide Reload button in oneFile mode. No iframe, so we can't reload.
	if (oneFile) {
		document.getElementById('reload').style.visibility = 'hidden';
	}
	
	// Set interface labels
	document.getElementById('optlastmonthslabel').innerHTML = i18n.labelLastMonths;
	document.getElementById('optmonthlylabel'   ).innerHTML = i18n.labelMonthPartials;
	document.getElementById('optfuturelabel'    ).innerHTML = i18n.labelFuture;
	document.getElementById('optregexlabel'     ).innerHTML = i18n.labelRegex;
	document.getElementById('optnegatelabel'    ).innerHTML = i18n.labelNegate;
	document.getElementById('optvaluefilterlabel').innerHTML = i18n.labelValueFilter;
	document.getElementById('tagMultiAllLabel'  ).innerHTML = i18n.labelTagGroup;
	document.getElementById('d'                 ).innerHTML = i18n.labelDaily;
	document.getElementById('m'                 ).innerHTML = i18n.labelMonthly;
	document.getElementById('y'                 ).innerHTML = i18n.labelYearly;
	document.getElementById('helpbutton').title = i18n.labelHelp;
	document.getElementById('reload'    ).title = i18n.labelReload;
	document.getElementById('sitelink'  ).title = i18n.appDescription;
	document.getElementById('sitelink'  ).href  = i18n.appUrl;

	// Hide all help content, then enable the current lang
	document.getElementById('help-en').style.display = 'none';
	document.getElementById('help-pt').style.display = 'none';
	document.getElementById('help-' + lang).style.display = '';

	// Mark current report as active (CSS)
	document.getElementById(reportType).className = 'active';
	
	// Apply user defaults
	if (defaultLastMonths)    { document.getElementById('optlastmonths').click(); }
	if (defaultMonthPartials) { document.getElementById('optmonthly'   ).click(); }
	if (defaultFuture)        { document.getElementById('optfuture'    ).click(); }
	if (defaultRegex)         { document.getElementById('optregex'     ).click(); }
	if (defaultNegate)        { document.getElementById('optnegate'    ).click(); }
	document.getElementById('filter').value = defaultSearch;

	// Load data file or embedded data
	if (!oneFile) {
		loadDataFile(dataFiles[0]);
	} else {
		showReport();
	}

	// document.getElementById('filter').focus();
}
window.onload = init;
