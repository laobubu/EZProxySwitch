'use strict'

/**
 * browserAction generator
 */

class IconGen {
  /**
   *
   * @param {string} path original image
   * @param {string|RegExp} placeholder color string to be replaced
   * @param {number} size width & height in pixels
   */
  constructor(path, placeholder, size) {
    fetch(browser.runtime.getURL(path)).then(res => res.text()).then(tpl => { this.template = tpl });
    this.placeholder = placeholder;
    this.size = size;
  }

  /**
   *
   * @param {string} color
   * @returns {Promise<ImageData>}
   */
  generate(color) {
    return new Promise((res) => {
      var size = this.size;
      var img = new Image(size, size);
      var canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      img.onload = function () {
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        res(ctx.getImageData(0, 0, size, size));
      };
      img.src = "data:image/svg+xml," + encodeURIComponent(this.template.replace(this.placeholder, color));
    });
  }
}
