var unit1 = {
    0: { // Step of the unit
        type: 'theory',
        content: {
            0:  {
                type: 'pure-text',
                content: '<p>Welcome to your first lesson. In this lesson, we will learn about bla bla bla...</p>'
            },
            1:  {
                type: 'pure-text',
                content: "<p>Temporarily turn off the tab and try doing an experiment. There will be instructions for you to follow!</p>"
            }
        }
    },
    1: {
        type: 'experiment',
        content: {
            labware: [
                {
                    id: 1,
                    name: "spilled-chemical",
                    chemical: "Mercury",
                    formula: "Hg",
                    type: "metal",
                    texture: "mercury.jpg",
                    form: "liquid",
                    fillScale: -1
                },
                {
                    id: 2,
                    name: "beaker",
                    chemical: "Sulphur",
                    formula: "S",
                    type: "metal",
                    texture: "sulphur.jpg",
                    form: "solid",
                    fillScale: 1/3
                }
            ],
            steps: [
                {
                    action: "pick-up",
                    target: 2,
                    guideText: [
                        "123",
                        "Mashiro best girl!"
                    ]
                },
                {
                    action: "pour",
                    target: 1,
                    guideText: [
                        "456",
                        "Mashiro best girl!"
                    ]
                },
                {
                    action: "reaction",
                    target: 1,
                    reaction: {
                        type: "change-texture",
                        texture: "sulphur.jpg"
                    },
                    guideText: [
                        "789",
                        "Mashiro best girl!"
                    ]
                },
                {
                    action: "clean",
                    target: 1,
                    guideText: [
                        "Abc",
                        "XYZ"
                    ]
                }
            ],
        },
    },
    2: {
        type: 'theory',
        content: {
            0:  {
                type: 'pure-text',
                content: 'Welcome to your first lesson. In this lesson, we will learn about bla bla bla...'
            },
            1:  {
                type: 'pure-text',
                content: "Temporarily turn off the tab and try doing an experiment. There will be instructions for you to follow!"
            }
        }
    },
}
var unit2 = {
    0: { // Step of the unit
        type: 'theory',
        content: {
            0:  {
                    type: 'pure-text',
                    content: 'Welcome to your first lesson. In this lesson, we will learn about bla bla bla...'
                },
            1:  {
                type: 'pure-text',
                content: "Temporarily turn off the tab and try doing an experiment. There will be instructions for you to follow!"
            }
        }
    },
    1: {
        type: 'experiment',
        content: {
            combine: [1, 2, 3],
            tube: [1, 2],
            stand: [1],
            base: [3],
            labware: [
                {
                    id: 1,
                    name: "test-tube",
                    chemical: "Kali Pemanganat",
                    formula: "K2MnO4",
                    type: "salt",
                    texture: "purple.jpg",
                    form: "liquid",
                    corked: true,
                    placed: "horizontal",
                    reversed: false,
                    fillScale: 1/6
                },
                {
                    id: 2,
                    name: "test-tube",
                    chemical: "Water",
                    formula: "H2O",
                    type: "liquid",
                    texture: "water.jpg",
                    form: "liquid",
                    placed: "vertical",
                    reversed: true,
                    fillScale: 1/2
                },
                {
                    id: 3,
                    name: "burner",
                    target: 1
                },
            ],
            steps: [
                {
                    action: "light-burner",
                    target: 3,
                    guideText: [
                        "Click at the burner to light it up"
                    ]
                },
                {
                    action: "reaction",
                    target: 2,
                    reaction: {
                        type: "evaporate"
                    },
                    guideText: [
                        "789",
                        "Mashiro best girl!"
                    ]
                }
            ],
        },
    },
    2: {
        type: 'theory',
        content: {
            0:  {
                type: 'pure-text',
                content: 'Welcome to your first lesson. In this lesson, we will learn about bla bla bla...'
            },
            1:  {
                type: 'pure-text',
                content: "Temporarily turn off the tab and try doing an experiment. There will be instructions for you to follow!"
            }
        }
    },
}

UnitLoop = function(camera, controls, labScene, labGuide) {
    
    this.camera = camera;

    this.controls = controls;

    this.labScene = labScene;

    this.labGuide = labGuide;

    this.readyForNextStep = false;

    this.unit1 = function(event) {
        event.preventDefault();

        scope.labGuide.moveToDesk();
        scope.labGuide.raycaster.prevPos = "lab-desk";

        currentUnit = unit1;
        startUnit('Unit 1');
    }

    this.unit2 = function(event) {
        event.preventDefault();

        scope.labGuide.moveToDesk();
        scope.labGuide.raycaster.prevPos = "lab-desk";

        currentUnit = unit2;
        startUnit('Unit 2');
    }

    this.unit3 = function(event) {
        event.preventDefault();

        scope.labGuide.moveToDesk();
        scope.labGuide.raycaster.prevPos = "lab-desk";

        currentUnit = unit3;
        startUnit('Unit 3');
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
    }

    this.reset = function() {
        running = false;
        currentUnit = null;
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
                    scope.labScene.reset();
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
                    scope.labScene.addLabware(currentStep.content);
                    scope.labGuide.raycaster.enableInteractingWithLabware(currentStep.content);

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

    function startUnit(unit) {
        running = true;
        step = 0;
        totalStep = Object.keys(currentUnit).length;
        stepTextContent = [];
        stepTextPage = 0;
        needUpdate = true;
        gtabContentHeader.innerHTML = '<h4>' + unit + '</h4>';
        gtabContentBody.innerHTML = '';
        document.getElementById('gtab-back-to-menu').style.pointerEvents = "auto";
        document.getElementById('gtab-back-to-menu').style.opacity = 1;
    }
}