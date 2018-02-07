// MoneyLog config for devs
//
// Handy configurations to test MoneyLog features.
// Copy to repo root as config.js and fiddle.

// Set the default driver at app init
ml.storage.defaultDriver = 'html';
ml.storage.defaultDriver = 'browser';
ml.storage.defaultDriver = 'googledrive';
ml.storage.defaultDriver = 'filesystem';

// Test files for the filesystem driver
ml.storage.drivers.filesystem.defaultFile = 'sample/data-en.txt';
ml.storage.drivers.filesystem.dataFiles = [
	'sample/data-pt.txt',
	'sample/data-en.txt',
	'sample/data-es.txt'
];

// LEGACY global configuration for the filesystem driver.
// Won't be applied if the previous two configs are active.
dataFilesDefault = 'sample/data-es.txt';
dataFiles = [
	'sample/data-pt.txt',
	'sample/data-es.txt'
];
