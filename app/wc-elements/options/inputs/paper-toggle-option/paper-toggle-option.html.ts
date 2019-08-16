import { TemplateFn, CHANGE_TYPE } from '../../../../modules/wc-lib/build/es/wc-lib.js';
import { cache } from '../../../../modules/lit-html/directives/cache.js'
import { render } from '../../../../modules/lit-html/lit-html.js';
import { PaperToggleOption } from './paper-toggle-option.js';
import { twoWayProp } from '../../../utils.js';

export const PaperToggleOptionHTML = new TemplateFn<PaperToggleOption>(function (html, props) {
	return html`
		<paper-checkbox id="checkbox" checked="${twoWayProp(props, 'toggled')}" @tap="${this.onClick}">
			<slot></slot>
		</paper-checkbox>
		${cache(this.props.disabled && this.props.showmessage ? html`
			<div id="disabledContainer">
				<div id="disabledInfo">
					<svg class="inactive" fill="#000000" height="24" viewbox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
						<path d="M0 0h24v24H0z" fill="none"/>
						<path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
					</svg>
					<svg class="active" fill="#000000" height="24" viewbox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
						<path d="M0 0h24v24H0z" fill="none"/>
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
					</svg>
					<div class="paper-material infoDiv" elevation="3">
						<div class="infoDivText">${props.disabledreason}</div>
					</div>
				</div>
			</div>
		` : '')}
	`
}, CHANGE_TYPE.PROP, render);