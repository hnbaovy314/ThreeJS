//getting information from db - calling server side function by create fake call
export function getAllElements() {
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

export function getElementGroup(property) {
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

export function getElementCrystalStructure() {
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

export function getECTName(ctId) {
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

export function getCat(catId) {
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

export function getCatName(catId) {
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
