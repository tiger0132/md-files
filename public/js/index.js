var pathStk, routePath, routeUrl, routeParams;
var displayContent, searchContent;
var rootData, curData;

var isSearchResult;

async function main() {
	try {
		renderClear();

		curData = procPath();
		if (!curData) return;

		displayContent = traverseBlogs(curData, routeParams.get('disp_subdir') || false);

		searchMain();
		await renderPage();
		setTimeout(restoreScroll, 100);
	} catch (e) {
		if (e === 'no redirect') {
			console.log('[fe] aborted');
			return;
		}

		console.error(e);
		location.hash = '#/';
	}
}

function procPath() {
	console.log('[fe] procPath()');

	routeUrl = new URL('blog:' + location.hash.substr(1));
	routeParams = routeUrl.searchParams;

	var hash = routeUrl.pathname;
	var pathParts = hash.matchAll(/\/([^\/]+)/g);
	var cur = rootData, legalPath = true;

	pathStk = [];
	for (var i of pathParts) {
		var filename = decodeURIComponent(i[1]);
		if (filename === '..') {
			pathStk.pop();
			cur = pathStk.length ? pathStk[pathStk.length - 1] : rootData;
		} else {
			cur = cur.files[filename];
			pathStk.push(cur);
		}
		if (!cur) {
			legalPath = false;
			break;
		}
	}

	if (!legalPath) {
		console.error('[fe] path not found');
		appendRow('dir', '/', '', '/', '');
		appendMsg('negative', '路径不存在');
		return;
	}

	routePath = cur.path;
	if (cur.path !== hash) {
		location.hash = cur.path;
		throw 'no redirect';
	}
	return cur;
}
function globalInit() {
	$.get('index.json').then(data => {
		rootData = data;
		main();
	});
}
function clearGlobals() {
	isSearchResult = false;
}

$(document).ready(globalInit);
window.addEventListener('hashchange', main, false);