Lessons = function(labGuide) {

    this.labGuide = labGuide;

    this.dataRetriever = new DataRetriever();

    var units = this.dataRetriever.getAllLessons();

    this.readyForNextStep = false;

    this.listUnit = function() {
        document.getElementById("gtab-content-body").innerHTML = '';
        document.getElementById("gtab-content-body").innerHTML = '<ul>';

        for (var unit in units) {
            document.getElementById("gtab-content-body").innerHTML += "<li><a id=unit-" + unit + " href='javascript:void(0)'>Unit " + unit + " - " + units[unit].name + "</li>";
        }

        setTimeout(function() {
            for (var unit in units) {
                document.getElementById("unit-" + unit).addEventListener("click", startUnit, false);
            }
        }, 1000);

        document.getElementById("gtab-content-body").innerHTML += '</ul>';
    }

    function testFunc(event) {
        console.log("AAA");
    }

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

            if (stepTextPage == stepTextContent.length - 1) {
                scope.readyForNextStep = true;
            }

            // document.getElementById("gtab-pagination-page").innerHTML = page + ' / ' + guideTexts.length;
            gtabContentBody.innerHTML = stepTextContent[stepTextPage];
        });

        document.getElementById("gtab-back-to-scene").addEventListener("click", scope.labGuide.turnOffGuideTab, false);

        scope.labGuide.getMainMenu('lessons');
    }

    this.checkNextStep = function() {
        if (running && step < totalStep - 1 && scope.readyForNextStep) {
            switch (currentUnit[step].type) {
                case "theory": {
                    step += 1;
                    stepTextPage = 0;
                    stepTextContent = [];
                    needUpdate = true;
                    scope.readyForNextStep = false;
                    scope.labGuide.hideGuideText();

                    break;
                }
                case "experiment": {
                    step += 1;
                    needUpdate = true;
                    scope.readyForNextStep = false;
                    scope.labGuide.reset();

                    break;
                }
                default: break;
            }
        }
    }

    this.update = function() {
        if (running & needUpdate) {
            currentStep = currentUnit[step];
            switch(currentStep.type) {
                case 'theory': {
                    var content = currentStep.content;
                    for (const page in content) {
                        var pageContent = '';
                        switch(content[page].type) {
                            case 'pure-text': {
                                pageContent = content[page].content;

                                break;
                            }
                            case 'option': {
                                pageContent += '<p>Hahaha</p>';

                                break;
                            }
                            default: break;
                        }

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
                case 'experiment': {
                    scope.labGuide.labScene.addLabware(currentStep.content);
                    scope.labGuide.enableInteractingWithLabware(currentStep.content);

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

    var currentUnit, step, totalStep, stepTextContent = [], stepTextPage = 0, needUpdate = false;

    var running = false;

    function startUnit(event) {
        document.getElementById('gtab-back-to-menu').addEventListener("click", function(event) {
            event.preventDefault();

            reset();
            scope.labGuide.getMainMenu('lessons');
        })
        
        gtabContentHeader = document.getElementById('gtab-content-header');
        gtabContentBody = document.getElementById('gtab-content-body');

        scope.labGuide.moveToDesk();
        scope.labGuide.prevPos = "lab-desk";

        var unit = event.target.id.slice(5);
        currentUnit = units[unit].steps;
        running = true;
        step = 0;
        totalStep = Object.keys(currentUnit).length;
        stepTextContent = [];
        stepTextPage = 0;
        needUpdate = true;
        gtabContentHeader.innerHTML = '<h4>Unit ' + unit + ' - ' + units[unit].name + '</h4>';
        gtabContentBody.innerHTML = '';
        document.getElementById('gtab-back-to-menu').style.pointerEvents = "auto";
        document.getElementById('gtab-back-to-menu').style.opacity = 1;
    }

    function reset() {
        running = false;
        currentUnit = null;
        scope.labGuide.reset();
    }
}
