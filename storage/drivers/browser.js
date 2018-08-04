// browser: localStorage

ml.storage.drivers.browser = {
	id: 'browser',
	name: 'Browser (localStorage)',
	config: {
		isAsync: false,
		isEditable: true,
		isFileBased: false,
		isReloadable: false,
		loadDataAtSetup: true
	},

	// localStorage database key
	database: 'moneylogData',

	read: function () {
		return localStorage.getItem(this.database) || '';
	},

	write: function (contents) {
		localStorage.setItem(this.database, contents);
	},

	setDefaultData: function () {
		ml.storage.drivers.filesystem.readAsync(
			{name: 'sample/data-pt.txt'},
			function (contents) {
				ml.storage.drivers.browser.write(contents);
				loadData();
			}
		);
	},

	init: function () {

		// Browser support check
		if (!window.localStorage) {
			showError(
				i18n.errorNoLocalStorage.replace('%s', appName),
				'<p>' + i18n.errorRequirements +
					array2ul(['Internet Explorer 8', 'Firefox 3', 'Google Chrome 3', 'Safari 4', 'Opera 10.50'])
			);
		}

		// Empty database? Initialize with sample content
		if (this.read().strip() === '') {
			this.setDefaultData();
		}
	}
};
