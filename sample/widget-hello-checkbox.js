///////////////////////////////////////////////////////////////////////
//// Hello Checkbox Widget
//// by Aurelio Jargas 2012-02-17
//
// A simple sample widget, using a checkbox.
//
// Copy/paste all this code to the end of your config.js file.


// Create a new widget instance (id, name, instance name)
var HelloCheckbox = new Widget('hello-checkbox', 'Hello Checkbox', 'HelloCheckbox');

// Widget config
HelloCheckbox.config.active = true;  // Is this widget active?
HelloCheckbox.config.opened = true;  // Start app with this widget opened?

// Set widget contents
HelloCheckbox.populate = function () {
	this.addCheckbox('foo', 'Hello?');  // id suffix, label
};

// Handle checkbox click
HelloCheckbox.checkboxClicked = function (checkbox) {
	if (checkbox.checked) {
		this.header.innerHTML = 'I am checked';
	} else {
		this.header.innerHTML = 'I am not checked';
	}

	// Debug
	console.log('Checkbox ID: ' + checkbox.id);
	console.log(this);  // Widget instance
};
