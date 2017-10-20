var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');

var app = express();

app.get('/', function(req, res, next){
	superagent
		.get('http://cnodejs.org/')
		/*.set('User-Agent','https://www.google.com')*/
		.end(function(err, sres){
			if(err)
				return next(err);
			var $ = cheerio.load(sres.text);
			var items = [];
			$('.cell').each(function(idx, element){
				var $user = $(element).find('a').find('img');
				var $title = $(element).find('.topic_title');
				items.push({
					title:$title.attr('title'),
					author:$user.attr('title'),
					href:$title.attr('href'),
					
				});
			})

			

			/*$('#topic_list .topic_title').each(function(idx, element){
				var $element = $(element);
				items.push({
					title:$element.attr('title'),
					href:$element.attr('href')
					
				});
			});*/
			res.send(items);
		});
});

app.listen(3000, function(req, res){
	console.log('Server is running at port 3000');
});

