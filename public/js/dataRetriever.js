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
}
