# MoneyLog Multi Files Test

Test files for the multiple TXT files feature.

Put the following lines in `config.js`:

	dataFiles = [
		'test/multi/1.txt',
		'test/multi/2.txt',
		'test/multi/3.txt',
		'test/multi/4.txt',
		'test/multi/5.txt',
		'*'
	];

And check the following behavior:

- The first file is the default and it's data must be loaded at MoneyLog startup.

- Selecting a different file in the file chooser will clear the current data and load the new file's data.

- Selecting the asterisk `*`, all TXT files are simultaneously loaded, as if they were just a single file.

- Edit `config.js` to place the asterisk as the first array item. All TXT files must be loaded at MoneyLog startup.

- Observe the behavior of the tags (selected or not), the other filtering options and the type of report.

- Use the Reload button to verify it's working.


> Note: If you use an extra comma in the last array item, IE attempts to load the `undefined` item :/
