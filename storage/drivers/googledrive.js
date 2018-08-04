// Google Drive integration for MoneyLog
//
// By default, it searches for a MoneyLog folder in the root of your Drive,
// and load all its files automatically, no user action required.
//
// If that folder is not found, then the Google Picker is loaded so the
// user can point where the MoneyLog folder is located.

ml.storage.drivers.googledrive = {
	id: 'googledrive',
	name: 'Google Drive',
	config: {
		isAsync: true,
		isEditable: false,
		isFileBased: true,
		isReloadable: true,
		showFolderLink: true,
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
		ml.storage.resetWidgetFolder();

		if (!window.gapi) {
			// Load the Google API
			addScript('https://apis.google.com/js/api.js', this.onApiLoad.bind(this));
		} else  {
			// Already loaded, call API entrypoint
			this.onApiLoad();
		}
	},

	// -----------------------------------------------------------------------

	// The base of this code is a copy/paste from the official documentation:
	// https://developers.google.com/picker/docs/

	// The Browser API and Client ID keys obtained from the Google API Console
	developerKey: 'AIzaSyAgPNmODKpMNzP30VdvvgQFSw-H8mtIegc',
	clientId: '372105999892-po48pkb5kjlhlf1t3j2bj96se9v986cp.apps.googleusercontent.com',
	oauthToken: '',

	// Scope to use to access user's files (the more restrictive, the better)
	// https://developers.google.com/drive/v3/web/about-auth
	scope: ['https://www.googleapis.com/auth/drive.readonly'],

	// https://developers.google.com/picker/docs/#i18n
	pickerLanguages: {
		pt: 'pt-BR',
		en: 'en',
		es: 'es',
		ca: 'ca'
	},

	// Use the API Loader script to load google.picker and gapi.auth.
	onApiLoad: function () {
		gapi.load('auth', this.onAuthApiLoad.bind(this));
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
					this.onAuthOk();
				} else {
					console.log('Google auth failed:', authResult);
				}
			}.bind(this)
		);
	},

	onAuthOk: function () {
		this.findUserFolder(function () {
			this.setWidgetFolder();
			this.listAllUserFiles(this.processFiles.bind(this));
		}.bind(this));
	},

	runPicker: function (callback) {

		// Load Picker API
		gapi.load(
			'picker',
			function onPickerApiLoad() {

				// Picker setup: will show folders only, in hierarquical view
				var view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
					.setParent('root')
					.setIncludeFolders(true)
					.setSelectFolderEnabled(true)
					.setMode(google.picker.DocsViewMode.LIST);

				// Load Picker
				var picker = new google.picker.PickerBuilder()
					.addView(view)
					.setOAuthToken(this.oauthToken)
					.setDeveloperKey(this.developerKey)
					.enableFeature(google.picker.Feature.NAV_HIDDEN)
					.setLocale(this.pickerLanguages[lang])
					.setTitle(i18n.labelLocateAppFolder)
					.setCallback(function onPickerDone(data) {
						if (data.action == google.picker.Action.PICKED) {
							this.userFolder = data.docs[0];  // Save picked folder metadata
							callback();
						}
					}.bind(this))
					.build();
				picker.setVisible(true);

			}.bind(this)
		);
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

	// Set this.userFolder and callback
	findUserFolder: function (callback) {
		this.findDefaultUserFolder(function () {

			// Found default /MoneyLog folder
			if (this.userFolder.id) {
				callback();

			// Not found, will prompt user with the Picker
			} else {
				this.runPicker(callback);
			}
		}.bind(this));
	},

	findDefaultUserFolder: function (callback) {
		// Folder named MoneyLog at Google Drive root
		var query = '"root" in parents and name = "MoneyLog" and mimeType = "application/vnd.google-apps.folder"';
		this.listFiles(query, function (files) {
			if (files && files.length > 0) {
				this.userFolder = files[0];
			}
			callback();
		}.bind(this));
	},

	setWidgetFolder: function () {
		var a = document.getElementById('storage-folder');
		a.href = 'https://drive.google.com/drive/folders/' + this.userFolder.id;
		a.innerText = this.userFolder.name;
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
