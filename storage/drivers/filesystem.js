// File system: local text files

ml.storage.drivers.filesystem = {
	id: 'filesystem',
	name: 'Local text files',
	config: {
		isAsync: true,
		isEditable: false,
		isFileBased: true,
		isReloadable: true,
		loadDataAtSetup: true,
		maxFilesForStar: 999
	},

	dataFiles: [],  // flat array, meant for easier user config
	userFiles: [],  // [{id:'', name:''}, ...]
	defaultFile: '',

	setUserFilesFromFlatArray: function (arr) {
		var i;
		this.userFiles = [];
		for (i = 0; i < arr.length; i++) {
			this.userFiles.push({
				id: i,
				name: arr[i]
			});
		}
	},

	// Use a temporary iframe to read a local text file contents.
	// Note: Firefox won't read text files in a parent folder.
	readAsync: function (fileData, callback) {
		var iframe = document.createElement('iframe');
		iframe.style.display = 'none';
		iframe.src = fileData.name;
		iframe.onload = function () {
			callback(iframe.contentWindow.document.getElementsByTagName('pre')[0].innerText);
			iframe.parentNode.removeChild(iframe);  // del iframe
		};
		document.body.appendChild(iframe);  // add iframe
	},

	setup: function () {
		var filesCombo;

		// Honor legacy global config: dataFiles array
		if (this.dataFiles.length === 0 && dataFiles && dataFiles.length > 0) {
			this.dataFiles = dataFiles;
		}

		// Honor legacy global config: dataFilesDefault
		if (!this.defaultFile && dataFilesDefault) {
			this.defaultFile = dataFilesDefault;
		}

		// Set user files from config array
		if (this.dataFiles.length > 0) {
			this.setUserFilesFromFlatArray(this.dataFiles);
		}

		ml.storage.populateFilesCombo();

		// Set the default file to load when using multiple files
		if (this.defaultFile) {
			filesCombo = document.getElementById('source-file');
			selectOptionByText(filesCombo, this.defaultFile);
		}
	}
};
