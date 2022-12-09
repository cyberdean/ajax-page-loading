/* ===========================================================
 * ajaxPageLoading - Dev version
 * ===========================================================
 * Copyright 2016-2020 Cyberdean
 * https://cyberdean.fr
 *
 * Permet un chargement asynchrone du contenu, avec gestion de l'url,
 * du titre de la page. Ainsi que de l'historique de navigation.
 * Gère le préchargement avant le clic.
 *
 * https://github.com/cyberdean/ajax-page-loading
 * Under GNU GENERAL PUBLIC LICENSE Version 3
 *
 * ========================================================== */
const APL = {
  loader: null,
  container: null,
  callback: null,
  failCallback: null,
  preloadMap: {},
  isSuccessCallback: function(request){
    return request.status < 400;
  },
  setFailCallback: function(callback) {
    this.failCallback = callback;
  },
  setCallback: function(callback) {
    this.callback = callback;
  },
  setLoader: function(elem) {
    this.loader = elem;
  },
  setContainer: function(elem) {
    this.container = elem;
  },

  loadAjax: function(res, textContent, href) {
    if (!res.startsWith('/')) { res = '/' + res;}

    if (this.loader != null) {
      this.loader.style.display = 'block';
    }

    const request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState !== 4) {
        // handle preload
        return;
      }

      try {
        const data = JSON.parse(request.responseText);
        if (APL.isSuccessCallback(request, data)) {
          // handle successful request
          if (textContent != null && href != null) {
            history.pushState(res, textContent, href); // Add an item to the history log
          }
          APL.container.innerHTML = data.view;
          if (APL.callback != null) {
            APL.callback(res, data.params);
          }
          APL.addListener();
        }
        else if (APL.failCallback != null) {  // handle error
          APL.failCallback(res, data);
        }
      }
      catch {
        // handle error
        if (APL.failCallback != null) {
          APL.failCallback(res, data);
        }
      }
      if (APL.loader != null) {
        APL.loader.style.display = 'none';
      }
    };
    request.open('GET', res + (res.indexOf('?') === -1 ? '?' : '&') + 'j=1', true);
    request.setRequestHeader('Accept', 'application/json');
    request.send();
  },
  getUrl: function(event) {
    //currentTarget au lieu de target car currentTarget référance toujours l'élément auquel est attaché l'event. Sinon target renvoi l'élément contenu dans l'élément qui a l'event
    let url;
    let hrefAttr = event.currentTarget.getAttribute('href');
    if (hrefAttr.indexOf('/') === -1 || hrefAttr.startsWith('./')) {
      //relative link
      let baseurl = window.location.pathname;
      if (hrefAttr.startsWith('./')) {hrefAttr = hrefAttr.substr(2);}

      if (!baseurl.endsWith('/')) { baseurl = baseurl + '/' }
      url = baseurl + hrefAttr;
    }
    else {
      url = event.currentTarget.getAttribute('href');
    }
    return url;
  },
  clickHandler: function(event) {
    const url = APL.getUrl(event);
    APL.loadAjax(url, event.currentTarget.textContent, event.currentTarget.href);

    // Revert to a previously saved state
    window.onpopstate = function (evt) {
      if(evt.state == null){
        APL.loadAjax('/');
      }
      else {
        APL.loadAjax(evt.state);
      }
    };
    // Store the initial content so we can revisit it later
    /*history.replaceState({
     content: contentEl.textContent,
     photo: photoEl.src
     }, document.title, document.location.href);*/
    return event.preventDefault();
  },
  onMouseOverHandler: function (event) {
    const url = APL.getUrl(event);
    if (APL.preloadMap[url] !== false) {
      APL.preloadMap[url] = setTimeout(function () {
        APL.preloadMap[url] = false; // avoid to preload multiple times
        const request = new XMLHttpRequest();
        request.open('GET', url + (url.indexOf('?') === -1 ? '?' : '&') + 'j=1', true);
        request.setRequestHeader('Accept', 'application/json');
        request.send();
      }, 300);
    }
  },
  onMouseOutHandler: function(event) {
    const url = APL.getUrl(event);
    if (APL.preloadMap[url] !== false) {
      clearTimeout(APL.preloadMap[url]);
      delete APL.preloadMap[url];
    }
  },
  addListener: function() {
    const linkEls = document.getElementsByTagName('a');
    // Attach event listeners
    for (let i = 0, l = linkEls.length; i < l; i++) {
      if (linkEls[i].hasAttribute('target') && !(linkEls[i].getAttribute('target') === '_parent' || linkEls[i].getAttribute('target') === '_self'))
      { //on ignore _blank _top
        continue;
      }

      const hasHref = linkEls[i].hasAttribute('href');
      if (!hasHref || hasHref && linkEls[i].getAttribute('href').indexOf('#') === 0){
        continue;
      }

      const elem = linkEls[i].getAttribute('href').split('/');
      if (elem.length > 0 && elem.pop().indexOf('#') === 0) {
        continue;
      }

      linkEls[i].removeEventListener('click', this.clickHandler);
      linkEls[i].addEventListener('click', this.clickHandler);

      // preload
      linkEls[i].removeEventListener("mouseover", this.onMouseOverHandler);
      linkEls[i].addEventListener("mouseover", this.onMouseOverHandler);
      linkEls[i].removeEventListener("mouseout", this.onMouseOutHandler);
      linkEls[i].addEventListener("mouseout", this.onMouseOutHandler);
      // preload touch events
      linkEls[i].removeEventListener("touchstart", this.onMouseOverHandler);
      linkEls[i].addEventListener("touchstart", this.onMouseOverHandler);
      linkEls[i].removeEventListener("touchcancel", this.onMouseOutHandler);
      linkEls[i].addEventListener("touchcancel", this.onMouseOutHandler);
      linkEls[i].removeEventListener("touchend", this.onMouseOutHandler);
      linkEls[i].addEventListener("touchend", this.onMouseOutHandler);
    }
  }
};

(function() {
  APL.addListener();
})();
