// Modularized getRate
module.exports = {
    getRate: (req, res) => {
        if (!('letterWeight' in req.query && 'postType' in req.query)) {
            return respond(res, {
                status: 400,
                headers: {
                    'Content-Type': 'text/html',
                },
                message: 'Bad request: missing letterWeight and/or postType parameter(s)',
            });
        }

        // check for and set output postType
        let outputType = 'text/html';
        if ('output' in req.query) {
            switch (req.query.output) {
                case 'json':
                    outputType = 'application/json';
                break;
                
                case 'html':
                case 'ajax':
                case '':
                case null:
                case undefined:
                    outputType = 'text/html';
                break;

                default:
                    return respond(res, {
                        status: 400,
                        headers: {
                            'Content-Type': 'text/html',
                        },
                        message: `Invalid output postType "${req.query.output}"`,
                    });
                break;
            }
        }

        // get values from the URL query
        let letterWeight = Number(req.query.letterWeight);
        let postType = req.query.postType;

        // get the rate and calculate the price
        let price;
        let rate;
        let nameType;
        try {
            [rate, price, nameType] = calculateRate(letterWeight, postType);
        } catch (err) {
            return respond(res, {
                status: 400,
                headers: {
                    'Content-Type': 'text/html',
                },
                message: err,
            });
        }

        res.set('Content-Type', outputType);
        switch (outputType) {
            case 'text/html':
                res.render('pages/price.ejs', {
                    letterWeight: letterWeight.toFixed(2),
                    nameType: nameType,
                    rate: rate.toFixed(2),
                    price: price.toFixed(2),
                });
                break;
            
            // send a JSON object
            case 'application/json':
                res.send(JSON.stringify({
                    letterWeight: letterWeight.toFixed(2),
                    postType: postType,
                    nameType: nameType,
                    rate: rate.toFixed(2),
                    price: price.toFixed(2),
                }));
                break;
        }
    },
};

/**
 * TYPE RATE MAP
 * A map to match the package postType to the rate calculation function.
 */
const mapTypeRate = {
    'letter-stamped': letterStampedRate,
    'letter-metered': letterMeteredRate,
    'large-flat': largeFormatRate,
    'first-class-retail': firstClassicRetailRate,
};

/**
 * TYPE NAME MAP
 * A map to match the package postType with a more human-readable postType name.
 */
const mapTypeName = {
    'letter-stamped': 'Letter (Stamped)',
    'letter-metered': 'Letter (Metered)',
    'large-flat': 'Large Envelope (Flat)',
    'first-class-retail': 'First-Class Package Service (Retail)',
};

/**
 * RATE : LETTER (STAMPED)
 * This calculates the rate of a stamped letter or deferes the calculation to
 * the "First Class Mail" calculator if the letterWeight is over 3.5 oz.
 * @param letterWeight The letterWeight of the letter
 * @returns      The applied rate
 * @throws       An error if the letterWeight is too much
 */
function letterStampedRate(letterWeight) {
    if (letterWeight <= 1.0) {
        return 0.55;
    } else if (letterWeight <= 2.0) {
        return 0.70;
    } else if (letterWeight <= 3.0) {
        return 0.85;
    } else if (letterWeight <= 3.5) {
        return 1.00;
    } else {
        return largeFormatRate(letterWeight);
    }
}

/**
 * RATE : LETTER (METERED)
 * This calculates the rate of a metered letter or deferes the calculation to
 * the "First Class Mail" calculator if the letterWeight is over 3.5 oz.
 * @param letterWeight The letterWeight of the letter
 * @returns      The applied rate
 * @throws       An error if the letterWeight is too much
 */
function letterMeteredRate(letterWeight) {
    if (letterWeight <= 1.0) {
        return 0.50;
    } else if (letterWeight <= 2.0) {
        return 0.65;
    } else if (letterWeight <= 3.0) {
        return 0.80;
    } else if (letterWeight <= 3.5) {
        return 0.95;
    } else {
        return largeFormatRate(letterWeight);
    }
}

/**
 * RATE : LARGE ENVELOPE (FLAT)
 * @param letterWeight The letterWeight of the envelope
 * @returns      The applied rate
 * @throws       An error if the letterWeight is greater than 13.0 oz
 */
function largeFormatRate(letterWeight) {
    if (letterWeight <= 1.0) {
        return 1.00;
    } else if (letterWeight <= 2.0) {
        return 1.20;
    } else if (letterWeight <= 3.0) {
        return 1.40;
    } else if (letterWeight <= 4.0) {
        return 1.60;
    } else if (letterWeight <= 5.0) {
        return 1.80;
    } else if (letterWeight <= 6.0) {
        return 2.00;
    } else if (letterWeight <= 7.0) {
        return 2.20;
    } else if (letterWeight <= 8.0) {
        return 2.40;
    } else if (letterWeight <= 9.0) {
        return 2.60;
    } else if (letterWeight <= 10.0) {
        return 2.80;
    } else if (letterWeight <= 11.0) {
        return 3.00;
    } else if (letterWeight <= 12.0) {
        return 3.20;
    } else if (letterWeight <= 13.0) {
        return 3.40;
    } else {
        throw `Invalid letterWeight "${letterWeight}"`;
    }
}

/**
 * RATE : FIRST-CLASS MAIL (RETAIL)
 * @param letterWeight The letterWeight of the package
 * @returns      The applied rate
 * @throws       An error if the letterWeight is greater than 13.0 oz
 */
function firstClassicRetailRate(letterWeight) {
    if (letterWeight <= 4.0) {
        return 3.80;
    } else if (letterWeight <= 8.0) {
        return 4.60;
    } else if (letterWeight <= 12.0) {
        return 5.30;
    } else {
        throw `Invalid letterWeight "${letterWeight}"`;
    }
}

/**
 * CALCULATE DATA
 * This calculates and returns the rate, price and human-readable postType name.
 * @param letterWeight The package/letter letterWeight
 * @param postType   The package/letter postType
 * @returns      A data array
 * @throws       An error message if the letterWeight or postType is invalid
 * 
 * The returned data array includes the rate, price and postType name (in that order).
 */
function calculateRate(letterWeight, postType) {
    if (!(postType in mapTypeRate)) {
        throw `Unknown postType "${postType}"`;
    } else if (isNaN(letterWeight) || letterWeight <= 0) {
        throw `Invalid letterWeight "${letterWeight}"`;
    }

    let getRate = mapTypeRate[postType];
    let rate = getRate(letterWeight);
    let nameType = mapTypeName[postType];
    return [rate, rate * letterWeight, nameType];
}

/**
 * RESPOND
 * This sends a simple response (typically for errors).
 * @param res The Express HTTP response object
 * @param obj A key-value map for the response
 * 
 * The key-value map includes:
 * @var status  The HTTP status code
 * @var headers A key-value map of HTTP headers
 * @var message The content message
 */
function respond(res, obj) {
    res.status(obj.status);
    for (let key in obj.headers) {
        res.set(key, obj.headers[key]);
    }
    res.send(obj.message);
}