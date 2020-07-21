async function renderFile(data) {
	$('#file-content').html(`
<div class="ui active text loader">Loading</div>
<div style="height: 7rem"></div>`);
	$('#file-content').show();

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
		},
		html: true
	})
		.use(math_plugin)
		.use(front_matter_plugin, data => { })
		.use(container_plugin, 'spoiler', {
			validate: function (params) {
				return params.trim().match(/^spoiler\s+(.*)$/);
			},
			render: function (tokens, idx) {
				var m = tokens[idx].info.trim().match(/^spoiler\s+(.*)$/);
				if (tokens[idx].nesting === 1) {
					return `
<p>
	<div class="ui styled fluid accordion">
		<div class="title">
			<i class="dropdown icon"></i>${md.utils.escapeHtml(m[1])}
		</div>
		<div class="content">`;
				} else {
					return '</div></div></p>\n';
				}
			}
		})
		.use(container_plugin, 'dividerL', {
			validate: function (params) {
				return params.trim().startsWith('dividerL');
			},
			render: function (tokens, idx) {
				if (tokens[idx].nesting === 1) {
					return `
<div class="ui segment">
	<div class="ui two column very relaxed grid">
		<div class="column">`;
				} else {
					return '</div><div class="column">\n';
				}
			}
		})
		.use(container_plugin, 'dividerR', {
			tmp: 'ze',
			validate: function (params) {
				return params.trim().startsWith('dividerR');
			},
			render: function (tokens, idx) {
				var m = tokens[idx].info.trim().match(/^dividerR\s+(.*)$/);
				console.log(tokens[idx].nesting, m);
				if (tokens[idx].nesting === 1) {
					tmp = md.utils.escapeHtml(m[1]);
					return '';
				} else {
					return `</div></div><div class="ui vertical divider">${tmp}</div></div>\n`;
				}
			}
		});
	const content = await $.get('src' + data.path);
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
	console.log('rendered');
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

async function renderPage() {
	console.log('[fe] renderPage()');
	if (curData.type !== 'root') {
		appendRow('dir', '/', '', '/' + (routeUrl.search || ''), '', '', 'data-topmost');
		appendRow('dir', '..', '', (routeUrl.pathname.replace(/\/[^/]*$/, '') || '/') + (routeUrl.search || ''), '', '', 'data-topmost');
	}

	if (curData.type === 'file')
		await renderFile(curData);
	else if (curData.type === 'dir' || curData.type === 'root')
		for (var i of displayContent)
			appendData(i, isSearchResult ? '' : routeUrl.search);
}