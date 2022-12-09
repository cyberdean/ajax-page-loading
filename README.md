# ajax-page-loading
Permet un chargement asynchrone du contenu, avec gestion de l'url de la page. Ainsi que de l'historique de navigation.
Les liens _blank, _top, # et sans href sont ignorés. (Supporte aussi bien les liens absolu que relatifs)

## Avantages / Pourquoi utiliser de l'ajax ?

Le premier est tout simplement que l'internaute ai moins de données à télécharger à chaque changement de page, ce qui de fait accélère le chargement.

Et ensuite on gagne aussi en rapidité car le navigateur n'a pas besoin de réinterpréter et de ré-initialiser tout votre javascript et css.

## Usage

Comment le mettre en place ? C'est très simple, vous n'avez pas besoin de toucher à vos liens. Des listeners seront ajoutés automatiquement sur les liens.
Cela permet que vos liens soient toujours utilisables, même sans Javascript ! (Auquel cas une requête "classique" est effectuée au lieu d'une ajax)

** Important ** (Sinon cela produira un erreur js et la page chargera normalement : pas en ajax)
Définir le container principal (qui contiendra le contenu à changer) :
```javascript
APL.setContainer(document.getElementById('mainContent'));
```

### Optionnel

Définir un callback qui sera exécuté après chaque chargement de page qui à réussi.
```javascript
APL.setCallback(function(url, params) {
	//todo what you want
});
```

Définir un callback qui sera exécuté après un chargement de page qui à échoué.
```javascript
APL.setFailCallback(function(url, data) {
	//todo what you want
});
```

Définir la barre du chargement /loader ajax (qui sera affiché / caché lors des requêtes ajax) :
```javascript
APL.setLoader(document.getElementById('loaderBar'));
```

Définir si une réponse doit être considéré comme un succès :
```javascript
APL.isSuccessCallback = function(request, data) {
    return request.status < 400 || typeof data !== 'undefined' && typeof data.view !== 'undefined';
};
```

### Ajax

L'appel ajax s'effectue sur l'url définie dans le href avec le paramètre `json=1`
Et s'attend à recevoir la structure json minimale suivante :
```json
{
	"view": "<div><h1>My title</h1>My html content</div>"
}
```

Optionnel :
Vous pouvez aussi passer des paramètres supplémentaires avec l'attribut "params", qui seront passés au callback (voir précédemment)
```json
{
	"view": "<div><h1>My title</h1>My html content</div>",
	"params": {"title": "My title page", "myparmeterOne": 42, "other":[]}
}
```