(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.String": {
        "require": true
      },
      "qx.bom.String": {
        "require": true
      },
      "qxWeb": {
        "defer": "runtime"
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);qx.Bootstrap.define("qx.module.util.String", {
    statics: {
      /**
       * Converts a hyphenated string (separated by '-') to camel case.
       *
       * @attachStatic {qxWeb, string.camelCase}
       * @param str {String} hyphenated string
       * @return {String} camelcase string
       */
      camelCase: function camelCase(str) {
        return qx.lang.String.camelCase.call(qx.lang.String, str);
      },

      /**
       * Converts a camelcased string to a hyphenated (separated by '-') string.
       *
       * @attachStatic {qxWeb, string.hyphenate}
       * @param str {String} camelcased string
       * @return {String} hyphenated string
       */
      hyphenate: function hyphenate(str) {
        return qx.lang.String.hyphenate.call(qx.lang.String, str);
      },

      /**
       * Convert the first character of the string to upper case.
       *
       * @attachStatic {qxWeb, string.firstUp}
       * @signature function(str)
       * @param str {String} the string
       * @return {String} the string with an upper case first character
       */
      firstUp: qx.lang.String.firstUp,

      /**
       * Convert the first character of the string to lower case.
       *
       * @attachStatic {qxWeb, string.firstLow}
       * @signature function(str)
       * @param str {String} the string
       * @return {String} the string with a lower case first character
       */
      firstLow: qx.lang.String.firstLow,

      /**
       * Check whether the string starts with the given substring.
       *
       * @attachStatic {qxWeb, string.startsWith}
       * @signature function(fullstr, substr)
       * @param fullstr {String} the string to search in
       * @param substr {String} the substring to look for
       * @return {Boolean} whether the string starts with the given substring
       */
      startsWith: function startsWith(fullstr, substr) {
        return fullstr.startsWith(substr);
      },

      /**
       * Check whether the string ends with the given substring.
       *
       * @attachStatic {qxWeb, string.endsWith}
       * @signature function(fullstr, substr)
       * @param fullstr {String} the string to search in
       * @param substr {String} the substring to look for
       * @return {Boolean} whether the string ends with the given substring
       */
      endsWith: function endsWith(fullstr, substr) {
        return fullstr.endsWith(substr);
      },

      /**
       * Escapes all chars that have a special meaning in regular expressions.
       *
       * @attachStatic {qxWeb, string.escapeRegexpChars}
       * @signature function(str)
       * @param str {String} the string where to escape the chars.
       * @return {String} the string with the escaped chars.
       */
      escapeRegexpChars: qx.lang.String.escapeRegexpChars,

      /**
       * Escapes the characters in a <code>String</code> using HTML entities.
       * Supports all known HTML 4.0 entities, including funky accents.
       *
       * @attachStatic {qxWeb, string.escapeHtml}
       * @signature function(str)
       * @param str {String} the String to escape
       * @return {String} a new escaped String
       */
      escapeHtml: qx.bom.String.escape
    },

    defer: function defer(statics) {
      qxWeb.$attachAll(this, "string");
    }
  });
  qx.module.util.String.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=String.js.map?dt=1554385324493