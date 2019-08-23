import { PolymerInit, PolymerElementProperties, PolymerElementPropertiesMeta, BindingPart } from '@polymer/polymer/interfaces';
import { WebComponent, Props, PROP_TYPE, ComplexType, TemplateFn, CHANGE_TYPE } from 'wc-lib';
import { render, directive, AttributePart, Part, html as litHTML } from 'lit-html';
import { html as srcHTML } from '@polymer/polymer/lib/utils/html-tag.js';
import { root, isPath, get } from '@polymer/polymer/lib/utils/path.js';
import { DomModule } from '@polymer/polymer/lib/elements/dom-module';
import { PropConfigObject } from 'wc-lib/src/wc-lib.all';
import { twoWayProp } from '../../wc-elements/utils.js';
import { addListener } from '@polymer/polymer/lib/utils/gestures';

interface ShadyWindow extends Window {
	ShadyCSS: {
		flushCustomStyles(): void;
		ApplyShim: {
			transformCssText(text: string, rule?: any): string;
		}
	}
}
declare const window: ShadyWindow;

interface SrcTemplate extends HTMLTemplateElement {
	__src: {
		strings: TemplateStringsArray;
		values: any[];
	}
}
namespace PolymerCompat {
	export namespace PolymerClass {
		namespace Util {
			export function arrToMap(values: [string, any][]) {
				const map = new Map();
				for (const [ key, value] of values) {
					map.set(key, value);
				}
				return map;
			}		

			export function flatten<V>(values: V[][]|V[]): V[] {
				const arr: V[] = [];
				for (const value of values) {
					if (Array.isArray(value)) {
						arr.push(...flatten(value));
					} else {
						arr.push(value);
					}
				}
				return arr;
			}
		}

		export namespace Template {
			/**
			 * Copied from 
			 * Github.com/Polymer/polymer/lib/mixins/property-effects.js
			 */
			const IDENT  = '(?:' + '[a-zA-Z_$][\\w.:$\\-*]*' + ')';
			const NUMBER = '(?:' + '[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?' + ')';
			const SQUOTE_STRING = '(?:' + '\'(?:[^\'\\\\]|\\\\.)*\'' + ')';
			const DQUOTE_STRING = '(?:' + '"(?:[^"\\\\]|\\\\.)*"' + ')';
			const STRING = '(?:' + SQUOTE_STRING + '|' + DQUOTE_STRING + ')';
			const ARGUMENT = '(?:(' + IDENT + '|' + NUMBER + '|' +  STRING + ')\\s*' + ')';
			const ARGUMENTS = '(?:' + ARGUMENT + '(?:,\\s*' + ARGUMENT + ')*' + ')';
			const ARGUMENT_LIST = '(?:' + '\\(\\s*' +
										'(?:' + ARGUMENTS + '?' + ')' +
										'\\)\\s*' + ')';
			const BINDING = '(' + IDENT + '\\s*' + ARGUMENT_LIST + '?' + ')'; // Group 3
			const OPEN_BRACKET = '(\\[\\[|{{)' + '\\s*';
			const CLOSE_BRACKET = '(?:]]|}})';
			const NEGATE = '(?:(!)\\s*)?'; // Group 2
			const EXPRESSION = OPEN_BRACKET + NEGATE + BINDING + CLOSE_BRACKET;
			const bindingRegex = new RegExp(EXPRESSION, "g");

