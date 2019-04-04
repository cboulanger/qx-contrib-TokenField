(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);qx.Class.define("tokenfield.Cache", {
    extend: qx.core.Object,
    properties: {
      maxSize: {
        init: 50,
        event: "changeMaxSize"
      }
    },
    construct: function construct(max_size) {
      if (max_size) {
        this.setMaxSize(50);
      }
      this._data = {};
      this._size = 0;
    },
    members: {
      /**
       * TODOC
       *
       * @return {void}
       */
      flush: function flush() {
        this._data = {};
        this._size = 0;
      },

      /**
       * TODOC
       *
       * @param query {var} TODOC
       * @param results {var} TODOC
       * @return {void}
       */
      add: function add(query, results) {
        if (this._size > this.getMaxSize()) {
          this.flush();
        }
        if (!this._data[query]) {
          this._size++;
        }
        this._data[query] = results;
      },

      /**
       * TODOC
       *
       * @param query {var} TODOC
       * @return {var} TODOC
       */
      get: function get(query) {
        return this._data[query];
      }
    }
  });
  tokenfield.Cache.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Cache.js.map?dt=1554385338299