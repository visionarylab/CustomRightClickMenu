﻿Polymer({
	is: 'stylesheet-edit',

	behaviors: [Polymer.NodeEditBehavior],

	//#region PolymerProperties
	/**
	* An interval to save any work not discarder or saved (say if your browser/pc crashes)
	* 
	* @attribute savingInterval
	* @type Object
	* @default null
	*/
	savingInterval: false,

	/**
	* Whether this dialog is active
	* 
	* @attribute active
	* @type Boolean
	* @default false
	*/
	active: false,

	/**
	* The editor
	* 
	* @attribute editor
	* @type Object
	* @default null
	*/
	editor: null,

	/**
     * Whether the vertical scrollbar is already shown
     * 
     * @attribute verticalVisible
     * @type Boolean
     * @default false
     */
	verticalVisible: false,

	/**
     * Whether the horizontal scrollbar is already shown
     * 
     * @attribute horizontalVisible
     * @type Boolean
     * @default false
     */
	horizontalVisible: false,

	/**
     * The settings element on the top-right of the editor
     * 
     * @attribute settingsEl
     * @type Element
     * @default null
     */
	settingsEl: null,

	/**
     * The fullscreen element on the bottom-right of the editor
     * 
     * @attribute fullscreenEl
     * @type Element
     * @default null
     */
	fullscreenEl: null,

	/**
     * The container of the fullscreen and settings buttons
     * 
     * @attribute buttonsContainer
     * @type Element
     * @default null
     */
	buttonsContainer: null,
	/**
     * The editor's starting height
     * 
     * @attribute editorHeight
     * @type Number
     * @default 0
     */
	editorHeight: 0,

	/**
     * The editor's starting width
     * 
     * @attribute editorWidth
     * @type Number
     * @default 0
     */
	editorWidth: 0,

	/**
     * Whether to show the trigger editing section
     * 
     * @attribute showTriggers
     * @type Boolean
     * @default false
     */
	showTriggers: false,

	/**
	 * Whether to show the section that allows you to choose on which content to show this
     * 
     * @attribute showContentTypeChooser
     * @type Boolean
     * @default false
     */
	showContentTypeChooser: false,

	/**
     * Whether the options are shown
     * 
     * @attribute optionsShown
     * @type Boolean
     * @default false
     */
	optionsShown: false,

	/**
     * Whether the editor is in fullscreen mode
     * 
     * @attribute fullscreen
     * @type Boolean
     * @default false
     */
	fullscreen: false,

	/**
     * The element that contains the editor's options
     * 
     * @attribute editorOptions
     * @type Element
     * @default null
     */
	editorOptions: null,

	/**
     * The settings shadow element which is the circle on options
     * 
     * @attribute settingsShadow
     * @type Element
     * @default null
     */
	settingsShadow: null,

	/**
     * The editor's settings before going to the settings page
     * 
     * @attribute unchangedEditorSettings
     * @type Object
     * @default {}
     */
	unchangedEditorSettings: {},

	/**
     * The editor's dimensions before it goes fullscreen
     * 
     * @attribute preFullscreenEditorDimensions
     * @type Object
     * @default {}
     */
	preFullscreenEditorDimensions: {},

	/**
	 * The fullscreen animation
	 *
	 * @attribute fullscreenAnimation
	 * @type Animation
	 * @default null
	 */
	fullscreenAnimation: null,

	/**
	 * The show options animation player
	 *
	 * @attribute optionsAnimations
	 * @type Array
	 * @default []
	 */
	optionsAnimations: [],

	/*
	 * Prevent the codemirror editor from signalling again for a while
	 * 
	 * @attribute preventNotification
	 * @type Boolean
	 * @default false
	 */
	preventNotification: false,

	/*
	 * The timeout that resets the preventNotification bool
	 * 
	 * @attribute preventNotificationTimeout
	 * @type Number
	 * @default null
	 */
	preventNotificationTimeout: null,

	properties: {
		item: {
			type: Object,
			value: {},
			notify: true
		}
	},
	//#endregion

	//#region Dialog
	getExportData: function () {
		$('script-edit #exportMenu paper-menu')[0].selected = 0;
		var settings = {};
		this.save(settings);
		return settings;
	},

	exportStylesheetAsCRM: function () {
		window.app.editCRM.exportGivenNodes([getExportData()], 'CRM');
	},

	exportStylesheetAsUserscript: function () {
		window.app.editCRM.exportGivenNodes([getExportData()], 'Userscript');
	},

	finishEditing: function () {
		chrome.storage.local.set({
			editing: null
		});
	},

	cancelChanges: function () {
		this.active = false;
		this.finishEditing();
		window.externalEditor.cancelOpenFiles();
	},

	saveChanges: function () {
		this.active = false;
		this.finishEditing();
		window.externalEditor.cancelOpenFiles();
	},
	//#endregion

	//#region Metadata Updates
	preventCodemirrorNotification: function () {
		var _this = this;
		this.preventNotification = true;
		if (this.preventNotificationTimeout !== null) {
			window.clearTimeout(this.preventNotificationTimeout);
		}
		this.preventNotificationTimeout = window.setTimeout(function () {
			_this.preventNotification = false;
			_this.preventNotificationTimeout = null;
		}, 20);
	},

	updateFromScriptApplier: function (changeType, key, newValue, oldValue) {
		var i;
		switch (key) {
			case 'downloadURL':
			case 'updateURL':
			case 'namespace':
				if (changeType === 'removed') {
					if (this.newSettings.nodeInfo.source && this.newSettings.nodeInfo.source.url) {
						this.newSettings.nodeInfo.source.url = metaTags.downloadURL || metaTags.updateURL || metaTags.namespace || this.newSettings.nodeInfo.source.downloadUrl || null;;
					}
				} else {
					this.newSettings.nodeInfo.source = this.newSettings.nodeInfo.source || {
						updateURL: (key === 'namespace' ? '' : undefined),
						url: newValue
					};
					if (key === 'namespace') {
						this.newSettings.nodeInfo.source.updateURL = newValue;
					}
					if (!this.newSettings.nodeInfo.source.url) {
						this.newSettings.nodeInfo.source.url = newValue;
					}
					window.crmEditPage.updateNodeInfo(this.newSettings.nodeInfo);
				}
				break;
			case 'name':
				this.set('newSettings.name', (changeType === 'removed') ? '' : newValue);
				window.crmEditPage.updateName(this.newSettings.name);
				break;
			case 'version':
				this.set('newSettings.nodeInfo.version', (changeType === 'removed') ? null : newValue);
				window.crmEditPage.updateNodeInfo(this.newSettings.nodeInfo);
				break;
			case 'require':
				//Change anonymous libraries to requires
				var libraries = this.newSettings.value.libraries;
				for (var k = 0; k < libraries.length; k++) {
					if (libraries[k].name === null) {
						libraries.splice(k, 1);
						k--;
					}
				}
				metaTags.require.forEach(function (url) {
					libraries.push({
						name: null,
						url: url
					});
				});
				this.set('newSettings.value.libraries', libraries);
				window.paperLibrariesSelector.updateLibraries(libraries);
				break;
			case 'author':
				this.set('newSettings.nodeInfo.source.author', (changeType === 'removed') ? null : newValue);
				window.crmEditPage.updateNodeInfo(this.newSettings.nodeInfo);
				break;
			case 'include':
			case 'match':
			case 'exclude':
				var triggerval = JSON.stringify({
					url: newValue,
					not: false
				});
				var isExclude = (key === 'exclude');
				if (changeType === 'changed' || changeType === 'removed') {
					var triggers = this.newSettings.value.triggers;
					for (i = 0; i < triggers.length; i++) {
						if (triggerval === JSON.stringify(triggers[i])) {
							if (changeType === 'changed') {
								//Replace this one
								this.set('newSettings.value.triggers.' + i + '.url', newValue);
								this.set('newSettings.value.triggers.' + i + '.not', isExclude);
							} else {
								//Remove this one
								this.splice('newSettings.value.triggers', i, 1);
							}
							break;
						}
					}
				} else {
					//Add another one
					this.push('newSettings.value.triggers', {
						url: newValue,
						not: isExclude
					});
				}
				break;
			case 'CRM_contentType':
				var val = newValue;
				var valArray;
				try {
					valArray = JSON.parse(val);
				} catch (e) {
					valArray = [];
				}
				for (i = 0; i < 6; i++) {
					if (valArray[i]) {
						valArray[i] = true;
					} else {
						valArray[i] = false;
					}
				}

				//If removed, don't do anything
				if (changeType !== 'removed') {
					this.set('newSettings.onContentTypes', valArray);
				}
				break;
			case 'CRM_launchMode':
				if (changeType !== 'removed') {
					this.set('newSettings.value.launchMode', parseInt(newValue, 10));
				}
				break;
		}
	},

	metaTagsUpdateFromSettings: function (changeType, key, value, oldValue) {
		var cm = this.editor;
		switch (key) {
			case 'name':
				cm.updateMetaTags(cm, key, oldValue, value, true);
				break;
			case 'CRM_launchMode':
				cm.updateMetaTags(cm, key, oldValue, value, true);
				break;
			case 'match':
			case 'include':
			case 'exclude':
				switch (changeType) {
					case 'added':
						cm.addMetaTags(cm, key, value);
						break;
					case 'changed':
						cm.updateMetaTags(cm, key, oldValue, value, false);
						break;
					case 'removed':
						cm.removeMetaTags(cm, key, value);
						break;
				}
				break;
			case 'CRM_contentTypes':
				cm.updateMetaTags(cm, key, oldValue, value, true);
				break;
		}
	},

	metaTagsUpdate: function (changes, source) {
		if (!changes) {
			return;
		}
		var i, j;
		var key, value, oldValue;
		var changeTypes = ['changed', 'removed', 'added'];
		this.newSettings.nodeInfo = this.newSettings.nodeInfo || {};
		for (i = 0; i < changeTypes.length; i++) {
			var changeType = changeTypes[i];
			var changesArray = changes[changeType];
			if (changesArray) {
				for (j = 0; j < changesArray.length; j++) {
					key = changesArray[j].key;
					value = changesArray[j].value;
					oldValue = changesArray[j].oldValue;
					if (source === 'script') {
						this.updateFromScriptApplier(changeType, key, value, oldValue);
					} else {
						this.metaTagsUpdateFromSettings(changeType, key, value, oldValue);
						this.preventCodemirrorNotification();
					}
				}
			}
		}
	},

	notifyTriggerMetaTagsCheckbox: function (e) {
		var index = 0;
		var el = e.path[index];
		while (el.tagName.toLowerCase() !== 'paper-checkbox') {
			el = el[++index];
		}

		this.async(function () {
			var inputVal = el.parentNode.children[1].value;
			var checkboxVal = el.checked;
			this.metaTagsUpdate([
				{
					key: 'triggers',
					oldValue: JSON.stringify({
						url: inputVal,
						not: !checkboxVal
					}),
					value: JSON.stringify({
						url: inputVal,
						not: checkboxVal
					})
				}
			], 'dialog');
		}, 0);
	},

	notifyTriggerMetaTagsInput: function (e) {
		var index = 0;
		var el = e.path[index];
		while (el.tagName.toLowerCase() !== 'paper-input') {
			el = el[++index];
		}

		var oldInputVal = el.value;
		this.async(function () {
			var inputVal = el.value;
			var checkboxVal = el.checked;
			this.metaTagsUpdate([
				{
					key: 'triggers',
					oldValue: JSON.stringify({
						url: oldInputVal,
						not: checkboxVal
					}),
					value: JSON.stringify({
						url: inputVal,
						not: checkboxVal
					})
				}
			], 'dialog');
		}, 0);
	},


	clearTriggerAndNotifyMetaTags: function (e) {
		this.clearTrigger(e);

		var index = 0;
		var el = e.path[index];
		while (el.tagName.toLowerCase() !== 'paper-icon-button') {
			el = el[++index];
		}

		this.async(function () {
			var inputVal = el.parentNode.children[0];
			var checkboxVal = el.parentNode.children[1];
			this.metaTagsUpdate([
				{
					key: 'triggers',
					value: JSON.stringify({
						url: inputVal,
						not: checkboxVal
					})
				}
			], 'dialog');
		}, 0);
	},

	launchModeUpdateFromDialog: function (prevState, state) {
		this.metaTagsUpdate({
			'changed': [
				{
					key: 'CRM_launchMode',
					value: state,
					oldValue: prevState
				}
			]
		}, 'dialog');
	},

	triggerCheckboxChange: function (element) {
		var oldValue = !element.checked;
		console.trace();
		var inputValue = $(element).parent().children('.triggerInput')[0].value;

		var line = this.editor.removeMetaTags(this.editor, oldValue ? 'exclude' : 'match', inputValue);
		this.editor.addMetaTags(this.editor, oldValue ? 'match' : 'exclude', inputValue, line);
	},

	triggerInputChange: function (element) {
		var _this = this;
		var oldValue = element.value;

		var checkboxChecked = $(element).parent().children('.executionTriggerNot')[0].checked;
		setTimeout(function () {
			var newValue = element.value;

			_this.metaTagsUpdate({
				'changed': [
					{
						key: (checkboxChecked ? 'exclude' : 'match'),
						oldValue: oldValue,
						value: newValue
					}
				]
			}, 'dialog');
		}, 0);
	},

	triggerRemove: function (element) {
		var $parent = $(element).parent();
		var inputValue = $parent.children('.triggerInput')[0].value;
		var checkboxValue = $parent.children('.executionTriggerNot')[0].checked;

		this.metaTagsUpdate({
			'removed': [
				{
					key: (checkboxValue ? 'match' : 'exclude'),
					value: inputValue
				}
			]
		}, 'dialog');
	},

	addTriggerAndAddListeners: function () {
		var _this = this;
		var newEl = this.addTrigger();
		$(newEl).find('.executionTriggerNot').on('change', function () {
			_this.triggerCheckboxChange.apply(_this, [this]);
		});
		$(newEl).find('.triggerInput').on('keydown', function () {
			_this.triggerInputChange.apply(_this, [this]);
		});
		$(newEl).find('.executionTriggerClear').on('click', function () {
			_this.triggerRemove.apply(_this, []);
		});
		this.metaTagsUpdate({
			'added': [
				{
					key: 'match',
					value: '*://*.example.com/*'
				}
			]
		}, 'dialog');
	},

	contentCheckboxChanged: function (e) {
		var index = 0;
		var element = e.path[0];
		while (element.tagName !== 'PAPER-CHECKBOX') {
			index++;
			element = e.path[index];
		}

		var elements = $('script-edit .showOnContentItemCheckbox');
		var elementType = element.classList[1].split('Type')[0];
		var state = !element.checked;

		var states = [];
		var oldStates = [];
		var types = ['page', 'link', 'selection', 'image', 'video', 'audio'];
		for (var i = 0; i < elements.length; i++) {
			if (types[i] === elementType) {
				states[i] = state;
				oldStates[i] = !state;
			} else {
				states[i] = elements[i].checked;
				oldStates[i] = elements[i].checked;
			}
		}

		this.metaTagsUpdate({
			'changed': [
				{
					key: 'CRM_contentTypes',
					oldValue: JSON.stringify(oldStates),
					value: JSON.stringify(states)
				}
			]
		}, 'dialog');
	},

	toggleStatusChange: function() {
		var checked = this.$.isTogglableButton.checked;
		if (checked) {
			this.metaTagsUpdate({
				'added': [
					{
						key: 'CRM_toggle',
						value: 'true'
					}
				]
			}, 'dialog');
		} else {
			this.metaTagsUpdate({
				'removed': [
					{
						key: 'CRM_toggle',
						value: 'true'
					}
				]
			}, 'dialog');
		}
	},

	toggleDefaultStatus: function() {
		var checked = this.$.isTogglableButton.checked;
		if (checked) {
			this.metaTagsUpdate({
				'added': [
					{
						key: 'CRM_defaultOn',
						value: 'true'
					}
				]
			}, 'dialog');
		} else {
			this.metaTagsUpdate({
				'removed': [
					{
						key: 'CRM_defaultOn',
						value: 'true'
					}
				]
			}, 'dialog');
		}
	},

	addDialogToMetaTagUpdateListeners: function () {
		var _this = this;
		this.async(function () {
			this.$.dropdownMenu._addListener(this.launchModeUpdateFromDialog, 'dropdownMenu', this);
		}, 0);

		//Use jquery to also get the pre-change value
		$(this.$.nameInput).on('keydown', function () {
			var el = this;
			_this.async(function () {
				_this.metaTagsUpdate({
					'changed': [
						{
							key: 'name',
							value: el.value,
							oldValue: null
						}
					]
				}, 'dialog');
			}, 5);
		});

		$('.executionTriggerNot').on('change', function () {
			_this.triggerCheckboxChange.apply(_this, [this]);
		});
		$('.triggerInput').on('keydown', function () {
			_this.triggerInputChange.apply(_this, [this]);
		});
		$('.executionTriggerClear').on('click', function () {
			_this.triggerRemove.apply(_this, [this]);
		});
	},

	scriptUpdateSingle: function (instance, change) {
		!this.fullscreen && this.findMetaTagsChanges.call(this, [change]);
	},

	scriptUpdateBatch: function (instance, changes) {
		this.fullscreen && this.findMetaTagsChanges.call(this, changes);
	},
	//#endregion

	//#region Fullscreen
	/*
	 * Inserts given snippet of code into the editor
	 * @param {element} _this The stylesheetEdit element/object
	 * @param {string} snippet - The snippet to be pasted
	 */
	insertSnippet: function (_this, snippet) {
		this.editor.doc.replaceSelection(snippet.replace('%s', this.editor.doc.getSelection()));
	},

	/*
	 * Pops in the ribbons with an animation
	 */
	popInRibbons: function () {
		//Introduce title at the top
		var scriptTitle = window.app.$.editorCurrentScriptTitle;
		var titleRibbonSize;
		if (app.settings.shrinkTitleRibbon) {
			window.doc.editorTitleRibbon.style.fontSize = '40%';
			scriptTitle.style.padding = 0;
			titleRibbonSize = '-18px';
		} else {
			titleRibbonSize = '-51px';
		}
		scriptTitle.style.display = 'flex';
		scriptTitle.style.marginTop = titleRibbonSize;
		var scriptTitleAnimation = [
			{
				marginTop: titleRibbonSize
			}, {
				marginTop: 0
			}
		];
		var margin = (app.settings.hideToolsRibbon ? 0 : '-200px');
		scriptTitle.style.marginLeft = '-200px';
		scriptTitleAnimation[0].marginLeft = '-200px';
		scriptTitleAnimation[1].marginLeft = 0;

		setTimeout(function() {
			window.doc.editorToolsRibbonContainer.style.display = 'flex';
			window.doc.editorToolsRibbonContainer.animate([
				{
					marginLeft: '-200px'
				}, {
					marginLeft: margin
				}
			], {
				duration: 500,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function() {
				window.doc.editorToolsRibbonContainer.style.marginLeft = margin;
				window.doc.editorToolsRibbonContainer.classList.add('visible');
			};
		}, 200);
		setTimeout(function () {
			$(window.doc.dummy).animate({
				height: '50px'
			}, {
				duration: 500,
				easing: $.bez([0.215, 0.610, 0.355, 1.000]),
				step: function (now) {
					window.doc.fullscreenEditorHorizontal.style.height = 'calc(100vh - ' + now + 'px)';
				}
			});
			scriptTitle.animate(scriptTitleAnimation, {
				duration: 500,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function () {
				scriptTitle.style.marginTop = 0;
				if (scriptTitleAnimation[0].marginLeft !== undefined) {
					scriptTitle.style.marginLeft = 0;
				}
			};
		}, 200);
	},

	/*
	 * Pops in only the tools ribbon
	 */
	popInToolsRibbon: function () {
		window.doc.editorToolsRibbon.style.display = 'block';
		window.doc.editorToolsRibbon.animate([
			{
				marginLeft: '-200px'
			}, {
				marginLeft: 0
			}
		], {
			duration: 800,
			easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
		}).onfinish = function () {
			this.effect.target.style.marginLeft = 0;
		}
	},

	/*
	 * Pops out only the tools ribbon
	 */
	popOutToolsRibbon: function () {
		window.doc.editorToolsRibbonContainer.animate([
			{
				marginLeft: 0
			}, {
				marginLeft: '-200px'
			}
		], {
			duration: 800,
			easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
		}).onfinish = function () {
			this.effect.target.style.marginLeft = '-200px';
			this.effect.target.classList.remove('visible');
		};
	},

	/*
	 * Pops out the ribbons with an animation
	 */
	popOutRibbons: function () {
		var scriptTitle = window.app.$.editorCurrentScriptTitle;
		var toolsRibbon = window.app.$.editorToolsRibbonContainer;
		if (window.app.settings.editor.showToolsRibbon && toolsRibbon && toolsRibbon.classList.contains('visible')) {
			scriptTitle.animate([
				{
					marginTop: 0,
					marginLeft: 0
				}, {
					marginTop: '-51px',
					marginLeft: '-200px'
				}
			], {
				duration: 800,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function () {
				scriptTitle.style.marginTop = '-51px';
				scriptTitle.style.marginLeft = '-200px';
			};
			toolsRibbon.animate([
				{
					marginLeft: 0
				}, {
					marginLeft: '-200px'
				}
			], {
				duration: 800,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function () {
				scriptTitle.style.display = 'none';
				toolsRibbon.style.display = 'none';
				toolsRibbon.style.marginLeft = '-200px';
			};
		}
		else {
			window.doc.dummy.style.height = '50px';
			$(window.doc.dummy).animate({
				height: 0
			}, {
				duration: 800,
				easing: $.bez([0.215, 0.610, 0.355, 1.000]),
				step: function (now) {
					window.doc.fullscreenEditorHorizontal.style.height = 'calc(100vh - ' + now + 'px)';
				}
			});
			scriptTitle.animate([
				{
					marginTop: 0
				}, {
					marginTop: '-51px'
				}
			], {
				duration: 800,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function () {
				this.effect.target.remove();
				scriptTitle.style.display = 'none';
				toolsRibbon.style.display = 'none';
				scriptTitle.style.marginTop = '-51px';
				toolsRibbon.remove();
			}
		}
	},

	/*
	 * Enters fullscreen mode for the editor
	 */
	enterFullScreen: function () {
		var _this = this;
		var rect = this.editor.display.wrapper.getBoundingClientRect();
		var editorCont = window.doc.fullscreenEditor;
		var editorContStyle = editorCont.style;
		editorContStyle.marginLeft = this.preFullscreenEditorDimensions.marginLeft = rect.left + 'px';
		editorContStyle.marginTop = this.preFullscreenEditorDimensions.marginTop = rect.top + 'px';
		editorContStyle.height = this.preFullscreenEditorDimensions.height = rect.height + 'px';
		editorContStyle.width = this.preFullscreenEditorDimensions.width = rect.width + 'px';
		this.fullscreenEl.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
		//this.fullscreenEl.style.display = 'none';
		var $editorWrapper = $(this.editor.display.wrapper);
		var buttonShadow = $editorWrapper.find('#buttonShadow')[0];
		buttonShadow.style.position = 'absolute';
		buttonShadow.style.right = '-1px';
		this.editor.display.wrapper.classList.add('fullscreen');

		$editorWrapper.appendTo(window.doc.fullscreenEditorHorizontal);
		var $horizontalCenterer = $('#horizontalCenterer');
		var viewportWidth = $horizontalCenterer.width();
		var viewPortHeight = $horizontalCenterer.height();

		if (app.settings.hideToolsRibbon !== undefined) {
			if (app.settings.hideToolsRibbon) {
				window.doc.showHideToolsRibbonButton.style.transform = 'rotate(180deg)';
			} else {
				window.doc.showHideToolsRibbonButton.style.transform = 'rotate(0deg)';
			}
		} else {
			chrome.storage.sync.set({
				hideToolsRibbon: false
			});
			app.settings.hideToolsRibbon = false;
			window.doc.showHideToolsRibbonButton.style.transform = 'rotate(0deg)';
		}
		if (app.settings.shrinkTitleRibbon !== undefined) {
			if (app.settings.shrinkTitleRibbon) {
				window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(90deg)';
			} else {
				window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)';
			}
		} else {
			chrome.storage.sync.set({
				shrinkTitleRibbon: false
			});
			app.settings.shrinkTitleRibbon = false;
			window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)'
		}

		$editorWrapper[0].style.height = 'auto';
		document.documentElement.style.overflow = 'hidden';
		editorCont.style.display = 'flex';

		//Animate to corners
		$(editorCont).animate({
			width: viewportWidth,
			height: viewPortHeight,
			marginTop: 0,
			marginLeft: 0
		}, {
			duration: 500,
			easing: 'easeOutCubic',
			complete: function () {
				_this.editor.refresh();
				this.style.width = '100vw';
				this.style.height = '100vh';
				buttonShadow.style.position = 'fixed';
				app.$.fullscreenEditorHorizontal.style.height = '100vh';
				window.colorFunction.func({
					from: {
						line: 0
					},
					to: {
						line: window.colorFunction.cm.lineCount()
					}
				}, window.colorFunction.cm);
				_this.popInRibbons();
			}
		});
	},

	/*
	 * Exits the editor's fullscreen mode
	 */
	exitFullScreen: function () {
		var _this = this;
		this.popOutRibbons();
		var $wrapper = $(_this.editor.display.wrapper);
		var $buttonShadow = $wrapper.find('#buttonShadow');
		$buttonShadow[0].style.position = 'absolute';
		setTimeout(function () {
			_this.editor.display.wrapper.classList.remove('fullscreen');
			var editorCont = window.doc.fullscreenEditor;
			_this.fullscreenEl.children[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg>';
			$(editorCont).animate({
				width: _this.preFullscreenEditorDimensions.width,
				height: _this.preFullscreenEditorDimensions.height,
				marginTop: _this.preFullscreenEditorDimensions.marginTop,
				marginLeft: _this.preFullscreenEditorDimensions.marginLeft
			}, {
				duration: 500,
				easing: 'easeOutCubic',
				complete: function () {
					editorCont.style.marginLeft = 0;
					editorCont.style.marginTop = 0;
					editorCont.style.width = 0;
					editorCont.style.height = 0;
					$(_this.editor.display.wrapper).appendTo(_this.$.editorCont).css({
						height: _this.preFullscreenEditorDimensions.height,
						marginTop: 0,
						marginLeft: 0
					});
				}
			});
		}, 800);
	},

	/*
	 * Toggles fullscreen mode for the editor
	 */
	toggleFullScreen: function () {
		(this.fullscreen ? this.exitFullScreen() : this.enterFullScreen());
		this.fullscreen = !this.fullscreen;
	},
	//#endregion

	//#region Options
	/*
	 * Shows the options for the editor
	 */
	showOptions: function () {
		var _this = this;
		this.unchangedEditorSettings = jQuery.extend(true, {}, window.app.settings.editor);
		var editorWidth = $('.CodeMirror').width();
		var editorHeight = $('.CodeMirror').height();
		var circleRadius;

		//Add a bit just in case
		if (this.fullscreen) {
			circleRadius = Math.sqrt((250000) + (editorHeight * editorHeight)) + 100;
		} else {
			circleRadius = Math.sqrt((editorWidth * editorWidth) + (editorHeight * editorHeight)) + 100;
		}
		var negHalfRadius = -circleRadius;
		circleRadius = circleRadius * 2;
		this.settingsShadow[0].parentNode.style.width = editorWidth;
		this.settingsShadow[0].parentNode.style.height = editorHeight;
		this.fullscreenEl.style.display = 'none';
		var settingsInitialMarginLeft = -500;
		$('#editorThemeFontSizeInput')[0].value = window.app.settings.editor.zoom;
		this.settingsShadow.css({
			width: '50px',
			height: '50px',
			borderRadius: '50%',
			marginTop: '-25px',
			marginRight: '-25px'
		}).animate({
			width: circleRadius,
			height: circleRadius,
			marginTop: negHalfRadius,
			marginRight: negHalfRadius
		}, {
			duration: 500,
			easing: 'linear',
			progress: function (animation) {
				_this.editorOptions[0].style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
				_this.editorOptions[0].style.marginTop = -animation.tweens[2].now + 'px';
			}
		});
	},

	/*
	 * Hides the options for the editor
	 */
	hideOptions: function () {
		var _this = this;
		var settingsInitialMarginLeft = -500;
		this.fullscreenEl.style.display = 'block';
		this.settingsShadow.animate({
			width: 0,
			height: 0,
			marginTop: 0,
			marginRight: 0
		}, {
			duration: 500,
			easing: 'linear',
			progress: function (animation) {
				_this.editorOptions[0].style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
				_this.editorOptions[0].style.marginTop = -animation.tweens[2].now + 'px';
			},
			complete: function () {
				var zoom = window.app.settings.editor.zoom;
				var prevZoom = _this.unchangedEditorSettings.zoom;
				_this.unchangedEditorSettings.zoom = zoom;
				if (JSON.stringify(_this.unchangedEditorSettings) !== JSON.stringify(window.app.settings.editor)) {
					_this.reloadEditor();
				}
				if (zoom !== prevZoom) {
					window.app.updateEditorZoom();
				}
			}
		});
	},

	/*
	 * Toggles the editor's options
	 */
	toggleOptions: function () {
		(this.optionsShown ? this.hideOptions() : this.showOptions());
		this.optionsShown = !this.optionsShown;
	},
	//#endregion

	/*
	 * Triggered when the scrollbars get updated (hidden or showed) and adapts the 
	 * icons' positions
	 * @param {boolean} Whether - the vertical scrollbar is now visible
	 */
	scrollbarsUpdate: function (vertical) {
		if (vertical !== this.verticalVisible) {
			if (vertical) {
				this.buttonsContainer.style.right = '29px';
			} else {
				this.buttonsContainer.style.right = '11px';
			}
			this.verticalVisible = !this.verticalVisible;
		}
	},

	/*
	 * Reloads the editor completely (to apply new settings)
	 */
	reloadEditor: function (disable) {
		$(this.editor.display.wrapper).remove();
		this.$.editorPlaceholder.style.display = 'flex';
		this.$.editorPlaceholder.style.opacity = 1;
		this.$.editorPlaceholder.style.position = 'absolute';

		this.newSettings.value.stylesheet = [];
		var lines = this.editor.doc.lineCount();
		for (var i = 0; i < lines; i++) {
			this.newSettings.value.stylesheet.push(this.editor.doc.getLine(i));
		}
		this.newSettings.value.stylesheet = this.newSettings.value.stylesheet.join('\n');
		this.editor = null;

		if (this.fullscreen) {
			this.loadEditor(window.doc.fullscreenEditorHorizontal, this.newSettings.value.stylesheet, disable);
		}
		else {
			this.loadEditor(this.$.editorCont, this.newSettings.value.stylesheet, disable);
		}
	},

	/*
	 * Fills the this.editorOptions element with the elements it should contain (the options for the editor)
	 */
	fillEditorOptions: function () {
		var settingsContainer = $('<div id="settingsContainer"></div>').appendTo(this.editorOptions);
		$('<div id="editorSettingsTxt">Editor Settings</div>').appendTo(settingsContainer);

		//The settings for the theme
		var theme = $('<div id="editorThemeSettingCont">' +
			'<div id="editorThemeSettingTxt">' +
			'Theme: ' +
			'</div>' +
			'<div id="editorThemeSettingChoicesCont">' +
			'</div>' +
			'</div>' +
			'<br>').appendTo(settingsContainer);

		//The white theme option
		$('<div id="editorThemeSettingWhite" class="editorThemeSetting' + (window.app.settings.editor.theme === 'white' ? ' currentTheme' : '') + '"></div>')
			.click(function () {
				var themes = this.parentNode.children;
				themes[0].classList.add('currentTheme');
				themes[1].classList.remove('currentTheme');
				window.app.settings.editor.theme = 'white';
				window.app.upload();
			}).appendTo(theme.find('#editorThemeSettingChoicesCont'));

		//The dark theme option
		$('<div id="editorThemeSettingDark" class="editorThemeSetting' + (window.app.settings.editor.theme === 'dark' ? ' currentTheme' : '') + '"></div>')
			.click(function () {
				var themes = this.parentNode.children;
				themes[0].classList.remove('currentTheme');
				themes[1].classList.add('currentTheme');
				window.app.settings.editor.theme = 'dark';
				window.app.upload();
			}).appendTo(theme.find('#editorThemeSettingChoicesCont'));

		//The font size
		var fontSize = $('<div id="editorThemeFontSize">' +
			'Editor zoom percentage:' +
			'</div>').appendTo(settingsContainer);

		$('<paper-input type="number" id="editorThemeFontSizeInput" no-label-float value="' + window.app.settings.editor.zoom + '"></paper-input>').on('keypress change', function () {
			var _this = this;
			setTimeout(function () {
				window.app.settings.editor.zoom = _this.value;
			}, 0);
		}).appendTo(fontSize);

		//The option to use tabs or spaces
		var tabsOrSpaces = $('<div id="editorTabsOrSpacesSettingCont">' +
			'<div id="editorTabsOrSpacesCheckbox">' +
			'</div>' +
			'<div id="editorTabsOrSpacesTxt">' +
			'Use tabs instead of spaces' +
			'</div>' +
			'</div>' +
			'<br>').appendTo(settingsContainer);

		//The main checkbox for the tabs or spaces option
		$('<paper-checkbox ' + (window.app.settings.editor.useTabs ? 'checked' : '') + '></paper-checkbox>').click(function () {
			window.app.settings.editor.useTabs = !window.app.settings.editor.useTabs;
			window.app.upload();
		}).appendTo(tabsOrSpaces.find('#editorTabsOrSpacesCheckbox'));

		//The option for the size of tabs
		var tabSize = $('<div id="editorTabSizeSettingCont">' +
			'<div id="editorTabSizeInput">' +
			'<paper-input-container>' +
			'<label>Tab size</label>' +
			'<input min="1" is="iron-input" type="number" value="' + window.app.settings.editor.tabSize + '"/>' +
			'</paper-input-container>' +
			'</div>' +
			'</div>' +
			'<br>').appendTo(settingsContainer);

		//The main input for the size of tabs option
		tabSize.find('input').change(function () {
			var input = $(this);
			setTimeout(function () {
				window.app.settings.editor.tabSize = input.val();
				window.app.upload();
			}, 0);
		});
	},

	/*
	 * Triggered when the codeMirror editor has been loaded, fills it with the options and fullscreen element
	 */
	cmLoaded: function (element) {
		var _this = this;
		this.editor = element;
		element.refresh();
		element.display.wrapper.classList.add('script-edit-codeMirror');
		if (element.metaTags && element.metaTags.metaTags) {
			element.changeMetaTags(element, 'CRM_stylesheet', 'true', 'true', true);
		}
		element.on('metaTagChanged', function (changes, metaTags) {
			if (!_this.preventNotification) {
				_this.metaTagsUpdate(changes, 'script');
			}
			_this.newSettings.value.metaTags = JSON.parse(JSON.stringify(metaTags));
		});
		var $buttonShadow = $('<paper-material id="buttonShadow" elevation="1"></paper-material>').insertBefore($(element.display.sizer).children().first());
		this.buttonsContainer = $('<div id="buttonsContainer"></div>').appendTo($buttonShadow)[0];
		var bubbleCont = $('<div id="bubbleCont"></div>').insertBefore($buttonShadow);
		//The bubble on settings open
		var $shadow = this.settingsShadow = $('<paper-material elevation="5" id="settingsShadow"></paper-material>').appendTo(bubbleCont);
		var $editorOptionsContainer = $('<div id="editorOptionsContainer"></div>').appendTo($shadow);
		this.editorOptions = $('<paper-material id="editorOptions" elevation="5"></paper-material>').appendTo($editorOptionsContainer);
		this.fillEditorOptions();
		this.fullscreenEl = $('<div id="editorFullScreen"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg></div>').appendTo(this.buttonsContainer).click(function () {
			_this.toggleFullScreen.apply(_this);
		})[0];
		this.settingsEl = $('<div id="editorSettings"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 48 48"><path d="M38.86 25.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43l-4.98 2.01c-1.03-.79-2.16-1.46-3.38-1.97L29 4.84c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3c-1.22.51-2.35 1.17-3.38 1.97L9.9 10.1c-.45-.17-.97 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31C9.06 22.69 9 23.34 9 24s.06 1.31.14 1.95l-4.22 3.31c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3c1.22-.51 2.35-1.17 3.38-1.97l4.98 2.01c.45.17.97 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zM24 31c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></div>').appendTo(this.buttonsContainer).click(function () {
			_this.toggleOptions.apply(_this);
		})[0];
		if (element.getOption('readOnly') === 'nocursor') {
			element.display.wrapper.style.backgroundColor = 'rgb(158, 158, 158)';
		}
		if (this.fullscreen) {
			element.display.wrapper.style.height = 'auto';
			this.$.editorPlaceholder.style.display = 'none';
			$buttonShadow[0].style.right = '-1px';
			$buttonShadow[0].style.position = 'absolute';
			this.fullscreenEl.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
		}
		else {
			this.$.editorPlaceholder.style.height = this.editorHeight + 'px';
			this.$.editorPlaceholder.style.width = this.editorWidth + 'px';
			this.$.editorPlaceholder.style.position = 'absolute';
			if (this.editorPlaceHolderAnimation) {
				this.editorPlaceHolderAnimation.play();
			}
			else {
				this.editorPlaceHolderAnimation = this.$.editorPlaceholder.animate([
					{
						opacity: 1
					}, {
						opacity: 0
					}
				], {
					duration: 300,
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				});
				this.editorPlaceHolderAnimation.onfinish = function () {
					this.effect.target.style.display = 'none';
				}
			}
		}
	},

	/*
	 * Loads the codeMirror editor
	 */
	loadEditor: function (container, content, disable) {
		var placeHolder = $(this.$.editorPlaceholder);
		this.editorHeight = placeHolder.height();
		this.editorWidth = placeHolder.width();
		!window.app.settings.editor && (window.app.settings.editor = {});
		this.editor = new window.CodeMirror(container, {
			lineNumbers: true,
			mode: 'css',
			value: content || this.item.value.stylesheet,
			scrollbarStyle: 'simple',
			lineWrapping: true,
			readOnly: (disable ? 'nocursor' : false),
			theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
			indentUnit: window.app.settings.editor.tabSize,
			indentWithTabs: window.app.settings.editor.useTabs,
			messageStylesheetEdit: true,
			extraKeys: { 'Ctrl-Space': 'autocomplete' },
			gutters: ['CodeMirror-lint-markers'],
			lint: window.CodeMirror.lint.css
		});
	},

	init: function () {
		var _this = this;
		this._init();
		this.$.dropdownMenu.init();
		this.$.exportMenu.init();
		this.initDropdown();
		document.body.classList.remove('editingScript');
		document.body.classList.add('editingStylesheet');
		window.stylesheetEdit = this;
		this.$.editorPlaceholder.style.display = 'flex';
		this.$.editorPlaceholder.style.opacity = 1;
		if (this.editor) {
			this.editor.display.wrapper.remove();
			this.editor = null;
		}
		window.externalEditor.init();
		chrome.storage.local.set({
			editing: {
				val: this.item.value.stylesheet,
				id: this.item.id,
				crmType: window.app.crmType
			}
		});
		this.savingInterval = window.setInterval(function() {
			if (_this.active) {
				//Save
				var val;
				try {
					val = _this.editor.getValue();
					chrome.storage.local.set({
						editing: {
							val: val,
							id: _this.item.id,
							crmType: window.app.crmType
						}
					});
				} catch (e) { }
			} else {
				//Stop this interval
				chrome.storage.local.set({
					editing: false
				});
				window.clearInterval(_this.savingInterval);
			}
		}, 5000);
		this.active = true;
		setTimeout(function () {
			_this.loadEditor(_this.$.editorCont);
		}, 750);
	}
});