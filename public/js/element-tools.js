ElementTools = function (PtEventListener, DataRetriever) {
    this.getElementInfo = function (element, divId, eConf) {
        var infoText = document.getElementById(divId);
        var eCT = '';
        if (element.crystalStructure === Array) {
            eCT = '<ul>';
            for (var i=0; i<element.crystalStructure.length; i++) {
                var eCTValue = DataRetriever.getECTName(element.crystalStructure[i]).name;
                eCT = eCT.concat(`<li>${eCTValue}</li>`);
            }
            eCT = eCT.concat('</ul>');
        }
        else {
            eCT = DataRetriever.getECTName(element.crystalStructure).name;
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
            PtEventListener.onCrystalStructure(element.crystalStructure);
        });
    }

    this.clearDiv = function(divId) {
        var div = document.getElementById(divId);
        div.innerHTML = '';
    }

    this.getElementImg = function(divId, atomicNumber) {
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

    // Get individual element
    function getElement(size, element) {
        var group = new THREE.Group();


        // Create canvas and write text on it
        var canvas = document.createElement('canvas');
        var canvasSize = 256;
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        var ctx = canvas.getContext('2d');

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#2c3e50";
        // Atomic Number
        ctx.font = "bold 32pt helvetica";
        ctx.fillText(element.z, canvasSize / 2, canvasSize / 7);
        // Symbol
        ctx.font = "bold 70pt helvetica";
        ctx.fillText(element.symbol, canvasSize / 2, canvasSize / 2);
        // Name
        ctx.font = "bold 28pt helvetica";
        ctx.fillText(element.name, canvasSize / 2, canvasSize / 1.25);
        // Atomic Weight
        ctx.font = "bold 16pt helvetica";
        ctx.fillText(element.atomicWeight, canvasSize / 2, canvasSize / 1.0875);

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        var planeGeometry = new THREE.PlaneBufferGeometry(size, size, size);
        var planeMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true
        });

        var boxGeometry = new THREE.BoxBufferGeometry(size, size, size / 2);
        var boxMaterial = new THREE.MeshBasicMaterial({
            opacity: 0,
            transparent: true,
        });
        var edges = new THREE.EdgesGeometry(boxGeometry);
        var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0x1A1A1A}));
        line.material.depthTest = false;
        line.material.opacity = 0.25;
        line.material.transparent = true;

        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        var box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.name = `box${element.z}`;
        plane.name = `plane${element.z}`;
        box.add(line);

        group.add(plane);
        group.add(box);

        periodicTable.push(box);

        return group;
    }

    // Get periodic table grid
    this.getElementGrid = function(table) {
        var group = new THREE.Group();
        var k = 0;

        for (var i = 0; i < table.length; i++) {
            for (var j = 0; j < table[0].length; j++) {
                if (table[i][j]) {
                    var mesh = getElement(elementBoxSize, elements[table[i][j]-1]);
                    mesh.position.x = j * gridSeparation - (gridSeparation * (table[0].length - 1)) / 2;
                    mesh.position.y = -(i * gridSeparation + elementBoxSize / 2) + (gridSeparation * (table.length - 1)) / 2;
                    group.add(mesh);
                    k += 1;
                }
            }
        }

        group.add(getTableHeader(table[0].length * gridSeparation, gridSeparation * table.length));

        group.position.z = -50;

        tableScene.add(group);

        return group;
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
      if (z > 10 & z <= 18){
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

    // Create orbit layer of eletrons
    this.getElementModelOrbitLayer = function(electronNumber, radius, tilt, z) {
        var orbitContainer = new THREE.Object3D();
        orbitContainer.rotation.x = tilt;

        var orbit = new THREE.Object3D();
        var mergedGeometry = new THREE.Geometry();

        var orbitGeometry = new THREE.CircleGeometry(radius, 100);
        orbitGeometry.vertices.shift();
        var line = new THREE.LineSegments(orbitGeometry, new THREE.LineBasicMaterial({color: 0x1A1A1A}));
        line.material.depthTest = false;
        line.material.transparent = true;

        var electronGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        var electronMaterial = new THREE.MeshBasicMaterial({
            color: 0x1A1A1A,
        });

        var angle = 2 * Math.PI / electronNumber;
        var count = 0;
        for (var i = 0; i < electronNumber; i++) {
            var x = Math.cos(angle * count) * radius;
            var y = Math.sin(angle * count) * radius;
            count++;

            electronGeometry.translate(x, y, 0);
            mergedGeometry.merge(electronGeometry);
            electronGeometry.translate(-x, -y, 0);
        }

        var electronMesh = new THREE.Mesh(mergedGeometry, electronMaterial);

        orbit.add(line);
        orbit.add(electronMesh);

        var tween = new TWEEN.Tween(orbit.rotation)
            .to({z: '+' + Math.PI * 8 / radius}, 10000)
            .repeat(Infinity)
            .start();

        orbit.name = 'electron-orbit';
        orbitContainer.add(orbit);

        meshArr.push(line);
        meshArr.push(electronMesh);

        return orbitContainer;
    }

    
}
