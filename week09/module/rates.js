module.exports = {
    getRate: (req, res) => {
        if(!('weight' in req.query && 'type' in req.query)) {
            return respond(res, { 
                status: 400, 
                headers: { 'Content-Type' : 'text/html' },
                message: 'Bad request: weight and type parameters are missing'
            });
        }

        let outputType = 'text/html';
        if('output' in req.query) {
            switch(req.query.output) {
                case 'html':
                case 'ajax':
                case '':
                case null:
                case undefined:
                    outputType = 'text/html';
                break;

                case 'json':
                    outputType = 'application/json';
                break;

                default:
                    return respond(res,{
                        status: 400,
                        headers: {
                            'Content-Type': 'text/html',
                        },
                        message: `Invalid output type "${req.query.output}"`
                    });
                break;
            }
        }

        let weight = Number(req.query.weight);
        let type = req.query.type;

        let price;
        let rate;
        let type_name;

        try {
            [rate, price, type_name] = calculateRate(weight, type);
        } catch(ex) {
            return respond(res, {
                status: 400,
                headers: {
                    'Content-Type': 'text/html',
                },
                message: ex
            });
        }

        res.set('Content-Type', outputType);

        switch(outputType) {
            case 'text/html':
                res.render('pages/price.ejs', {
                    weight: weight.toFixed(2),
                    type_name: type_name,
                    rate: rate.toFixed(2),
                    price: price.toFixed(2),
                });
            break;
            
            // send a JSON object
            case 'application/json':
                res.send(JSON.stringify({
                    weight: weight.toFixed(2),
                    type: type,
                    type_name: type_name,
                    rate: rate.toFixed(2),
                    price: price.toFixed(2),
                }));
            break;
        }
    }
};

const mapTypeRate = {
    'letter-stamped': rateLetterStamped,
    'letter-metered': rateLetterMetered,
    'large-flat': rateLargeFlat,
    'first-class-retail': rateFirstClassRetail
}

const mapTypeName = {
    'letter-stamped': 'Letter (Stamped)',
    'letter-metered': 'Letter (Metered)',
    'large-flat': 'Large Envelope (Flat)',
    'first-class-retail': 'First-Class Package Service—Retail'
}

const rateLetterStamped = (weight) => {
    if(weight <= 1.0) {
        return 0.55;
    } else if(weight <= 2.0) {
        return 0.70;
    } else if (weight <= 3.0) {
        return 0.85;
    } else if (weight <= 3.5) {
        return 1.00;
    } else {
        return rateLargeFlat(weight);
    }
}

const rateLetterMetered = (weight) => {
    if (weight <= 1.0) {
        return 0.5;
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

const rateFirstClassRetail = (weight) => {
    if (weight <= 4.0) {
        return 3.80;
    } else if (weight <= 8.0) {
        return 3.75;
    } else if (weight <= 8.0) {
        return 4.60;
    } else if (weight <= 12.0) {
        return 5.30;
    } else if (weight <= 13.0) {
        return 5.90;
    } else {
        throw `Invalid weight "${weight}"`;
    }
}

const calculateRate = (weight, type) => {
    if (!(type in mapTypeRate)) {
        throw `Unknown type "${type}"`;
    } else if (isNaN(weight) || weight <= 0) {
        throw `Invalid weight "${weight}"`;
    }

    let getRate = mapTypeRate[type];
    let rate = getRate(weight);
    let type_name = mapTypeName[type];
    return [rate, rate * weight, type_name];
}

const respond = (res, obj) => {
    res.status(obj.status);
    for (let key in obj.headers) {
        res.set(key, obj.headers[key]);
    }
    res.send(obj.message);
}