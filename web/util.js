
module.exports = exports = {
  installObjectExtend: function() {
    Object.prototype.extend = function(obj) {
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          this[i] = obj[i];
        }
      }
      return this;
    };
  },
}
