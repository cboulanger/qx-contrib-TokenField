(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.basic.Atom": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MExecutable": {
        "require": true
      },
      "qx.ui.form.IBooleanForm": {
        "require": true
      },
      "qx.ui.form.IExecutable": {
        "require": true
      },
      "qx.ui.form.IRadioItem": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);qx.Class.define("qx.ui.form.ToggleButton", {
    extend: qx.ui.basic.Atom,
    include: [qx.ui.core.MExecutable],
    implement: [qx.ui.form.IBooleanForm, qx.ui.form.IExecutable, qx.ui.form.IRadioItem],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Creates a ToggleButton.
     *
     * @param label {String} The text on the button.
     * @param icon {String} An URI to the icon of the button.
     */
    construct: function construct(label, icon) {
      qx.ui.basic.Atom.constructor.call(this, label, icon);

      // register pointer events
      this.addListener("pointerover", this._onPointerOver);
      this.addListener("pointerout", this._onPointerOut);
      this.addListener("pointerdown", this._onPointerDown);
      this.addListener("pointerup", this._onPointerUp);

      // register keyboard events
      this.addListener("keydown", this._onKeyDown);
      this.addListener("keyup", this._onKeyUp);

      // register execute event
      this.addListener("execute", this._onExecute, this);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */

    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "button"
      },

      // overridden
      focusable: {
        refine: true,
        init: true
      },

      /** The value of the widget. True, if the widget is checked. */
      value: {
        check: "Boolean",
        nullable: true,
        event: "changeValue",
        apply: "_applyValue",
        init: false
      },

      /** The assigned qx.ui.form.RadioGroup which handles the switching between registered buttons. */
      group: {
        check: "qx.ui.form.RadioGroup",
        nullable: true,
        apply: "_applyGroup"
      },

      /**
      * Whether the button has a third state. Use this for tri-state checkboxes.
      *
      * When enabled, the value null of the property value stands for "undetermined",
      * while true is mapped to "enabled" and false to "disabled" as usual. Note
      * that the value property is set to false initially.
      *
      */
      triState: {
        check: "Boolean",
        apply: "_applyTriState",
        nullable: true,
        init: null
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    members: {
      /** The assigned {@link qx.ui.form.RadioGroup} which handles the switching between registered buttons */
      _applyGroup: function _applyGroup(value, old) {
        if (old) {
          old.remove(this);
        }

        if (value) {
          value.add(this);
        }
      },

      /**
       * Changes the state of the button dependent on the checked value.
       *
       * @param value {Boolean} Current value
       * @param old {Boolean} Previous value
       */
      _applyValue: function _applyValue(value, old) {
        value ? this.addState("checked") : this.removeState("checked");

        if (this.isTriState()) {
          if (value === null) {
            this.addState("undetermined");
          } else if (old === null) {
            this.removeState("undetermined");
          }
        }
      },

      /**
      * Apply value property when triState property is modified.
      *
      * @param value {Boolean} Current value
      * @param old {Boolean} Previous value
      */
      _applyTriState: function _applyTriState(value, old) {
        this._applyValue(this.getValue());
      },

      /**
       * Handler for the execute event.
       *
       * @param e {qx.event.type.Event} The execute event.
       */
      _onExecute: function _onExecute(e) {
        this.toggleValue();
      },

      /**
       * Listener method for "pointerover" event.
       * <ul>
       * <li>Adds state "hovered"</li>
       * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onPointerOver: function _onPointerOver(e) {
        if (e.getTarget() !== this) {
          return;
        }

        this.addState("hovered");

        if (this.hasState("abandoned")) {
          this.removeState("abandoned");
          this.addState("pressed");
        }
      },

      /**
       * Listener method for "pointerout" event.
       * <ul>
       * <li>Removes "hovered" state</li>
       * <li>Adds "abandoned" state (if "pressed" state is set)</li>
       * <li>Removes "pressed" state (if "pressed" state is set and button is not checked)
       * </ul>
       *
       * @param e {qx.event.type.Pointer} pointer event
       */
      _onPointerOut: function _onPointerOut(e) {
        if (e.getTarget() !== this) {
          return;
        }

        this.removeState("hovered");

        if (this.hasState("pressed")) {
          if (!this.getValue()) {
            this.removeState("pressed");
          }

          this.addState("abandoned");
        }
      },

      /**
       * Listener method for "pointerdown" event.
       * <ul>
       * <li>Activates capturing</li>
       * <li>Removes "abandoned" state</li>
       * <li>Adds "pressed" state</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} pointer event
       */
      _onPointerDown: function _onPointerDown(e) {
        if (!e.isLeftPressed()) {
          return;
        }

        // Activate capturing if the button get a pointerout while
        // the button is pressed.
        this.capture();

        this.removeState("abandoned");
        this.addState("pressed");
        e.stopPropagation();
      },

      /**
       * Listener method for "pointerup" event.
       * <ul>
       * <li>Releases capturing</li>
       * <li>Removes "pressed" state (if not "abandoned" state is set and "pressed" state is set)</li>
       * <li>Removes "abandoned" state (if set)</li>
       * <li>Toggles {@link #value} (if state "abandoned" is not set and state "pressed" is set)</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} pointer event
       */
      _onPointerUp: function _onPointerUp(e) {
        this.releaseCapture();

        if (this.hasState("abandoned")) {
          this.removeState("abandoned");
        } else if (this.hasState("pressed")) {
          this.execute();
        }

        this.removeState("pressed");
        e.stopPropagation();
      },

      /**
       * Listener method for "keydown" event.<br/>
       * Removes "abandoned" and adds "pressed" state
       * for the keys "Enter" or "Space"
       *
       * @param e {Event} Key event
       */
      _onKeyDown: function _onKeyDown(e) {
        switch (e.getKeyIdentifier()) {
          case "Enter":
          case "Space":
            this.removeState("abandoned");
            this.addState("pressed");

            e.stopPropagation();
        }
      },

      /**
       * Listener method for "keyup" event.<br/>
       * Removes "abandoned" and "pressed" state (if "pressed" state is set)
       * for the keys "Enter" or "Space". It also toggles the {@link #value} property.
       *
       * @param e {Event} Key event
       */
      _onKeyUp: function _onKeyUp(e) {
        if (!this.hasState("pressed")) {
          return;
        }

        switch (e.getKeyIdentifier()) {
          case "Enter":
          case "Space":
            this.removeState("abandoned");
            this.execute();

            this.removeState("pressed");
            e.stopPropagation();
        }
      }
    }
  });
  qx.ui.form.ToggleButton.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ToggleButton.js.map?dt=1554385328821