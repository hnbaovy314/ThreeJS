import {getECTName} from './dataRetriever.js';
import {onCrystalStructure} from './eventListener.js';
export function getElementInfo(element, divId, eConf) {
    var infoText = document.getElementById(divId);
    var eCT = '';
    if (element.crystalStructure === Array) {
        eCT = '<ul>';
        for (var i=0; i<element.crystalStructure.length; i++) {
            var eCTValue = getECTName(element.crystalStructure[i]).name;
            eCT = eCT.concat(`<li>${eCTValue}</li>`);
        }
        eCT = eCT.concat('</ul>');
    }
    else {
        eCT = getECTName(element.crystalStructure).name;
    }
    var author = '';
    for (var i=0; i < element.discovery.by.length; i++){
        if (i > 0) {
            author = author.concat(' và ');
        }
        author = author.concat(element.discovery.by[i]);
    }

    infoText.innerHTML =
    `<h2>${element.z} - ${element.name}</h2>
    <ul>
    <li>Khối lượng nguyên tử: <b>${element.atomicWeight}</b></li>
    <li>Cấu hình electron: <b>${eConf}</b></li>
    <li>Phân loại: <a href="" id="cat-link">${element.cat}</a></li>
    <li>Trạng thái: ${element.phase}</li>
    <li>Cấu trúc tinh thể: <a href="" id="structure-link">${eCT}</a></li>
    <li>Phát hiện bởi ${author}, ${element.discovery.year}</li>
    </ul>`;

    $('#structure-link').on('click', function(){
        $('.infoBtn-focus').removeClass('infoBtn-focus');
        $('#infoBtn1').addClass('infoBtn-focus');
        onCrystalStructure(element.crystalStructure);
    });
}

export function clearDiv(divId) {
    var div = document.getElementById(divId);
    div.innerHTML = '';
}

export function getElementImg(divId, atomicNumber) {
    var div = document.getElementById(divId);
    var imgWrapper = document.createElement('div');
    var img = document.createElement('img');

    imgWrapper.setAttribute('id', 'element-info-img');
    imgWrapper.setAttribute('class', 'img-wrapper');
    img.setAttribute('id', 'element-img');
    img.setAttribute('src', `./img/elements/${atomicNumber}.jpg`);

    imgWrapper.appendChild(img);
    div.appendChild(imgWrapper);

    var imageHeight, wrapperHeight, overlap, container = $('.image-wrapper');

    function centerImage() {
        imageHeight = container.find('img').height();
        wrapperHeight = container.height();
        overlap = (wrapperHeight - imageHeight) / 2;
        container.find('img').css('margin-top', overlap);
    }

    $(window).on("load resize", centerImage);
}
