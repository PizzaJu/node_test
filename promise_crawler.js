var http = require('http');
var Promise = require('bluebird');
var cheerio = require ('cheerio');
var superagent = require('superagent');

var baseUrl = 'http://www.imooc.com/learn/';
var ScottUrl = 'http://www.imooc.com/t/108492';
var courserRequestUrl = 'http://www.imooc.com/course/AjaxCourseMembers?ids=';


superagent.get(ScottUrl)
	.end(function(err, res){
		if(err){
			return console.log(err);
		}
		var courseIds = [];
		var fetchCourseArray = [];             //promise对象数组
		var coursesData = [];
		var courseNumbers = {id:[], number:[]};
		

		var $ = cheerio.load(res.text);
		var course = $('.course-del-box .moco-course-wrap');
		course.each(function(item){
			var courseId = $(this).find('a').attr('href');
			courseIds.push(courseId.replace(/\D/ig, ""));
			
		});
		
		// console.log(courseIds);

		function getPageAsync(courseId){                            //对课程的url进行promise化
			return new Promise(function(resolve, reject){      
				superagent.get(courseId)
					.end(function(err, res){
						if(err){
							return console.log(err);
						}
						resolve(res.text);
					});
			});
		}

		function getCourseMembers(id)   
		{
			var url = courserRequestUrl + id;
			
			superagent.get(url)                                 //发送AJAX请求
				.end(function(err, res){
					if(err){
						return console.log(err);
					}
					var datas = JSON.parse(res.text);
					// courseNumbers.id.push(id);
					console.log(id);
					// courseNumbers.number.push(datas.data[0].numbers);
					console.log(datas.data[0].numbers);
				});
		}

		function pageHandle(html){                 //对页面内容进行分析
			var courseInfo = [];
			
			 // courseInfo: [
			 // 	title:
			 // 	number:
			 // 	score:	
			 // ]
			var $ = cheerio.load(html);
			var title = $('div .path').find('a').eq(3).text();
			// var number = $('div .static-item').eq(0).find('span').eq(1).text();
			var score = $('div .static-item').eq(3).find('span').eq(1).text();
			courseInfo.push({
				coursetitle : title,
				// courseNumber : number,
				courseScore : score
			});
			return courseInfo;
		}

		courseIds.forEach(function(item){                 //courseIds进行遍历
			// console.log(item);
			fetchCourseArray.push(getPageAsync(baseUrl + item));

			getCourseMembers(item);
			// console.log(id);
		});
		// console.log(courseNumbers);
		// console.log(fetchCourseArray);
		Promise
			.all(fetchCourseArray) 
			.then(function(pages){                //pages是一个
				
				// console.log(pages);
				pages.forEach(function(html){
					// console.log(html+'\n');
					var courseInfo = pageHandle(html);
					coursesData.push(courseInfo);
				});
				console.log(coursesData);
			});
				
	});
