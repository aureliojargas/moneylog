// HTML: <pre id="data">

ml.storage.drivers.html = {
	name: '<pre> element',
	setup: function () {
		ml.storage.isAsync = false;
		ml.storage.isEditable = false;
		ml.storage.isFileBased = false;
		ml.storage.isReloadable = false;
		ml.storage.loadDataAtSetup = true;
		ml.storage.read = function () {
			return document.getElementById('data').innerText;
		};
	}
};
