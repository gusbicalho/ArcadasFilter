/* global Rx */
(function() {

  var form = $('#names-form');
  var textarea = form.find('textarea');
  var loader = $('#loader');
  var insideList = $('#inside ul');
  var outsideList = $('#outside ul');
  var errorPanel = $('#error-panel');
  var errorMsg = $('#error-msg');

  function showList(listElement, list) {
    listElement.empty();
    Rx.Observable.from(list)
      .map(function(person) {
        var item = $('<li>' + person.name + '</li>');
        if (!person.belongs || !person.results || person.results.length === 0) {
          return item;
        }
        if (person.results.length === 1 && person.results[0].name === person.name) {
          return $('<li>' + person.name + ' ('+ person.results[0].class +')</li>');
        }
        var resultList = $('<ul></ul>');
        resultList.appendTo(item);
        person.results.forEach(function(r) {
          resultList.append($('<li>' + r.name + ' ('+ r.class +')</li>'));
        })
        return item;
      })
      .subscribe(function(item) { listElement.append(item); });
  }

  form.submit(function(event) {
    var names = textarea.val()
      .split('\n')
      .map(function(s) { return s.trim(); })
      .filter(function(s) { return !!s; });

    loader.show();
    errorPanel.hide();
    insideList.empty();
    outsideList.empty();

    Rx.Observable.from(names)
      .flatMap(function(name) {
        return Rx.Observable.fromPromise($.get('/franz', {name: name}));
      })
      .scan(function(acc, x) {
        return x.belongs ?
                { inside: acc.inside.concat(x).sort(), outside: acc.outside } :
                { inside: acc.inside, outside: acc.outside.concat(x).sort() };
      }, {inside: [], outside: []})
      .subscribe(
        function(result) {
          showList(insideList, result.inside);
          showList(outsideList, result.outside);
        },
        function(error) {
          console.error(error);
          loader.hide();
          errorPanel.show();
          errorMsg.text(error.responseJSON.error);
        },
        function() {
          loader.hide();
        });
    return false;
  });

})();