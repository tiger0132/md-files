const contentType = {
	'root': '根目录',
	'dir': '目录',
	'file': '文件'
}

var content = [];
function traverseBlogs(data, keyword, tags) {
	if (data.name)
		content.push({
			title: data.name,
			description: data.abstract,
			url: '#' + data.fullpath,
			category: contentType[data.type]
		});
	for (var i in data.files)
		traverseBlogs(data.files[i], keyword, tags);
}
function initSearch(data) {
	content = [];
	traverseBlogs(data);
	console.log(content);
	$('#search-box').search({
		type: 'category',
		source: content
	});
}

function deleteKeyword() {
	var url = new URL('blog:' + location.hash.substr(1));
	url.searchParams.delete('keyword');
	location.hash = url.pathname + url.search;
}

function searchInit() {
	$('#search-box').keydown(function (e) {
		console.log(e.keyCode);
		if (e.keyCode !== 13) return;

		var url = new URL('blog:' + location.hash.substr(1));
		url.searchParams.set('keyword', $('#search-input')[0].value);
		location.hash = url.pathname + url.search;

		$(this).search('set value', '');
		$(this).search('hide results');
	});
}