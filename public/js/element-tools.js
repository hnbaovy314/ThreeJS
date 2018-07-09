ElementTools = function () {
    const orbit = ['1s', '2s', '2p', '3s', '3p', '3d', '4s', '4p', '4d', '4f', '5s', '5p',
                '5d', '5f', '6s', '6p', '6d', '7s', '7p'];
    const dataRetriever = new DataRetriever();

    this.clearDiv = function(divId) {
        var div = document.getElementById(divId);
        div.innerHTML = '';
    }

    //Load image for each image in detail page
    this.getElementImg = function(divId, atomicNumber) {
        var div = document.getElementById(divId);
        var imgWrapper = document.createElement('div');
        var img = document.createElement('img');

        imgWrapper.setAttribute('id', 'element-info-img');
        if (dataRetriever.checkFileExist(`./img/elements/${atomicNumber}.jpg`)) {
            imgWrapper.setAttribute('class', 'img-wrapper');
            img.setAttribute('id', 'element-img');
            img.setAttribute('src', `./img/elements/${atomicNumber}.jpg`);
        }
        else {
            imgWrapper.setAttribute('class', 'svg-image');
            img.setAttribute('src', './img/ct/unk.svg');
        }


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

    this.loadBGM = function(link){
        document.write('<audio loop autoplay="autoplay">');
        document.write('<source src="'+link+'" type="audio/mpeg">');
        document.write('<!--[if lt IE 9]>');
        document.write('<bgsound src="'+link+'" loop="100">');
        document.write('<![endif]-->');
        document.write('</audio>');
    }

    this.calcElectronConf = function(z, eConf) {
      var eConfig = '';
      for (var i=0; i < eConf.length; i++){
          eConfig = eConfig.concat(orbit[i], eConf[i].toString(), ' ');
      }
      if (z <= 10) {
          return eConfig;
      }
      else if (z > 10 & z <= 18){
        eConfig = eConfig.replace('1s2 2s2 2p6 ', '[Ne]');
      }
      else if (z > 18 & z <= 36){
        eConfig = eConfig.replace('1s2 2s2 2p6 3s2 3p6 ', '[Ar]');
      }
      else if (z > 36 & z <= 54){
        eConfig = eConfig.replace('1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 ', '[Kr]');
      }
      else if (z > 54 & z <= 86){
        var f4 = eConfig.match(/4f[1-9]+/);
        eConfig = eConfig.replace(/1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10[a-z 1-9]+5s2 5p6/, '[Xe] ');
        eConfig = eConfig.slice(0, 5) + f4 + eConfig.slice(5);
      }
      else {
        var f5 = eConfig.match(/5f[1-9]+/)
        eConfig = eConfig.replace(/1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 4f14 5s2 5p6 5d10[a-z 1-9]+6s2 6p6/, '[Rn] ');
        eConfig = eConfig.slice(0, 5) + f5 + eConfig.slice(5);
      }

      return eConfig;
    }


}
