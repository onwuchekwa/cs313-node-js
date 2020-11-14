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
 * Map the letter type rate to match the one used in the functions
 */
const mapTypeRate = {
    'letter-stamped': letterStampedRate,
    'letter-metered': letterMeteredRate,
    'large-flat': largeFormatRate,
    'first-class-retail': firstClassicRetailRate,
};

/**
 * Map the letter type to display a human readable value
 */
const mapTypeName = {
    'letter-stamped': 'Letter (Stamped)',
    'letter-metered': 'Letter (Metered)',
    'large-flat': 'Large Envelope (Flat)',
    'first-class-retail': 'First-Class Package Service (Retail)',
};

/**
 * This function  returns the rate per stamped letter weight
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
 * This function  returns the rate per metered letter weight
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
 * This function  returns the rate per large format weight
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
 * This function returns the rate per each first classic retail weight
 */
function firstClassicRetailRate(letterWeight) {
    if (letterWeight <= 4.0) {
        return 3.80;
    } else if (letterWeight <= 8.0) {
        return 4.60;
    } else if (letterWeight <= 12.0) {
        return 5.30;
    } else if (letterWeight <= 13.0) {
        return 5.90;
    } else {
        throw `Invalid letterWeight "${letterWeight}"`;
    }
}

/**
 * This function calculates rates
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
 * Ths function displays data on the webpage
 */
function respond(res, obj) {
    res.status(obj.status);
    for (let key in obj.headers) {
        res.set(key, obj.headers[key]);
    }
    res.send(obj.message);
}