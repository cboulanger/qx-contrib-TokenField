/* ************************************************************************

   Copyright:
     2010 Guilherme R. Aiolfi

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Guilherme R. Aiolfi (guilhermeaiolfi)
     * Christian Boulanger (cboulanger) - added some documentation

************************************************************************ */

/**
 * A widget implementing the token field concept known from Mac OS X
 * @see http://developer.apple.com/mac/library/documentation/Cocoa/Conceptual/TokenField_Guide/Introduction/Introduction.html
 * @asset(tokenfield/*)
 */
qx.Class.define('tokenfield.Token',
{
  extend : qx.ui.form.AbstractSelectBox,
  implement : [qx.ui.core.IMultiSelection, qx.ui.form.IModelSelection],
  include : [qx.ui.core.MMultiSelectionHandling, qx.ui.form.MModelSelection],

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events :
  {
    /**
     * This event is fired after a list item was added to the list. The
     * {@link qx.event.type.Data#getData} method of the event returns the
     * added item.
     */
    addItem : 'qx.event.type.Data',

    /**
     * This event is fired after a list item has been removed from the list.
     * The {@link qx.event.type.Data#getData} method of the event returns the
     * removed item.
     */
    removeItem : 'qx.event.type.Data',

    /**
     * This event is fired when the widget needs external data. The data dispatched
     * with the event is the string fragment to use to find matching items
     * as the data. The event listener must then load the data from whereever
     * it may come and call populateList() with the string fragment and the
     * received data.
     */
    loadData : 'qx.event.type.Data'
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties :
  {
    // /**
    //  * The orientation of the widget
    //  * not implemented
    //  */
    // orientation :
    // {
    //   check : ['horizontal', 'vertical'],
    //   init : 'vertical',
    //   apply : '_applyOrientation'
    // },

    /**
     * The appearance of the widget
     */
    appearance :
    {
      refine : true,
      init : 'token'
    },

    /**
     * The message prompting the user to type in text
     */
    typeInText :
    {
      check : 'String',
      nullable : true,
      event : 'changeTypeInText',
      init : 'Type in a search term'
    },

    /**
     * The current hint message
     */
    hintText :
    {
      check : 'String',
      nullable : true,
      event : 'changeHintText',
      init : null
    },

    /**
     * The message indicating that there were no results
     */
    noResultsText :
    {
      check : 'String',
      nullable : true,
      init : 'No results'
    },

    /**
     * The message indicating that the application is loading data
     * in response to the user's input
     */
    searchingText :
    {
      check : 'String',
      nullable : true,
      init : 'Searching...'
    },

    /**
     * The delay in milliseconds before a request is sent
     */
    searchDelay : {
      init : 300
    },

    /**
     * The minimum number of characters before a request is sent
     */
    minChars : {
      init : 2
    },

    /**
     * The maximum number of tokens that can be entered
     */
    tokenLimit :
    {
      init : null,
      nullable : true
    },

    /**
     * If true, an item on the suggested list of items can be selected only
     * once (and is then removed from the list). If false, the item can be
     * selected multiple times (default).
     */
    selectOnce :
    {
      init : false,
      check : 'Boolean'
    },

    /**
     * The path to the label in the model
     */
    labelPath : {
      init : 'label',
      event: 'changeLabelPath'
    },

    /**
     * The style of the token. if 'facebook', then the labels are as wide as the containing text
     * (best for horizontal TokenFields). If any other value, the labels span the width of the container
     * widget (best for vertical TokenFields).
     */
    style : {
      init : 'facebook'
    },

    delegate: {
      check: 'Map',
      init: null,
      apply: '_applyDelegate'
    },

    /**
     * A map containing the options for the label binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    labelOptions: {
      nullable: true
    },

    /**
     * A map containing the options for the icon binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    iconOptions: {
      nullable: true
    },

    /**
     * The path to the label in the model
     */
    iconPath: {
      check: 'String',
      init: null,
      event: 'changeIconPath'
    },

    /**
     * Contains the textfield content, when there is no token available
     */
    text: {
      check: 'String',
      init: '',
      event: 'changeText'
    },

    /**
     * Close the popup when there are no results found
     */
    closeWhenNoResults: {
      check: 'Boolean',
      init: false
    }
  },

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct: function ()
  {
    this.base(arguments);
    this._tokenClass = qx.ui.form.ListItem;
    this.cache = new tokenfield.Cache();
    this._setLayout(new qx.ui.layout.Flow());
    var textField = this._createChildControl('textfield');
    var label = this._createChildControl('label');
    this.getApplicationRoot().add(label,
    {
      top : -10,
      left : -1000
    });
    label.setAppearance(textField.getAppearance());
    textField.bind('value', label, 'value');
    textField.addListener('keypress', function () {
      //label.setValue(textField.getValue());
      textField.setWidth(label.getBounds()['width'] + 8);
    }, this);
    textField.addListener('mousedown', function (e) {
      e.stop();
    });
    this.addListener('click', this._onClick);

    // forward the focusin and focusout events to the textfield. The textfield
    // is not focusable so the events need to be forwarded manually.
    this.addListener('focusin', function () {
      textField.fireNonBubblingEvent('focusin', qx.event.type.Focus);
    }, this);
    this.addListener('focusout', function () {
      textField.fireNonBubblingEvent('focusout', qx.event.type.Focus);
    }, this);
    textField.setLiveUpdate(true);
    textField.addListener('input', this._onInputChange, this);
    textField.setMinWidth(6);
    this._search = '';
    this._dummy = new qx.ui.form.ListItem();
    this._dummy.setEnabled(false);
    this.bind('hintText', this._dummy, 'label');
    this.getChildControl('list').add(this._dummy);
    this.addListener('appear', function (){
        this.setHintText(this.getTypeInText());
    },this);
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members :
  {
    SELECTION_MANAGER : tokenfield.SelectionManager,
    _search: null,
    _tokenClass: null,

    /*
    ---------------------------------------------------------------------------
       WIDGET CREATION
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl: function (id)
    {
      var control;
      switch (id)
      {
        case 'label':
          control = new qx.ui.basic.Label();
          //control.setWidth(10);
          control.hide();
          break;
        case 'button':
          return null;

        case 'textfield':
          control = new qx.ui.form.TextField();
          control.setFocusable(false);
          control.addState('inner');

          //control.addListener('changeValue', this._onTextFieldChangeValue, this);
          control.addListener('blur', this.close, this);
          this._add(control);
          break;
        case 'list':
          // Get the list from the AbstractSelectBox
          control = this.base(arguments, id);

          // Change selection mode
          control.setSelectionMode('single');
          break;
        case 'popup':
          control = new qx.ui.popup.Popup(new qx.ui.layout.VBox);
          control.setAutoHide(true);
          control.setKeepActive(true);
          control.addListener('mouseup', this.close, this);
          control.add(this.getChildControl('list'));
          control.addListener('changeVisibility', this._onPopupChangeVisibility, this);
          break;
      }
      return control || this.base(arguments, id);
    },

    _applyDelegate: function (value) {
      if (value) {
        if (value.hasOwnProperty('createItem')) {
          this._tokenClass = value.createItem().constructor;
        } else {
          this._tokenClass = qx.ui.form.ListItem;
        }
      }
    },

    _createBoundItem: function (model) {
      var item = this.__createItem();
      this.__bindItem(model, item);
      return item;
    },

    __createItem: function () {
      var delegate = this.getDelegate();
      var item;
      if (delegate && delegate.hasOwnProperty('createItem')) {
        item = delegate.createItem();
      } else {
        item = new (this._tokenClass)();
      }
      if (delegate && delegate.hasOwnProperty('configureItem')) {
        delegate.configureItem(item);
      } else {
        item.setRich(true);
      }
      return item;
    },

    __bindItem: function (model, item) {
      var delegate = this.getDelegate();
      if (delegate && delegate.bindItem != null) {
        delegate.bindItem(this, model, item);
      } else {
        this.bindDefaultProperties(model, item);
      }
    },

    /**
     * Helper-Method for binding the default properties (label, icon and model)
     * from the model to the target widget.
     *
     * @param model {qx.core.Object} the model the ListItem should be bound to
     * @param item {Number} The internally created and used ListItem.
     */
    bindDefaultProperties: function (model, item) {
      // model
      item.setModel(model);
      model.bind(this.getLabelPath(), item, 'label', this.getLabelOptions());

      // if the iconPath is set
      if (this.getIconPath() != null) {
        model.bind(this.getIconPath(), item, 'icon', this.getIconOptions());
      }
    },

    // overridden
    focus: function ()
    {
      this.base(arguments);
      this.getChildControl('textfield').getFocusElement().focus();
    },

    // overridden
    tabFocus: function ()
    {
      var field = this.getChildControl('textfield');
      field.getFocusElement().focus();

      //field.selectAllText();
    },
    tabBlur: function ()
    {
      var field = this.getChildControl('textfield');
      field.getFocusElement().blur();
    },

    // overridden

    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates : {
      focused : true
    },

    /*
    ---------------------------------------------------------------------------
       EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    // overridden
    _onBlur: function () {
    },

    /**
     * Toggles the popup's visibility.
     *
     * @param e {qx.event.type.Mouse} Mouse click event
     */
    _onClick: function (e)
    {
      if (this.__selected) {
        this.__selected.removeState('head');
      }
      this.__selected = null;
      this.toggle();
    },

    // overridden
    _onKeyPress: function (e)
    {
      var key = e.getKeyIdentifier();
      var textfield, children, index;
      var list = this.getChildControl('popup');
      if (key === 'Down' && !list.isVisible())
      {
        this.open();
        e.stopPropagation();
        e.stop();
      } else if (key === 'Backspace' || key === 'Delete')
      {
        textfield = this.getChildControl('textfield');
        var value = textfield.getValue();
        children = this._getChildren();
        index = children.indexOf(textfield);
        if (value === null || value === '' && !this.__selected) {
          if (key === 'Delete' && index < (children.length - 1))
          {
            this.__selected = children[index + 1];
            this.__selected.addState('head');
            this.focus();
          } else if (key === 'Backspace' && index > 0)
          {
            this.__selected = children[index - 1];
            this.__selected.addState('head');
            this.focus();
          }

        } else if (this.__selected)
        {
          this._deselectItem(this.__selected);
          this.__selected = null;
          this.tabFocus();
          e.stop();
        }

      } else if (key === 'Left' || key === 'Right')
      {
        textfield = this.getChildControl('textfield');
        var start = textfield.getTextSelectionStart();
        var length = textfield.getTextSelectionLength();
        children = this._getChildren();
        var n_children = children.length;
        var item = this.__selected ? this.__selected : textfield;
        index = children.indexOf(item);
        if (item === textfield) {
          if (key === 'Left')index -= 1;
           else index += 1;

        }
        if (key === 'Left' && index >= 0 && start === 0 && length === 0) {
          this._addBefore(textfield, children[index]);
        } else if (key === 'Right' && index < n_children && start === textfield.getValue().length) {
          this._addAfter(textfield, children[index]);
        }

        if (this.__selected) {
          this.__selected.removeState('head');
        }
        this.__selected = null;

        // I really don't know, but FF needs the timer to be able to set the focus right
        // when there is a selected item and the key == 'Left'
        qx.util.TimerManager.getInstance().start(function () {
          this.tabFocus();
        }, null, this, null, 20);
      } else if (key === 'Enter' || key === 'Space') {
        if (this.__preSelectedItem && this.getChildControl('popup').isVisible())
        {
          this._selectItem(this.__preSelectedItem);
          this.__preSelectedItem = null;
          this.toggle();
        } else if (key === 'Space')
        {
          textfield = this.getChildControl('textfield');
          textfield.setValue(textfield.getValue() + ' ');
          e.stop();
        }

      } else if (key === 'Escape') {
        this.close();
      } else if (key !== 'Left' && key !== 'Right') {
        this.getChildControl('list').handleKeyPress(e);
      }
    },

    /**
     * Event listener for <code>input</code> event on the textfield child
     *
     * @param e {qx.event.type.Data} Data Event
     */
    _onInputChange: function (e) {
      var str = e.getData();
      var timer = qx.util.TimerManager.getInstance();

      // check for the old listener
      if (this.__timerId !== null) {
        // stop the old one
        timer.stop(this.__timerId);
        this.__timerId = null;
      }

      if (str == null || (str != null && str.length < this.getMinChars())) {
        this.setText(str);
        return false;
      }

      // start a new listener to update the controller
      this.__timerId = timer.start(function () {
        this.search(str);
        this.__timerId = null;
      }, 0, this, null, this.getSearchDelay());
    },

    // overridden
    _onListPointerDown: function ()
    {
      this.debug(this.__preSelectedItem);
      // Apply pre-selected item (translate quick selection to real selection)
      if (this.__preSelectedItem)
      {
        this._selectItem(this.__preSelectedItem);
        this.__preSelectedItem = null;
      }
    },    

    // overridden
    _onListChangeSelection: function (e)
    {
      var current = e.getData();
      if (current.length > 0)
      {
        // Ignore quick context (e.g. mouseover)
        // and configure the new value when closing the popup afterwards
        var list = this.getChildControl('list');
        var popup = this.getChildControl('popup');
        var context = list.getSelectionContext();
        if (popup.isVisible() && (context === 'quick' || context === 'key')) {
          this.__preSelectedItem = current[0];
        } else {
          this.__preSelectedItem = null;
        }
      }
    },

    // overridden
    _onPopupChangeVisibility: function () {
      this.tabFocus();
    },

    /*
    ---------------------------------------------------------------------------
       API
    ---------------------------------------------------------------------------
    */

    /**
     * Fire a event to search for a string
     *
     * @param str {String} query to search for
     */
    search: function (str)
    {
      this.getChildControl('list').removeAll();
      this._dummy.setLabel(this.getSearchingText());
      this.getChildControl('list').add(this._dummy);
      this.open();
      this._search = str;
      this.fireDataEvent('loadData', str);
    },

    /**
     * Populates the list with the data received from the data source
     *
     * @param str {String} The string fragment that was used for retrieving
     *    the autoocomplete data.
     * @param data {Object} A javascript object that contains the autocomplete
     *    data
     * @return {void}
     */
    populateList: function (str, data) {
      this.cache.add(str, qx.data.marshal.Json.createModel(data));
      var result = this.cache.get(str);
      var list = this.getChildControl('list');
      list.removeAll();
      if (result.getLength() === 0) {
        this.setText(str);
        if (this.isCloseWhenNoResults()) {
          this.close();
        }
        return;
      } else {
        this.resetText();
      }
      this.setLabelOptions({
        converter: function (value) {
          return this.highlight(value, str);
        }.bind(this)
      });

      for (var i = 0; i < result.getLength(); i++) {
        if (!this.getSelectOnce() || (this.getSelectOnce() === true && !this._isSelected(result.getItem(i)))) {
          var item = this._createBoundItem(result.getItem(i), i);
          this.getChildControl('list').add(item);
        }
      }
    },

    /**
     * Add a token to the list
     * @param data {Object} The data of the token. The label to be
     *      shown must be in the label path ({@link tokenfield.Token#labelPath})
     *      of the model.
     * @param selected {Boolean | undefined} Whether the token should be selected
     */
    addToken: function (data, selected) {
      var model = qx.data.marshal.Json.createModel(data);
      var item = this._createBoundItem(model);
      var list = this.getChildControl('list');
      if (!this.getSelectOnce() || (this.getSelectOnce() === true && !this._isSelected(model))) {
        if (list.hasChildren() && list.getChildren()[0] === this._dummy) {
          list.remove(this._dummy);
        }
        list.add(item);
      }
      if (selected && !this._isSelected(model)) {
        this._selectItem(item);
      }
    },

    /**
     * Selects a ListItem that matches the given data's label.
     * If there is none, one gets created.
     * @param data {Map} model
     */
    selectItem: function (data) {
      var model = qx.data.marshal.Json.createModel(data);
      var label = model.get(this.getLabelPath());
      var item;
      var isInSelection = false;
      this.getSelection().some(function (item) {
        if (item.getLabel() === label) {
          isInSelection = true;
          return true;
        }
      });
      if (isInSelection) {
        return;
      }
      this.getChildControl('list').getChildren().some(function (child) {
        if (child.getLabel() === label) {
          item = child;
          return true;
        }
      }, this);
      if (!item) {
        item = this._createBoundItem(model);
      }
      this._selectItem(item);
    },

    /**
     * Removes a token from the selection id it matches the data label.
     * @param data {Map} model
     */
    removeItem: function (data) {
      var model = qx.data.marshal.Json.createModel(data);
      var label = model.get(this.getLabelPath());
      this.getSelection().forEach(function (item) {
        if (item.getLabel() === label) {
          this._deselectItem(item);
          return true;
        }
      }, this);
    },

    /**
     * Tests and see if the model is already selected or not
     *
     * @param model {qx.core.Object} Model to be tested
     * @returns {Boolean}
     */
    _isSelected: function (model)
    {
      var selection = this.getModelSelection();
      var item = null;
      for (var i = 0; i < selection.getLength(); i++)
      {
        item = selection.getItem(i);
        if (item && model && item.get(this.getLabelPath()) === model.get(this.getLabelPath())) {
          return true;
        }
      }
      return false;
    },

    /**
     * Removes an item from the selection
     *
     * @param item {qx.ui.form.ListItem} The List Item to be removed from the selection
     */
    _deselectItem: function (item) {
      if (item && item.constructor === this._tokenClass) {
        this.removeFromSelection(item);
        this.fireDataEvent('removeItem', item);
        item.destroy();
      }
    },

    // overridden
    getChildrenContainer: function () {
      return this;
    },

    /**
     * Resets the widget
     */
    reset: function () {
      this.getSelection().forEach(function (item) {
        if (item instanceof this._tokenClass) {
          this.removeFromSelection(item);
          item.destroy();
        }
      }, this);
      this.getChildren().forEach(function (item) {
        if (item instanceof this._tokenClass) {
          this.remove(item);
          item.destroy();
        }
      }, this);
      this.getChildControl('textfield').setValue('');
      this.getChildControl('list').removeAll();
      this.getChildControl('list').add(this._dummy);
    },

    /**
     * Adds an item to the selection
     *
     * @param old {qx.ui.form.ListItem} The List Item to be added to the selection
     */
    _selectItem: function (old) {
      if (old && old.constructor === this._tokenClass) {
        var item = this.getSelectOnce() ? old : this.__createItem();
        item.setAppearance('tokenitem');
        item.setLabel(old.getModel().get(this.getLabelPath()));
        item.setModel(old.getModel());
        item.getChildControl('icon').setAnonymous(false);
        item.getChildControl('icon').addListener('click', function (e) {
          if (this.__selected) {
            this.__selected.removeState('head');
            this.__selected = null;
          }
          this._deselectItem(item);
          e.stop();
          this.tabFocus();
        }, this);
        item.addListener('click', function (e) {
          item.addState('head');
          if (this.__selected != null && this.__selected !== item) {
            this.__selected.removeState('head');
          }
          this.__selected = item;
          e.stop();
        }, this);
        item.setIconPosition('right');
        item.getChildControl('icon').addListener('mouseover', function () {
          item.addState('close');
        });
        item.getChildControl('icon').addListener('mouseout', function () {
          item.removeState('close');
        });
        if (this.getStyle() !== 'facebook') {
          item.getChildControl('label').setWidth(this.getWidth() - 29);
        }
        this._addBefore(item, this.getChildControl('textfield'));
        this.addToSelection(item);
        this.fireDataEvent('addItem', item);
        this.getChildControl('textfield').setValue('');

        // if the selected one was the last one, include dummy item
        if (this.getChildControl('list').getChildren() && this.getChildControl('list').getChildren().length === 0) {
          this.setHintText(this.getTypeInText());
          this.getChildControl('list').add(this._dummy);
        }
      }
    },

    /**
     * Highlight the searched string fragment
     *
     * @param value {String} The phrase containing the frament to be highlighted
     * @param query {String} The string fragment that should be highlited
     * @return {String} TODOC
     */
    highlight: function (value, query) {
      return value.replace(new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + query + ')(?![^<>]*>)(?![^&;]+;)', 'gi'), '<b>$1</b>');
    }
  },

  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */
  destruct: function () {
    this._disposeObjects('_dummy', 'cache');
  }
});
