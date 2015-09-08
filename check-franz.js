module.exports = function(req, res, next) {
  var name = req.query.name;
  if (!name)
    return res.status(401).json({error: 'NO_NAME'});
  res.json({name: name, belongs: Math.random() < 0.5});
};