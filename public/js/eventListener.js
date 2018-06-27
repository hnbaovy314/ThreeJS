import {getElementImg} from './element-tools.js';
import {getCat} from './dataRetriever.js';

export function onElementImg(atomicNumber, divId) {
    var subInfoDiv = document.getElementById(divId);
    subInfoDiv.innerHTML = '';
    getElementImg('left-sub-info', atomicNumber);
}

export function onCrystalStructure(crystalStructure, divId) {
    var subInfoDiv = document.getElementById(divId);
    subInfoDiv.innerHTML = '';

    var svgWrapper = document.createElement('div');
    svgWrapper.setAttribute('id', 'element-info-structure');
    svgWrapper.setAttribute('class', 'svg-wrapper');

    if(crystalStructure === Array) {
        var svgImg1 = document.createElement('img');
        var svgImg2 = document.createElement('img');
        var switchBtn = document.createElement('button');

        svgImg1.setAttribute('class', 'svg-image');
        svgImg1.setAttribute('id', 'svg-image1');
        svgImg1.setAttribute('src', `./img/ct/${crystalStructure[0]}.svg`);
        svgImg2.setAttribute('class', 'svg-image');
        svgImg2.setAttribute('id', 'svg-image2');
        svgImg2.setAttribute('src', `./img/ct/${crystalStructure[1]}.svg`);
        svgWrapper.appendChild(svgImg1);
        svgWrapper.appendChild(svgImg2);

        svgImg2.style.visibility = 'hidden';
        switchBtn.setAttribute('id', 'CT-switch-btn');
        switchBtn.innerText = '&alpha;';
        switchBtn.addEventListener('click', function() {
            if (this.innerText == '&alpha;') {
                this.innerText = '&beta;';
                switchImage('svg-image1', 'svg-image2');
            } else {
                this.innerText = '&alpha;';
                switchImage('svg-image2', 'svg-image1');
            }
        });
    }
    else {
        var svgImg = document.createElement('img');
        svgImg.setAttribute('class', 'svg-image');
        svgImg.setAttribute('src', `./img/ct/${crystalStructure}.svg`);
        svgWrapper.appendChild(svgImg);
    }

    subInfoDiv.appendChild(svgWrapper);
}

export function onCategories(catId, divId) {
    var subInfoDiv = document.getElementById(divId);
    subInfoDiv.innerHTML = '';

    var textWrapper = document.createElement('div');
    textWrapper.setAttribute('id', 'element-info-categories');
    textWrapper.setAttribute('class', 'text-wrapper');

    var category = getCat(catId);
    textWrapper.innerHTML = `
        <h3>${category.name} (${category.nameEn})</h3>
        <p>${category.description}</p>
    `

    subInfoDiv.appendChild(textWrapper);
}

//id1 is to hide, id2 is to show
function switchImage(id1, id2) {
    var img1 = document.getElementById(id1);
    var img2 = document.getElementById(id2);

    id1.style.visibility = 'hidden';
    id2.style.visibility = 'visible';
}
