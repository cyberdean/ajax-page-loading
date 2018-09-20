/* ===========================================================
 * ajaxPageLoading - Dev version
 * ===========================================================
 * Copyright 2016-2018 Dean79000
 * https://cyberdean.fr
 *
 * Permet un chargement asynchrone du contenu, avec gestion de l'url,
 * du titre de la page. Ainsi que de l'historique de navigation.
 *
 * https://github.com/Dean79000/ajax-page-loading
 * Under GNU GENERAL PUBLIC LICENSE Version 3
 *
 * ========================================================== */
const APL = {
  loader: null,
  container: null,
  callback: null,
  failCallback: null,
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
      if (request.readyState < 4) {
        // handle preload
        return;
      }
      if (request.status !== 200) {
        // handle error
        if (APL.failCallback != null) {
          const data = JSON.parse(request.responseText);
          APL.failCallback(res, data);
        }

        if (APL.loader != null) {
          APL.loader.style.display = 'none';
        }
        return;
      }
      if(request.readyState === 4) {
        // handle successful request
        if (textContent != null && href != null) {
          history.pushState(res, textContent, href); // Add an item to the history log
        }

        const data = JSON.parse(request.responseText);

        APL.container.innerHTML = data.view;
        if (APL.callback != null) {
          APL.callback(res, data.params);
        }
        APL.addListener();

        document.getElementById(APL.container).innerHTML = request.responseText;

        if (APL.loader != null) {
          APL.loader.style.display = 'none';
        }
      }
    };
    request.open('GET', res, true);
    request.setRequestHeader('Accept', 'application/json');
    request.send();
  },
  clickHandler: function(event) {
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
    }
  }
};

(function() {
  APL.addListener();
})();
