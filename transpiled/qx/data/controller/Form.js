(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.ui.core.ISingleSelection": {},
      "qx.data.marshal.Json": {},
      "qx.data.SingleValueBinding": {},
      "qx.data.controller.Object": {},
      "qx.ui.form.IModelSelection": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);qx.Class.define("qx.data.controller.Form", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],

    /**
     * @param model {qx.core.Object | null} The model to bind the target to. The
     *   given object will be set as {@link #model} property.
     * @param target {qx.ui.form.Form | null} The form which contains the form
     *   items. The given form will be set as {@link #target} property.
     * @param selfUpdate {Boolean?false} If set to true, you need to call the
     *   {@link #updateModel} method to get the data in the form to the model.
     *   Otherwise, the data will be synced automatically on every change of
     *   the form.
     */
    construct: function construct(model, target, selfUpdate) {
      qx.core.Object.constructor.call(this);

      this._selfUpdate = !!selfUpdate;
      this.__bindingOptions = {};

      if (model != null) {
        this.setModel(model);
      }

      if (target != null) {
        this.setTarget(target);
      }
    },

    properties: {
      /** Data object containing the data which should be shown in the target. */
      model: {
        check: "qx.core.Object",
        apply: "_applyModel",
        event: "changeModel",
        nullable: true,
        dereference: true
      },

      /** The target widget which should show the data. */
      target: {
        check: "qx.ui.form.Form",
        apply: "_applyTarget",
        event: "changeTarget",
        nullable: true,
        init: null,
        dereference: true
      }
    },

    members: {
      __objectController: null,
      __bindingOptions: null,

      /**
       * The form controller uses for setting up the bindings the fundamental
       * binding layer, the {@link qx.data.SingleValueBinding}. To achieve a
       * binding in both directions, two bindings are needed. With this method,
       * you have the opportunity to set the options used for the bindings.
       *
       * @param name {String} The name of the form item for which the options
       *   should be used.
       * @param model2target {Map} Options map used for the binding from model
       *   to target. The possible options can be found in the
       *   {@link qx.data.SingleValueBinding} class.
       * @param target2model {Map} Options map used for the binding from target
       *   to model. The possible options can be found in the
       *   {@link qx.data.SingleValueBinding} class.
       */
      addBindingOptions: function addBindingOptions(name, model2target, target2model) {
        this.__bindingOptions[name] = [model2target, target2model];

        // return if not both, model and target are given
        if (this.getModel() == null || this.getTarget() == null) {
          return;
        }

        // renew the affected binding
        var item = this.getTarget().getItems()[name];
        var targetProperty = this.__isModelSelectable(item) ? "modelSelection[0]" : "value";

        // remove the binding
        this.__objectController.removeTarget(item, targetProperty, name);
        // set up the new binding with the options
        this.__objectController.addTarget(item, targetProperty, name, !this._selfUpdate, model2target, target2model);
      },

      /**
       * Creates and sets a model using the {@link qx.data.marshal.Json} object.
       * Remember that this method can only work if the form is set. The created
       * model will fit exactly that form. Changing the form or adding an item to
       * the form will need a new model creation.
       *
       * @param includeBubbleEvents {Boolean} Whether the model should support
       *   the bubbling of change events or not.
       * @return {qx.core.Object} The created model.
       */
      createModel: function createModel(includeBubbleEvents) {
        var target = this.getTarget();

        // throw an error if no target is set
        if (target == null) {
          throw new Error("No target is set.");
        }

        var items = target.getItems();
        var data = {};
        for (var name in items) {
          var names = name.split(".");
          var currentData = data;
          for (var i = 0; i < names.length; i++) {
            // if its the last item
            if (i + 1 == names.length) {
              // check if the target is a selection
              var clazz = items[name].constructor;
              var itemValue = null;
              if (qx.Class.hasInterface(clazz, qx.ui.core.ISingleSelection)) {
                // use the first element of the selection because passed to the
                // marshaler (and its single selection anyway) [BUG #3541]
                itemValue = items[name].getModelSelection().getItem(0) || null;
              } else {
                itemValue = items[name].getValue();
              }
              // call the converter if available [BUG #4382]
              if (this.__bindingOptions[name] && this.__bindingOptions[name][1]) {
                itemValue = this.__bindingOptions[name][1].converter(itemValue);
              }
              currentData[names[i]] = itemValue;
            } else {
              // if its not the last element, check if the object exists
              if (!currentData[names[i]]) {
                currentData[names[i]] = {};
              }
              currentData = currentData[names[i]];
            }
          }
        }

        var model = qx.data.marshal.Json.createModel(data, includeBubbleEvents);
        this.setModel(model);

        return model;
      },

      /**
       * Responsible for syncing the data from entered in the form to the model.
       * Please keep in mind that this method only works if you create the form
       * with <code>selfUpdate</code> set to true. Otherwise, this method will
       * do nothing because updates will be synced automatically on every
       * change.
       */
      updateModel: function updateModel() {
        // only do stuff if self update is enabled and a model or target is set
        if (!this._selfUpdate || !this.getModel() || !this.getTarget()) {
          return;
        }

        var items = this.getTarget().getItems();
        for (var name in items) {
          var item = items[name];
          var sourceProperty = this.__isModelSelectable(item) ? "modelSelection[0]" : "value";

          var options = this.__bindingOptions[name];
          options = options && this.__bindingOptions[name][1];

          qx.data.SingleValueBinding.updateTarget(item, sourceProperty, this.getModel(), name, options);
        }
      },

      // apply method
      _applyTarget: function _applyTarget(value, old) {
        // if an old target is given, remove the binding
        if (old != null) {
          this.__tearDownBinding(old);
        }

        // do nothing if no target is set
        if (this.getModel() == null) {
          return;
        }

        // target and model are available
        if (value != null) {
          this.__setUpBinding();
        }
      },

      // apply method
      _applyModel: function _applyModel(value, old) {

        // set the model to null to reset all items before removing them
        if (this.__objectController != null && value == null) {
          this.__objectController.setModel(null);
        }

        // first, get rid off all bindings (avoids wrong data population)
        if (this.__objectController != null && this.getTarget() != null) {
          var items = this.getTarget().getItems();
          for (var name in items) {
            var item = items[name];
            var targetProperty = this.__isModelSelectable(item) ? "modelSelection[0]" : "value";
            this.__objectController.removeTarget(item, targetProperty, name);
          }
        }

        // set the model of the object controller if available
        if (this.__objectController != null) {
          this.__objectController.setModel(value);
        }

        // do nothing is no target is set
        if (this.getTarget() == null) {
          return;
        } else {
          // if form was validated with errors and model changes
          // the errors should be cleared see #8977
          this.getTarget().getValidationManager().reset();
        }

        // model and target are available
        if (value != null) {
          this.__setUpBinding();
        }
      },

      /**
       * Internal helper for setting up the bindings using
       * {@link qx.data.controller.Object#addTarget}. All bindings are set
       * up bidirectional.
       */
      __setUpBinding: function __setUpBinding() {
        // create the object controller
        if (this.__objectController == null) {
          this.__objectController = new qx.data.controller.Object(this.getModel());
        }

        // get the form items
        var items = this.getTarget().getItems();

        // connect all items
        for (var name in items) {
          var item = items[name];
          var targetProperty = this.__isModelSelectable(item) ? "modelSelection[0]" : "value";
          var options = this.__bindingOptions[name];

          // try to bind all given items in the form
          try {
            if (options == null) {
              this.__objectController.addTarget(item, targetProperty, name, !this._selfUpdate);
            } else {
              this.__objectController.addTarget(item, targetProperty, name, !this._selfUpdate, options[0], options[1]);
            }
            // ignore not working items
          } catch (ex) {
            {
              this.warn("Could not bind property " + name + " of " + this.getModel() + ":\n" + ex.stack);
            }
          }
        }
        // make sure the initial values of the model are taken for resetting [BUG #5874]
        this.getTarget().redefineResetter();
      },

      /**
       * Internal helper for removing all set up bindings using
       * {@link qx.data.controller.Object#removeTarget}.
       *
       * @param oldTarget {qx.ui.form.Form} The form which has been removed.
       */
      __tearDownBinding: function __tearDownBinding(oldTarget) {
        // do nothing if the object controller has not been created
        if (this.__objectController == null) {
          return;
        }

        // get the items
        var items = oldTarget.getItems();

        // disconnect all items
        for (var name in items) {
          var item = items[name];
          var targetProperty = this.__isModelSelectable(item) ? "modelSelection[0]" : "value";
          this.__objectController.removeTarget(item, targetProperty, name);
        }
      },

      /**
       * Returns whether the given item implements
       * {@link qx.ui.core.ISingleSelection} and
       * {@link qx.ui.form.IModelSelection}.
       *
       * @param item {qx.ui.form.IForm} The form item to check.
       *
       * @return {Boolean} true, if given item fits.
       */
      __isModelSelectable: function __isModelSelectable(item) {
        return qx.Class.hasInterface(item.constructor, qx.ui.core.ISingleSelection) && qx.Class.hasInterface(item.constructor, qx.ui.form.IModelSelection);
      }

    },

    /*
     *****************************************************************************
        DESTRUCTOR
     *****************************************************************************
     */

    destruct: function destruct() {
      // dispose the object controller because the bindings need to be removed
      if (this.__objectController) {
        this.__objectController.dispose();
      }
    }
  });
  qx.data.controller.Form.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Form.js.map?dt=1554385317846