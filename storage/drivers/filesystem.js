// File system: local text files

ml.storage.drivers.filesystem = {
	name: 'Local text files',
	dataFiles: [],  // flat array, meant for easier user config
	userFiles: [],  // objects array
	defaultFile: '',

	setUserFilesFromFlatArray: function (arr) {
		this.userFiles = [];
		for (var i = 0; i < arr.length; i++) {
			this.userFiles.push({
				id: i,
				name: arr[i]
			});
		}
	},

	setup: function () {
		ml.storage.isAsync = true;
		ml.storage.isEditable = false;
		ml.storage.isFileBased = true;
		ml.storage.isReloadable = true;
		ml.storage.loadDataAtSetup = true;

		// Use a temporary iframe to read a local text file contents.
		// Note: Firefox won't read text files in a parent folder.
		ml.storage.readAsync = function (fileData, callback) {
			var iframe = document.createElement('iframe');
			iframe.style.display = 'none';
			iframe.src = fileData.name;
			iframe.onload = function () {
				callback(iframe.contentWindow.document.getElementsByTagName('pre')[0].innerText);
				iframe.parentNode.removeChild(iframe);  //del iframe
			};
			document.body.appendChild(iframe);  // add iframe
		};

		// Honor legacy global config: dataFiles array
		if (dataFiles && dataFiles.length > 0) {
			this.setUserFilesFromFlatArray(dataFiles);
		}

		// Set user files from config array
		if (this.dataFiles.length > 0) {
			this.setUserFilesFromFlatArray(this.dataFiles);
		}

		ml.storage.userFiles = this.userFiles;
		ml.storage.populateFilesCombo();

		var filesCombo = document.getElementById('source-file');

		// Honor legacy global config: dataFilesDefault
		// Set the default file to load when using multiple files
		if (dataFilesDefault) {
			selectOptionByText(filesCombo, dataFilesDefault);
		}

		// Set the default file to load when using multiple files
		if (this.defaultFile) {
			selectOptionByText(filesCombo, this.defaultFile);
		}
	}
};
