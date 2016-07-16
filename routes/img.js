var express = require('express');
var router = express.Router();
var request = require('request');
var client_id = process.env.GITHUB_CLIENT_ID;
var client_secret = process.env.GITHUB_CLIENT_SECRET;
var auth = "?client_id="+client_id+"&client_secret="+client_secret;

router.get(/\/([^\/]+)\/(.+)/, function(req, res, next) {
  var path = req.params[1];
  var project = req.params[0];

  var url = 'https://api.github.com/repos/0lumide/'+project+"/contents/"+path+auth;
  var opts = {
    url: url,
    headers: {
      'User-Agent': '0lumide/PersonalWebsite'
    }
  };
  request(opts, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      var fileData = JSON.parse(body);
      var fileUrl = fileData['download_url'];
      var options = {
        url: fileUrl,
        encoding: null,
        headers: {
          'User-Agent': '0lumide/PersonalWebsite'
        }
      };
      request(options, function (err, response, body) {
        if (!err && response.statusCode == 200) {
          res.set('Content-Type', response.headers['content-type']);
          res.end(body);
        }else
          res.sendStatus(response.statusCode);
      });
    }else{
      if(!err)
        console.log(response.statusCode);
      else
        console.log(err);
      res.sendStatus(response.statusCode);
    }
  });
});

module.exports = router;
