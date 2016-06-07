var express = require('express');
var router = express.Router();
var fs = require("fs");
var request = require('request');
var Firebase = require('firebase');
var async = require('async');
var client_id = process.env.GITHUB_CLIENT_ID;
var client_secret = process.env.GITHUB_CLIENT_SECRET;
var auth = "?client_id="+client_id+"&client_secret="+client_secret;

var fileName = "./sample-detail.json";
var config;
try {
  config = require(fileName)
}
catch (err) {
  config = {};
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var currTime = (new Date).getTime();
  var render = function(time){
    var ref = new Firebase("https://website3128.firebaseio.com/projects/"+time);
    ref.once("value", function(data) {
      if(data != null){
        res.render('index', { title: 'Olumide Awofeso', projects: data.val() });
      }else{
        res.render('index', { title: 'Olumide Awofeso'});
      }
    }, function(err){
      res.render('index', { title: 'Olumide Awofeso'});
    });
  }

  var getInfo = function(path, callback){
    console.log(path);
    var url = "https://api.github.com/repos/"+ path + "/contents/web.details.json"+auth;
    var options = {
      url: url,
      headers: {
        'User-Agent': '0lumide/PersonalWebsite'
      }
    };
    request(options, function (err, response, body) {
        console.log(response.statusCode);
      if (!err && response.statusCode == 200) {
        var fileData = JSON.parse(body);
        var fileUrl = fileData['download_url'];
        var options = {
          url: fileUrl,
          headers: {
            'User-Agent': '0lumide/PersonalWebsite'
          }
        };
        request(options, function (err, response, body) {
          if (!err && response.statusCode == 200) {
            try{
              callback(JSON.parse(body));
            }catch(err){
              callback();
            }
          }else
            callback();
        });
      }else{
        if(err)
          console.log(err);
        callback();
      }
    });
  };
  var fetch = function(){
    var url = 'https://api.github.com/users/0lumide/repos'+auth;
    var options = {
      url: url,
      headers: {
        'User-Agent': '0lumide/PersonalWebsite'
      }
    };
    var calls = [];
    calls.push(function(callback){
      request(options, function (err, response, body) {
        if (!err){
          if(response.statusCode == 200) {
            var repoData = JSON.parse(body);
            var dataCalls = [];
            repoData.forEach(function(obj){
              if(!obj["fork"]){
                dataCalls.push(function(callback){
                  var ref = new Firebase("https://website3128.firebaseio.com/projects/"+currTime);
                  getInfo(obj["full_name"], function(data){
                    if(data){
                      if(!data["ignore"]){
                        data.iconImage = "img/" + obj["name"] + "/" + data.iconImage;
                        for (var i in data.media) {
                          data.media[i] = "img/" + obj["name"] + "/" + data.media[i];
                        }
                        data["github"] = obj["html_url"];
                        ref.push(data, function(error){
                          callback();
                        });
                      }else{
                        callback();
                      }
                    }else{
                      callback();
                    }
                  });
                });
              }
            });
            dataCalls.push(function(callback){
              var ref = new Firebase("https://website3128.firebaseio.com/last-modified");
              ref.set(currTime, function(data) {callback()});
            });
            async.parallel(dataCalls, function(err, result){
              callback();
            });
          }else{
            console.log(response);
          }
        }else{
          console.log(err);
        }
      });
    });
    calls.push(function(callback){
      request({url: 'https://api.github.com/repos/0lumide/MoreProjects/contents/list.details.json'+auth,
      headers: {'User-Agent': '0lumide/PersonalWebsite'}}, function (err, response, body) {
        if (!err && response.statusCode == 200) {
          var fileData = JSON.parse(body);
          var fileUrl = fileData['download_url'];
          var options = {
            url: fileUrl,
            headers: {
              'User-Agent': '0lumide/PersonalWebsite'
            }
          };
          request(options, function (err, response, body) {
            if (!err && response.statusCode == 200) {
              var moreCalls = [];
              JSON.parse(body).forEach(function(obj){
                moreCalls.push(function(callbacks){
                  var ref = new Firebase("https://website3128.firebaseio.com/projects/"+currTime);
                    obj.iconImage = "img/MoreProjects/" + obj.iconImage;
                  for (var i in obj.media) {
                    obj.media[i] = "img/MoreProjects/" + obj.media[i];
                  }
                  obj["title"] = obj["title"].replace("-", " ");
                  ref.push(obj, function(error){
                    callbacks();
                  });
                });
              });
              async.parallel(moreCalls, function(err, result){
                callback();
              });
            }else
              callback();
          });
        }else{
          if(!err)
            console.log(response);
          else
            console.log(err);
          callback();
        }
      });
    });

    async.parallel(calls, function(err, result){
      render(currTime);
    });
  };

  var modifiedRef = new Firebase("https://website3128.firebaseio.com/last-modified");
  modifiedRef.once("value", function(data) {
    if(data != null){
      var currTime = (new Date).getTime();
      var oldTime = data.val();
      console.log(data.val());
      if(currTime - oldTime < 24*60*60*1000){
        console.log("File is current");
        render(oldTime);
      }else{
        console.log("File is stale");
        fetch();
      }
    }else{
      fetch();
    }
  }, function(err){
    console.log(err);
    fetch();
  });
});

router.get('/resume', function(req, res){
  res.render('resume');
});

router.get('/QAResume', function(req, res){
  res.render('QAResume');
});
module.exports = router;
