///////////////////////////////////////////////////////////////////////
//// Hello World Widget
//// by Aurelio Jargas 2012-02-17
//
// A sample widget. Simple. Readable.
//
// Copy/paste all this code to the end of your config.js file.


// Create a new widget instance (id, name, instance name)
var HelloWorld = new Widget('hello-world', 'Hello World', 'HelloWorld');

// Set widget contents
HelloWorld.populate = function () {
	this.content.innerHTML = 'Hellooo!';
};
