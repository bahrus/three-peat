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
        const {customData} = /** @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>} */ (ctx.emc || ctx.config);
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
        await (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
        self.initialized = true;
    }

    /** @type {HTMLTemplateElement | undefined} */
    #itemTemplate;
    /** @type {Element | null} */
    #defaultTargetEl = null;
    /** @type {AbortController | undefined} */
    #ac;
    /**
     * The elements this enhancement has already replaced (in src / target)
     * with a WeakRef -- see weaken().
     * @type {{src?: WeakRef<Element>, target?: WeakRef<Element>}}
     */
    #weakenedRefs = {};

    /**
     * src and target may be elements (or WeakRefs to elements) passed by
     * reference.  They must only ever be held weakly -- including in the
     * values stored on this enhancement -- so an element is stored back as a
     * WeakRef.  roundabout's getter derefs a stored WeakRef, so reading the
     * property always yields the element; #weakenedRefs remembers which
     * element has already been weakened, so it isn't weakened (and hydrate
     * re-triggered) over and over.
     * @param {AP} self
     * @param {'src' | 'target'} key
     * @param {PAP} weakened collects the values to store back
     * @returns {string | Element | undefined} the id or element to use
     */
    #weaken(self, key, weakened){
        const val = /** @type {any} */ (self[key]);
        if(!(val instanceof Element)) return val;
        if(this.#weakenedRefs[key]?.deref() !== val){
            const ref = new WeakRef(val);
            this.#weakenedRefs[key] = ref;
            /** @type {any} */ (weakened)[key] = ref;
        }
        return val;
    }

    /**
     * @param {AP} self
     */
    async hydrate(self){
        const {enhancedElement, listProp, each, updateOn} = self;
        /** @type {PAP} */
        const weakened = {};
        const src = this.#weaken(self, 'src', weakened);
        const target = this.#weaken(self, 'target', weakened);

        // Re-hydrating (e.g. src / listProp reassigned programmatically)
        // replaces the listeners from the previous pass rather than stacking on them.
        this.#ac?.abort();
        const {signal} = this.#ac = new AbortController();

        // 1. Find the host that holds the list (itemscope manager, shadow host, or peer element by id)
        const {upSearch} = await import('assign-gingerly/inferencer/upSearch.js');
        const host = /** @type {any} */ (src instanceof Element
            ? src
            : await upSearch(enhancedElement, src));
        if(host === undefined) return /** @type {PAP} */ ({...weakened, resolved: true});

        // 2. Determine the template to repeat and where the clones should go.
        // Captured once:  on a later pass, the adorned element's first child
        // is a rendered clone, not the original content.
        if(this.#itemTemplate === undefined){
            if(enhancedElement instanceof HTMLTemplateElement){
                this.#itemTemplate = enhancedElement;
                this.#defaultTargetEl = enhancedElement.parentElement;
            }else{
                const firstChild = enhancedElement.firstElementChild;
                if(firstChild === null) throw 'three-peat: no child content to repeat';
                const itemTemplate = document.createElement('template');
                itemTemplate.content.appendChild(firstChild.cloneNode(true));
                firstChild.remove();
                this.#itemTemplate = itemTemplate;
                this.#defaultTargetEl = enhancedElement;
            }
        }
        const itemTemplate = this.#itemTemplate;
        let targetEl = this.#defaultTargetEl;
        if(target instanceof Element){
            targetEl = target;
        }else if(target !== undefined){
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
        // render is registered on the host (or its propagator), so it reaches the
        // host and the target only weakly -- otherwise the host would keep a
        // removed target alive, and vice versa.
        const hostRef = new WeakRef(host);
        const targetRef = new WeakRef(targetEl);
        const render = async () => {
            const host = hostRef.deref();
            const targetEl = targetRef.deref();
            if(host === undefined || targetEl === undefined) return;
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
            host.addEventListener(updateOn, render, {signal});
        }else if(listProp !== undefined){
            let propagator = host.propagator;
            if(!(propagator instanceof EventTarget)){
                const {Infer} = /** @type {any} */ (await import('assign-gingerly/inferencer/inferencer.js'));
                propagator = await new Infer(host, listProp).getPropagator();
            }
            propagator.addEventListener(listProp, render, {signal});
        }else if(usesIterableMixin){
            // IterableMixin.setItems dispatches 'items-changed' on the instance
            host.addEventListener('items-changed', render, {signal});
        }

        return /** @type {PAP} */ ({...weakened, resolved: true});
    }
}

export {ThreePeat};
