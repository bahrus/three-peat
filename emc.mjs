//@ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/three-peat/types' */
/** @import {RAConfig} from './types/roundabout/types' */

/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions> >}
 */
export const emc = {
    enhConfig: {
        enhKey: 'three-peat',
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
                ifKeyIn: ['src', 'listProp', 'initialized'],
                ifAllOf: ['enhancedElement', 'initialized']
            }
        }
    }
};

export function render(){
    return JSON.stringify(emc, null, 4);
}
