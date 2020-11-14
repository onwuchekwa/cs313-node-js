/**
 * GET ELEMENT BY ID
 * Alias for document.getElementById.
 */
function byId(id) {
    return document.getElementById(id);
}

/**
 * HTML ELEMENTS
 */
let divAjax;
let divAjaxResponse;
let selOutput;
let frmMain;
let btRequest;

/**
 * VALIDATE INPUTS
 * This function checks to see if all form inputs are valid.
 * This is used for the button disabled and submit logic.
 * @returns Whether or not the form is valid
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

    let type = frmMain.elements['type'].value;
    let weight = frmMain.elements['weight'].value;
    let output = frmMain.elements['output'].value;

    let validType = validTypes.indexOf(type) >= 0;
    let validOutput = validOutputs.indexOf(output) >= 0;
    let validWeight = (!isNaN(weight) && (weight >= 0.01 && weight <= 13.00));

    return validType && validWeight && validOutput;
}

/**
 * ON OUTPUT SELECTOR CHANGE
 * This function is triggered when the "Output Type" dropdown value is changed.
 * It determines whether or not to hide and clear the AJAX/AJAX Reponse divs.
 */
function onOutputSelectorChange() {
    divAjaxResponse.innerHTML = '';
    selOutput.addEventListener('input', () => {
        if (selOutput.value === 'ajax') {
            divAjax.style.display = '';
        } else {
            divAjax.style.display = 'none';
        }
    });/*
    if (selOutput.value === 'ajax') {
        divAjax.style.display = '';
    } else {
        divAjax.style.display = 'none';
    }*/
}

/**
 * ON WINDOW LOAD
 * This function initializes the local elem variables and performs initial
 * trigger calls.
 */
function onWindowLoad() {
    divAjax = byId('div-ajax');
    divAjaxResponse = byId('div-ajax-response');
    selOutput = byId('sel-output');
    frmMain = byId('frm-main');
    btRequest = byId('bt-request');

    // call triggers once to initialize
    onOutputSelectorChange();
    onFormChange();
}

/**
 * ON FORM CHANGE
 * This function is triggered by the form's inputs changing.
 * It determines whether or not the "Calculate" button is disabled.
 */
function onFormChange() {
    btRequest.disabled = !validateInputs();
}

/**
 * ON REQUEST CLICK
 * This function is triggered by the "Calculate" button clicking.
 * If the form is valid, then this function either performs a basic HTTP form submission
 * or an AJAX request.
 * If doing an AJAX request, then this function updates the "AJAX Response" div.
 */
function onRequestClick() {
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
}

// register the window load
window.addEventListener('load', onWindowLoad);