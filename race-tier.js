/*
 * Nightbot command:
 * !editcom -ul=everyone -cd=10 !tier $(eval tier('$(provider)', '$(query)', "$(urlfetch json https://docs.google.com/spreadsheets/d/17NQWlnzrHHPDXbPhoHyevwdQjDqHQGdIWgK4goiwy5U/export?exportFormat=tsv)"); $(urlfetch json https://raw.githubusercontent.com/PhilHoff84/broughy1322/master/race-tier.js);)
 * !editcom -ul=everyone -cd=10 !compacts -a=!tier compacts $(query)
 * !editcom -ul=everyone -cd=10 !coupes -a=!tier coupes $(query)
 * !editcom -ul=everyone -cd=10 !muscle -a=!tier muscle $(query)
 * !editcom -ul=everyone -cd=10 !offroad -a=!tier off-road $(query)
 * !editcom -ul=everyone -cd=10 !openwheel -a=!tier open-wheel $(query)
 * !editcom -ul=everyone -cd=10 !sedans -a=!tier sedans $(query)
 * !editcom -ul=everyone -cd=10 !sports -a=!tier sports $(query)
 * !editcom -ul=everyone -cd=10 !classics -a=!tier sports-classics $(query)
 * !editcom -ul=everyone -cd=10 !supers -a=!tier supers $(query)
 * !editcom -ul=everyone -cd=10 !suvs -a=!tier suvs $(query)
 * !editcom -ul=everyone -cd=10 !utility -a=!tier utility $(query)
 * !editcom -ul=everyone -cd=10 !vans -a=!tier vans $(query)
 */
function tier(provider='', query = '', data = '') {
    /* Sanitize the filter criteria specified in the query */
    query = normalize(query);
    var args = query.split(/\s+/);

    /* Parse vehicles */
    var vehicles = data.split('<EOL>').map(function (row) {
        var cols = row.split('\t');
        return new Vehicle(cols[0], cols[1], cols[2]);
    });

    if (0 === vehicles.length) {
        return 'Could not parse GTA Car Tiers ¯\\_(ツ)_/¯';
    }

    /* Print usage (for !tier)*/
    if (args.length === 0 || /\busage\b/.test(query)) {
        return 'GTA Car Tiers: ' +
            unique(
                vehicles.map(function (vehicle) {
                    return vehicle._clazz;
                })
            ).join(', ');
    }

    if (args.length >= 1) {
        var clazz = args[0];
        var vehicles_by_class = vehicles.filter(function (vehicle) {
            return normalize(vehicle._clazz) == clazz;
        });
        if (0 === vehicles_by_class.length) {
            return 'Could not find a GTA Car Tier for: ' + clazz + ' ¯\\_(ツ)_/¯';
        }
    }

    if (args.length >= 2) {
        var tier = args[1];
        var vehicles_by_tier = vehicles_by_class.filter(function (vehicle) {
            return normalize(vehicle._tier) == tier;
        });
        if (0 === vehicles_by_tier.length) {
            return 'GTA Car Tiers for ' + vehicles[0]._clazz + ': ' +
                unique(
                    vehicles_by_class.map(function (vehicle) {
                        return vehicle._tier;
                    })
                ).sort(function (a ,b) {
                    /* Sort order: S+, S, A, B, C, ... */
                    var a_tier = a.replace(/^S\+/i, '0').replace(/^S/i, '1');
                    var b_tier = b.replace(/^S\+/i, '0').replace(/^S/i, '1');
                    return a_tier.localeCompare(b_tier);
                }).join(', ');
        }
    }

    if (vehicles_by_tier.length > 10) {
        return 'Found too many vehicles in GTA Car Tier: '+ args.join(' ') + ' ¯\\_(ツ)_/¯';
    }

    return 'query: ' + query + ' -> args: ' + args.join(', ') + ' filtered: ' + vehicles_by_tier.length + ' vehicles: ' +
        vehicles_by_tier[0]._clazz + ' ' + vehicles_by_tier[0]._tier + ' ▸ ' +
        vehicles_by_tier.map(function (vehicle) {
            return vehicle._name;
        }).join(', ');
}

function normalize(text) {
    if (!text) {
        text = '';
    }

    /* Convert to lowercase */
    text = text.toLowerCase();

    /* Remove plural */
    text = text.replace(/(?<=\S)s\b/g, '');

    /* Remove accents */
    text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    /* Remove everything behind '@' */
    text = text.replace(/\s*@.*/, '');

    /* Convert whitespace to ' ' */
    text = text.replace(/\s+/g, ' ');

    /* Remove all chars that are not letters, '+' or '-' */
    text = text.replace(/[^a-z \+\-]+/g, '');

    /* Substitute common aliases with the correct criteria */
    switch (text) {
        case '': /* Print usage, if there was not even a single valid letter in the text */
        case 'help':
        case 'option':
        case 'instruction':
            return 'usage';
        case 'open':
        case 'wheel':
        case 'formula':
        case 'open wheel':
            return 'open-wheel';
        case 'classic':
        case 'sportclassic':
        case 'sportsclassic':
        case 'sport classic':
            return 'sport-classic';
        case 'utiliti':
        case 'utilitie':
            return 'utility';
        case 'offroad':
        case 'off road':
            return 'off-road';
        default:
            return text.trim();
    }
}

/* Returns only unique values from the specified argument */
function unique(values) {
    return [...new Set(values)];
}

function Vehicle(_clazz, _tier, _name) {
    this._clazz = _clazz;
    this._tier = _tier;
    this._name = _name;

    this.toString = function () {
        return _name;
    };
}