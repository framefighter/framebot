declare module "warframe-worldstate-parser" {
    /**
 * @param {string} json The worldstate JSON string
 * @param {Object} [deps] The options object
 */
    export default class WorldState implements wf.Ws {
        constructor(json: string, deps?: any)
    }
}