			function parseBindings(text: string): BindingPart[]|null {
				let parts = [];
				let lastIndex = 0;
				let m;
				while ((m = bindingRegex.exec(text)) !== null) {
					// Add literal part
					if (m.index > lastIndex) {
						parts.push({literal: text.slice(lastIndex, m.index)});
					}
					// Add binding part
					let mode = m[1][0];
					let negate = Boolean(m[2]);
					let source = m[3].trim();
					let customEvent = false, notifyEvent = '', colon = -1;
					if (mode == '{' && (colon = source.indexOf('::')) > 0) {
						notifyEvent = source.substring(colon + 2);
						source = source.substring(0, colon);
						customEvent = true;
					}
					let signature = Config.Methods.parseMethod(source);
					let dependencies = [];
					if (signature) {
						// Inline computed function
						let {args, methodName} = signature;
						for (let i=0; i<args.length; i++) {
							let arg = args[i];
							if (!arg.literal) {
								dependencies.push(arg);
							}
						}
						if (signature.static) {
							dependencies.push(methodName);
							signature.dynamicFn = true;
						}
					} else {
						// Property or path
						dependencies.push(source);
					}
					parts.push({
						source, mode, negate, customEvent, signature, dependencies,
						event: notifyEvent
					});
					lastIndex = bindingRegex.lastIndex;
				}
				// Add a final literal part
				if (lastIndex && lastIndex < text.length) {
					let literal = text.substring(lastIndex);
					if (literal) {
						parts.push({
							literal: literal
						});
					}
				}
				if (parts.length) {
					return parts;
				} else {
					return null;
				}
			}

			const cachedTemplates: WeakMap<any, Set<[{
				strings: TemplateStringsArray;
				values: any[];
			}, {
				strings: string[];
				values: any[];
			}]>> = new WeakMap();

			function getCachedTemplate(component: any, template: {
				strings: TemplateStringsArray;
				values: any[];
			}) {
				if (cachedTemplates.has(component)) {
					for (const [ srcTemplate, converted ] of cachedTemplates.get(component)!.values()) {
						if (srcTemplate.strings.length !== template.strings.length) continue;
						let continueNext: boolean = false;
						for (let i = 0; i < srcTemplate.strings.length; i++) {
							if (srcTemplate.strings[i] !== template.strings[i]) {
								continueNext = true;
								break;
							}
						}
						if (continueNext) continue;

						if (srcTemplate.values.length !== template.values.length) continue;
						for (let i = 0; i < srcTemplate.values.length; i++) {
							if (srcTemplate.values[i] !== template.values[i]) {
								continueNext = true;
								break;
							}
						}
						if (continueNext) continue;

						return converted;
					}
				}
				return null;
			}

			function convertBindings(component: any, template: {
				strings: TemplateStringsArray;
				values: any[];
			}) {
				const newTemplate: {
					strings: string[];
					values: any[];
				} = {
					strings: [],
					values: []
				};

				for (let i = 0; i < template.strings.length; i++) {
					const string = template.strings[i];

					const bindings = parseBindings(string);
					if (bindings) {
						for (const binding of bindings) {
							if ('literal' in binding) {
								newTemplate.strings.push(binding.literal);
							} else {
								const value = (() => {
									const sig = binding.signature as Config.Methods.MethodSignature|null;
									if (sig) {
										const method = Config.Methods.resolveMethod(component, sig);
										if (!method) return undefined;
					
										return method(...Config.Methods.getMethodArgs(sig, component.props));
									} else {
										// Property
										const arg = Config.Methods.parseArg(binding.source);
										if (arg.literal) {
											return arg.value;
										}
										if (arg.structured && arg.wildcard) {
											return get(component.prop, arg.name);
										} else if (arg.structured) {
											return get(component.props, arg.value);
										} else {
											if (binding.mode === '{') {
												return twoWayProp(component.props, arg.rootProperty);
											} else {
												return component.prop[arg.rootProperty];
											}
										}
									}
								})();
								if (binding.negate) {
									newTemplate.values.push(!value);	
								} else {
									newTemplate.values.push(value);
								}
							}
						}
					} else {
						newTemplate.strings.push(template.strings[i]);
					}
					if (i < template.values.length - 1) {
						newTemplate.values.push(template.values[i]);
					}
				}

				return newTemplate;
			}

