// Google Drive integration for MoneyLog
// http://aurelio.net/moneylog/
//
// On page loading, the Google Drive File Picker will show up.
// Once you select your text files, MoneyLog will load them.

// Most of this code is a copy/paste from the official documentation:
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
				'immediate': false
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

	// Create and render a Picker object for picking user files.
	function createPicker() {
		var view, picker;
		if (pickerApiLoaded && oauthToken) {
			view = new google.picker.DocsView()
				// txt files only
				.setMimeTypes('text/plain');

			picker = new google.picker.PickerBuilder()
				.addView(view)
				.setOAuthToken(oauthToken)
				.setDeveloperKey(developerKey)
				.setCallback(pickerCallback)
				.enableFeature(google.picker.Feature.NAV_HIDDEN)
				.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
				.setLocale('pt-BR')
				.build();
			picker.setVisible(true);
		}
	}

	// Called when the user has chosen the file
	function pickerCallback(data) {
		var i, self, filesCombo;

		if (data.action == google.picker.Action.PICKED) {

			// Original scope is lost here :(
			self = ml.storage.drivers.googledrive;

			self.userFiles = [];
			for (i = 0; i < data.docs.length; i++) {
				self.userFiles.push({
					id: data.docs[i].id,
					name: data.docs[i].name
				});
			}
			// self.userFiles.sort(); XXX TODO

			ml.storage.userFiles = self.userFiles;
			ml.storage.populateFilesCombo();

			// Set the default file to load when using multiple files
			if (self.defaultFile) {
				filesCombo = document.getElementById('source-file');
				selectOptionByText(filesCombo, self.defaultFile);
			}

			loadData();
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
