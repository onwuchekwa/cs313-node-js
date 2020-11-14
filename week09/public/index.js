/**
 * Get element by ID
 */
const elementById = (id) => {
    return document.querySelector(id);
}

/**
 * HTML elements
 */
let divAjax;
let divAjaxResponse;
let selOutput;
let frmMain;
let btRequest;

/**
 * Check if all inputs are valid
 */
const validateInputs = () => {
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
 * Select Changed Event
 */
const onOutputSelectorChange = () => {
    divAjaxResponse.innerHTML = '';

    if (selOutput.value === 'ajax') {
        divAjax.style.display = '';
    } else {
        divAjax.style.display = 'none';
    }
}

/**
 * ON WINDOW LOAD
 * This function initializes the local elem variables and performs initial
 * trigger calls.
 */
function onWindowLoad() {
    divAjax = elementById('#div-ajax');
    divAjaxResponse = elementById('#div-ajax-response');
    selOutput = elementById('#sel-output');
    frmMain = elementById('#frm-main');
    btRequest = elementById('#bt-request');

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