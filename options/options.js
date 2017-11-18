'use strict';

class DOMRenderer {
    /**
     *
     * @param {HTMLElement} root
     */
    constructor(root) {
        var queue = [root];

        while (queue.length) {
            var el = queue.shift();
            var attrs = el.attributes;
            for (let i = 0; i < attrs.length; i++) {
                const attr = attrs[i];
                attr.name
            }
        }
    }
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
            container.appendChild(node);
        }

        // further_trig
        if (this.active_idx >= arr.length) this.active(arr.length - 1);
    }

    /**
     *
     * @param {HTMLElement} c
     * @param {object} obj
     * @param {number} i
     */
    updateChild(c, obj, i) {
        c.innerHTML = this.templateHTML.replace(/{{\s*([\$\w\.]+)\s*}}/g, (e, key) => {
            if (key === '$i') return i;
            var sep = key.split('.');
            var retval = obj;
            while (sep.length) retval = retval[sep.shift()];
            return retval;
        });

        c.setAttribute("index", i);
    }
}

/** @type {GOptions} */
var options = null;

var profileList = new ListRenderer(document.querySelector('#profiles .itemlist'));

browser.runtime.sendMessage("opt:pull").then((/** @type {GOptions} */o) => {
    options = o;

    profileList.render(options.profiles);
})
