// Google Drive integration for MoneyLog
//
// On page loading, the Google Drive File Picker will show up.
// Once you select your MoneyLog folder, its files will be loaded.

ml.storage.drivers.googledrive = {
	id: 'googledrive',
	name: 'Google Drive',
	config: {
		isAsync: true,
		isEditable: false,
		isFileBased: true,
		isReloadable: true,
		loadDataAtSetup: false,

		// Google Drive API has a User Rate Limit of 10 requests per second
		// See https://github.com/aureliojargas/moneylog/issues/22
		maxFilesForStar: 9
	},

	userFiles: [],  // [{id:'', name:''}, ...]
	defaultFile: '',

	readAsync: function (fileData, callback) {
		this.readFile(fileData.id, callback);
	},

	init: function () {
		ml.storage.resetFilesCombo();

		// Load the Google API
		addScript('https://apis.google.com/js/api.js', this.onApiLoad);
	},

	// -----------------------------------------------------------------------

	// The base of this code is a copy/paste from the official documentation:
	// https://developers.google.com/picker/docs/

	// The Browser API and Client ID keys obtained from the Google API Console
	developerKey: 'AIzaSyAgPNmODKpMNzP30VdvvgQFSw-H8mtIegc',
	clientId: '372105999892-po48pkb5kjlhlf1t3j2bj96se9v986cp.apps.googleusercontent.com',

	// Scope to use to access user's files (the more restrictive, the better)
	// https://developers.google.com/drive/v3/web/about-auth
	scope: ['https://www.googleapis.com/auth/drive.file'],

	pickerApiLoaded: false,
	oauthToken: '',

	// Use the API Loader script to load google.picker and gapi.auth.
	onApiLoad: function () {

		// The original 'this' context is lost here :(
		var self = ml.storage.drivers.googledrive;

		// Load auth
		gapi.load('auth', function onAuthApiLoad() {
			gapi.auth.authorize(
				{
					'client_id': self.clientId,
					'scope': self.scope,
					'immediate': true  // just ask for Google account on the 1st time
				},
				function handleAuthResult(authResult) {
					if (authResult && !authResult.error) {
						self.oauthToken = authResult.access_token;
						self.createPicker();
					} else {
						console.log("Google auth failed:", authResult);
					}
				}
			);
		});

		// Load picker
		gapi.load('picker', function onPickerApiLoad() {
			self.pickerApiLoaded = true;
			self.createPicker();
		});
	},

	// Create and render a Picker object for picking a user folder
	createPicker: function () {
		var view, picker;

		// The original 'this' context is lost here :(
		var self = ml.storage.drivers.googledrive;

		if (self.pickerApiLoaded && self.oauthToken) {
			// Picker will show folders only, in hierarquical view
			view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
				.setParent('root')
				.setIncludeFolders(true)
				.setSelectFolderEnabled(true)
				.setMode(google.picker.DocsViewMode.LIST);
			picker = new google.picker.PickerBuilder()
				.addView(view)
				.setOAuthToken(self.oauthToken)
				.setDeveloperKey(self.developerKey)
				.setCallback(self.pickerCallback)
				.enableFeature(google.picker.Feature.NAV_HIDDEN)
				.setLocale('pt-BR')
				.setTitle('Cadê a pasta do MoneyLog?')
				.build();
			picker.setVisible(true);
		}
	},

	// Called when the user has chosen the folder
	pickerCallback: function (data) {
		var folderId;

		// The original 'this' context is lost here :(
		var self = ml.storage.drivers.googledrive;

		// User picked one folder
		if (data.action == google.picker.Action.PICKED) {

			// List this folder's files
			folderId = data.docs[0].id;
			self.getFolderFiles(folderId, function processFiles(files) {

				// Filter relevant files
				var textFiles = files.filter(function (el) { return el.name.endsWith('.txt'); });
				var configFile = files.filter(function (el) { return el.name === 'config.js'; })[0];

				// Setup data files combo
				self.userFiles = textFiles;
				ml.storage.populateFilesCombo();

				// Apply user config.js file (if any)
				if (configFile) {
					self.readFile(configFile.id, function (contents) {
						ml.storage.applyUserConfig(contents);
						ml.storage.setFilesCombo(self.defaultFile);
						loadData();
					});
				} else {
					ml.storage.setFilesCombo(self.defaultFile);
					loadData();
				}
			});
		}
	},

	// https://developers.google.com/drive/v3/web/folder
	// https://developers.google.com/drive/v3/reference/files/list
	getFolderFiles: function (folderId, callback) {
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
	},

	// https://developers.google.com/drive/v3/web/manage-downloads
	readFile: function (id, callback) {
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
};
