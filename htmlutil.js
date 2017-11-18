/**
 * ForEach element
 *
 * @param {string} selector
 * @param {(el: HTMLElement, index: number)=>void} func
 */
function $$each(selector, func) {
    [].forEach.call(document.querySelectorAll(selector), func);
}

/**
 * Create element or update attributes
 *
 * @param {string|Element} target
 * @param {object} attrs
 */
function $$make(target, attrs = {}) {
    var o = typeof target === 'string' ? document.createElement(target) : target;
    for (const key in attrs) {
        o.setAttribute(key, attrs[key]);
    }
    return o;
}

/**
 * Add `change` event handler
 *
 * @param {HTMLElement|string} dom element or selector string
 * @param {(value:string, dom:HTMLElement)=>void} callback
 *
 * @returns {HTMLElement}
 */
function $$change(dom, callback) {
    if (typeof dom === 'string') dom = document.querySelector(dom);
    dom.addEventListener('change', (ev) => callback(dom.value, dom), false);
    return dom;
}


class ListRenderer {
    /**
     *
     * @param {HTMLElement} container
     */
    constructor(container) {
        this.container = container;
        var template = this.template = container.firstElementChild;
        this.templateHTML = template.innerHTML;
        this.active_idx = -1;

        this.onActive = /** @type {(index:number)=>void} */(null);

        container.addEventListener("click", (ev) => {
            if (ev.target.parentElement !== container) return;
            var index = ~~ev.target.getAttribute("index");
            this.active(index);
        }, true);

        container.removeChild(template);
    }

    /**
     * Populate a dom, with an object and index.
     *
     * @param {HTMLElement} dom
     * @param {object} obj
     * @param {number} i
     */
    updateChild(dom, obj, i) {
        // User shall implement this.
    }

    /**
     * Implement updateChild
     *
     * @param {number} [index]
     * @param {object} data
     */
    updateAt(index, data) {
        if (typeof index === 'object') {
            data = index;
            index = this.active_idx;
        }
        var dom = this.container.children[index];
        this.updateChild(dom, data, index);
        return dom;
    }

    /**
     * Call Object.assign to arr[active_idx], then update DOM
     *
     * @param {object[]} arr
     * @param {object} partialData
     */
    updateMV(arr, partialData, noTrigActive = false) {
        var index = this.active_idx;
        Object.assign(arr[index], partialData);
        this.updateAt(index, arr[index]);

        if (!noTrigActive && typeof this.onActive === 'function') this.onActive(index);
    }

    active(index) {
        var oldIndex = this.active_idx;
        if (oldIndex >= 0) {
            let oldEle = this.container.children[oldIndex];
            if (oldEle) oldEle.classList.remove('active');
        }

        this.container.children[index].classList.add('active');
        this.active_idx = index;

        if (typeof this.onActive === 'function') this.onActive(index);
    }

    /**
     *
     * @param {object[]} arr
     */
    render(arr) {
        var container = this.container;
        var template = this.template;
        while (container.childElementCount > arr.length) container.removeChild(container.lastElementChild);

        // modify current items
        let cs = container.children;
        for (let i = 0; i < cs.length; i++) {
            this.updateChild(cs[i], arr[i], i);
        }

        // add more element
        for (let i = cs.length; i < arr.length; i++) {
            let node = document.importNode(template, true);
            this.updateChild(node, arr[i], i);
            node.setAttribute("index", i);
            container.appendChild(node);
        }

        // further_trig
        if (this.active_idx >= arr.length) this.active(arr.length - 1);
    }
}
