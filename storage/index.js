// Read (and possibly write) user data.
// Each driver must implement the necessary stubs and set defaults.

ml.storage = {

	// drivers
	availableDrivers: [
		'html',
		'browser',
		'filesystem',
		'googledrive'
	],
	currentDriver: 'filesystem',	// default if not specified in config
	drivers: {},	// driver's implementations

	// properties to be set by each driver (all are required)
	isAsync: false,
	isEditable: false,
	isFileBased: false,
	isReloadable: false,
	loadDataAtSetup: false,

	// to be set by file based drivers
	userFiles: [],	// [{id:'', name:''}, ...]

	// stubs to be implemented by each driver (some are optional)
	write: function (contents) { console.log('write'); },
	read: function () { return ''; },
	readAsync: function (fileData, callback) { callback('contents') },

	// module methods, drivers should not reimplement those:

	populateDriversCombo: function () {
		var combo = document.getElementById('storage-driver');
		for (i = 0; i < this.availableDrivers.length; i++) {
			combo.add(new Option(
				this.drivers[this.availableDrivers[i]].name,
				this.availableDrivers[i]
			));
		}
		// Select the current driver
		if (this.currentDriver) {
			combo.value = this.currentDriver;
		}
	},

	driversComboChanged: function () {
		var combo = document.getElementById('storage-driver');
		var driver = combo.options[combo.selectedIndex].value;
		ml.storage.setDriver(driver);
	},

	resetFilesCombo: function () {
		document.getElementById('source-file').options.length = 0;
	},

	populateFilesCombo: function () {
		var nr_files = this.userFiles.length;
		var combo = document.getElementById('source-file');

		// Clean then add all files
		this.resetFilesCombo();
		for (var i = 0; i < nr_files; i++) {
			combo.add(new Option(
				this.userFiles[i].name,
				this.userFiles[i].id
			));
		}

		// Extra option at the end: parse all files
		if (nr_files > 1) {
			combo.add(new Option('*'));
		}
	},

	setDriver: function (driverName) {
		try {
			this.currentDriver = driverName || this.currentDriver;
			this.drivers[this.currentDriver].setup();	// driver-specific setup

			// Show/hide UI elements for each mode
			document.getElementById('source-file'	).style.display		= (this.isFileBased ) ? '' : 'none';
			document.getElementById('editor-open'	).style.visibility = (this.isEditable	) ? 'visible' : 'hidden';
			document.getElementById('source-reload').style.visibility = (this.isReloadable) ? 'visible' : 'hidden';

			if (this.loadDataAtSetup) {
				loadData();
			}
		} catch(error) {
			console.log('ERROR: Cannot setup storage: ' + this.currentDriver);
			console.log(error);
		}
	},

	// Read multiple files (async) and callback with a single string with
	// all their contents concatenated (in random order)
	readAsyncMulti: function (filenames, callback) {
		var loadedData = [];

		function allDone() {
			callback(loadedData.join('\n'));
		}

		function oneFileWasRead(contents) {
			loadedData.push(contents);

			if (loadedData.length === filenames.length) {
				allDone();
			}
		}

		for (var i = 0; i < filenames.length; i++) {
			ml.storage.readAsync(filenames[i], oneFileWasRead);
		}
	},

	init: function () {
		this.populateDriversCombo();
	}
};
