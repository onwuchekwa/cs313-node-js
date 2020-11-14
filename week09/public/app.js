/**
 * Get elements by ID
function elementById(id) {
    return document.querySelector(id);
}

/**
 * HTML ELEMENTS
 */
let divAjax;
let divAjaxResponse;
let selOutput;
let frmMain;
let btnSubmit;

/**
 * Validate all input fields
 */
function validateInputs() {
    const validTypes = [
        'letter-stamped',
        'letter-metered',
        'large-flat',
        'first-class-retail',
    ];
    const validOutputs = [
        'html',
        'json',
        'ajax',
    ];

    let postType = frmMain.elements['postType'].value;
    let letterWeight = frmMain.elements['letterWeight'].value;
    let output = frmMain.elements['output'].value;

    let validType = validTypes.indexOf(postType) >= 0;
    let validOutput = validOutputs.indexOf(output) >= 0;
    let validWeight = (!isNaN(letterWeight) && (letterWeight >= 0.01 && letterWeight <= 13.00));

    return validType && validWeight && validOutput;
}

/**
 * Hide or Show divs based on selected item
 */
function selectStateChangedEvent() {
    divAjaxResponse.innerHTML = '';
    selOutput.addEventListener('input', () => {
        if (selOutput.value === 'ajax') {
            divAjax.style.display = '';
        } else {
            divAjax.style.display = 'none';
        }
    });
}

/**
 * Initialize the local element variables and performs initial
 * trigger calls.
 */
function onWindowLoad() {
    divAjax = elementById('#div-ajax');
    divAjaxResponse = elementById('#div-ajax-response');
    selOutput = elementById('#outputType');
    frmMain = elementById('#mainForm');
    btnSubmit = elementById('#btnSubmit');

    // call triggers once to initialize
    selectStateChangedEvent();
    formChangedEvent();
    getCalculatedRate();
}

/**
 * Enable or disable calculate button
 */
function formChangedEvent() {
    frmMain.addEventListener('input', () => {
        btnSubmit.disabled = !validateInputs();
    });
}

/**
 * This function either performs a basic HTTP form submission
 * or an AJAX request.
 */
const getCalculatedRate = () => {
    btnSubmit.addEventListener('click', () => {
        switch (selOutput.value) {
            case 'html':
            case 'json':
                if (validateInputs()) {
                    frmMain.submit();
                }
            break;
            
            case 'ajax':
                if (validateInputs()) {
                    let data = new FormData(frmMain);
                    
                    for (let datum of data) {
                        console.log(datum);
                    }

                    ajaxGet('/getRate', data)
                    .then((html) => {
                        divAjaxResponse.innerHTML = html;
                    })
                    .catch((err) => {
                        console.log(err);
                    });
                }
            break;
        }
    });
}

// register the window load
window.addEventListener('load', onWindowLoad);