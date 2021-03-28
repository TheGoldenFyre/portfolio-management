import {parse} from '/script/parse-transactions.js'

function InitializeTransactionUpload(selector, cb) {
    const dropArea = document.querySelector(selector);

    dropArea.addEventListener('dragover', (event) => {
        event.stopPropagation();
        event.preventDefault();
        dropArea.style.backgroundColor = "rgb(42, 42, 42)";
        // Style the drag-and-drop as a "copy file" operation.
        event.dataTransfer.dropEffect = 'copy';
    });

    dropArea.addEventListener('drop', (event) => {
        event.stopPropagation();
        event.preventDefault();
        const fileList = event.dataTransfer.files;
        ReadFile(fileList[0]);
    });

    dropArea.addEventListener('dragleave', e => {
        dropArea.style.backgroundColor = "#1b1b1b";
    });


    if (window.FileList && window.File && window.FileReader) {
        document.getElementById(selector).addEventListener('change', event => {
            const file = event.target.files[0];
            ReadFile(file, cb)
        });
    }
}

function ReadFile(file, cb) {
    const reader = new FileReader();
    reader.addEventListener('load', event => {
        $(".main-display").first().css("overflow-y", "scroll")
        $("#drop-area").remove()
        let investments = parse(event.target.result, "bitvavo")
        document.cookie = `invs=${JSON.stringify(investments)}`
        cb(investments)
    });
    reader.readAsText(file);
}

function ReadInvestmentsFromCookie(mainAreaSelector, dropAreaSelector, cb) {
    if (!document.cookie) return
    
    let str = ""
    for (let i = 0; i < document.cookie.length; i++) {
        if(document.cookie[i] != '\\'){
            str += document.cookie[i]
        }
    }

    try {
        cb(JSON.parse(str.slice(5,str.length)))
        $(mainAreaSelector).first().css("overflow-y", "scroll")
        $(dropAreaSelector).remove()
    } catch {
        console.log("Invalid investment cookie content")
        return
    }
}

export {InitializeTransactionUpload, ReadInvestmentsFromCookie}