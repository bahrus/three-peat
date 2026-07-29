// @ts-check
/** @import {Actions, PAP, AllProps, AP} from './types/three-peat/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway, SpawnContext, ManageTemplateListResolvedParams} from './types/assign-gingerly/types' */;
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;

/**
 * @implements {Actions}
 */
class ThreePeat {

    /**
     * @this {AllProps & Actions}
     * @param {Element & ElementEnhancementGateway} enhancedElement
     * @param {SpawnContext} ctx
     * @param {PAP} initVals
     */
    constructor(enhancedElement, ctx, initVals){
        this.init(this, enhancedElement, ctx, initVals);
    }

    /**
     * @param {AllProps} self
     * @param {Element & ElementEnhancementGateway} enhancedElement
     * @param {SpawnContext} ctx
     * @param {PAP} initVals
     */
    async init(self, enhancedElement, ctx, initVals){
        const {customData} = /** @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>} */ (ctx.emc);
        /**
         * @type {RoundaboutOptions}
         */
        const raOptions = {
            ...customData,
            vm: self,
            initialPropVals: {
                enhancedElement,
                ...customData?.defaultPropVals,
                ...initVals
            }
        };
        (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
    }

    /**
     * @param {AP} self
     */
    async hydrate(self){
        const {enhancedElement, src, listProp, each, target, updateOn} = self;

        // 1. Find the host that holds the list (itemscope manager, shadow host, or peer element by id)
        const {upSearch} = await import('assign-gingerly/inferencer/upSearch.js');
        const host = /** @type {any} */ (await upSearch(enhancedElement, src));

        // 2. Determine the template to repeat and where the clones should go
        /**
         * @type {HTMLTemplateElement}
         */
        let itemTemplate;
        /**
         * @type {Element | null}
         */
        let targetEl;
        if(enhancedElement instanceof HTMLTemplateElement){
            itemTemplate = enhancedElement;
            targetEl = enhancedElement.parentElement;
        }else{
            const firstChild = enhancedElement.firstElementChild;
            if(firstChild === null) throw 'three-peat: no child content to repeat';
            itemTemplate = document.createElement('template');
            itemTemplate.content.appendChild(firstChild.cloneNode(true));
            firstChild.remove();
            targetEl = enhancedElement;
        }
        if(target !== undefined){
            const rootNode = /** @type {Document | ShadowRoot} */ (enhancedElement.getRootNode());
            const found = rootNode.getElementById(target);
            if(found === null) throw 404;
            targetEl = found;
        }
        if(targetEl === null) throw 404;

        // 3. Render via assign-gingerly's built-in manageTemplateList handler
        const {ManageTemplateListHandler} = /** @type {any} */ (await import('assign-gingerly/handlers/manageTemplateList.js'));
        const fromEachItem = each ?? {
            withOptions: {
                infer: {
                    byItemprop: true
                }
            }
        };
        const handler = new ManageTemplateListHandler({
            do: 'builtIns.manageTemplateList',
            fromEachItem
        });
        // Hosts built with assign-gingerly's IterableMixin keep the list private,
        // exposing it (and change notification) via statics on the constructor.
        const hostConstructor = host.constructor;
        const usesIterableMixin = typeof hostConstructor?.getItems === 'function';
        const render = async () => {
            const forEach = listProp !== undefined ? host[listProp]
                : usesIterableMixin ? hostConstructor.getItems(host)
                : host;
            /**
             * @type {ManageTemplateListResolvedParams}
             */
            const resolvedParams = {
                forEach,
                instantiate: itemTemplate,
            };
            await handler.assign(targetEl, resolvedParams, {from: host});
        };
        await render();

        // 4. Listen for list changes
        if(updateOn !== undefined){
            host.addEventListener(updateOn, render);
        }else if(listProp !== undefined){
            let propagator = host.propagator;
            if(!(propagator instanceof EventTarget)){
                const {Infer} = /** @type {any} */ (await import('assign-gingerly/inferencer/inferencer.js'));
                propagator = await new Infer(host, listProp).getPropagator();
            }
            propagator.addEventListener(listProp, render);
        }else if(usesIterableMixin){
            // IterableMixin.setItems dispatches 'items-changed' on the instance
            host.addEventListener('items-changed', render);
        }

        return /** @type {PAP} */ ({resolved: true});
    }
}

export {ThreePeat};
