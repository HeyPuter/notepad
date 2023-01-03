// Assign different page elements to easy-to-use constants
const open_button = document.getElementById('open-button');
const save_button = document.getElementById('save-button');
const save_as_button = document.getElementById('save-as-button');
const font_button = document.getElementById('font-button');
const background_color_button = document.getElementById('background-color-button');
const font_color_button = document.getElementById('font-color-button');
const exit_button = document.getElementById('exit-button');
const editor = document.getElementById('editor');

// this variable tracks whether the content of the editor has changed since the last save
let unsaved_changes = false;

// Holds the handle to the file that is currently open in Notepad
let open_file;

// Instantiate a Cloud.JS object. Cloud.JS is the official SDK for Puter that allows you to build
// cloud-native applications within the Puter.com environment.
const cloud = new Cloud({

    // This optional event-handler function is called right before this app's window is about to close
    // For example, when user clicks the close button ('X') on the window
    onWindowClose: function(){
        this.exit();
    },

    // This optional event-handler function is called when an item is opened using this app
    // For example, when user double click on a text file or a text file is dragged and dropped 
    // onto the Notepad.
    onItemsOpened: async function(items){
        
        // open_file is now items[0]
        open_file = items[0];

        // Load the content of the opened file into the editor. 
        editor.value = await open_file.text();

    }

});

//----------------------------------------------------
// Fetch settings
//----------------------------------------------------
cloud.getItem('font').then((value)=>{
    editor.style.fontFamily = value;
});

cloud.getItem('bg-color').then((value)=>{
    editor.style.backgroundColor = value;
});

cloud.getItem('color').then((value)=>{
    editor.style.color = value;
});

//----------------------------------------------------
// 'Open' button clicked
//----------------------------------------------------
open_button.addEventListener('click', async () => {

    // Display the 'Open File Picker' allowing the user to select and open a file from their Puter account 
    open_file = await cloud.showOpenFilePicker();

    // Load the content of the opened file into the editor
    editor.value = await open_file.text();

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
        open_file = await cloud.showSaveFilePicker(editor.value, 'Untitled.txt');

    // Set unsaved_changes to false since the file has been saved
    unsaved_changes = false;
});

//----------------------------------------------------
// 'Save As' button clicked
//----------------------------------------------------
save_as_button.addEventListener('click', async () => {

    // Display the 'Save File Picker' dialog to allow user to save the file to their Puter account
    open_file = await cloud.showSaveFilePicker(editor.value, open_file ? open_file.name : 'Untitled.txt');

});

//----------------------------------------------------
// 'Font' button clicked
//----------------------------------------------------
font_button.addEventListener('click', async () => {

    // Show the 'Font Picker' dialog to allow user to pick a font.
    const new_font = await cloud.showFontPicker();

    // If a font was selected in previous step, change the editor font to it
    if(new_font)

        // Set editor font
        editor.style.fontFamily = new_font.fontFamily;

        // Save setting
        cloud.setItem("font", new_font.fontFamily);

});

//----------------------------------------------------
// 'Background Color' button clicked
//----------------------------------------------------
background_color_button.addEventListener('click', async (event) => {

    // Show the 'Color Picker' dialog to allow user to pick a color.
    const new_color = await cloud.showColorPicker();

    // If a color was selected in previous step, change the editor background to it
    if(new_color)
        
        // Set editor background color
        editor.style.backgroundColor = new_color;

        // Save setting
        cloud.setItem("bg-color", new_color);

});

//----------------------------------------------------
// 'Font Color' button clicked
//----------------------------------------------------
font_color_button.addEventListener('click', async (event) => {

    // Show the 'Color Picker' dialog to allow user to pick a color.
    const new_color = await cloud.showColorPicker();

    // If a color was selected in previous step, change the editor background to it
    if(new_color)

        // Set editor font color
        editor.style.color = new_color;

        // Save setting
        cloud.setItem("color", new_color);

});

//----------------------------------------------------
// Track changes to the editor. If the user makes any changes, 
// set the unsaved_changes variable to true.
//----------------------------------------------------
editor.addEventListener('input', function (event) {
    unsaved_changes = true;
});

//----------------------------------------------------
// 'Exit' button clicked
//----------------------------------------------------
exit_button.addEventListener('click', async (event) => {
    // If a file was opened, prompt the user to save
    if (unsaved_changes) {
        cloud.alert('You have unsaved changes! Exit anyway?', [
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
                cloud.exit();
            } else if (resp === "save") {
                // if a file is already open, overwrite the file with the contents of the editor
                if(open_file){
                    await open_file.write(editor.value);
                }
                // No file was opened, show the 'Save File' dialog to allow user to save the file to their Puter account
                else{
                    open_file = await cloud.showSaveFilePicker(editor.value, 'Untitled.txt');
                }
                // Once file is saved close the window and exit Notepad
                cloud.exit();
            }
        });
    } else {
        // Otherwise, close the window and exit Notepad without prompting the user
        cloud.exit();
    }

});
