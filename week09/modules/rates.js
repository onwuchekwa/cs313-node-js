module.exports = {
    /**
     * GET RATE
     * This is the function portion of the "/getRate" endpoint.
     * If an input is invalid, then a simple reponse is sent back with the matching
     * error code.
     * @param req The Express HTTP request object (populated)
     * @param res The Express HTTP response object (to be populated)
     */
    getRate: (req, res) => {
        // enforce needed paramters
        if (!('weight' in req.query && 'type' in req.query)) {
            return respond(res, {
                status: 400,
                headers: {
                    'Content-Type': 'text/html',
                },
                message: 'Bad request: missing weight and/or type parameter(s)',
            });
        }

        // check for and set output type
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

                // "output" must be valid or omitted
                default:
                    return respond(res, {
                        status: 400,
                        headers: {
                            'Content-Type': 'text/html',
                        },
                        message: `Invalid output type "${req.query.output}"`,
                    });
            }
        }

        // get values from the URL query
        let weight = Number(req.query.weight);
        let type = req.query.type;

        // get the rate and calculate the price
        let price;
        let rate;
        let typeName;
        try {
            [rate, price, typeName] = calculateData(weight, type);
        } catch (err) {
            // if an invalid weight was given, then indicate such
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
            // render the EJS page
            case 'text/html':
                res.render('pages/price.ejs', {
                    weight: weight.toFixed(2),
                    typeName: typeName,
                    rate: rate.toFixed(2),
                    price: price.toFixed(2),
                });
                break;
            
            // send a JSON object
            case 'application/json':
                res.send(JSON.stringify({
                    weight: weight.toFixed(2),
                    type: type,
                    typeName: typeName,
                    rate: rate.toFixed(2),
                    price: price.toFixed(2),
                }));
                break;
        }
    },
};

/**
 * TYPE RATE MAP
 * A map to match the package type to the rate calculation function.
 */
const typeRateMap = {
    'letter-stamped': rateLetterStamped,
    'letter-metered': rateLetterMetered,
    'large-flat': rateLargeFlat,
    'first-class-retail': rateFirstClassRetail,
};

/**
 * TYPE NAME MAP
 * A map to match the package type with a more human-readable type name.
 */
const typeNameMap = {
    'letter-stamped': 'Letter (Stamped)',
    'letter-metered': 'Letter (Metered)',
    'large-flat': 'Large Envelope (Flat)',
    'first-class-retail': 'First-Class Package Service—Retail',
};

/**
 * RATE : LETTER (STAMPED)
 * This calculates the rate of a stamped letter or deferes the calculation to
 * the "First Class Mail" calculator if the weight is over 3.5 oz.
 * @param weight The weight of the letter
 * @returns      The applied rate
 * @throws       An error if the weight is too much
 */
function rateLetterStamped(weight) {
    if (weight <= 1.0) {
        return 0.55;
    } else if (weight <= 2.0) {
        return 0.70;
    } else if (weight <= 3.0) {
        return 0.85;
    } else if (weight <= 3.5) {
        return 1.00;
    } else {
        return rateLargeFlat(weight);
    }
}

/**
 * RATE : LETTER (METERED)
 * This calculates the rate of a metered letter or deferes the calculation to
 * the "First Class Mail" calculator if the weight is over 3.5 oz.
 * @param weight The weight of the letter
 * @returns      The applied rate
 * @throws       An error if the weight is too much
 */
function rateLetterMetered(weight) {
    if (weight <= 1.0) {
        return 0.50;
    } else if (weight <= 2.0) {
        return 0.65;
    } else if (weight <= 3.0) {
        return 0.80;
    } else if (weight <= 3.5) {
        return 0.95;
    } else {
        return rateLargeFlat(weight);
    }
}

/**
 * RATE : LARGE ENVELOPE (FLAT)
 * @param weight The weight of the envelope
 * @returns      The applied rate
 * @throws       An error if the weight is greater than 13.0 oz
 */
function rateLargeFlat(weight) {
    if (weight <= 1.0) {
        return 1.00;
    } else if (weight <= 2.0) {
        return 1.20;
    } else if (weight <= 3.0) {
        return 1.40;
    } else if (weight <= 4.0) {
        return 1.60;
    } else if (weight <= 5.0) {
        return 1.80;
    } else if (weight <= 6.0) {
        return 2.00;
    } else if (weight <= 7.0) {
        return 2.20;
    } else if (weight <= 8.0) {
        return 2.40;
    } else if (weight <= 9.0) {
        return 2.60;
    } else if (weight <= 10.0) {
        return 2.80;
    } else if (weight <= 11.0) {
        return 3.00;
    } else if (weight <= 12.0) {
        return 3.20;
    } else if (weight <= 13.0) {
        return 3.40;
    } else {
        throw `Invalid weight "${weight}"`;
    }
}

/**
 * RATE : FIRST-CLASS MAIL (RETAIL)
 * @param weight The weight of the package
 * @returns      The applied rate
 * @throws       An error if the weight is greater than 13.0 oz
 */
function rateFirstClassRetail(weight) {
    if (weight <= 4.0) {
        return 3.80;
    } else if (weight <= 8.0) {
        return 4.60;
    } else if (weight <= 12.0) {
        return 5.30;
    } else {
        throw `Invalid weight "${weight}"`;
    }
}

/**
 * CALCULATE DATA
 * This calculates and returns the rate, price and human-readable type name.
 * @param weight The package/letter weight
 * @param type   The package/letter type
 * @returns      A data array
 * @throws       An error message if the weight or type is invalid
 * 
 * The returned data array includes the rate, price and type name (in that order).
 */
function calculateData(weight, type) {
    if (!(type in typeRateMap)) {
        throw `Unknown type "${type}"`;
    } else if (isNaN(weight) || weight <= 0) {
        throw `Invalid weight "${weight}"`;
    }

    let getRate = typeRateMap[type];
    let rate = getRate(weight);
    let typeName = typeNameMap[type];
    return [rate, rate * weight, typeName];
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