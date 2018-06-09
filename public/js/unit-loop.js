var demoUnit = {
    0: {
        type: 'text',
        content: {
            0: [
                {
                    type: 'pure-text',
                    content: 'Welcome to your first lesson. In this lesson, we will learn about bla bla bla...'
                },
                {
                    type: 'option',
                    content: ['Mashiro is handsome', "Mashiro is beautiful", "Mashiro is gorgeous"]
                }
            ],
            1: [
                {
                    type: 'pure-text',
                    content: "Bla bla bla"
                }
            ]
        }
    },
    1: {
        type: 'experiment'
    }
}

UnitLoop = function(camera, controls, raycaster, labScene) {
    
    this.camera = camera;

    this.controls = controls;

    this.labScene = labScene;

    this.raycaster = raycaster;

    this.init = function() {
        document.getElementById("gtab-pagination-left").addEventListener("click", function(event) {
            event.preventDefault();

            stepTextPage -= 1;
            if (stepTextPage < 0) {
                stepTextPage = 0;
            }

            // document.getElementById("gtab-pagination-page").innerHTML = page + ' / ' + guideTexts.length;
            gtabContentBody.innerHTML = stepTextContent[stepTextPage];
        });

        document.getElementById("gtab-pagination-right").addEventListener("click", function(event) {
            event.preventDefault();

            stepTextPage += 1;
            if (stepTextPage > stepTextContent.length - 1) {
                stepTextPage = stepTextContent.length - 1;
            }

            // document.getElementById("gtab-pagination-page").innerHTML = page + ' / ' + guideTexts.length;
            gtabContentBody.innerHTML = stepTextContent[stepTextPage];
        });
    }

    this.unit1 = function(event) {
        event.preventDefault();

        scope.raycaster.moveToDesk();
        scope.raycaster.setPrevPos("lab-desk");

        currentUnit = demoUnit;
        startUnit('Unit 1');
    }

    this.update = function() {
        if (needUpdate) {
            switch(currentUnit[step].type) {
                case 'text': {
                    var content = currentUnit[step].content;
                    for (const page in content) {
                        var pageContent = '';
                        for (var i = 0; i < content[page].length; i++) {
                            switch(content[page][i].type) {
                                case 'pure-text': {
                                    pageContent += '<p>' + content[page][i].content + '</p>';

                                    break;
                                }
                                case 'option': {
                                    pageContent += '<p>Hahaha</p>';

                                    break;
                                }
                                default: break;
                            }
                        }

                        console.log(page);
                        stepTextContent.push(pageContent);
                    }

                    if (stepTextContent.length < 2) {
                        document.getElementById('gtab-pagination').style.visibility = "hidden";
                    } else {
                        document.getElementById('gtab-pagination').style.visibility = "visible";
                    }

                    gtabContentBody.innerHTML = stepTextContent[stepTextPage];
                    needUpdate = false;
                    break;
                }
                default: break;
            }
        }
    }

    // Internals
    var scope = this;

    var gtabContentHeader = document.getElementById('gtab-content-header');
    var gtabContentBody = document.getElementById('gtab-content-body');

    var currentUnit, step, stepTextContent = [], stepTextPage = 0, needUpdate = false;

    function startUnit(unit) {
        step = 0;
        stepTextContent = [];
        stepTextPage = 0;
        needUpdate = true;
        gtabContentHeader.innerHTML = '<h4>' + unit + '</h4>';
        gtabContentBody.innerHTML = '';
        document.getElementById('gtab-back-to-menu').style.pointerEvents = "auto";
        document.getElementById('gtab-back-to-menu').style.opacity = 1;
    }
}