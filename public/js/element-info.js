ElementInfo = function(ElementTools) {
    this.addColAndCloseBtn = function() {
        // Add left and right column
        var newElement = document.createElement('div');
        var subInfo = document.createElement('div');
        var infoText = document.createElement('div');
        var subBtn = document.createElement('div');
        var iconArr = [
                '<i class="far fa-image fa-2x"></i>',
                '<i class="fas fa-cubes fa-2x"></i>',
                '<i class="fas fa-list fa-2x"></i>',
                '<i class="fab fa-wikipedia-w fa-2x"></i>'
        ];
        newElement.setAttribute('id', 'ds-left-column');
        subInfo.setAttribute('id', 'left-main-info');
        infoText.setAttribute('id', 'left-info-text');
        subInfo.appendChild(infoText);
        newElement.appendChild(subInfo);
        subInfo = document.createElement('div');
        subInfo.setAttribute('id', 'left-sub-info');
        subBtn.setAttribute('id', 'left-info-btn');
        for (var i=0; i < 4; i++) {
            var btn = document.createElement('span');
            btn.setAttribute('class', 'info-button');
            btn.setAttribute('id', `infoBtn${i}`);
            btn.innerHTML = iconArr[i];
            subBtn.appendChild(btn);
        }

        newElement.appendChild(subBtn);
        newElement.appendChild(subInfo);
        dataScreen.appendChild(newElement);
        // Add close button
        var newElement = document.createElement('div');
        newElement.setAttribute('id', 'ds-close-button');
        newElement.appendChild(document.createElement('b'));
        newElement.appendChild(document.createElement('b'));
        newElement.appendChild(document.createElement('b'));
        newElement.appendChild(document.createElement('b'));
        dataScreen.appendChild(newElement);
    }
}
