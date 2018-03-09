import {ModuleData, GlobalObject, StorageModules, Modules } from "./moduleTypes";
import { GlobalDeclarations } from "./global-declarations";
import { MessageHandling } from "./messagehandling";
import { BrowserHandler } from "./browserhandler";
import { APIMessaging } from "./api-messaging";
import { CRMFunctions } from "./crmfunctions";
import { CRMFunction } from "./crmfunction";
import { URLParsing } from "./urlparsing";
import { Resources } from "./resources";
import { Storages } from "./storages";
import { Logging } from "./logging";
import { Sandbox } from "./sandbox";
import { Global } from "./global";
import { CRMNodes } from "./crm";
import { Info } from "./info";
import { Util } from "./util";

declare const window: BackgroundpageWindow;

export namespace Init {
	let modules: ModuleData;

	function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	export async function init() {
		initModules();
		await initEverything();
		after();
	}

	function genStorageModules(): StorageModules {
		const globalObject: GlobalObject =
			typeof module !== 'undefined' || window.isDev ?
				window : {};
		const globals = Global.globals;
		globalObject.globals = globals;

		const {
			crm, storages, crmValues, constants,
			listeners, background, toExecuteNodes
		} = globals;
		return {
			crm,
			storages,
			crmValues,
			constants,
			listeners,
			background,
			toExecuteNodes,
			globalObject
		}
	}

	function genModulesObject(): Modules {
		return {
			APIMessaging,
			BrowserHandler,
			CRMNodes,
			CRMFunction,
			CRMFunctions,
			GlobalDeclarations,
			Logging,
			MessageHandling,
			Resources,
			Sandbox,
			Storages,
			URLParsing,
			Util
		}
	}

	function genModulesData(): ModuleData {
		return {...genStorageModules(), ...genModulesObject()}
	}

	function initModules() {
		const moduleData = genModulesData();
		
		APIMessaging.initModule(moduleData);
		BrowserHandler.initModule(moduleData);
		CRMNodes.initModule(moduleData);
		CRMFunction.initModule(moduleData);
		CRMFunctions.initModule(null, moduleData);
		Global.initModule(moduleData);
		GlobalDeclarations.initModule(moduleData);
		Logging.initModule(moduleData);
		MessageHandling.initModule(moduleData);
		Resources.initModule(moduleData);
		Storages.initModule(moduleData);
		URLParsing.initModule(moduleData);
		Util.initModule(moduleData);
		initModule(moduleData);
	}

	async function initEverything() {
		Info.init();

		window.console.group('Initialization');
		window.console.group('Loading storage data');
		modules.globalObject.backgroundPageLoaded = Util.iipe(async () => {
			await Storages.loadStorages();
			window.console.groupEnd();
			try {
				modules.globalObject.globals.latestId = 
					modules.storages.settingsStorage.latestId;
				window.info('Registering permission listeners');
				await GlobalDeclarations.refreshPermissions();
				window.info('Setting CRMAPI message handler');
				GlobalDeclarations.setHandlerFunction();
				browserAPI.runtime.onConnect.addListener((port) => {
					port.onMessage.addListener(window.createHandlerFunction(port));
				});
				browserAPI.runtime.onMessage.addListener(MessageHandling.handleRuntimeMessage);
				window.info('Building Custom Right-Click Menu');
				await CRMNodes.buildPageCRM();
				window.info('Compiling typescript');
				await CRMNodes.TS.compileAllInTree();
				window.console.groupCollapsed('Restoring previous open tabs');
				await GlobalDeclarations.restoreOpenTabs();
				window.console.groupEnd();
				window.console.groupCollapsed('Creating backgroundpages');
				await CRMNodes.Script.Background.createBackgroundPages();
				window.console.groupEnd();
				window.info('Registering global handlers');
				GlobalDeclarations.init();

				//Checks if all values are still correct
				window.console.group('Checking Resources');
				window.info('Updating resources');
				Resources.updateResourceValues();
				window.info('Updating scripts');
				CRMNodes.Script.Updating.updateScripts();
				window.setInterval(() => {
					CRMNodes.Script.Updating.updateScripts();
				}, 6 * 60 * 60 * 1000);
				window.console.groupEnd();

				//Debugging data
				window.console.groupCollapsed('Debugging'); 
				window.info('For all of these arrays goes, close and re-expand them to "refresh" their contents')
				window.info('Invalidated tabs:', 
					modules.storages.failedLookups);
				window.info('Insufficient permissions:', 
					modules.storages.insufficientPermissions);
				window.console.groupEnd();

				window.info('Registering console user interface');
				GlobalDeclarations.initGlobalFunctions();

				if (location.href.indexOf('test') > -1) {
					modules.globalObject.Storages = Storages;
				}
				if (typeof module !== 'undefined') {
					modules.globalObject.TransferFromOld =
						Storages.SetupHandling.TransferFromOld;
				}
				
				for (let i = 0; i < 5; i++) {
					window.console.groupEnd();
				}

				window.info('Done!');
			} catch (e) {
				for (let i = 0; i < 10; i++) {
					window.console.groupEnd();
				}

				window.log(e);
				window.console.trace();
				throw e;
			}
		});
		await modules.globalObject.backgroundPageLoaded;
	}

	function after() {
		window.logging = modules.globalObject.globals.logging;
		window.backgroundPageLog = modules.Logging.backgroundPageLog;
	}
}