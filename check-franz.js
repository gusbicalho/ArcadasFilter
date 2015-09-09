var Rx = require('rx');
var request = require('request');

module.exports = function(req, res) {
  var name = req.query.name;
  if (!name)
    return res.status(401).json({error: 'NO_NAME'});
  console.log('check-franz', 'Request', name);
  checkName(name)
    .subscribe(
      function(results) {
        console.log('Response:', name, !!results, results);
        res.json({
          name: name,
          belongs: !!results,
          results: results
        });
      },
      function(error) {
        console.error(error, error.stack);
        var msg = error.message;
        if ('ENOENT' === error.code) {
          msg = 'Cannot reach arcadas.org.br';
        }
        res.status(500).json({error: msg});
      });
};

function checkName(name) {
  var reResultCount = /<span>Resultados Encontrados: <strong>(\d+)<\/strong><\/span>/g;
  var reResults = /<tr>\n<td class='tr-border t-align'>(.*?)<\/td>\n<td class='tr-border'>(.*?)<\/td>\n<td class='tr-border'>(.*?)<\/td>\n<td>(.*?)<\/td>\n<\/tr>/g;

  return Rx.Observable.fromNodeCallback(request, this, function(response, body) { return body; })
              ({
                url: 'http://www.arcadas.org.br/antigos_alunos.php?q=nome&qvalue='+encodeURIComponent(name),
                encoding: 'latin1'
              })
    .map(function(html) {
      html = html.split('\n')
              .map(function (line) { return line.trim(); })
              .filter(function(line) { return !!line; })
              .join('\n');
      var result = reResultCount.exec(html);
      if (!result) {
        return null;
      }
      var count = parseInt(result[1]);
      if (count === 0) {
        return null;
      }
      var results = [], r;
      while(r = reResults.exec(html)) {
        results.push({
          name: r[1],
          class: r[2]
        });
      }
      return results;
    })
    .single(function() { return true; });
}
