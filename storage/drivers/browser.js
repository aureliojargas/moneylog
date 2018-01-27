// browser: localStorage

ml.storage.drivers.browser = {
	name: 'Browser (localStorage)',
	key: 'moneylogData',  // keyname for the localStorage database
	setup: function () {

		ml.storage.isAsync = false;
		ml.storage.isEditable = true;
		ml.storage.isFileBased = false;
		ml.storage.isReloadable = false;
		ml.storage.loadDataAtSetup = true;

		ml.storage.write = function (contents) {
			localStorage.setItem(ml.storage.drivers.browser.key, contents);
		};

		ml.storage.read = function () {
			var key = ml.storage.drivers.browser.key;

			// when empty (or undefined), save it with default data from #data (PRE)
			if (!localStorage.getItem(key) || localStorage.getItem(key).strip() === '') {
				ml.storage.write(document.getElementById('data').innerText);
			}

			return localStorage.getItem(key);
		};

		// localStorage browser support check
		if (!window.localStorage) {
			showError(
				i18n.errorNoLocalStorage.replace('%s', appName),
				'<p>' + i18n.errorRequirements +
					array2ul(['Internet Explorer 8', 'Firefox 3', 'Google Chrome 3', 'Safari 4', 'Opera 10.50'])
			);
		}
	}
};
