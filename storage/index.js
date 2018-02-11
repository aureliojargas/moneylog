// Read (and possibly write) user data.
//
// Each driver must implement some of these methods:
//
//     write: function (contents) { ... },
//     read: function () { return contents; },
//     readAsync: function (fileData, callback) { callback(contents); },
//     init: function () { ... },
//
// Each driver must set its config:
//
//     config: {
//         isAsync: fasle,
//         isEditable: false,
//         isFileBased: false,
//         isReloadable: false,
//         loadDataAtSetup: false,
//         maxFilesForStar: 999,   // only for file-based drivers
//         showFolderLink: false,  // only for file-based drivers
//     },

ml.storage = {

	// drivers
	availableDrivers: [
		'html',
		'browser',
		'filesystem',
		'googledrive'
	],
	defaultDriver: 'filesystem',  // default driver at app init
	driver: {},                   // the currently loaded driver
	drivers: {},                  // all driver's implementations

	// module methods, drivers should not reimplement those:

	populateDriversCombo: function () {
		var i, combo;
		combo = document.getElementById('storage-driver');
		for (i = 0; i < this.availableDrivers.length; i++) {
			combo.add(new Option(
				this.drivers[this.availableDrivers[i]].name,
				this.availableDrivers[i]
			));
		}
		// Select the current driver
		if (this.defaultDriver) {
			combo.value = this.defaultDriver;
		}
	},

	driversComboChanged: function () {
		var combo = document.getElementById('storage-driver');
		var driverId = combo.options[combo.selectedIndex].value;

		// Wipe old driver data
		resetData();
		showReport();

		// Load new driver
		ml.storage.setDriver(driverId);
	},

	resetFilesCombo: function () {
		document.getElementById('source-file').options.length = 0;
	},

	populateFilesCombo: function () {
		var i;
		var files = this.driver.userFiles;
		var nrFiles = files.length;
		var combo = document.getElementById('source-file');

		// Clean then add all files
		this.resetFilesCombo();
		for (i = 0; i < nrFiles; i++) {
			combo.add(new Option(
				files[i].name,
				files[i].id
			));
		}

		// Extra option at the end: parse all files
		if (nrFiles > 1 && nrFiles <= this.driver.config.maxFilesForStar) {
			combo.add(new Option('*'));
		}
	},

	// Set the selected file when using multiple files
	setFilesCombo: function (file) {
		var combo;
		if (file) {
			combo = document.getElementById('source-file');
			selectOptionByText(combo, file);
		}
	},

	resetWidgetFolder: function () {
		var a = document.getElementById('storage-folder');
		a.href = '';
		a.innerText = '';
	},

	setDriver: function (driverId) {
		try {
			driverId = driverId || this.defaultDriver;

			// Load driver code and set it up
			this.driver = this.drivers[driverId];
			this.driver.init();

			// Show/hide UI elements for each mode
			document.getElementById('source-file'   ).style.display    = (this.driver.config.isFileBased   ) ? '' : 'none';
			document.getElementById('storage-folder').style.display    = (this.driver.config.showFolderLink) ? '' : 'none';
			document.getElementById('editor-open'   ).style.visibility = (this.driver.config.isEditable    ) ? 'visible' : 'hidden';
			document.getElementById('source-reload' ).style.visibility = (this.driver.config.isReloadable  ) ? 'visible' : 'hidden';

			if (this.driver.config.loadDataAtSetup) {
				loadData();
			}
		} catch (error) {
			console.log('ERROR: Cannot setup storage: ' + driverId);
			console.log(error);
		}
	},

	// Call this after reading user's config.js file
	applyUserConfig: function (configString) {
		eval(configString);  // eslint-disable-line no-eval
		sanitizeConfig();
		initUI();
	},

	// Read multiple files (async) and callback with a single string with
	// all their contents concatenated (in random order)
	readAsyncMulti: function (filenames, callback) {
		var i;
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

		for (i = 0; i < filenames.length; i++) {
			this.driver.readAsync(filenames[i], oneFileWasRead);
		}
	},

	init: function () {
		this.populateDriversCombo();
	}
};
