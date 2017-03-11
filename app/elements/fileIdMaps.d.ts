///<reference path="./elements.d.ts" />

interface IDMap 
{
	"behavior":{ },
	"center-element":{
		"centerVertical": HTMLDivElement,
		"centerHorizontal": HTMLDivElement,
		"content": HTMLDivElement
	},
	"change-log":{ },
	"crm-app":{
		"fullscreenEditor": HTMLDivElement,
		"editorCurrentScriptTitle": HTMLDivElement,
		"showHideToolsRibbonCont": HTMLDivElement,
		"showHideToolsRibbonButton": SVGElement,
		"editorTitleRibbon": HTMLDivElement,
		"shrinkTitleRibbonButtonCont": HTMLDivElement,
		"shrinkTitleRibbonButton": SVGElement,
		"fullscreenEditorHorizontal": HTMLDivElement,
		"editorToolsRibbonContainer": HTMLDivElement,
		"editorToolsRibbon": HTMLDivElement,
		"externalEditorDialogTrigger": HTMLDivElement,
		"paperLibrariesSelector": HTMLPaperLibrariesSelectorElement,
		"paperGetPageProperties": HTMLPaperGetPagePropertiesElement,
		"paperSearchWebsitesToolTrigger": HTMLDivElement,
		"runJsLintButton": HTMLDivElement,
		"runCssLintButton": HTMLDivElement,
		"showCssTipsButton": HTMLDivElement,
		"editPage": HTMLCrmEditPageElement,
		"showOptions": HTMLPaperToggleOptionElement,
		"recoverUnsavedData": HTMLPaperToggleOptionElement,
		"CRMOnPage": HTMLPaperToggleOptionElement,
		"editCRMInRM": HTMLPaperToggleOptionElement,
		"useStorageSync": HTMLPaperToggleOptionElement,
		"crmEditPageTopTextContainer": HTMLDivElement,
		"crmTypeSelector": HTMLDivElement,
		"editCrm": HTMLEditCrmElement,
		"URISchemeFilePath": HTMLPaperInputElement,
		"URISchemeSchemeName": HTMLPaperInputElement,
		"importSettingsInput": HTMLTextAreaElement,
		"importSettingsError": HTMLSpanElement,
		"overWriteImport": HTMLPaperCheckboxElement,
		"oldCRMImport": HTMLPaperCheckboxElement,
		"importButton": HTMLPaperButtonElement,
		"exportSettingsOutput": HTMLTextAreaElement,
		"exportCRM": HTMLPaperCheckboxElement,
		"exportSettings": HTMLPaperCheckboxElement,
		"exportButton": HTMLPaperButtonElement,
		"exportToLegacyOutput": HTMLTextAreaElement,
		"legacyExportButton": HTMLPaperButtonElement,
		"dialogs": HTMLDivElement,
		"messageToast": HTMLPaperToastElement,
		"scriptUpdatesToast": ScriptUpdatesToast,
		"nextScriptUpdateButton": HTMLSpanElement,
		"contentTypeToast": HTMLPaperToastElement,
		"changedToMenuToast": HTMLPaperToastElement,
		"menuSwitchUndoButton": HTMLSpanElement,
		"externalEditorErrorToast": HTMLPaperToastElement,
		"externalEditorTryAgainButton": HTMLSpanElement,
		"externalEditorLocationToast": HTMLPaperToastElement,
		"externalEditoOpenLocationInBrowser": HTMLAnchorElement,
		"storageExceededToast": HTMLPaperToastElement,
		"noErrorsFound": HTMLPaperToastElement,
		"acceptDownloadToast": HTMLPaperToastElement,
		"updatedSettingsToast": HTMLPaperToastElement,
		"codeSettingsDialog": CodeSettingsDialog,
		"codeSettingsTitle": HTMLHeadingElement,
		"codeSettingsOptions": HTMLDivElement,
		"codeSettingsRepeat": HTMLDomRepeatElement,
		"tabRepeat": HTMLDomRepeatElement,
		"restoreChangesDialog": HTMLPaperDialogElement,
		"restoreChangesMain": HTMLDivElement,
		"highlightChangedScript": HTMLDivElement,
		"restoreChangesShowOld": HTMLDivElement,
		"restoreChangesShowUnsaved": HTMLDivElement,
		"restoreChangesOldCode": HTMLDivElement,
		"restoreChangesOldCodeCont": HTMLDivElement,
		"restoreChangesUnsavedCode": HTMLDivElement,
		"restoreChangeUnsaveddCodeCont": HTMLDivElement,
		"externalEditorChooseFile": ChooseFileDialog,
		"chooseFileMainDialog": HTMLDivElement,
		"chooseFileRadioGroup": HTMLPaperRadioGroupElement,
		"chooseFileMerge": HTMLPaperButtonElement,
		"chooseFileChooseFirst": HTMLPaperButtonElement,
		"chooseFileMerger": HTMLDivElement,
		"chooseFileTitleTxt": HTMLHeadingElement,
		"updateMergerCont": HTMLDivElement,
		"updateMergerTxt": HTMLDivElement,
		"chooseFileMergerText": HTMLDivElement,
		"chooseFileLeftTxtCont": HTMLDivElement,
		"chooseFileCurrentTxt": HTMLDivElement,
		"updateMergeLeftNextError": ListeningHTMLElement,
		"chooseFileResultTxt": HTMLDivElement,
		"updateMergePlaceholderBr": HTMLBRElement,
		"chooseFileRightTxtCont": HTMLDivElement,
		"chooseFileNewTxt": HTMLDivElement,
		"updateMergeRightNextError": ListeningHTMLElement,
		"chooseFileMergerEditor": HTMLDivElement,
		"chooseFileMergerPlaceholder": HTMLDivElement,
		"chooseFilemergerContainer": HTMLDivElement,
		"chooseFileChooseMerge": HTMLPaperButtonElement,
		"chooseFileStopMerging": HTMLPaperButtonElement,
		"addLibraryDialog": HTMLPaperDialogElement,
		"addLibraryLoadingDialog": HTMLDivElement,
		"addLibraryLoadingDialogCenterer": HTMLDivElement,
		"addLibraryProcessContainer": HTMLDivElement,
		"addedLibraryName": HTMLPaperInputElement,
		"addLibraryRadios": HTMLPaperRadioGroupElement,
		"addLibraryUrlOption": HTMLPaperRadioButtonElement,
		"addLibraryManualOption": HTMLPaperRadioButtonElement,
		"addLibraryUrlInput": HTMLPaperInputElement,
		"addLibraryManualInput": HTMLPaperTextareaElement,
		"addLibraryButton": HTMLPaperButtonElement,
		"addLibraryConfirmationContainer": HTMLDivElement,
		"addLibraryConfirmationInput": HTMLPaperTextareaElement,
		"addLibraryConfirmAddition": HTMLPaperButtonElement,
		"addLibraryDenyConfirmation": HTMLPaperButtonElement,
		"addLibraryDialogSucces": HTMLDivElement,
		"addLibraryDialogSuccesCheckmark": HTMLDivElement,
		"addLibraryDialogSuccesText": HTMLDivElement,
		"cssEditorInfoDialog": HTMLPaperDialogElement,
		"exportCenterer": HTMLCenterElementElement,
		"exportDialog": HTMLPaperDialogElement,
		"exportInputLine": HTMLDivElement,
		"exportAuthorName": HTMLPaperInputElement,
		"exportCopyButton": HTMLPaperIconButtonElement,
		"exportJSONData": HTMLTextAreaElement,
		"scriptPermissionsCenterer": HTMLCenterElementElement,
		"scriptPermissionDialog": HTMLPaperDialogElement,
		"scriptPermissionsTemplate": HTMLDomRepeatElement,
		"requestPermissionsCenterer": HTMLCenterElementElement,
		"requestPermissionsDialog": HTMLPaperDialogElement,
		"requestPermissionsHeader": HTMLHeadingElement,
		"requestPermissionsTxt": HTMLDivElement,
		"requestedPermissionsCont": HTMLDivElement,
		"requestPermissionsAsked": HTMLDivElement,
		"requestedPermissionsTemplate": HTMLDomRepeatElement,
		"requestPermissionsLineCont": HTMLDivElement,
		"requestPermissionsSplitter": HTMLDivElement,
		"requestPermissionsShowOther": SVGElement,
		"requestPermissionsOther": HTMLDivElement,
		"requestedPermissionsOtherTemplate": HTMLDomRepeatElement,
		"requestPermissionsAcceptAll": HTMLPaperButtonElement,
		"versionUpdateCenterer": HTMLCenterElementElement,
		"versionUpdateDialog": VersionUpdateDialog,
		"versionUpdateTabContainer": HTMLDivElement,
		"versionUpdateTabSlider": HTMLDivElement,
		"tryOutEditor": HTMLDivElement,
		"gifCropper": HTMLDivElement,
		"stylesheetGif": HTMLImageElement,
		"versionUpdatePrevTab": HTMLPaperButtonElement,
		"versionUpdateNextTab": HTMLPaperButtonElement,
		"addedPermissionsCenterer": HTMLCenterElementElement,
		"addedPermissionsDialog": HTMLPaperDialogElement,
		"addedPermissionsTabContainer": AddedPermissionsTabContainer,
		"addedPermissionsTabRepeater": HTMLDomRepeatElement,
		"addedPermissionPrevButton": HTMLPaperButtonElement,
		"addedPermissionNextButton": HTMLPaperButtonElement,
		"paperSearchWebsiteDialog": HTMLPaperSearchWebsiteDialogElement,
		"useExternalEditor": HTMLUseExternalEditorElement,
		"dummy": HTMLDivElement
	},
	"crm-edit-page":{
		"horizontalCenterer": HTMLDivElement,
		"verticalCenterer": HTMLDivElement,
		"overlayCont": HTMLDivElement,
		"scriptUpdateNotice": HTMLDivElement,
		"scriptUpdateWarningIcon": HTMLDivElement,
		"scriptUpdateMessage": HTMLDivElement,
		"scriptUpdateStatus": HTMLDivElement,
		"scriptUpdateShowDiff": HTMLSpanElement,
		"scriptUpdateDismiss": HTMLSpanElement,
		"scriptUpdateHideDialog": HTMLDivElement,
		"scriptUpdateHideDialogButton": HTMLPaperIconButtonElement,
		"editPageCont": HTMLPaperMaterialElement,
		"nodeInfo": HTMLDivElement,
		"nodeInfoData": HTMLDivElement,
		"nodeInfoName": HTMLSpanElement,
		"nodeInfoNameCont": HTMLElement,
		"nodeInfoAuthor": HTMLSpanElement,
		"nodeInfoAuthorCont": HTMLElement,
		"nodeInfoFrom": HTMLSpanElement,
		"nodeInfoUrl": HTMLAnchorElement,
		"nodeInfoSource": HTMLDivElement,
		"NodeInfoAcquiredThrough": HTMLSpanElement,
		"installedOn": HTMLSpanElement,
		"NodeInfoInstallDate": HTMLSpanElement
	},
	"default-link":{
		"input": HTMLInputElement
	},
	"echo-html":{ },
	"edit-crm-item":{
		"itemCont": HTMLDivElement,
		"typeSwitcher": HTMLTypeSwitcherElement,
		"draggerOrCheckbox": HTMLDivElement,
		"dragger": HTMLDivElement,
		"checkboxCont": HTMLDivElement,
		"checkbox": HTMLPaperCheckboxElement
	},
	"edit-crm":{
		"mainCont": HTMLDivElement,
		"emptyCrmNotice": HTMLDivElement,
		"crmLoadingPage": HTMLDivElement,
		"crmButtonsContainer": HTMLDivElement,
		"crmButtons": HTMLDivElement,
		"addButton": HTMLPaperButtonElement,
		"removeButton": HTMLPaperButtonElement,
		"cancelSelecting": HTMLPaperButtonElement,
		"exportSelected": HTMLPaperButtonElement,
		"removeSelectedButton": HTMLPaperButtonElement,
		"warning": HTMLDivElement,
		"removeWarning": HTMLSpanElement,
		"editCRMHelp": HTMLDivElement
	},
	"divider-edit":{
		"dividerEditCont": HTMLDivElement,
		"dividerEditLeft": HTMLDivElement,
		"changeName": HTMLDivElement,
		"changeNameInput": HTMLDivElement,
		"nameInput": HTMLPaperInputElement,
		"showOnContentContainer": HTMLDivElement,
		"showOnContentIconsContainer": HTMLDivElement,
		"dividerEditRight": HTMLDivElement,
		"showOnSitesCont": HTMLDivElement,
		"showOnSpecified": HTMLPaperCheckboxElement,
		"triggersInfoCont": HTMLDivElement,
		"triggersInfoTxtCont": HTMLPaperMaterialElement,
		"triggersInfoTxt": HTMLDivElement,
		"addTrigger": HTMLPaperButtonElement,
		"buttonsCont": HTMLDivElement,
		"buttons": HTMLDivElement,
		"cancelButton": HTMLPaperButtonElement,
		"saveButton": HTMLPaperButtonElement
	},
	"link-edit":{
		"linkEditCont": HTMLDivElement,
		"linkEditLeft": HTMLDivElement,
		"changeName": HTMLDivElement,
		"changeNameInput": HTMLDivElement,
		"nameInput": HTMLPaperInputElement,
		"showOnSitesCont": HTMLDivElement,
		"showOnSpecified": HTMLPaperCheckboxElement,
		"triggersInfoCont": HTMLDivElement,
		"triggersInfoTxtCont": HTMLPaperMaterialElement,
		"triggersInfoTxt": HTMLDivElement,
		"addTrigger": HTMLPaperButtonElement,
		"linkEditRight": HTMLDivElement,
		"changeLink": HTMLDivElement,
		"linksContainer": HTMLDivElement,
		"showOnContentContainer": HTMLDivElement,
		"showOnContentIconsContainer": HTMLDivElement,
		"buttonsCont": HTMLDivElement,
		"buttons": HTMLDivElement,
		"cancelButton": HTMLPaperButtonElement,
		"saveButton": HTMLPaperButtonElement
	},
	"menu-edit":{
		"menuEditCont": HTMLDivElement,
		"menuEditLeft": HTMLDivElement,
		"changeName": HTMLDivElement,
		"changeNameInput": HTMLDivElement,
		"nameInput": HTMLPaperInputElement,
		"showOnContentContainer": HTMLDivElement,
		"showOnContentIconsContainer": HTMLDivElement,
		"menuEditRight": HTMLDivElement,
		"showOnSitesCont": HTMLDivElement,
		"showOnSpecified": HTMLPaperCheckboxElement,
		"triggersInfoCont": HTMLDivElement,
		"triggersInfoTxtCont": HTMLPaperMaterialElement,
		"triggersInfoTxt": HTMLDivElement,
		"addTrigger": HTMLPaperButtonElement,
		"buttonCont": HTMLDivElement,
		"buttons": HTMLDivElement,
		"cancelButton": HTMLPaperButtonElement,
		"saveButton": HTMLPaperButtonElement
	},
	"script-edit":{
		"codeEditCont": HTMLDivElement,
		"settingsCont": HTMLDivElement,
		"settings": HTMLDivElement,
		"nameChangeCont": HTMLDivElement,
		"nameInput": HTMLPaperInputElement,
		"permissionsCont": HTMLDivElement,
		"openPermissionsDialogButton": HTMLPaperButtonElement,
		"triggersCont": HTMLDivElement,
		"dropdownMenu": HTMLPaperDropdownMenuElement,
		"executeOnClickOption": HTMLPaperItemElement,
		"executeAlwaysOption": HTMLPaperItemElement,
		"execyteOnSpecified": HTMLPaperItemElement,
		"showOnSpecifiedSites": HTMLPaperItemElement,
		"nodeDisabled": HTMLPaperItemElement,
		"triggerOverflowContainer": HTMLDivElement,
		"executionTriggersContainer": HTMLDivElement,
		"triggersInfoTitle": HTMLSpanElement,
		"showOrExecutetxt": HTMLSpanElement,
		"triggersInfoCont": HTMLDivElement,
		"triggersInfoTxtCont": HTMLPaperMaterialElement,
		"triggersInfoTxt": HTMLDivElement,
		"addTrigger": HTMLPaperButtonElement,
		"showOnContentContainer": HTMLDivElement,
		"showOnContentIconsContainer": HTMLDivElement,
		"codeEditorCont": HTMLDivElement,
		"mainEditorTab": HTMLDivElement,
		"backgroundEditorTab": HTMLDivElement,
		"scriptOptionsTab": HTMLDivElement,
		"codeInfoCont": HTMLDivElement,
		"codeInfoTxtCont": HTMLPaperMaterialElement,
		"codeInfoTxt": HTMLDivElement,
		"container": HTMLDivElement,
		"flexRow": HTMLDivElement,
		"flexColumn": HTMLDivElement,
		"editorCont": HTMLDivElement,
		"editorPlaceholder": HTMLDivElement,
		"editorPlaceHolderCenterer": HTMLDivElement,
		"buttonsCont": HTMLDivElement,
		"buttons": HTMLDivElement,
		"exportMenu": HTMLPaperDropdownMenuElement,
		"cancelButton": HTMLPaperButtonElement,
		"saveButton": HTMLPaperButtonElement
	},
	"stylesheet-edit":{
		"codeEditCont": HTMLDivElement,
		"settingsCont": HTMLDivElement,
		"settings": HTMLDivElement,
		"nameChangeCont": HTMLDivElement,
		"nameInput": HTMLPaperInputElement,
		"toggleButtonsCont": HTMLDivElement,
		"isTogglableButton": HTMLPaperToggleButtonElement,
		"isDefaultOnButton": HTMLPaperToggleButtonElement,
		"toggleInfoCont": HTMLDivElement,
		"toggleInfoTxtCont": HTMLPaperMaterialElement,
		"toggleInfoTxt": HTMLDivElement,
		"triggersCont": HTMLDivElement,
		"dropdownMenu": HTMLPaperDropdownMenuElement,
		"executeOnClickOption": HTMLPaperItemElement,
		"executeAlwaysOption": HTMLPaperItemElement,
		"execyteOnSpecified": HTMLPaperItemElement,
		"showOnSpecifiedSites": HTMLPaperItemElement,
		"nodeDisabled": HTMLPaperItemElement,
		"triggerOverflowContainer": HTMLDivElement,
		"executionTriggersContainer": HTMLDivElement,
		"showOrExecutetxt": HTMLSpanElement,
		"triggersInfoCont": HTMLDivElement,
		"triggersInfoTxtCont": HTMLPaperMaterialElement,
		"triggersInfoTxt": HTMLDivElement,
		"addTrigger": HTMLPaperButtonElement,
		"showOnContentContainer": HTMLDivElement,
		"showOnContentIconsContainer": HTMLDivElement,
		"stylesheetEditorCont": HTMLDivElement,
		"container": HTMLDivElement,
		"flexRow": HTMLDivElement,
		"flexColumn": HTMLDivElement,
		"editorCont": HTMLDivElement,
		"editorPlaceholder": HTMLDivElement,
		"editorPlaceHolderCenterer": HTMLDivElement,
		"buttonCont": HTMLDivElement,
		"buttons": HTMLDivElement,
		"exportMenu": HTMLPaperDropdownMenuElement,
		"cancelButton": HTMLPaperButtonElement,
		"saveButton": HTMLPaperButtonElement
	},
	"error-reporting-tool":{
	"error-reporting-overlay": HTMLDivElement,	"errorToolContent": HTMLDivElement,
		"cropCanvas": HTMLCanvasElement,
		"iconContent": HTMLDivElement,
		"reportingButtonElevation": HTMLPaperMaterialElement,
		"bugButton": HTMLDivElement,
		"reportBugButton": HTMLPaperIconButtonElement,
		"bugCheckmarkCont": HTMLDivElement,
		"bugCheckmark": HTMLDivElement,
		"overlay": HTMLDivElement,
		"highlightButtons": HTMLDivElement,
		"submitHighlightButton": HTMLPaperButtonElement,
		"cancelHighlightButton": HTMLPaperButtonElement,
		"highlightingCont": HTMLDivElement,
		"highlightingTopSquare": ErrorReportingToolSquare,
		"highlightingLeftSquare": ErrorReportingToolSquare,
		"highlightingRightSquare": ErrorReportingToolSquare,
		"highlightingBotSquare": ErrorReportingToolSquare,
		"errorReportingCenterer": HTMLCenterElementElement,
		"errorReportingDialog": HTMLPaperDialogElement
	},
	"paper-array-input":{
		"arrayInput": HTMLPaperMaterialElement,
		"arrayInputTitleContainer": HTMLDivElement,
		"arrayInputTitle": HTMLDivElement,
		"arrayInputSubtext": HTMLDivElement,
		"arrayInputContainer": HTMLDivElement,
		"arrayInputItems": HTMLDivElement,
		"arrayInputNoItemsMessage": HTMLDivElement,
		"arrayInputAddPositioner": HTMLDivElement,
		"maxElementsReachedCenterer": HTMLDivElement,
		"maxElementsReachedMessage": HTMLSpanElement
	},
	"paper-dropdown-menu":{
		"fancyDropdownlabel": HTMLDivElement,
		"fancyDropdownSubtext": HTMLDivElement,
		"dropdownLabel": HTMLDivElement,
		"dropdownSelectedCont": HTMLDivElement,
		"dropdownSelected": HTMLDivElement,
		"dropdownArrow": SVGElement,
		"contentCont": HTMLDivElement
	},
	"paper-toggle-option":{
		"checkbox": HTMLPaperCheckboxElement
	},
	"install-confirm":{
		"scriptInstalled": HTMLDivElement,
		"scriptInstalledBackground": HTMLPaperMaterialElement,
		"scriptInstalledCenterCont": HTMLDivElement,
		"scriptInstalledCheckmarkCont": HTMLDivElement,
		"scriptInstalledCheckmark": HTMLDivElement,
		"scriptInstalledText": HTMLDivElement,
		"scriptInfo": HTMLDivElement,
		"scriptInfoMeta": HTMLDivElement,
		"descriptionInfo": HTMLDivElement,
		"descriptionValue": HTMLDivElement,
		"authorInfo": HTMLDivElement,
		"authorValue": HTMLDivElement,
		"sourceInfo": HTMLDivElement,
		"sourceValue": HTMLDivElement,
		"scriptInfoPermissions": HTMLDivElement,
		"permissionInfo": HTMLDivElement,
		"permissionValue": HTMLDomRepeatElement,
		"editorCont": HTMLDivElement,
		"installButtons": HTMLDivElement,
		"installButton": HTMLPaperButtonElement,
		"cancelButton": HTMLPaperButtonElement,
		"closePage": HTMLPaperButtonElement
	},
	"install-error":{
		"installErrorContainer": HTMLCenterElementElement,
		"errorContainer": HTMLDivElement,
		"errorText": HTMLDivElement
	},
	"install-page":{
		"pageContainer": HTMLDivElement,
		"toolbar": HTMLPaperToolbarElement,
		"title": HTMLDivElement,
		"loadingContainer": HTMLDivElement,
		"spinnerCenterer": HTMLDivElement,
		"spinner": HTMLPaperSpinnerElement,
		"loadingText": HTMLDivElement
	},
	"log-console":{
		"consoleCont": HTMLPaperMaterialElement,
		"console": HTMLDivElement,
		"consoleInfo": HTMLDivElement,
		"filterCont": HTMLDivElement,
		"idFilter": HTMLDivElement,
		"idDropdown": HTMLPaperDropdownMenuElement,
		"idRepeat": HTMLDomRepeatElement,
		"tabFilter": HTMLDivElement,
		"tabDropdown": HTMLPaperDropdownMenuElement,
		"tabRepeat": HTMLDomRepeatElement,
		"textFilterCont": HTMLDivElement,
		"textFilter": HTMLPaperInputElement,
		"consoleStats": HTMLDivElement,
		"whatIsThis": HTMLDivElement,
		"consoleInfoTxtCont": HTMLPaperMaterialElement,
		"consoleInfoTxt": HTMLDivElement,
		"totalLines": HTMLDivElement,
		"totalLinesNumber": HTMLSpanElement,
		"linesCont": HTMLDivElement,
		"lines": HTMLDivElement,
		"inputFieldCont": HTMLDivElement,
		"inputFieldPrefix": HTMLDivElement,
		"inputFieldWarning": HTMLDivElement,
		"consoleInput": HTMLTextAreaElement,
		"consoleFiller": HTMLDivElement,
		"contextMenu": ContextMenuElement,
		"storeAsLocal": HTMLDivElement,
		"logValue": HTMLDivElement,
		"copyAsJSON": HTMLDivElement,
		"copyPath": HTMLDivElement,
		"clearConsole": HTMLDivElement,
		"copySource": HTMLSpanElement,
		"genericToast": HTMLPaperToastElement
	},
	"log-page":{
		"pageContainer": HTMLDivElement,
		"toolbar": HTMLPaperToolbarElement,
		"title": HTMLDivElement
	},
	"paper-get-page-properties":{
		"dropdownSelectedCont": HTMLDivElement,
		"dropdownSelected": HTMLDivElement,
		"dropdownArrow": SVGElement
	},
	"paper-libraries-selector":{
		"libraryInfoCont": HTMLDivElement,
		"libraryInfoTxtCont": HTMLPaperMaterialElement,
		"libraryInfoTxt": HTMLDivElement,
		"dropdownSelectedCont": HTMLDivElement,
		"dropdownSelected": HTMLDivElement,
		"dropdownArrow": SVGElement,
		"dropdown": HTMLPaperMenuElement
	},
	"paper-search-website-dialog":{
		"paperSearchWebsiteDialog": HTMLPaperDialogElement,
		"initialWindow": HTMLDivElement,
		"initialWindowChoicesCont": HTMLPaperRadioGroupElement,
		"chooseDefaultSearchWindow": HTMLDivElement,
		"searchWebsiteDefaultsCont": HTMLDivElement,
		"searchWebsitesRadioGroup": HTMLPaperRadioGroupElement,
		"manuallyInputSearchWebsiteWindow": HTMLDivElement,
		"manualInputChoiceRadios": HTMLPaperRadioGroupElement,
		"manualInputURLChoice": HTMLPaperRadioButtonElement,
		"manulInputSavedChoice": HTMLPaperRadioButtonElement,
		"manualInputURLOption": HTMLDivElement,
		"manualInputURLInput": HTMLPaperInputElement,
		"manualInputListChoice": HTMLDivElement,
		"manualInputListChoiceInput": HTMLPaperTextareaElement,
		"processedListWindow": HTMLDivElement,
		"listInputSearchList": HTMLDivElement,
		"confirmationWindow": HTMLDivElement,
		"urlPreviewInput": HTMLPaperInputElement,
		"testResultContainer": HTMLDivElement,
		"testUrlLink": HTMLDivElement,
		"howToOpenWindow": HTMLDivElement,
		"howToOpenLink": HTMLPaperRadioGroupElement,
		"successWindow": HTMLDivElement,
		"addLibraryDialogSuccesCheckmark": HTMLDivElement,
		"addLibraryDialogSuccesText": HTMLDivElement,
		"loadingWindow": HTMLDivElement
	},
	"use-external-editor":{ },
	"type-switcher":{
		"typeTxt": HTMLSpanElement,
		"typeSwitchArrow": SVGElement,
		"typeSwitchChoicesContainer": HTMLDivElement
	}
}
