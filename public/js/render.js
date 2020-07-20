function renderFile(data) {
	var md = markdownit({
		highlight: function (str, lang) {
			if (lang && hljs.getLanguage(lang)) {
				try {
					return '<pre class="hljs"><code>' +
						hljs.highlight(lang, str, true).value +
						'</code></pre>';
				} catch (__) { }
			}
			return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
		}
	})
		.use(math_plugin)
		.use(front_matter_plugin, data => { });
	$.get('src' + data.path).then(content => {
		var html = $(md.render(content));
		var img = $('img', html);
		for (var i of img) {
			var src = $(i).attr('src');
			if (!isAbs(src)) {
				$(i).attr('src', `/src${routePath}/../${src}`);
				console.log(`${src} -> /src${routePath}/../${src}`);
			}
		}
		// TODO: <a>
		$('#file-content').html(html);
		$('#file-content').show();
	});
}

function renderClear() {
	$('#dir').html('');
	$('#file-content').html('');
	$('#file-content').hide();
	$('#search-filters-row').html('<b>搜索条件</b>');
	$('#search-options-row').html('<b>搜索选项</b>');
	$('#display-options-row').html('<b>预览选项</b>');
	appendTag('option', '', 'x', '没有搜索条件', '');
	appendTag('filter', '', 'x', '没有搜索条件', '');
}

function renderPage() {
	console.log('[fe] renderPage()');
	if (curData.type !== 'root') {
		appendRow('dir', '/', '', '/' + (routeUrl.search || ''), '', '', 'data-topmost');
		appendRow('dir', '..', '', (routeUrl.pathname.replace(/\/[^/]*$/, '') || '/') + (routeUrl.search || ''), '', '', 'data-topmost');
	}

	if (curData.type === 'file')
		renderFile(curData);
	else if (curData.type === 'dir' || curData.type === 'root')
		for (var i of displayContent)
			appendData(i, isSearchResult ? '' : routeUrl.search);
}