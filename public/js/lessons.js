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
                content: 'AAAAAAAAAAAAAAAA'
            },
            1:  {
                type: 'pure-text',
                content: "AAAAAAAAAAAAAAAAAAA"
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
                    form: "solid",
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
                    texture: "colorless.jpg",
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
var unit3 = {
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
                    form: "solid",
                    corked: true,
                    placed: "horizontal",
                    reversed: false,
                    fillScale: 1/6
                },
                {
                    id: 2,
                    name: "flask",
                    chemical: "Water",
                    formula: "H2O",
                    type: "liquid",
                    texture: "colorless.jpg",
                    form: "liquid",
                    placed: "vertical",
                    reversed: false,
                    fillScale: 1/3
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

Lessons = function(labGuide) {

    this.labGuide = labGuide;

    this.readyForNextStep = false;

    this.listUnit = function() {
        document.getElementById("gtab-content-body").innerHTML = '<ul><li><a id="unit-1" href="javascript:void(0)">Unit 1</a></li><li><a id="unit-2" href="javascript:void(0)">Unit 2</a></li><li><a id="unit-3" href="javascript:void(0)">Unit 3</a></li></ul>';
        document.getElementById('unit-1').addEventListener('click', getUnit1, false);
        document.getElementById('unit-2').addEventListener('click', getUnit2, false);
        document.getElementById('unit-3').addEventListener('click', getUnit3, false);
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

        document.getElementById('gtab-back-to-menu').addEventListener("click", function(event) {
            event.preventDefault();

            reset();
            scope.labGuide.getMainMenu('lessons');
        })

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

    function getUnit1(event) {
        event.preventDefault();

        scope.labGuide.moveToDesk();
        scope.labGuide.prevPos = "lab-desk";

        currentUnit = unit1;
        startUnit('Unit 1');
    }

    function getUnit2(event) {
        event.preventDefault();

        scope.labGuide.moveToDesk();
        scope.labGuide.prevPos = "lab-desk";

        currentUnit = unit2;
        startUnit('Unit 2');
    }

    function getUnit3(event) {
        event.preventDefault();

        scope.labGuide.moveToDesk();
        scope.labGuide.prevPos = "lab-desk";

        currentUnit = unit3;
        startUnit('Unit 3');
    }

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

    function reset() {
        running = false;
        currentUnit = null;
        scope.labGuide.reset();
    }
}