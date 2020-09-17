let fs = require('fs');
let readline = require('readline');

const Q1 = 'q1', Q2 = 'q2', Q3 = 'q3', Q4 = 'q4';

exports.setFs = function(_fs) {
    fs = _fs; 
}

exports.setReadline = function(_readline) {
    readline = _readline; 
}

exports.getMatrix = async function(filePath, signatureRegex) {
    const components = await getComponentsFromLogs(filePath, signatureRegex);
    const rankedComponentsByHits = rankComponents(getComponentsSortedDescByHits(components), hitsExtractor);
    const rankedComponentsByMillis = rankComponents(getComponentsSortedDescByMillis(components), millisExtractor);

    if (rankedComponentsByHits.length === 0 || rankedComponentsByMillis === 0) {
        return initQuadrants();
    }
    
    return getQuadrants(rankedComponentsByHits, rankedComponentsByMillis);
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

function initQuadrants() {
    return { [Q1]: [], [Q2]: [], [Q3]: [], [Q4]: [], centroid: {} };
}

function hitsExtractor(c) {
    return c.millis.length;
}

function millisExtractor(c) {
    return c.millisSum / c.millis.length;
}

function getQuadrants(rankedComponentsByHits, rankedComponentsByMillis) {
    const quadrants = initQuadrants();
    quadrants.centroid = calculateCentroid(rankedComponentsByHits, rankedComponentsByMillis);
    const rankedComponentsByMillisMap = arrayToMap(rankedComponentsByMillis);
    for (const rankedComponentByHit of rankedComponentsByHits) {
        const mergedComponent = mergeComponents(
            rankedComponentByHit, 
            rankedComponentsByMillisMap[rankedComponentByHit.key],
            quadrants.centroid
        );
        quadrants[mergedComponent.quadrant].push(mergedComponent);
    }
    return quadrants;
}

function calculateCentroid(rankedComponentsByHits, rankedComponentsByMillis) {
    return {
        hitsRank: Math.ceil(rankedComponentsByHits[rankedComponentsByHits.length - 1].rank / 2),
        millisRank: Math.ceil(rankedComponentsByMillis[rankedComponentsByMillis.length - 1].rank / 2)
    };
}

function arrayToMap(components) {
    const map = {};
    for (const c of components) {
        map[c.key] = c;
    }
    return map;
}

function mergeComponents(hitComponent, millisComponent, centroid) {
    return {
        key: hitComponent.key,
        hits: hitComponent.millis.length,
        millis: hitComponent.millisSum / hitComponent.millis.length, 
        hitsRank: hitComponent.rank,
        millisRank: millisComponent.rank,
        quadrant: calculateQuadrant(hitComponent, millisComponent, centroid)
    };
}

function calculateQuadrant(hitComponent, millisComponent, centroid) {
    if (hitComponent.rank <= centroid.hitsRank && millisComponent.rank <= centroid.millisRank)
        return Q1;
    else if (hitComponent.rank <= centroid.hitsRank && millisComponent.rank > centroid.millisRank)
        return Q2;
    else if (hitComponent.rank > centroid.hitsRank && millisComponent.rank > centroid.millisRank)
        return Q3;
    else 
        return Q4;
}