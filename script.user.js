// ==UserScript==
// @name         RR Region Cost
// @namespace    http://tampermonkey.net/
// @version      1.0.0
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

(function() {
    'use strict';

    window.addEventListener('hashchange', e => {
        checkForUrl(e.newURL);
    });
})();

function checkForUrl(url) {
    const URL = url.match(/map\/details\/\d+/);
    if(URL) {
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
        console.clear();
        const res = calcResources();
        let cost = res.money;
        cost += await getMarketPrice(INDEX_GOLD) * res.gold;
        cost += await getMarketPrice(INDEX_OIL) * res.oil;
        cost += await getMarketPrice(INDEX_ORE) * res.ore;
        cost += await getMarketPrice(INDEX_URANIUM) * res.uranium;
        cost += await getMarketPrice(INDEX_DIAMONDS) * res.diamonds;
        console.log(`Итоговая стоимость региона: ${(cost / 1e+12).toFixed(3)}T`);
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
    switch(index) {
        case INDEX_OIL:
            name = 'нефти';
            break;
        case INDEX_ORE:
            name = 'руды';
            break;
        case INDEX_URANIUM:
            name = 'урана';
            break;
        case INDEX_DIAMONDS:
            name = 'алмазов';
            break;
        case INDEX_GOLD:
            name = 'золота';
            break;
    }
    console.log(`Рыночная цена ${name}: ${average}`);
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

    const hospital = wrapper.match(/Госпиталь\: (?<hospital>\d+)/).groups.hospital;
    const mbase = wrapper.match(/Военная база\: (?<mbase>\d+)/).groups.mbase;
    const school = wrapper.match(/Школа\: (?<school>\d+)/).groups.school;
    const missile = wrapper.match(/ПВО\: (?<missile>\d+)/).groups.missile;
    const port = wrapper.match(/Порт\: (?<port>\d+)/) ? wrapper.match(/Порт\: (?<port>\d+)/).groups.port : 0;
    const electro = wrapper.match(/Электростанция\: (?<electro>\d+)/).groups.electro;
    const cosmo = wrapper.match(/Космодром\: (?<cosmo>\d+)/).groups.cosmo;
    const aero = wrapper.match(/Аэропорт\: (?<aero>\d+)/).groups.aero;
    const hfound = wrapper.match(/Жилой фонд\: (?<hfound>\d+)/).groups.hfound;

    console.log(`Постройки региона: Госпиталь ${hospital}, Военная база ${mbase}, Школа ${school}, ПВО ${missile}, Порт ${port}, Электростанция ${electro}, Космодром ${cosmo}, Аэропорт ${aero}, Жилой фонд ${hfound}`);

    for (let i = 1; i <= hospital; i++) {
        money += Math.round(Math.pow(i*300, 1.5));
        gold += Math.round(Math.pow(i*2160, 1.5));
        oil += Math.round(Math.pow(i*160, 1.5));
        ore += Math.round(Math.pow(i*90, 1.5));
    }

    for (let i = 1; i <= mbase; i++) {
        money += Math.round(Math.pow(i*300, 1.5));
        gold += Math.round(Math.pow(i*2160, 1.5));
        oil += Math.round(Math.pow(i*160, 1.5));
        ore += Math.round(Math.pow(i*90, 1.5));
    }

    for (let i = 1; i <= school; i++) {
        money += Math.round(Math.pow(i*300, 1.5));
        gold += Math.round(Math.pow(i*2160, 1.5));
        oil += Math.round(Math.pow(i*160, 1.5));
        ore += Math.round(Math.pow(i*90, 1.5));
    }

    for (let i = 1; i <= missile; i++) {
        money += Math.round(Math.pow(i*1000, 1.5));
        gold += Math.round(Math.pow(i*180, 1.5));
        oil += Math.round(Math.pow(i*10, 1.5));
        ore += Math.round(Math.pow(i*10, 1.5));
        diamonds += Math.round(Math.pow(i*10, 0.7));
    }

    for (let i = 1; i <= port; i++) {
        money += Math.round(Math.pow(i*1000, 1.5));
        gold += Math.round(Math.pow(i*180, 1.5));
        oil += Math.round(Math.pow(i*10, 1.5));
        ore += Math.round(Math.pow(i*10, 1.5));
        diamonds += Math.round(Math.pow(i*10, 0.7));
    }

    for (let i = 1; i <= electro; i++) {
        money += Math.round(Math.pow(i*2000, 1.5));
        gold += Math.round(Math.pow(i*90, 1.5));
        oil += Math.round(Math.pow(i*25, 1.5));
        ore += Math.round(Math.pow(i*25, 1.5));
        diamonds += Math.round(Math.pow(i*5, 0.7));
        uranium += Math.round(Math.pow(i*20, 1.5));
    }

    for (let i = 1; i <= cosmo; i++) {
        money += Math.round(Math.pow(i*6000, 1.5));
        gold += Math.round(Math.pow(i*180, 1.5));
        oil += Math.round(Math.pow(i*30, 1.5));
        ore += Math.round(Math.pow(i*25, 1.5));
        diamonds += Math.round(Math.pow(i*10, 0.7));
        uranium += Math.round(Math.pow(i*30, 1.5));
    }

    for (let i = 1; i <= aero; i++) {
        money += Math.round(Math.pow(i*1000, 1.5));
        gold += Math.round(Math.pow(i*180, 1.5));
        oil += Math.round(Math.pow(i*10, 1.5));
        ore += Math.round(Math.pow(i*10, 1.5));
        diamonds += Math.round(Math.pow(i*10, 0.7));
    }

    for (let i = 1; i <= hfound; i++) {
        money += Math.round(Math.pow(i*30, 1.5));
        gold += Math.round(Math.pow(i*216, 1.5));
        oil += Math.round(Math.pow(i*16, 1.5));
        ore += Math.round(Math.pow(i*9, 1.5));
    }

    console.log(`Всего ресурсов затрачено:\nРубли ${(money / 1e+12).toFixed(3)}T\nЗолото ${(gold / 1e+12).toFixed(3)}T\nНефть ${(oil / 1e+9).toFixed(3)}ККК\nРуда ${(ore / 1e+9).toFixed(3)}ККК\nАлмазы ${(diamonds / 1e+3).toFixed(3)}К\nУран ${(uranium / 1e+6).toFixed(3)}КК`);

    return {money: money, gold: gold, oil: oil, ore: ore, uranium: uranium, diamonds: diamonds};
}
