// HTML: <pre id="data">

ml.storage.drivers.html = {
	id: 'html',
	name: '<pre> element',
	config: {
		isAsync: false,
		isEditable: false,
		isFileBased: false,
		isReloadable: false,
		loadDataAtSetup: true
	},

	read: function () {
		return document.getElementById('data').innerText;
	},

	init: function () {
		// none
	}
};
