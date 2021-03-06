// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed


function getRange(document, startIndex, endIndex){
	var startPos = document.positionAt(startIndex);
	var endPos = document.positionAt(endIndex);
	return new vscode.Range(startPos, endPos);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "highlighter" is now active!');

	var settings = vscode.workspace.getConfiguration('highlighter');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('highlighter.helloWorld', function () {
		// The code you place here will be executed every time your command is executed
		
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from highlighter!');
	});

	let addFileCommand = vscode.commands.registerCommand('highlighter.addFile', function () {
		
		var currentFile = vscode.window.activeTextEditor.document.fileName;
		var oldFiles = settings.get('enabledFiles') ?? []; 
		oldFiles.push(currentFile)
		settings.update('enabledFiles', oldFiles)
		
		vscode.window.showInformationMessage('Enabled highlighting for file: '+ currentFile);
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(addFileCommand);
	
	vscode.window.onDidChangeActiveTextEditor(updateDecorations, null, context.subscriptions);

	function updateDecorations(activeEditor) {

		if (!settings.get('enabledFiles').includes(activeEditor.document.fileName)) return;
		
		try {
			var text = activeEditor.document.getText();

			var isHighlighting = false;
			var startIndex = -1;
			var endIndex = -1;

			var decorationOptions = [];

			[...text].forEach((char, i) => {
				if (char == '[') {
					startIndex = i;
					isHighlighting = true;
				}
				if (isHighlighting && char == ']') {
					endIndex = i;
					isHighlighting = false;
					decorationOptions.push({range: getRange(activeEditor.document, startIndex, endIndex+1)})
				}
			});

			var decoration = vscode.window.createTextEditorDecorationType({
				backgroundColor: "#E1BEE7"
			});
		
			activeEditor.setDecorations(decoration, decorationOptions);

		} catch(e) {
			console.log(e.message);
			console.log(e.stack);
			vscode.window.showErrorMessage("highlighting failed");
		}

	}
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
