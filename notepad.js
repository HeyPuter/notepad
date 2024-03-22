// Assign different page elements to easy-to-use constants
const open_button = document.getElementById('open-button');
const save_button = document.getElementById('save-button');
const save_as_button = document.getElementById('save-as-button');
const font_button = document.getElementById('font-button');
const background_color_button = document.getElementById('background-color-button');
const font_color_button = document.getElementById('font-color-button');
const exit_button = document.getElementById('exit-button');
const speak_button = document.getElementById('speak-button');
const editor = document.getElementById('editor');

// This variable tracks whether the content of the editor has changed since the last save
let unsaved_changes = false;

// Holds the handle to the file that is currently open in Notepad
let open_file;

// Sets an event-handler function that is called when an item is opened using this app.
// For example, when user double click on a text file or a text file is dragged and dropped 
// onto the Notepad.
puter.ui.onLaunchedWithItems(async function(items){
    
    // open_file is now items[0]
    open_file = items[0];

    // Load the content of the opened file into the editor. 
    editor.value = await open_file.read();

})

//----------------------------------------------------
// Fetch settings
//----------------------------------------------------
puter.kv.get('font').then((value)=>{
    editor.style.fontFamily = value;
});

puter.kv.get('bg-color').then((value)=>{
    editor.style.backgroundColor = value;
});

puter.kv.get('color').then((value)=>{
    editor.style.color = value;
});

//----------------------------------------------------
// 'Open' button clicked
//----------------------------------------------------
open_button.addEventListener('click', async () => {

    // Display the 'Open File Picker' allowing the user to select and open a file from their Puter account 
    open_file = await puter.ui.showOpenFilePicker();

    // Load the content of the opened file into the editor
    editor.value = await (await open_file.read()).text();

});

//----------------------------------------------------
// 'Save' button clicked
//----------------------------------------------------
save_button.addEventListener('click', async () => {

    // If there is a file already open, overwrite it with the content of editor
    if(open_file)
        open_file.write(editor.value);

    // If no file is open (i.e. this document was written from scratch) show the 'Save File' dialog
    else
        open_file = await puter.ui.showSaveFilePicker(editor.value, 'Untitled.txt');

    // Set unsaved_changes to false since the file has been saved
    unsaved_changes = false;
});

//----------------------------------------------------
// 'Save As' button clicked
//----------------------------------------------------
save_as_button.addEventListener('click', async () => {

    // Display the 'Save File Picker' dialog to allow user to save the file to their Puter account
    open_file = await puter.ui.showSaveFilePicker(editor.value, open_file ? open_file.name : 'Untitled.txt');

});

//----------------------------------------------------
// 'Font' button clicked
//----------------------------------------------------
font_button.addEventListener('click', async () => {

    // Show the 'Font Picker' dialog to allow user to pick a font.
    const new_font = await puter.ui.showFontPicker();

    // If a font was selected in previous step, change the editor font to it
    if(new_font){

        // Set editor font
        editor.style.fontFamily = new_font.fontFamily;

        // Save setting
        puter.kv.set("font", new_font.fontFamily);
    }
});

//----------------------------------------------------
// 'Background Color' button clicked
//----------------------------------------------------
background_color_button.addEventListener('click', async (event) => {

    // Show the 'Color Picker' dialog to allow user to pick a color.
    const new_color = await puter.ui.showColorPicker();

    // If a color was selected in previous step, change the editor background to it
    if(new_color){
        
        // Set editor background color
        editor.style.backgroundColor = new_color;

        // Save setting
        puter.kv.set("bg-color", new_color);
    }
});

//----------------------------------------------------
// 'Font Color' button clicked
//----------------------------------------------------
font_color_button.addEventListener('click', async (event) => {

    // Show the 'Color Picker' dialog to allow user to pick a color.
    const new_color = await puter.ui.showColorPicker();

    // If a color was selected in previous step, change the editor background to it
    if(new_color){

        // Set editor font color
        editor.style.color = new_color;

        // Save setting
        puter.kv.set("color", new_color);
    }
});

//----------------------------------------------------
// 'Speak' button clicked
//----------------------------------------------------
speak_button.addEventListener('click', async (event) => {

    // get editor content
    const text = editor.value;

    // check if the editor is empty
    if(text.trim() === ''){
        puter.ui.alert('The editor is empty!');
        return;
    }

    // Speak the content of the editor
    puter.ai.txt2speech(text).then((audio)=>{
        audio.play();
    });

});

//----------------------------------------------------
// Track changes to the editor. If the user inputs anything in the editor, 
// set the unsaved_changes variable to true. This is a naive implementation
// and for demonstration purposes only. In a real-world application, you should
// check to see if the content of the editor has actually changed before setting
// unsaved_changes to true.
//----------------------------------------------------
editor.addEventListener('input', function (event) {
    unsaved_changes = true;
});

//----------------------------------------------------
// 'Exit' button clicked
//----------------------------------------------------
exit_button.addEventListener('click', async (event) => {
    attempt_exit();
});


//----------------------------------------------------
// A function that attempts to exit the app. If there are any unsaved changes,
// it will prompt the user to save the file before exiting.
//----------------------------------------------------
attempt_exit = function() {
    // If there are any unsaved changes, prompt the user to save the file before closing the window
    if (unsaved_changes) {
        puter.ui.alert('You have unsaved changes! Exit anyway?', [
            {
                label: 'Exit',
                value: 'exit',
                type: 'danger',
            },
            {
                label: 'Save',
                value: 'save',
                type: 'primary',
            },
            {
                label: 'Cancel',
                value: 'cancel'
            },
        ]).then(async (resp) => {
            if (resp == "exit") {
                // Close the window and exit Notepad
                puter.exit();
            } else if (resp === "save") {
                // if a file is already open, overwrite the file with the contents of the editor
                if(open_file){
                    await open_file.write(editor.value);
                }
                // No file was opened, show the 'Save File' dialog to allow user to save the file to their Puter account
                else{
                    open_file = await puter.showSaveFilePicker(editor.value, 'Untitled.txt');
                }
                // Once file is saved close the window and exit Notepad
                puter.exit();
            }
        });
    } else {
        // Otherwise, close the window and exit Notepad without prompting the user
        puter.exit();
    }    
}

// Set a handler that is called right before this app's window is about to close.
// For example, when user clicks the close button ('X') on the window.
puter.ui.onWindowClose(function(){
    attempt_exit();
})