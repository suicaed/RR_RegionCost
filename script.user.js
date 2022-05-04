// ==UserScript==
// @name         RR Region Cost
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description
// @author       suicaed
// @updateURL    https://github.com/suicaed/RR_RegionCost/raw/main/script.user.js
// @downloadURL  https://github.com/suicaed/RR_RegionCost/raw/main/script.user.js
// @match        http*://*.rivalregions.com/
// @grant        none

// ==/UserScript==

const INDEX_GOLD = 100;
const INDEX_OIL = 3;
const INDEX_ORE = 4;
const INDEX_URANIUM = 11;
const INDEX_DIAMONDS = 15;

let resultTextTemplate = 'RR_RegionCost by suicaed v1.0.1\n\n';
let resultText = 'RR_RegionCost by suicaed v1.0.1\n\n';

(function () {
    'use strict';

    const target = document.getElementById('header_slide_inner');
    const observer = new MutationObserver(mutations => {
        for (let mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                checkForUrl(window.location.href);
            }
        }
    });

    observer.observe(target, { childList: true });
})();

function checkForUrl(url) {
    const URL = url.match(/map\/details\/\d+/);
    if (URL) {
        addButton();
    }
}

function addButton() {
    const wrapper = document.querySelector('.imp.tc.small');
    const btn = document.createElement('span');
    btn.classList = 'tip white pointer dot small';
    btn.textContent = 'Get Price';
    btn.setAttribute('title', '');
    btn.style.color = 'red';
    btn.addEventListener('click', async () => {
        const res = calcResources();
        let cost = res.money;
        resultText += '\n\nResources market price: ';
        cost += await getMarketPrice(INDEX_GOLD) * res.gold;
        cost += await getMarketPrice(INDEX_OIL) * res.oil;
        cost += await getMarketPrice(INDEX_ORE) * res.ore;
        cost += await getMarketPrice(INDEX_URANIUM) * res.uranium;
        cost += await getMarketPrice(INDEX_DIAMONDS) * res.diamonds;

        var text = `Cost of the region: ${(cost / 1e+12).toFixed(3)}T`;
        resultText += `\n\n${text}`;
        const confirmResult = confirm(`${text}\nPress "OK" button to copy extended info to the clipboard.`);
        if (confirmResult) {
            try {
                const clipboardPermition = await navigator.permissions.query({ name: 'clipboard-write' });
                if (clipboardPermition.state === 'granted' || clipboardPermition.state === 'prompt') {
                    try {
                        const writeTextResult = navigator.clipboard.writeText(resultText);
                        if (writeTextResult) {
                            resultText = resultTextTemplate;
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    });

    wrapper.appendChild(btn);
}

async function getMarketPrice(index) {
    const data = await fetch(`https://rivalregions.com/graph/price/0/${index}?c=${window.c_html}`);
    const response = await data.text();
    const result = response.slice(response.indexOf('series'), response.indexOf('negativeColor'));
    const arr = result.slice(result.indexOf('[[') + 1, -3).replace(/\[\d+\, /g, '').split('], ');
    const average = (arr.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / arr.length).toFixed(2);
    let name;
    switch (index) {
        case INDEX_OIL:
            name = 'oil';
            break;
        case INDEX_ORE:
            name = 'ore';
            break;
        case INDEX_URANIUM:
            name = 'uranium';
            break;
        case INDEX_DIAMONDS:
            name = 'diamonds';
            break;
        case INDEX_GOLD:
            name = 'gold';
            break;
    }
    resultText += `\n• ${name}: ${average}`;
    return Number(average);
}

function calcResources() {
    let money = 0;
    let gold = 0;
    let oil = 0;
    let ore = 0;
    let uranium = 0;
    let diamonds = 0;

    const wrapper = document.querySelector('.slide_profile_photo').innerHTML;

    const hospitalMatch = wrapper.match(/Госпиталь\: (?<hospitalCurrent>\d+)(\/)*(?<hospitalReal>\d+)*/);
    const hospitalCount = hospitalMatch?.groups?.hospitalReal || hospitalMatch?.groups?.hospitalCurrent || 0;

    const mbaseMatch = wrapper.match(/Военная база\: (?<mbaseCurrent>\d+)(\/)*(?<mbaseReal>\d+)*/);
    const mbaseCount = mbaseMatch?.groups?.mbaseReal || mbaseMatch?.groups?.mbaseCurrent || 0;

    const schoolMatch = wrapper.match(/Школа\: (?<schoolCurrent>\d+)(\/)*(?<schoolReal>\d+)*/);
    const schoolCount = schoolMatch?.groups?.schoolReal || schoolMatch?.groups?.schoolCurrent || 0;

    const missileMatch = wrapper.match(/ПВО\: (?<missileCurrent>\d+)(\/)*(?<missileReal>\d+)*/);
    const missileCount = missileMatch?.groups?.missileReal || missileMatch?.groups?.missileCurrent || 0;

    const portMatch = wrapper.match(/Порт\: (?<portCurrent>\d+)(\/)*(?<portReal>\d+)*/);
    const portCount = portMatch?.groups?.portReal || portMatch?.groups?.portCurrent || 0;

    const electroMatch = wrapper.match(/Электростанция\: (?<electroCurrent>\d+)(\/)*(?<electroReal>\d+)*/);
    const electroCount = electroMatch?.groups?.electroReal || electroMatch?.groups?.electroCurrent || 0;

    const cosmoMatch = wrapper.match(/Космодром\: (?<cosmoCurrent>\d+)(\/)*(?<cosmoReal>\d+)*/);
    const cosmoCount = cosmoMatch?.groups?.cosmoReal || cosmoMatch?.groups?.cosmoCurrent || 0;

    const aeroMatch = wrapper.match(/Аэропорт\: (?<aeroCurrent>\d+)(\/)*(?<aeroReal>\d+)*/);
    const aeroCount = aeroMatch?.groups?.aeroReal || aeroMatch?.groups?.aeroCurrent || 0;

    const hfoundMatch = wrapper.match(/Жилой фонд\: (?<hfoundCurrent>\d+)(\/)*(?<hfoundReal>\d+)*/);
    const hfoundCount = hfoundMatch?.groups?.hfoundReal || hfoundMatch?.groups?.hfoundCurrent || 0;

    const gasMatch = wrapper.match(/Заправочная станция\: (?<gasCurrent>\d+)(\/)*(?<gasReal>\d+)*/);
    const gasCount = gasMatch?.groups?.gasReal || gasMatch?.groups?.gasCurrent || 0;

    resultText += `Region buildings:\n• hospital ${hospitalCount}\n• military base ${mbaseCount} \n• school ${schoolCount} \n• missile ${missileCount}\n• port ${portCount}\n• powerplant ${electroCount}\n• cosmodrome ${cosmoCount}\n• aeroport ${aeroCount}\n• house found ${hfoundCount}`;

    for (let i = 1; i <= hospitalCount; i++) {
        money += Math.round(Math.pow(i * 300, 1.5));
        gold += Math.round(Math.pow(i * 2160, 1.5));
        oil += Math.round(Math.pow(i * 160, 1.5));
        ore += Math.round(Math.pow(i * 90, 1.5));
    }

    for (let i = 1; i <= mbaseCount; i++) {
        money += Math.round(Math.pow(i * 300, 1.5));
        gold += Math.round(Math.pow(i * 2160, 1.5));
        oil += Math.round(Math.pow(i * 160, 1.5));
        ore += Math.round(Math.pow(i * 90, 1.5));
    }

    for (let i = 1; i <= schoolCount; i++) {
        money += Math.round(Math.pow(i * 300, 1.5));
        gold += Math.round(Math.pow(i * 2160, 1.5));
        oil += Math.round(Math.pow(i * 160, 1.5));
        ore += Math.round(Math.pow(i * 90, 1.5));
    }

    for (let i = 1; i <= missileCount; i++) {
        money += Math.round(Math.pow(i * 1000, 1.5));
        gold += Math.round(Math.pow(i * 180, 1.5));
        oil += Math.round(Math.pow(i * 10, 1.5));
        ore += Math.round(Math.pow(i * 10, 1.5));
        diamonds += Math.round(Math.pow(i * 10, 0.7));
    }

    for (let i = 1; i <= portCount; i++) {
        money += Math.round(Math.pow(i * 1000, 1.5));
        gold += Math.round(Math.pow(i * 180, 1.5));
        oil += Math.round(Math.pow(i * 10, 1.5));
        ore += Math.round(Math.pow(i * 10, 1.5));
        diamonds += Math.round(Math.pow(i * 10, 0.7));
    }

    for (let i = 1; i <= electroCount; i++) {
        money += Math.round(Math.pow(i * 2000, 1.5));
        gold += Math.round(Math.pow(i * 90, 1.5));
        oil += Math.round(Math.pow(i * 25, 1.5));
        ore += Math.round(Math.pow(i * 25, 1.5));
        diamonds += Math.round(Math.pow(i * 5, 0.7));
        uranium += Math.round(Math.pow(i * 20, 1.5));
    }

    for (let i = 1; i <= cosmoCount; i++) {
        money += Math.round(Math.pow(i * 6000, 1.5));
        gold += Math.round(Math.pow(i * 180, 1.5));
        oil += Math.round(Math.pow(i * 30, 1.5));
        ore += Math.round(Math.pow(i * 25, 1.5));
        diamonds += Math.round(Math.pow(i * 10, 0.7));
        uranium += Math.round(Math.pow(i * 30, 1.5));
    }

    for (let i = 1; i <= aeroCount; i++) {
        money += Math.round(Math.pow(i * 1000, 1.5));
        gold += Math.round(Math.pow(i * 180, 1.5));
        oil += Math.round(Math.pow(i * 10, 1.5));
        ore += Math.round(Math.pow(i * 10, 1.5));
        diamonds += Math.round(Math.pow(i * 10, 0.7));
    }

    for (let i = 1; i <= hfoundCount; i++) {
        money += Math.round(Math.pow(i * 30, 1.5));
        gold += Math.round(Math.pow(i * 216, 1.5));
        oil += Math.round(Math.pow(i * 16, 1.5));
        ore += Math.round(Math.pow(i * 9, 1.5));
    }

    resultText += `\n\nAll spent resources:\n• money ${(money / 1e+12).toFixed(3)}T\n• gold ${(gold / 1e+12).toFixed(3)}T\n• oil ${(oil / 1e+9).toFixed(3)}ККК\n• ore ${(ore / 1e+9).toFixed(3)}ККК\n• diamonds ${(diamonds / 1e+3).toFixed(3)}К\n• uranium ${(uranium / 1e+6).toFixed(3)}КК`;

    return { money: money, gold: gold, oil: oil, ore: ore, uranium: uranium, diamonds: diamonds };
}
