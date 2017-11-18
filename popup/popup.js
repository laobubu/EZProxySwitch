var curpid = null;

function highlight_profile(idx) {
    curpid = idx;
    $$each(".item.active", (el) => { el.className = 'item' })
    var ti = document.querySelector('.item[idx="' + idx + '"]');
    if (ti) ti.className = 'active item';
}

var list = document.getElementById('list');
list.addEventListener('click', (ev) => {
    /** @type {HTMLDivElement} */
    var target = ev.target;
    if (!/\bitem\b/.test(target.className)) return;

    var pid = parseInt(target.getAttribute("idx") || "0");
    if (curpid === pid) {
        // already current proxy. refresh tab.
        browser.runtime.sendMessage('popup:refresh');
    } else {
        // switch to the selected
        browser.runtime.sendMessage({ type: "popup:select", profile_idx: pid }, () => {
            highlight_profile(pid);
        })
    }
}, true);

browser.runtime.sendMessage("popup:list")
    .then(res => {
        /** @type {Profile[]} */
        var profiles = res.profiles;
        for (let i = 0; i < profiles.length; i++) {
            let profile = profiles[i];
            if (profile.hidden) continue;

            let item = $$make('div', {
                class: 'item',
                title: profile.description || '',
                idx: i
            });

            let ball = $$make('span', {
                class: 'ball',
                style: `color: ${profile.color || '#EEE'}`,
            });

            item.appendChild(ball);
            item.appendChild(document.createTextNode(profile.name));
            list.appendChild(item);
        }

        highlight_profile(res.profile_idx);
    })
