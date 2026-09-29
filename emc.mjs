//@ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/three-peat/types' */
/** @import {RAConfig} from './types/roundabout/types' */

/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions> >}
 */
export const emc = {
    enhConfig: {
        enhKey: 'threePeat',
        spawn: 'three-peat/three-peat.js',
        withAttrs: {
            base: 'three-peat',
            listProp: '${base}-list-prop',
            src: '${base}-src',
            each: '${base}-each',
            _each: {
                instanceOf: 'Object'
            },
            target: '${base}-target',
            updateOn: '${base}-update-on'
        }
    },
    customData: {
        weakRef: {
            properties: ['enhancedElement']
        },
        actions: {
            hydrate: {
                // every end-user prop is listed, so that roundabout monitors
                // them all -- reassigning any one (programmatically) re-renders.
                ifKeyIn: ['src', 'listProp', 'each', 'target', 'updateOn', 'initialized'],
                ifAllOf: ['enhancedElement', 'initialized']
            }
        }
    }
};

export function render(){
    return JSON.stringify(emc, null, 4);
}
