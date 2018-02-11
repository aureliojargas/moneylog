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

	userFolder: {},  // {id:'', name:''}
	configFile: {},  // {id:'', name:''}
	userFiles: [],  // [{id:'', name:''}, ...]
	defaultFile: '',

	readAsync: function (fileData, callback) {
		this.readFile(fileData.id, callback);
	},

	init: function () {
		ml.storage.resetFilesCombo();

		// Load the Google API
		addScript('https://apis.google.com/js/api.js', this.onApiLoad.bind(this));
	},

	// -----------------------------------------------------------------------

	// The base of this code is a copy/paste from the official documentation:
	// https://developers.google.com/picker/docs/

	// The Browser API and Client ID keys obtained from the Google API Console
	developerKey: 'AIzaSyAgPNmODKpMNzP30VdvvgQFSw-H8mtIegc',
	clientId: '372105999892-po48pkb5kjlhlf1t3j2bj96se9v986cp.apps.googleusercontent.com',

	// Scope to use to access user's files (the more restrictive, the better)
	// https://developers.google.com/drive/v3/web/about-auth
	scope: ['https://www.googleapis.com/auth/drive.readonly'],

	pickerApiLoaded: false,
	oauthToken: '',

	// Use the API Loader script to load google.picker and gapi.auth.
	onApiLoad: function () {
		gapi.load('auth', this.onAuthApiLoad.bind(this));
		gapi.load('picker', this.onPickerApiLoad.bind(this));
	},

	onAuthApiLoad: function () {
		gapi.auth.authorize(
			{
				'client_id': this.clientId,
				'scope': this.scope,
				'immediate': false
			},
			function handleAuthResult(authResult) {
				if (authResult && !authResult.error) {
					this.oauthToken = authResult.access_token;
					this.createPicker();
				} else {
					console.log('Google auth failed:', authResult);
				}
			}.bind(this)
		);
	},

	onPickerApiLoad: function () {
		this.pickerApiLoaded = true;
		this.createPicker();
	},

	// Create and render a Picker object for picking a user folder
	createPicker: function () {
		var view, picker;
		if (this.pickerApiLoaded && this.oauthToken) {
			// Picker will show folders only, in hierarquical view
			view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
				.setParent('root')
				.setIncludeFolders(true)
				.setSelectFolderEnabled(true)
				.setMode(google.picker.DocsViewMode.LIST);
			picker = new google.picker.PickerBuilder()
				.addView(view)
				.setOAuthToken(this.oauthToken)
				.setDeveloperKey(this.developerKey)
				.setCallback(this.pickerCallback.bind(this))
				.enableFeature(google.picker.Feature.NAV_HIDDEN)
				.setLocale('pt-BR')
				.setTitle('Cadê a pasta do MoneyLog?')
				.build();
			picker.setVisible(true);
		}
	},

	// Called when the user has chosen the folder
	pickerCallback: function (data) {
		if (data.action == google.picker.Action.PICKED) {
			// User picked one folder, process its files
			this.userFolder = data.docs[0];
			this.listAllUserFiles(this.processFiles.bind(this));
		}
	},

	processFiles: function (files) {

		// Filter relevant files
		this.userFiles = files.filter(function (file) { return file.name.endsWith('.txt'); });
		this.configFile = files.filter(function (file) { return file.name === 'config.js'; })[0] || {};

		ml.storage.populateFilesCombo();

		// Apply user config.js file (if any)
		if (this.configFile.id) {
			this.readFile(this.configFile.id, function (contents) {
				ml.storage.applyUserConfig(contents);
				ml.storage.setFilesCombo(this.defaultFile);
				loadData();
			}.bind(this));
		} else {
			ml.storage.setFilesCombo(this.defaultFile);
			loadData();
		}
	},

	listAllUserFiles: function (callback) {
		var query;
		if (this.userFolder.id) {
			query = '"' + this.userFolder.id + '" in parents and (mimeType = "text/plain" or mimeType = "application/x-javascript")';
			this.listFiles(query, callback);
		}
	},

	// https://developers.google.com/drive/v3/web/folder
	// https://developers.google.com/drive/v3/reference/files/list
	// https://developers.google.com/drive/v3/web/search-parameters
	listFiles: function (query, callback) {
		var url, queryString, accessToken, xhr, data;

		accessToken = gapi.auth.getToken().access_token;
		url = 'https://www.googleapis.com/drive/v3/files';
		queryString = encodeQueryData({
			q: 'trashed = false and ' + query,  // never list trashed
			spaces: 'drive',
			orderBy: 'name',
			fields: 'files(id, name)'
		});

		xhr = new XMLHttpRequest();
		xhr.open('GET', url + '?' + queryString);
		xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
		xhr.onreadystatechange = function () {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) {
					data = JSON.parse(xhr.responseText);
					callback(data.files);
				} else {
					console.log(xhr.responseText);
				}
			}
		};
		xhr.send();
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
			xhr.onreadystatechange = function () {
				if (xhr.readyState === XMLHttpRequest.DONE) {
					if (xhr.status === 200) {
						callback(xhr.responseText);
					} else {
						console.log(xhr.responseText);
					}
				}
			};
			xhr.send();
		} else {
			console.log('ERROR: No file id informed');
		}
	}
};
