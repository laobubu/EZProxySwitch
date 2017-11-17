/**
 * ForEach element
 * 
 * @param {string} selector 
 * @param {(el: HTMLElement, index: number)=>void} func 
 */
function $$each(selector, func) {
    [].forEach.call(document.querySelectorAll(selector), func);
}
