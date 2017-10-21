var eventproxy = require('eventproxy');
var fs = require('fs');

var ep = eventproxy();

ep.all('read1','read2','read3',function(data1, data2, data3){
	console.log(data1+ '~'+ data2 + '~'+data3);
});
fs.readFile('1.txt', 'UTF-8', function(err,data1){
	ep.emit('read1', data1);
});
fs.readFile('2.txt', 'UTF-8', function(err,data2){
	ep.emit('read2', data2);
});
fs.readFile('3.txt', 'UTF-8', function(err,data3){
	ep.emit('read3', data3);
});