function appendRow(type, name, abstract, path, time) {
	const icon = {
		'dir': 'folder',
		'file': 'file outline',
		'delete': 'delete'
	};
	$('#dir').append(`
	<tr>
		<td class="collapsing">
			<i class="${icon[type]} icon"></i><a href="#${path}">${name}</a>
		</td>
		<td>${abstract}</td>
		<td class="left aligned collapsing">${time}</td>
	</tr>`);
}
function appendMsg(type, msg) {
	$('#dir').append(`
	<tr class="${type}">
		<td colspan="3" class="center aligned"><b>${msg}</b></td>
	</tr>`);
}
function appendData(data) {
	appendRow(data.type, data.name, data.abstract || '', data.fullpath, data.time);
}

function checkEntry(data, keyword, tags) {
	try {
		if (keyword && !data.name.includes(keyword) && !data.path.includes(keyword)) return false;
		if (tags && data.tags && !data.tags.every(x => tags.includes(x))) return false;
		return true;
	} catch { return false; }
}
function findBlogs(data, keyword, tags) {
	if (checkEntry(data, keyword, tags))
		appendData(data);
	for (var i in data.files)
		findBlogs(data.files[i], keyword, tags);
}
function renderSearchFilter(url, data, tags) {
	try {
		appendRow('delete', '清除搜索条件', '', url.pathname || '/', '');

		var keyword = url.searchParams.get('keyword');
		var tagIds = url.searchParams.getAll('tagIds');

		if (keyword)
			$('#search-filters-row').append(`
<div class="ui grey small label"><i class="file alternate icon"></i>${keyword}<i class="delete icon" onclick="deleteKeyword()"></i></div>`);
		for (var i of tagIds)
			$('#search-filters-row').append(`
<div class="ui ${tags[i].color} small label">${tags[i].name}<i class="delete icon"></i></div>`);

		findBlogs(data, keyword, tags);
	} catch (e) {
		console.error(e);
	}
}

function renderFile(data) {
	var md = markdownit().use(markdownItKatexFixed);
	$.get('/src' + data.fullpath).then(content => {
		var html = md.render(content);
		$('#file-content').html(html);
		$('#file-content').show();
	});
}

function main() {
	$.get('/index.json').then(data => {
		window.blogData = data;
		renderPage();
	});
}
function renderPage() {
	$('#dir').html('');
	$('#file-content').html('');
	$('#file-content').hide();
	$('#search-filters-row').html('<strong>搜索条件</strong>');

	try {
		var url = new URL('blog:' + location.hash.substr(1));

		var hash = url.pathname;
		var path = hash.matchAll(/\/([^\/]+)/g);

		var cur = blogData, flag = true;
		for (var i of path) {
			var filename = decodeURIComponent(i[1]);
			cur = cur.files[filename];
			if (!cur) {
				flag = false;
				break;
			}
		}

		if (!flag) {
			console.error('PATH NOT FOUND');
			appendRow('dir', '/', '', '/', '');
			appendMsg('negative', '路径不存在');
			return;
		}

		if (cur.type !== 'root') {
			appendRow('dir', '/', '', '/' + (url.search || ''), '');
			appendRow('dir', '..', '', (url.pathname.replace(/\/[^/]*$/, '') || '/') + (url.search || ''), '');
		}

		initSearch(cur);
		if (cur.type === 'file')
			renderFile(cur);
		else if (cur.type === 'dir' || cur.type === 'root') {
			if (url.search)
				renderSearchFilter(url, cur, blogData.tags);
			else
				for (var i in cur.files) appendData(cur.files[i]);
		}
	} catch {
		location.hash = '#/';
	}
}

function init() {
	searchInit();
}

$(document).ready(init);
$(document).ready(main);
window.addEventListener('hashchange', main, false);