			const elementListeners: WeakMap<any, WeakMap<HTMLElement, Map<string, string>>> = new WeakMap();
			const listenDirective = directive((event: string, methodName: string, component: any) => (part: Part) => {
				if (!(part instanceof AttributePart)) {
					throw new Error('listeners can only be added through attributes');
				}

				if (!elementListeners.has(component)) {
					elementListeners.set(component, new WeakMap());
				}
				const componentListeners = elementListeners.get(component)!;
				if (!componentListeners.has(part.committer.element as HTMLElement)) {
					componentListeners.set(part.committer.element as HTMLElement, new Map());
				}
				const eventMap = componentListeners.get(part.committer.element as HTMLElement)!
				if (eventMap.get(event) === methodName) return;

				part.committer.element.addEventListener(event, (e) => {
					const method = Config.Methods.resolveMethod(component, {
						methodName,
						str: methodName
					});
					if (!method) return;

					method(e, e ? (e as any).detail : undefined);
				});
				eventMap.set(event, methodName);
			});

			const EVENT_ATTR_REGEX = /on-(\w+)=(['"])(\w+)\2/g;
			function addEventHandlers(component: any, template: {
				strings: string[];
				values: any[];
			}) {
				const newTemplate: {
					strings: string[];
					values: any[];
				} = {
					strings: [],
					values: []
				};

				for (let i = 0; i < template.strings.length; i++) {
					const string = template.strings[i];

					if (!EVENT_ATTR_REGEX.test(string)) {
						newTemplate.strings.push(template.strings[i]);
					} else {
						let lastIndex: number = 0;
						// Basically a way to use string.matchAll
						string.replace(EVENT_ATTR_REGEX, (match, event, _quote, methodName, index) => {
							newTemplate.strings.push(string.slice(lastIndex, index));
							lastIndex = index + match.length;

							// Add the listener
							newTemplate.values.push(listenDirective(event, methodName, component));
							return '';
						});
					}

					if (i < template.values.length - 1) {
						newTemplate.values.push(template.values[i]);
					}
				}

				return newTemplate;
			}

			const CUSTOM_STYLE_REGEX = /\<style(.*?)(include=(['"])([\w-]*)\3)(.*?)\>/g;
			function addCustomStyles(template: {
				strings: string[];
				values: any[];
			}) {
				const newTemplate: {
					strings: string[];
					values: any[];
				} = {
					strings: [],
					values: template.values
				};

				for (let i = 0; i < template.strings.length; i++) {
					const string = template.strings[i];
					newTemplate.strings.push(string.replace(CUSTOM_STYLE_REGEX, (match, _1, _2, _3, includePaths: string) => {
						return match + includePaths.split(' ').map((includePath) => {
							const imported = DomModule.import(includePath, 'template');
							if (!imported) {
								console.warn('Couldn\'t find style import', includePath);
								return '';
							}
							const stylesheet = (imported as HTMLTemplateElement).innerHTML;
							return window.ShadyCSS.ApplyShim.transformCssText(
								stylesheet.slice(
									stylesheet.indexOf('<style>') + '<style>'.length,
									stylesheet.indexOf('</style>')));
						}).join(' ');
					}));
				}

				return newTemplate;
			}

			const STYLESHEET_REGEX = /\<style(.*)?\>((.|\n|\s)*?)<\/style>/g;
			function addApplies(template: {
				strings: string[];
				values: any[];
			}) {
				const newTemplate: {
					strings: string[];
					values: any[];
				} = {
					strings: [],
					values: template.values
				};

				for (let i = 0; i < template.strings.length; i++) {
					const string = template.strings[i];

					newTemplate.strings.push(string.replace(STYLESHEET_REGEX, (_match, _styleAttrs, content: string) => {
						return `<style>${window.ShadyCSS.ApplyShim.transformCssText(content)}</style>`;
					}));
				}

				return newTemplate;
			}

			function convertTemplate(component: any, template: {
				strings: TemplateStringsArray;
				values: any[];
			}) {
				const cached = getCachedTemplate(component, template);
				if (cached) return cached;

				let marker = 10000;
				while (template.strings.join('').indexOf(marker + '') > -1) {
					marker++;
				}
				
				window.ShadyCSS.flushCustomStyles();
				const result = addApplies(
					addCustomStyles(addEventHandlers(component,
						convertBindings(
							component, template
						))));

				if (!cachedTemplates.has(component)) cachedTemplates.set(component, new Set());
				cachedTemplates.get(component)!.add([template, result]);
				return result;
			}

			export function createTemplate<P>(getSrc: (component: P) => {
				strings: TemplateStringsArray;
				values: any[];
			}) {
				return new TemplateFn<P>(function () {
					const srcTemplate = getSrc(this);
					const converted = convertTemplate(this, srcTemplate);
					return litHTML(converted.strings as unknown as TemplateStringsArray, 
						...converted.values);
				}, CHANGE_TYPE.PROP, render)
			}
		}

		export namespace Config {
			export namespace Methods {
				export interface MethodSignature {
					args: MethodArg[];
					static: boolean;
					str: string;
					methodName: string;
					dynamicFn?: boolean;
				}
			
				type MethodArg = {
					name: string;
					value: any;
				} & ({
					literal: true;
				} | ({
					literal: false;
					rootProperty: string;
				} & ({
					structured: true;
					wildcard: boolean;
				} | {
					structured: false;
				})))
			
				/**
				 * Copied from 
				 * Github.com/Polymer/polymer/lib/mixins/property-effects.js
				 */
				function parseArgs(argList: Array<string>, sig: MethodSignature): MethodSignature {
					sig.args = argList.map(function(rawArg) {
						let arg = parseArg(rawArg);
						if (!arg.literal) {
							sig.static = false;
						}
						return arg;
					});
					return sig;
				}
			
				export function parseArg(rawArg: string): MethodArg {
					// clean up whitespace
					let arg = rawArg.trim()
						// replace comma entity with comma
						.replace(/&comma;/g, ',')
						// repair extra escape sequences; note only commas strictly need
						// escaping, but we allow any other char to be escaped since its
						// likely users will do this
						.replace(/\\(.)/g, '\$1')
						;
					// basic argument descriptor
					let a: MethodArg = {
						name: arg,
						value: '',
						literal: false
					} as any;
					// detect literal value (must be String or Number)
					let fc = arg[0];
					if (fc === '-') {
						fc = arg[1];
					}
					if (fc >= '0' && fc <= '9') {
						fc = '#';
					}
					switch(fc) {
						case "'":
						case '"':
							a.value = arg.slice(1, -1);
							a.literal = true;
							break;
						case '#':
							a.value = Number(arg);
							a.literal = true;
							break;
					}
					// if not literal, look for structured path
					if (!a.literal) {
						a.rootProperty = root(arg);
						// detect structured path (has dots)
						a.structured = isPath(arg);
						if (a.structured) {
							a.wildcard = (arg.slice(-2) == '.*');
							if (a.wildcard) {
								a.name = arg.slice(0, -2);
							}
						}
					}
					return a;
				}
			
				export function parseMethod(expression: string): MethodSignature | null {
					// tries to match valid javascript property names
					let m = expression.match(/([^\s]+?)\(([\s\S]*)\)/);
					if (m) {
					let methodName = m[1];
					let sig = { methodName, static: true, args: [], str: expression };
					if (m[2].trim()) {
						// replace escaped commas with comma entity, split on un-escaped commas
						let args = m[2].replace(/\\,/g, '&comma;').split(',');
						return parseArgs(args, sig);
					} else {
						return sig;
					}
					}
					return null;
				}
			
				export function resolveObserver(str: string) {
					let parsed = parseMethod(str);
					if (!parsed) {
						parsed = parseMethod(`${str}()`);
						if (!parsed) {
							console.warn('Failed to parse observer');
							return null;
						}
					}
			
					return parsed;
				}

				type Behavior = Partial<PolymerInit>;			
				export function collectBehaviors(init: PolymerInit|Behavior, behaviors: Behavior[] = []): Behavior[]  {
					if (!init.behaviors) return behaviors;
					if (Array.isArray(init.behaviors)) {
						Util.flatten(init.behaviors).forEach((behavior) => {
							behaviors.push(behavior);
							collectBehaviors(behavior, behaviors);
						});
						return behaviors;
					} else {
						behaviors.push(init.behaviors);
						return collectBehaviors(init.behaviors, behaviors);
					}
				}

				export function getMethodProps(method: MethodSignature, propConfig: Map<string, PolymerElementPropertiesMeta>) {
					if (method.static) return [];
			
					const props: string[] = [];
					for (const arg of method.args) {
						if (arg.literal) continue;
			
						if (!propConfig.has(arg.rootProperty)) {
							console.warn(
								`Failed to find property with name ${
									arg.rootProperty} in observer ${method.str}`);
						} else {
							props.push(arg.rootProperty);
						}
					}
					return props;
				}
			
				export function getMethodArgs(method: MethodSignature, props: {
					[key: string]: any;
				}) {
					return method.args.map((arg) => {
						if (arg.literal) return arg.value;
						
						return props[arg.rootProperty];
					});
				}

				export function resolveMethod(component: any, sig: Pick<MethodSignature, 'methodName'|'str'>) {
					const method = component[sig.methodName]
					if (!method) {
						console.warn('Failed to find method with name', sig.methodName,
							'and signature', sig.str, 'on', component);
						return null;
					}
					return method as Function;
				}
			}

			export namespace Props {
				export function joinObjPropsMultiValue(props: {
					[key: string]: any;
				}[]): {
					[key: string]: any[];
				} {
					const joined: {
						[key: string]: any[];
					} = {};
					for (const propSet of props) {
						for (const key in propSet) {
							if (!joined[key]) {
								joined[key] = [propSet[key]];
							} else {
								joined[key].push(propSet[key]);
							}
						}
					}
					return joined;
				}
			
				export function joinObjProps(props: {
					[key: string]: any;
				}[]): {
					[key: string]: any;
				} {
					const joined: {
						[key: string]: any;
					} = {};
					for (const propSet of props) {
						for (const key in propSet) {
							if (key in joined) {
								joined[key] = { ...joined[key], ...propSet[key] };
							} else {
								joined[key] = propSet[key];
							}
						}
					}
					return joined;
				}

				export function createPropValueMap<V>(arr: { props: string[]; value: V }[]): Map<string, V[]> {
					const map: Map<string, V[]> = new Map();
					for (const { props, value } of arr) {
						for (const prop of props) {
							if (!map.has(prop)) {
								map.set(prop, [ value ]);
							} else {
								map.get(prop)!.push(value);
							}
						}
					}
					return map;
				}

				export function getPolymerElConfig(init: PolymerInit) {
					const behaviors = Methods.collectBehaviors(init);
					const joinedProps: PolymerElementProperties = Props.joinObjProps(Util.flatten([
						...behaviors.map(b => b.properties!),
						init.properties!
					].filter(v => !!v)));
					const basicPropConfig: Map<string, PolymerElementPropertiesMeta> = Util.arrToMap(
						Object.getOwnPropertyNames(joinedProps).map((propKey) => {
							const config = joinedProps[propKey];
							const value = (() => {
								if (typeof config === 'function') {
									return config();
								}
								return config;
							})();
							return [ propKey, value ];
						}));
					const joinedInit = getJoinedInit(init, behaviors, basicPropConfig);
			
					return {
						joinedProps, joinedInit
					}
				}
			
				export function getPropValues(component: any, joinedProps: PolymerElementProperties) {
					return Util.arrToMap(
						Object.getOwnPropertyNames(joinedProps).map((propKey) => {
							const config = joinedProps[propKey];
							const value = (() => {
								if (typeof config === 'function') {
									return config();
								} else if (typeof config !== 'object' || !config.type) {
									return {
										type: (() => {
											switch (typeof config) {
												case 'string':
													return String;
												case 'number':
												case 'bigint':
													return Number;
												case 'boolean':
													return Boolean;
												default: 
													return {};
											}
										})(),
										config
									}
								} else if (typeof config === 'object' && typeof config.value === 'function') {
									return {
										...config,
										value: config.value.apply(component)
									}
								}
								return config;
							})();
							return [ propKey, value ];
						})) as Map<string, PolymerElementPropertiesMeta>;
				}
			
				export function createPropsConfig(propConfig: Map<string, PolymerElementPropertiesMeta>) {
					const obj: {
						priv: PropConfigObject;
						reflect: PropConfigObject;
					} = {
						priv: {},
						reflect: {}
					}
					for (const [ propName, config ] of propConfig.entries()) {
						obj[config.reflectToAttribute ? 'reflect' : 'priv'][propName] = {
							type: (() => {
								switch (config.type) {
									case Boolean:
										return PROP_TYPE.BOOL;
									case Number:
										return PROP_TYPE.NUMBER;
									case String:
										return PROP_TYPE.STRING;
									case Array:
										return ComplexType<any[]>();
									default:
										return ComplexType<any>()
								}
							})() as any,
							watch: config.notify === true ? true : false,
							value: config.value,
							reflectToSelf: true
						}	
					}
					return obj;
				}

				export function copyProps(target: any, sources: any[]) {
					const keys = sources.map(b => Object.getOwnPropertyNames(b));
					const excludeList: string[] = [];
					for (let i = 0; i < sources.length; i++) {
						for (const key of keys[i]) {
							if (key in excludeList) continue;
		
							const descriptor = Object.getOwnPropertyDescriptor(sources[i], key);
							if (!descriptor) continue;
		
							descriptor.configurable = true;
							Object.defineProperty(target, key, descriptor);
						}
		
						excludeList.push(...keys[i]);
					}
				}
			}

			export function getJoinedInit(init: PolymerInit, behaviors: Partial<PolymerInit>[], 
				propConfig: Map<string, PolymerElementPropertiesMeta>) {
					return {
						properties: propConfig,
						observers: Props.createPropValueMap((Util.flatten([
							...behaviors
								.map(b => b.observers!),
							init.observers!
						].filter(v => !!v)) as unknown as string[])
							.map((o => Methods.resolveObserver(o)!))
							.filter(v => !!v)
							.map(m => ({ value: m, props: Methods.getMethodProps(m, propConfig)}))),
						hostAttributes: Props.joinObjProps([
							...behaviors
								.map(b => b.hostAttributes!),
							init.hostAttributes!
						].filter(v => !!v)) as {
							[key: string]: string;
						},
						listeners: Props.joinObjPropsMultiValue([
							...behaviors
								.map(b => b.listeners!),
							init.listeners!
						].filter(v => !!v)) as {
							[key: string]: string[];
						},
						propObservers: Props.createPropValueMap(
							Array.from(propConfig.entries()).map(([ propName, { observer }]) => {
								
								if (!observer) return null!;
								return {
									props: [propName],
									value: observer
								};
							}).filter(v => !!v)
						),
						computed: Props.createPropValueMap(Util.flatten(
							Array.from(propConfig.entries()).map(([propName, prop]) => {
								if (!prop.computed) return null!;
								
								return { 
									propName: propName, 
									method: Methods.resolveObserver(prop.computed)!
								};
							})
							.filter(v => !!v)
							.map(m => ({ value: m, props: Methods.getMethodProps(m.method, propConfig)}))
						)),
		
						registered: [
							...behaviors
								.map(b => b.registered!),
							init.registered!
						].filter(v => !!v),
						created: [
							...behaviors
								.map(b => b.created!),
							init.created!
						].filter(v => !!v),
						attached: [
							...behaviors
								.map(b => b.attached!),
							init.attached!
						].filter(v => !!v),
						detached: [
							...behaviors
								.map(b => b.detached!),
							init.detached!
						].filter(v => !!v),
						ready: [
							...behaviors
								.map(b => b.ready!),
							init.ready!
						].filter(v => !!v),
						attributeChanged: [
							...behaviors
								.map(b => b.attributeChanged!),
							init.attributeChanged!
						].filter(v => !!v),
					};
				}
		}

		export function polymerConstructor(init: PolymerInit, __this: PolymerInit & PolymerElement) {
			const { joinedInit, joinedProps } = Config.Props.getPolymerElConfig(init);

			const propValues = Config.Props.getPropValues(__this, joinedProps);
			__this._joinedInit = joinedInit;
			__this._propValues = propValues;
			__this._proxyObj = new Proxy(__this, {
				get(_, key) {
					if (key === 'fire') {
						return __this.wcFire;
					} else {
						const value = (__this as any)[key];
						if (typeof value === 'function') {
							return value.bind(__this);
						} 
						return value;
					}
				}
			}) as PolymerInit & PolymerElement & {
				fire(...args: any[]): any;
			};
			__this.props = Props.define(__this._proxyObj, 
				Config.Props.createPropsConfig(propValues));

			for (const [ propName, config ] of propValues.entries()) {
				if (config.readOnly) {
					__this['_set' + propName[0].toUpperCase() + propName.slice(1)] = (value: any) => {
						if (propName in __this.props) {
							__this.props[propName] = value;
						} else {
							__this[propName] = value;
						}
					}
				}
			}

			joinedInit.registered.forEach(f => f.call(__this));
			joinedInit.created.forEach(f => f.call(__this));

			for (const key in joinedInit.hostAttributes) {
				const value = joinedInit.hostAttributes[key];
				__this.setAttribute(key, value);
			}
			for (const event in joinedInit.listeners) {
				for (const listener of joinedInit.listeners[event]) {
					__this.listen(__this, event, listener);
				}
			}
			__this.wcListen('propChange', (name: string, newVal: any, oldVal: any) => {
				const observers = joinedInit.observers.get(name);
				const propObservers = joinedInit.propObservers.get(name);
				const computed = joinedInit.computed.get(name);

				computed && computed.forEach(({ propName, method: computed }) => {
					const method = Config.Methods.resolveMethod(__this, computed);
					if (!method) return;

					(__this.props as any)[propName] = method.apply(__this,
						Config.Methods.getMethodArgs(computed, __this.props));
				});
				observers && observers.forEach((observer) => {
					const method = Config.Methods.resolveMethod(__this, observer);
					if (!method) return;

					method.apply(__this, Config.Methods.getMethodArgs(observer, __this.props));
				});
				propObservers && propObservers.forEach((observer) => {
					const method = (() => {
						if (typeof observer === 'function') return observer;
						const method = Config.Methods.resolveMethod(__this, { 
							methodName: observer,
							str: observer
						});
						if (!method) return;
						return method;
					})() as Function;

					method.call(__this, newVal, oldVal);
				});
			});
		}
	}
}

export function Polymer(init: PolymerInit) {
	const cls = class PolymerClass extends PolymerElement {
		static is = init.is;
		private static __html: TemplateFn<any>|null|undefined = null;
		static get html() {
			if (this.__html !== null) return this.__html || null;
			return (this.__html = init._template ? 
				PolymerCompat.PolymerClass.Template.createTemplate((component) => {
					return ((component as unknown as PolymerInit)._template as SrcTemplate).__src;
				}) : undefined) || null;
		}

		protected _runPolymerConstructor() {
			PolymerCompat.PolymerClass.polymerConstructor(init as any, this as any);
		}

		get self() {
			return PolymerClass;
		}
	}

	PolymerCompat.PolymerClass.Config.Props.copyProps(
		cls.prototype, [init, 
			...PolymerCompat.PolymerClass.Config.Methods.collectBehaviors(init)]);

	cls.define();
	return cls;
}

export class PolymerElement extends WebComponent {
	static get template() {
		return html``;
	}

	static get properties() {
		return {};
	}

	private static ___html: TemplateFn<any>|null = null;
	static get html(): TemplateFn<any>|null {
		if (this.___html) return this.___html;
		return (this.___html = PolymerCompat.PolymerClass.Template.createTemplate(() => {
			return this.template.__src;
		}));
	}
	static css = null;
	static dependencies = [];
	static mixins = [];
	public _joinedInit!: ReturnType<typeof PolymerCompat.PolymerClass.Config.getJoinedInit>;
	public _propValues!: Map<string, PolymerElementPropertiesMeta>;
	public _proxyObj!: PolymerInit & PolymerElement & {
		fire(...args: any[]): any;
	};

	constructor(...args: any[]) {
		super(...args);

		this._runPolymerConstructor();
	}

	protected _runPolymerConstructor() {
		PolymerCompat.PolymerClass.polymerConstructor(this.constructor as any, this as any);
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		this._joinedInit.attributeChanged.forEach(f => f.call(this, name, oldValue, newValue));
	}

	connectedCallback() {
		super.connectedCallback.call(this._proxyObj);

		// All properties with default values will have a value at this point,
		// run the observers
		for (const [ prop, config ] of this._propValues.entries()) {
			if (config.value === undefined) continue;
			this.wcFire('propChange', prop, this.props[prop], undefined);
		}

		this._joinedInit.attached.forEach(f => f.call(this));
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this._joinedInit.detached.forEach(f => f.call(this));
	}

	mounted() {
		this._joinedInit.ready.forEach(f => f.call(this));
	}

	$$(selector: string): any {
		return this.shadowRoot!.querySelector(selector);
	}

	toggleClass(name: string, value: boolean, node: HTMLElement = this) {
		if (value) {
			node.classList.add(name);
		} else {
			node.classList.remove(name);
		}
	}

	// @ts-ignore
	fire = (type: string, detail?: any, { node = this }: {
		node?: any;
	} = { }) => {
		node.wcFire(type as never, detail);
	}

	private ___listenedTo: Set<string> = new Set();
	// @ts-ignore
	listen = (node: any, event: string, method: string) => {
		const wcNode = node;
		const onCall = (...args: any[]) => {
			const fn = PolymerCompat.PolymerClass.Config.Methods.resolveMethod(this, {
				methodName: method,
				str: method
			});
			if (!fn) return;

			fn.apply(this, args);
		};
		if (node.wcListen) {
			wcNode.wcListen(event as never, onCall);
		}

		if (this.___listenedTo.has(`${event}${method}`)) return;
		addListener(wcNode, event, onCall);
		this.___listenedTo.add(`${event}${method}`);
	}

	wcListen(event: string, fn: (...args: any[]) => void) {
		return super.listen(event, fn);
	}

	wcFire(event: string, ...params: any[]): any[] {
		return super.fire(event as never, ...params);
	}

	private __notImplemented() {
		debugger;
		throw new Error('Not implemented');
	}

	createPropertiesForAttribute() {
		this.__notImplemented();
	}

	finalize() {
		this.__notImplemented();
	}

	get() {
		this.__notImplemented();
	}

	linkPaths() {
		this.__notImplemented();
	}

	notifyPath() {
		this.__notImplemented();
	}

	notifySplices() {
		this.__notImplemented();
	}

	pop() {
		this.__notImplemented();
	}

	push() {
		this.__notImplemented();
	}

	resolveUrl() {
		this.__notImplemented();
	}

	set() {
		this.__notImplemented();
	}

	setProperties() {
		this.__notImplemented();
	}

	shift() {
		this.__notImplemented();
	}

	splice() {
		this.__notImplemented();
	}

	unlinkPaths() {
		this.__notImplemented();
	}

	unshift() {
		this.__notImplemented();
	}

	updateStyles() {
		this.__notImplemented();
	}

	async() {
		this.__notImplemented();
	}

	cancelAsync() {
		this.__notImplemented();
	}

	cancelDebouncer() {
		this.__notImplemented();
	}

	chainObject() {
		this.__notImplemented();
	}

	create() {
		this.__notImplemented();
	}

	debounce() {
		this.__notImplemented();
	}

	get self() {
		return PolymerElement;
	}
}

export function html(strings: TemplateStringsArray, ...values: any[]): SrcTemplate {
	const template = srcHTML(strings, ...values) as SrcTemplate;
	template.__src = {
		strings, values
	}
	return template;
}