///////////////////////////////////////////////////////////////////////
//// Hello Translation Widget
//// by Aurelio Jargas 2012-02-17
//
// A simple sample widget, using translated strings.
//
// Copy/paste all this code to the end of your config.js file.

// Create a new widget instance (id, name, instance name)
var HelloTranslation = new Widget('hello-translation', 'Hello Translation', 'HelloTranslation');

// Save widget translation to the main database
// header
i18nDatabase.en.HelloTranslationHeaderLabel = 'Hello Translation';
i18nDatabase.es.HelloTranslationHeaderLabel = 'Hola Traducción';
i18nDatabase.pt.HelloTranslationHeaderLabel = 'Oi Tradução';
// checkbox label
i18nDatabase.en.HelloTranslationOptionLabel = 'Say hello!';
i18nDatabase.es.HelloTranslationOptionLabel = '¡Decir hola!';
i18nDatabase.pt.HelloTranslationOptionLabel = 'Diga oi!';
// Note: always use {InstanceName}HeaderLabel for automatic header translation

// Debug: change the app language to test the translations
// lang = 'es';   // en:English, es:Spanish, pt:Portuguese


// Set widget contents
HelloTranslation.populate = function () {
	// Here we use the translated label.
	// Note that the prefix is just i18n.
	this.addCheckbox('foo', i18n.HelloTranslationOptionLabel);
};

// Handle checkbox click
HelloTranslation.checkboxClicked = function (checkbox) {
	return;  // do nothing
};
