let fs = require('fs');
let readline = require('readline');
const { match } = require('assert');

exports.setFs = function(_fs) {
    fs = _fs; 
}

exports.setReadline = function(_readline) {
    readline = _readline; 
}

// TODO: Include a quadrant property and change this function to return the complete matrix
exports.getHighHitsHighMillis = async function(filePath, signatureRegex) {
    const components = await getComponentsFromLogs(filePath, signatureRegex);
    const rankedComponentsByHits = rankComponents(getComponentsSortedDescByHits(components), hitsExtractor);
    const rankedComponentsByMillis = rankComponents(getComponentsSortedDescByMillis(components), millisExtractor);

    if (rankedComponentsByHits.length === 0 || rankedComponentsByMillis === 0) {
        return [];
    }

    const highHitComponents = getHighComponents(rankedComponentsByHits);
    const highMillisComponents = getHighComponents(rankedComponentsByMillis);

    return getMatches(highHitComponents, highMillisComponents);
}

async function getComponentsFromLogs(filePath, signatureRegex) {
    const componentsMap = {};

    for await (const logLine of getLogLines(filePath)) {
        const signatureAndMillis = getSignatureAndMillis(logLine, signatureRegex);
        if (!signatureAndMillis) {
            continue;
        }

        if (!componentsMap[signatureAndMillis.signature]) {
            componentsMap[signatureAndMillis.signature] = { millisSum: 0, millis: [] };
        }
        componentsMap[signatureAndMillis.signature].millisSum += Number(signatureAndMillis.millis);
        componentsMap[signatureAndMillis.signature].millis.push(signatureAndMillis.millis);
    }

    return mapToArray(componentsMap);
}

function getLogLines(filePath) {
    const fileStream = fs.createReadStream(filePath);
    return readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
}

function getSignatureAndMillis(line, signatureRegex) {
    const found = line.match(`(?<signature>${signatureRegex}.+) executed in (?<millis>[0-9])ms`);
    return isValidLog(found) && { signature: found.groups.signature, millis: found.groups.millis };
}

function isValidLog(found) {
    return found && found.groups && (found.groups.signature && found.groups.millis);
}

function mapToArray(components) {
    const componentsArray = [];
    for (const c in components) {
        componentsArray.push({ ...components[c], key: c });
    }
    return componentsArray;
}

function getComponentsSortedDescByHits(components) {
    return deepClone(components)
        .sort((a, b) => b.millis.length - a.millis.length);
}

function getComponentsSortedDescByMillis(components) {
    return deepClone(components)
        .sort((a, b) => (b.millisSum / b.millis.length) - (a.millisSum / a.millis.length));
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function rankComponents(components, propertyExtractor) {
    const rankedComponents = [...components];
    let rank = 0;
    let prop = -1;
    for (const rc of rankedComponents) {
        if (propertyExtractor(rc) !== prop) { // hits or avg millis
            rank++;
            prop = propertyExtractor(rc);
        }
        rc.rank = rank;
    }
    return rankedComponents;
}

function hitsExtractor(c) {
    return c.millis.length;
}

function millisExtractor(c) {
    return c.millisSum / c.millis.length;
}

function getHighComponents(rankedComponents) {
    const centroid = Math.floor(rankedComponents[rankedComponents.length - 1].rank / 2);
    let idx = 1;
    for (const c of rankedComponents) {
        if (c.rank >= centroid) {
            break;
        }
        idx++;
    }
    return rankedComponents.slice(0, idx);
}

function getMatches(highHitComponents, highMillisComponents) {
    const highMillisComponentsMap = mapFromArray(highMillisComponents);
    const matches = [];
    for (const hitComponent of highHitComponents) {
        const millisComponent = highMillisComponentsMap[hitComponent.key];
        if (millisComponent != null) {
            matches.push(createMatchResult(hitComponent, millisComponent));           
        }
    }
    return matches;
}

function mapFromArray(components) {
    const map = {};
    for (const c of components) {
        map[c.key] = c;
    }
    return map;
}

function createMatchResult(hitComponent, millisComponent) {
    return {
        key: hitComponent.key,
        hits: hitComponent.millis.length,
        millis: hitComponent.millisSum / hitComponent.millis.length, 
        rankHits: hitComponent.rank,
        rankMillis: millisComponent.rank,
    };
}