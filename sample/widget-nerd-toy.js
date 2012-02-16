///////////////////////////////////////////////////////////////////////
//// Nerd Toy Widget
//// by Aurelio Jargas 2012-02-16
//
// A sample widget that shows some MoneyLog options
// for you to turn ON or OFF with handy checkboxes.
//
// The widget config is at the end.
//
// To use this widget, copy/paste all this code
// to the end of your config.js file.



// Create a new widget instance
var NerdToy = new Widget('nerd-toy', 'Nerd Toy', 'NerdToy');

// init() is called automatically in MoneyLog start up,
// after all user config is read and before the report is shown.
//
NerdToy.init = function () {
	this.initPre();
	if (this.created) {
		this.populate();
	}
	this.initPost();
};

// This function fills the widget contents, creating all the checkboxes.
NerdToy.populate = function () {
	var i, opts, opt;
	opts = [
		'showChartBarLabel',
		'showCharts',
		'showEmptyTagInSummary',
		'showLocaleDate',
		'showMiniBars',
		'showMiniBarsLabels',
		'showRowCount',
		'monthlyRowCount'
	];
	for (i = 0; i < opts.length; i++) {
		opt = opts[i];
		this.addCheckbox(opt, opt, (window[opt] == true));
	}
};

// This is called automatically whenever a checkbox is clicked.
NerdToy.checkboxClicked = function (checkbox) {
	var optionName = checkbox.id.replace('nerd-toy-', '');
	window[optionName] = checkbox.checked;  // set config
	showReport();  // reload the report
};
// console.log(NerdToy);


// Widget Config
NerdToy.config.active = true;  // Is this widget active?
NerdToy.config.opened = true;  // Start app with this widget opened?

