//getting information from db - calling server side function by create fake call
DataRetriever = function() {
    this.getAllElements = function() {
        var result = [];
        $.ajax({
          url: '/getE',
          type: 'GET',
          async: false,
          success: function(data) {
            console.log("Data received");
            result = data;
          }
        });
        return result;
    }

    this.getElementGroup = function(property) {
        var result = [];
        $.ajax({
          url: '/getP',
          type: 'GET',
          data: {'property': property},
          async: false,
          success: function(data) {
            console.log("Property received");
            result = data;
          }
        });
        return result;
    }

    this.getElementCrystalStructure = function() {
        var result = [];
        $.ajax({
            url: '/getCTs',
            type: 'GET',
            async: false,
            success: function(data) {
                result = data;
            }
        });
        return result;
    }

    this.getECTName = function(ctId) {
        var result = {};
        $.ajax({
            url: '/getCT',
            type: 'GET',
            data: {'id': ctId},
            async: false,
            success: function(data) {
                result = data;
            }
        });
        return result;
    }

    this.getCN = function(catId) {
        var result = {};
        $.ajax({
            url: '/getCN',
            type: 'GET',
            data: {'id': catId},
            async: false,
            success: function(data) {
                result = data;
            }
        });
        return result;
    }

    this.getCat = function(catId) {
        var result = {};
        $.ajax({
            url: '/getCat',
            type: 'GET',
            data: {'id': catId},
            async: false,
            success: function(data) {
                result = data;
            }
        });
        return result;
    }

    this.getLesson = function(lessonName) {
        var result = {};
        $.ajax({
            url: '/getL',
            type: 'GET',
            data: {'name': lessonName},
            async: false,
            success: function(data) {
                result = data;
            }
        });
        return result;
    }

    this.getAllLessons = function() {
        var result = [];
        $.ajax({
          url: '/getLs',
          type: 'GET',
          async: false,
          success: function(data) {
            console.log("Data received");
            result = data;
          }
        });
        return result;
    }

    this.checkFileExist = function(filePath) {
        var result = [];
        $.ajax({
          url: filePath,
          async: false,
          success: function(data) {
            result = true;
            },
            error: function(data) {
                result = false;
            }
        });
        return result;
    }
}
