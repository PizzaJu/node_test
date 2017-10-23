var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');
var eventproxy = require('eventproxy');
var url = require('url');

var ep = new eventproxy();

/*var app = express();

app.get('/', function(req, res, next){
	superagent
		.get('http://cnodejs.org/')
		// .set('User-Agent','https://www.google.com')
		.end(function(err, sres){
			if(err)
				return next(err);
			var $ = cheerio.load(sres.text);
			var items = [];
			
			$('#topic_list .topic_title').each(function(idx, element){
				var $element = $(element);
				items.push({
					title:$element.attr('title'),
					href:$element.attr('href')
					
				});
			});
			res.send(items);
		});
});

app.listen(3000, function(req, res){
	console.log('Server is running at port 3000');
});*/

var cnodeUrl = 'http://cnodejs.org/';
superagent.get(cnodeUrl)
	.end(function(err, res){
		if(err)
			return console.log(err);
		var topicUrls = [];         //话题的url数组
		var topicInfo = [];         //话题信息数组
		var userUrls = [];
		var userInfo = [];
		var needInfo = [];
		var $ = cheerio.load(res.text);
		$('#topic_list .topic_title').each(function(idx, element){
			var $element = $(element);
			// var $idx = $(idx);
			var href = url.resolve(cnodeUrl, $element.attr('href'));
			topicUrls.push(href);            //topicUrls存储爬取的href
			if(idx == 3)
				return false;
		});

		

		ep.after('topic_html', topicUrls.length, function(topics){      //监听topic_html事件
			topicInfo = topics.map(function(topicPair){
				var topicUrl = topicPair[0];                //topicUrl
				var topicHtml = topicPair[1];				//res.text
				var $ = cheerio.load(topicHtml);
				return({
					title: $('.topic_full_title').text().trim(),       //text文本内容  trim去掉两段空白
					href: topicUrl,
					comment1: $('.reply_content').eq(0).text().trim(),  //eq(0)选择第一个元素
					userUrl: url.resolve(cnodeUrl,$('.user_avatar').eq(1).attr('href'))
				});
				
			});
			console.log('final:');
			console.log(topicInfo);
			topicInfo.forEach(function(topicInfoEvery){
				userUrls.push(topicInfoEvery.userUrl);               //第一个评论的用户的url数组
			});
			// console.log(userUrls);

			ep.after('user_html', userUrls.length, function(users){
				userInfo = users.map(function(userPair){
					// var userUrl = userPair[0];
					var userHtml = userPair[1];
					// console.log(userHtml);
					var $ = cheerio.load(userHtml);
					// console.log($);
					return({

						author: $('img.user_avatar').eq(0).attr('title'),
						integral: $('.big').eq(1).text().trim()
					})
				});
				console.log(userInfo);	
				// console.log(user[0]);
			})

			userUrls.forEach(function(userUrl){
				superagent.get(userUrl)
					.end(function(err, res){
						ep.emit('user_html',[userUrl, res.text]);
						// console.log(userUrl);
					});
			});
			
		});

		

			// console.log(userUrls);
			/*userUrls = topicInfo.userUrl;
			console.log(userUrls);*/
			
			
		topicUrls.forEach(function (topicUrl){
			superagent.get(topicUrl)        //继续抓取每一条topicUrl 首页上的话题href
				.end(function(err,res){
					// console.log('fetch ' + topicUrl +' successful')   //打印href
					ep.emit('topic_html',[topicUrl, res.text])     //发射topic_html事件并传入参数
					// console.log(res.text);
					// console.log(topicUrl)
				})
		})	

	})