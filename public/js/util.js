// misc
function fmtDate(dt) {
	return `${
		dt.getFullYear().toString().padStart(4, '0')}-${
		(dt.getMonth() + 1).toString().padStart(2, '0')}-${
		dt.getDate().toString().padStart(2, '0')} ${
		dt.getHours().toString().padStart(2, '0')}:${
		dt.getMinutes().toString().padStart(2, '0')}:${
		dt.getSeconds().toString().padStart(2, '0')}`;
}
function isAbs(path) {
	path = path.trim();
	if (path[0] == '/') return true;
	if (/^[--9\w?@%&+~#=]*:/.test(path)) return true;
	return false;
}

// table
function appendRow(type, name, abstract, path, time, color, pos) {
	const icon = {
		'dir': 'folder',
		'file': 'file outline',
		'delete': 'delete'
	};
	$('#dir').append(`
	<tr ${(color || '') && `class="${color}"`} ${pos}>
		<td class="collapsing">
			<i class="${icon[type]} icon"></i>${path ? `<a href="#${path}">${name}</a>` : name}
		</td>
		<td>${abstract}</td>
		<td class="left aligned collapsing">${time && fmtDate(new Date(time))}</td>
	</tr>`);
}
function appendMsg(type, msg) {
	$('#dir').append(`
	<tr class="${type}">
		<td colspan="3" class="center aligned"><b>${msg}</b></td>
	</tr>`);
}
function appendData(data, search) {
	appendRow(data.type, data.name, data.abstract || '', data.path + search, data.time);
}

// search filter
function appendTag(pos, color, icon, text, onclick) {
	const selector = {
		'filter': '#search-filters-row',
		'option': '#search-options-row',
		'display': '#display-options-row'
	};
	$(selector[pos]).append(`
<div class="ui ${color} label">${icon && `<i class="${icon} icon"></i>`}${text}${onclick && `<i class="delete icon" onclick="${onclick}"></i></div>`}`);
}

// fs
function traverseBlogs(data, subdir) {
	var ret = [];
	for (var i in data.files) {
		ret.push(data.files[i]);
		if (subdir)
			ret = ret.concat(traverseBlogs(data.files[i], subdir));
	}
	return ret;
}