// algo
function checkEntry(data, keyword, tags) {
	try {
		if (keyword && !data.name.toUpperCase().includes(keyword) && !data.path.toUpperCase().includes(keyword)) return false;
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

// filter
function deleteKeyword() {
	routeUrl.searchParams.delete('keyword');
	location.hash = routeUrl.pathname + routeUrl.search;
}
function setParamAndUpdate(key, value) {
	routeUrl.searchParams.set(key, value);
	location.hash = routeUrl.pathname + routeUrl.search;
}

// main
function searchMain() {
	console.log('[fe] searchMain()');

	var keyword = routeParams.get('keyword');
	const searchPos = routeParams.get('search_pos');
	const searchTextOption = routeParams.get('search_text_option');
	const searchFiles = routeParams.get('search_files') !== 'false';
	const searchFolders = routeParams.get('search_dirs') !== 'false';
	const tagIds = routeParams.getAll('tagIds');
	const displayOption = routeParams.get('display_option');

	searchContent = traverseBlogs(curData, routeParams.get('search_pos') !== 'current');

	// serach box
	const contentType = {
		'root': '根目录',
		'dir': '目录',
		'file': '文件'
	};
	const searchBoxContent = searchContent
		.filter(data => data.name)
		.map(data => {
			return {
				title: data.name,
				description: data.abstract,
				url: '#' + data.path,
				category: contentType[data.type]
			}
		});
	$('#search-box').search({
		type: 'category',
		source: searchBoxContent
	});

	// serach filter
	const hasSearchFilter = keyword || tagIds.length;
	var searchSubdir, searchPath;
	if (hasSearchFilter) {
		$('#search-filters-row').html('<b>搜索条件</b>');

		if (keyword)
			appendTag('filter', 'grey', 'file alternate', keyword, 'deleteKeyword()');

		for (var i of tagIds)
			appendTag('filter', rootData.tags[i].color, '', rootData.tags[i].name, "alert(1)");

		$('#search-options-row').html('<b>搜索选项</b>');

		appendRow('delete', '清除搜索条件', '', routeUrl.pathname || '/', '', '', 'data-topmost');
		searchSubdir = searchPos !== 'current';
		if (searchSubdir)
			appendTag('option', 'teal', 'bars', '搜索子文件夹', "setParamAndUpdate('search_pos', 'current')");
		else
			appendTag('option', 'orange', 'bars', '搜索当前文件夹', "setParamAndUpdate('search_pos', 'subdir')");

		searchPath = searchTextOption !== 'only_name';
		if (searchPath)
			appendTag('option', 'teal', 'bars', '搜索文件名和路径名', "setParamAndUpdate('search_text_option', 'only_name')");
		else
			appendTag('option', 'orange', 'bars', '仅搜索文件名', "setParamAndUpdate('search_text_option', 'name_and_path')");

		if (searchFiles)
			appendTag('option', 'teal', 'file alternate', '搜索文件', "setParamAndUpdate('search_files', 'false')");
		else
			appendTag('option', 'orange', 'file outline', '不搜索文件', "setParamAndUpdate('search_files', 'true')");

		if (searchFolders)
			appendTag('option', 'teal', 'folder', '搜索文件夹', "setParamAndUpdate('search_dirs', 'false')");
		else
			appendTag('option', 'orange', 'folder outline', '不搜索文件夹', "setParamAndUpdate('search_dirs', 'true')");
	}

	// display option
	var displaySearch = displayOption !== 'file';
	if (displaySearch)
		appendTag('display', 'teal', 'bars', '查看搜索结果', "setParamAndUpdate('display_option', 'file')");
	else
		appendTag('display', 'orange', 'bars', '查看目录结构', "setParamAndUpdate('display_option', 'search')");

	// serach result
	keyword = (keyword || '').toUpperCase();
	isSearchResult = hasSearchFilter && displaySearch;
	if (isSearchResult) {
		console.log('qwq');
		displayContent = (searchSubdir ? searchContent : displayContent).filter(data => {
			try {
				if (data.type === 'file' && !searchFiles) return false;
				if (data.type === 'dir' && !searchFolders) return false;
				if (keyword && !data.name.toUpperCase().includes(keyword) && (!searchPath || !data.path.toUpperCase().includes(keyword))) return false;
				if (tagIds.length && (!data.tags || !tags.every(x => data.tags.includes(x)))) return false;
				return true;
			} catch { return false; }
		});
	}
}