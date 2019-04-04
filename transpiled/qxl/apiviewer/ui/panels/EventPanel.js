(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qxl.apiviewer.ui.panels.InfoPanel": {
        "construct": true,
        "require": true
      },
      "qxl.apiviewer.dao.Event": {},
      "qx.util.StringBuilder": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);qx.Class.define("qxl.apiviewer.ui.panels.EventPanel", {

    extend: qxl.apiviewer.ui.panels.InfoPanel,

    construct: function construct() {
      qxl.apiviewer.ui.panels.InfoPanel.constructor.call(this, "Events", "qxl/apiviewer/image/event18.gif");
    },

    members: {

      /**
       * @Override
       */
      canDisplayItem: function canDisplayItem(dao) {
        return dao instanceof qxl.apiviewer.dao.Event;
      },

      _canShowInherited: function _canShowInherited() {
        return true;
      },

      getPanelItemObjects: function getPanelItemObjects(daoClass, showInherited) {
        var arr = daoClass.getEvents();
        if (showInherited) arr = arr.concat(daoClass.getMixinEvents());
        return arr;
      },

      /**
       * Checks whether an event has details.
       *
       * @param node {Map} the doc node of the event.
       * @param currentClassDocNode {Map} the doc node of the currently displayed class
       * @return {Boolean} whether the event has details.
       */
      itemHasDetails: function itemHasDetails(node, currentClassDocNode) {
        return node.getClass() != currentClassDocNode || // event is inherited
        node.getSee().length > 0 || node.getErrors().length > 0 || qxl.apiviewer.ui.panels.InfoPanel.descriptionHasDetails(node);
      },

      getItemTypeHtml: function getItemTypeHtml(node) {
        return qxl.apiviewer.ui.panels.InfoPanel.createTypeHtml(node, "var");
      },

      getItemTitleHtml: function getItemTitleHtml(node) {
        return qxl.apiviewer.ui.panels.InfoPanel.setTitleClass(node, node.getName());
      },

      /**
       * Creates the HTML showing the information about an event.
       *
       * @param node {Map} the doc node of the event.
       * @param currentClassDocNode {Map} the doc node of the currently displayed class
       * @param showDetails {Boolean} whether to show the details.
       * @return {String} the HTML showing the information about the event.
       */
      getItemTextHtml: function getItemTextHtml(node, currentClassDocNode, showDetails) {
        // Add the description
        var textHtml = new qx.util.StringBuilder(qxl.apiviewer.ui.panels.InfoPanel.createDescriptionHtml(node, node.getClass(), showDetails));

        if (showDetails) {
          textHtml.add(qxl.apiviewer.ui.panels.InfoPanel.createInheritedFromHtml(node, currentClassDocNode));
          textHtml.add(qxl.apiviewer.ui.panels.InfoPanel.createSeeAlsoHtml(node));
          textHtml.add(qxl.apiviewer.ui.panels.InfoPanel.createErrorHtml(node, currentClassDocNode));
          textHtml.add(qxl.apiviewer.ui.panels.InfoPanel.createDeprecationHtml(node, "event"));
        }

        return textHtml.get();
      }

    }

  });
  qxl.apiviewer.ui.panels.EventPanel.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=EventPanel.js.map?dt=1554385339208