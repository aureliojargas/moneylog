// Google Drive integration for MoneyLog
// http://aurelio.net/moneylog/
//
// On page loading, the Google Drive File Picker will show up.
// Once you select your MoneyLog folder, its files will be loaded.

// The base of this code is a copy/paste from the official documentation:
// https://developers.google.com/picker/docs/

// About namespacing: https://addyosmani.com/blog/essential-js-namespacing/
// I'm using the last example in "2. Object literal notation"
ml.storage.drivers.googledrive = (function () {

	var name = 'Google Drive';

	// The Browser API and Client ID keys obtained from the Google API Console
	var developerKey = 'AIzaSyAgPNmODKpMNzP30VdvvgQFSw-H8mtIegc';
	var clientId = '372105999892-po48pkb5kjlhlf1t3j2bj96se9v986cp.apps.googleusercontent.com';

	// Scope to use to access user's files (the more restrictive, the better)
	// https://developers.google.com/drive/v3/web/about-auth
	var scope = ['https://www.googleapis.com/auth/drive.file'];

	var pickerApiLoaded = false;
	var oauthToken;

	// MoneyLog driver properties
	var userFiles = [];    // eslint-disable-line no-unused-vars
	var defaultFile = '';  // eslint-disable-line no-unused-vars

	// Use the API Loader script to load google.picker and gapi.auth.
	function onApiLoad() {
		gapi.load('auth', {'callback': onAuthApiLoad});
		gapi.load('picker', {'callback': onPickerApiLoad});
	}

	function onAuthApiLoad() {
		gapi.auth.authorize(
			{
				'client_id': clientId,
				'scope': scope,
				'immediate': true  // just ask for Google account on the 1st time
			},
			handleAuthResult
		);
	}

	function onPickerApiLoad() {
		pickerApiLoaded = true;
		createPicker();
	}

	function handleAuthResult(authResult) {
		if (authResult && !authResult.error) {
			oauthToken = authResult.access_token;
			createPicker();
		}
	}

	// Create and render a Picker object for picking a user folder
	function createPicker() {
		var view, picker;
		if (pickerApiLoaded && oauthToken) {
			// Picker will show folders only, in hierarquical view
			view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
				.setParent('root')
				.setIncludeFolders(true)
				.setSelectFolderEnabled(true)
				.setMode(google.picker.DocsViewMode.LIST);
			picker = new google.picker.PickerBuilder()
				.addView(view)
				.setOAuthToken(oauthToken)
				.setDeveloperKey(developerKey)
				.setCallback(pickerCallback)
				.enableFeature(google.picker.Feature.NAV_HIDDEN)
				.setLocale('pt-BR')
				.build();
			picker.setVisible(true);
		}
	}

	// Called when the user has chosen the folder
	function pickerCallback(data) {
		var folderId;

		// Original scope is lost here :(
		var self = ml.storage.drivers.googledrive;

		// User picked one folder
		if (data.action == google.picker.Action.PICKED) {

			// List this folder's files
			folderId = data.docs[0].id;
			getFolderFiles(folderId, function (files) {
				var textFiles, configFile;

				// Filter relevant files
				textFiles = files.filter(function (el) { return el.name.endsWith('.txt'); });
				configFile = files.filter(function (el) { return el.name === 'config.js'; })[0];

				// Setup data files combo
				self.userFiles = textFiles;
				ml.storage.userFiles = self.userFiles;
				ml.storage.populateFilesCombo();

				// Apply user config.js file (if any)
				if (configFile) {
					readFile(configFile.id, function (contents) {
						eval(contents);  // eslint-disable-line no-eval
						sanitizeConfig();
						initUI();
						setDefaultFile(self.defaultFile);
						loadData();
					});
				} else {
					setDefaultFile(self.defaultFile);
					loadData();
				}
			});
		}
	}

	// Set the default file to load when using multiple files
	function setDefaultFile(file) {
		var filesCombo;
		if (file) {
			filesCombo = document.getElementById('source-file');
			selectOptionByText(filesCombo, file);
		}
	}

	// https://developers.google.com/drive/v3/web/folder
	// https://developers.google.com/drive/v3/reference/files/list
	function getFolderFiles(folderId, callback) {
		var url, queryString, accessToken, xhr, data;

		if (folderId) {
			accessToken = gapi.auth.getToken().access_token;
			url = 'https://www.googleapis.com/drive/v3/files';
			queryString = encodeQueryData({
				// https://developers.google.com/drive/v3/web/search-parameters
				q: '"' + folderId + '" in parents and trashed = false and (mimeType = "text/plain" or mimeType = "application/x-javascript")',
				spaces: 'drive',
				orderBy: 'name',
				fields: 'files(id, name)'
			});

			xhr = new XMLHttpRequest();
			xhr.open('GET', url + '?' + queryString);
			xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
			xhr.onload = function () {
				data = JSON.parse(xhr.responseText);
				callback(data.files);
			};
			xhr.onerror = function () {
				console.log('ERROR: xhr error');
			};
			xhr.send();
		} else {
			console.log('ERROR: No folder id informed');
		}
	}

	// https://developers.google.com/drive/v3/web/manage-downloads
	function readFile(id, callback) {
		var downloadUrl, accessToken, xhr;

		if (id) {
			downloadUrl = 'https://www.googleapis.com/drive/v3/files/' + id + '?alt=media';
			accessToken = gapi.auth.getToken().access_token;
			xhr = new XMLHttpRequest();

			xhr.open('GET', downloadUrl);
			xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);

			xhr.onload = function () {
				callback(xhr.responseText);
			};
			xhr.onerror = function () {
				console.log('ERROR: xhr error');
			};
			xhr.send();
		} else {
			console.log('ERROR: No file id informed');
		}
	}

	function setup() {

		// Setup MoneyLog storage
		ml.storage.isAsync = true;
		ml.storage.isEditable = false;
		ml.storage.isFileBased = true;
		ml.storage.isReloadable = true;
		ml.storage.loadDataAtSetup = false;  // file picker first
		ml.storage.readAsync = function (fileData, callback) {
			readFile(fileData.id, callback);
		};

		// Google Drive API has a User Rate Limit of 10 requests per second
		// See https://github.com/aureliojargas/moneylog/issues/22
		ml.storage.maxFilesForStar = 9;

		ml.storage.resetFilesCombo();

		// Load the Google API
		addScript('https://apis.google.com/js/api.js', onApiLoad);
	}

	return {
		// Public attributes and methods
		name: name,
		setup: setup
	};
})();
