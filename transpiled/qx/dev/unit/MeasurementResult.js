(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);qx.Class.define("qx.dev.unit.MeasurementResult", {

    extend: Object,

    /**
     *
     * @param message {String} Description
     * @param iterations {Number} Amount of times the tested code was executed
     * @param ownTime {Number} Elapsed JavaScript execution time
     * @param renderTime {Number} Elapsed DOM rendering time
     */
    construct: function construct(message, iterations, ownTime, renderTime) {
      this.__message = message;
      this.__iterations = iterations;
      this.__ownTime = ownTime;
      this.__renderTime = renderTime;
    },

    members: {
      __message: null,
      __iterations: null,
      __ownTime: null,
      __renderTime: null,

      /**
       * Returns the stored data as a map.
       * @return {Map} The stored data.
       */
      getData: function getData() {
        return {
          message: this.__message,
          iterations: this.__iterations,
          ownTime: this.__ownTime,
          renderTime: this.__renderTime
        };
      },

      /**
       * Returns a readable summary of this result
       *
       * @return {String} Result summary
       */
      toString: function toString() {
        return ["Measured: " + this.__message, "Iterations: " + this.__iterations, "Time: " + this.__ownTime + "ms", "Render time: " + this.__renderTime + "ms"].join("\n");
      }
    }
  });
  qx.dev.unit.MeasurementResult.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=MeasurementResult.js.map?dt=1554385318623