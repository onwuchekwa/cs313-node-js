/**
 * RATE MODULE
 */

module.exports = {
    /**
     * Create /getRate function
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
        let NameType;
        try {
            [rate, price, NameType] = calculateRate(weight, type);
        } catch (err) {
            // Display error if value is invalid
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
                    NameType: NameType,
                    rate: rate.toFixed(2),
                    price: price.toFixed(2),
                });
            break;
            
            // send a JSON object
            case 'application/json':
                res.send(JSON.stringify({
                    weight: weight.toFixed(2),
                    type: type,
                    NameType: NameType,
                    rate: rate.toFixed(2),
                    price: price.toFixed(2),
                }));
            break;
        }
    },
};

/**
 * Map Rate to rate type
 */
const mapRateType = {
    'letter-stamped': rateLetterStamped,
    'letter-metered': rateLetterMetered,
    'large-flat': rateLargeFlat,
    'first-class-retail': rateFirstClassRetail,
};

/**
 * Map Names to readable names
 */
const mapNameType = {
    'letter-stamped': 'Letter (Stamped)',
    'letter-metered': 'Letter (Metered)',
    'large-flat': 'Large Envelope (Flat)',
    'first-class-retail': 'First-Class Package Service—Retail',
};

/**
 * Get rate for letters (stamped)
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
 *Get rate for letters (metered)
 */
const rateLetterMetered = (weight) => {
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
 *  Get rate for large envelopes (Flates)
 */
const rateLargeFlat = (weight) => {
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
 * Get rates for first class package service - retail
 */
const rateFirstClassRetai = (weight) => {
    if (weight <= 4.0) {
        return 3.80;
    } else if (weight <= 8.0) {
        return 4.60;
    } else if (weight <= 12.0) {
        return 5.35;
    } else if (weight <= 13.0) {
        return 5.90;
    } else {
        throw `Invalid weight "${weight}"`;
    }
}

/**
 * Calculate Rate
 */
const calculateRate = (weight, type) => {
    if (!(type in mapRateType)) {
        throw `Unknown type "${type}"`;
    } else if (isNaN(weight) || weight <= 0) {
        throw `Invalid weight "${weight}"`;
    }

    let getRate = mapRateType[type];
    let rate = getRate(weight);
    let NameType = mapNameType[type];
    return [rate, rate * weight, NameType];
}

/**
 * Send responds to views
 */
const respond = (res, obj) => {
    res.status(obj.status);
    for (let key in obj.headers) {
        res.set(key, obj.headers[key]);
    }
    res.send(obj.message);
}