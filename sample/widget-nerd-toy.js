///////////////////////////////////////////////////////////////////////
//// Nerd Toy Widget
//// by Aurelio Jargas 2012-02-16
//
// A sample widget that shows some MoneyLog options
// for you to turn ON or OFF with handy checkboxes.
//
// Copy/paste all this code to the end of your config.js file.


// Create a new widget instance
var NerdToy = new Widget('nerd-toy', 'Nerd Toy', 'NerdToy');

// Widget config
NerdToy.config.active = true;  // Is this widget active?
NerdToy.config.opened = true;  // Start app with this widget opened?

// This function fills the widget contents, creating all the checkboxes.
// populate() is called automatically in the default this.init().
NerdToy.populate = function () {
	var i, opts, opt;
	opts = [
		'showBalance',
		'showChartBarLabel',
		'showCharts',
		'showLocaleDate',
		'showMiniBars',
		'showMiniBarsLabels',
		'showRowCount',
		'showTagReport',
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
