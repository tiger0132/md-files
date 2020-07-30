---
title: 点分树学习笔记
abstract: 应该不会忘吧
---

# 定义

在点分治时，将每次找到的重心和上一层的重心之间连边，最后形成的新树被称为点分树。

# 性质

- 点分树的层数是 $O(\log n)$ 的。

    证明：显然。

    这意味着暴力跳父亲的复杂度是对的。一些在任意树上复杂度过高的暴力可以在点分树上使用。

- 点分树上的 LCA 在原树的路径上。

    证明：LCA 一定是把两个点从连通块中分断开连接的位置。

    这意味着每条路径都会在某些点被统计到。

# 例题

## BZOJ 3730 震波

对于点分树上的任意点 $x$，用权值线段树维护「$x$ 子树到 $x$ 距离为 $i$ 的点的权值和」和「$x$ 子树到 $x$ 父亲距离为 $i$ 的点的权值和」。设它们为 $S_1,S_2$。

对于每次修改（把 $x$ 的点权 $v_x$ 修改为 $y$），从 $x$ 开始往上跳。假设当前处在点 $i$，与 $x$ 的距离为 $\operatorname{dis}(x,i)$，那么将 $S_1[\operatorname{dis}(x,i)],S_2[\operatorname{dis}(fa_x,i)]$ 加上 $y-v_x$。

对于每次查询（查询与 $x$ 距离 $\le k$ 的点的点权和），从 $x$ 开始往上跳。假设当前处在点 $i$，那么将答案加上 $S_1[0\ldots k-\operatorname{dis}(x,i)]$。假设在到达 $i$ 之前经过的最后一个点为 $l$，那么再将答案减去 $S_2[0\ldots k-\operatorname{dis}(x,i)]$（这一部分在 $i$ 和 $l$ 处都算了一遍）。

:::spoiler 代码
```cpp
#include <algorithm>
#include <cstdio>
#include <cstring>
#include <vector>
#define mid (l + r) / 2
#define L ch][0
#define R ch][1

typedef std::pair<int, int> pii;
const int N = 4e5 + 54, M = 1e7 + 71, LN = 20, INF = 1e9;

std::vector<int> g[N];
int v[N], c[N];

struct {
	int occ[N << 1], dep[N], idx;
	pii st[N << 1][LN];
	void dfs2(int x, int p = 0, int d = 0) {
		st[x[occ] = ++idx][0] = {d, x}, x[dep] = d;
		for (int nx : x[g])
			if (nx != p) dfs2(nx, x, d + 1), st[++idx][0] = {d, x};
	}
	void init() {
		dfs2(1);
		for (int j = 1; (1 << j) <= idx; j++)
			for (int i = 1; i + (1 << j) - 1 <= idx; i++)
				st[i][j] = std::min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
	}
	int lca(int x, int y) {
		int l = x[occ], r = y[occ];
		if (l > r) std::swap(l, r);
		int k = 31 - __builtin_clz(r - l + 1);
		return std::min(st[l][k], st[r - (1 << k) + 1][k]).second;
	}
	inline int operator()(int x, int y) { return x[dep] + y[dep] - 2 * lca(x, y)[dep]; }
} dist;

int ch[M][2], s[M], nc = 1;
struct SGT {
	int rt;
	void upd(int& x, int l, int r, int i, int y) {
		if (!x) x = ++nc;
		if (x[s] += y, l == r) return;
		if (i <= mid) return upd(x[L], l, mid, i, y);
		upd(x[R], mid + 1, r, i, y);
	}
	int qry(int x, int l, int r, int ql, int qr) {
		if (!x) return 0;
		if (ql <= l && r <= qr) return x[s];
		if (qr <= mid) return qry(x[L], l, mid, ql, qr);
		if (mid < ql) return qry(x[R], mid + 1, r, ql, qr);
		return qry(x[L], l, mid, ql, qr) + qry(x[R], mid + 1, r, ql, qr);
	}
} S1[N], S2[N];

int rt, sz[N], dsiz[N], mx[N], p[N];
bool vis[N];
void dfs2(int x, int p, int sum) {
	x[sz] = 1, x[mx] = 0;
	for (int nx : x[g])
		if (!nx[vis] && nx != p) {
			dfs2(nx, x, sum), x[sz] += nx[sz];
			x[mx] = std::max(x[mx], nx[sz]);
		}
	x[mx] = std::max(x[mx], sum - x[sz]);
	if (!rt || x[mx] < rt[mx]) rt = x;
}
void divi(int x, int sum) {
	x[vis] = true;
	dsiz[x] = sum;
	for (int nx : x[g])
		if (!nx[vis]) {
			int ns = nx[sz] < x[sz] ? nx[sz] : sum - x[sz];
			rt = 0, dfs2(nx, x, ns);
			rt[p] = x, divi(rt, ns);
		}
}

int n;
void upd(int x, int y) {
	for (int cur = x, f; f = cur[p], cur; cur = f) {
		cur[S1].upd(cur[S1].rt, 0, n, dist(cur, x), y);
		if (f) cur[S2].upd(cur[S2].rt, 0, n, dist(f, x), y);
	}
}
int qry(int x, int k) {
	int ret = 0;
	for (int cur = x, last = 0; cur; last = cur, cur = cur[p]) {
		int d = dist(x, cur);
		if (d > k) continue;
		ret += cur[S1].qry(cur[S1].rt, 0, n, 0, k - d);
		if (last) ret -= last[S2].qry(last[S2].rt, 0, n, 0, k - d);
	}
	return ret;
}

int m, op, x, y, la;
int main() {
	scanf("%d%d", &n, &m);
	for (int i = 1; i <= n; i++) scanf("%d", v + i);
	for (int i = 1; i < n; i++) {
		scanf("%d%d", &x, &y);
		x[g].push_back(y);
		y[g].push_back(x);
	}
	dist.init();
	dfs2(1, 0, n);
	divi(rt, n);

	for (int i = 1; i <= n; i++) upd(i, i[v]);
	while (m--) {
		scanf("%d%d%d", &op, &x, &y), x ^= la, y ^= la;
		if (op == 0)
			printf("%d\n", la = qry(x, y));
		else
			upd(x, y - x[v]), x[v] = y;
	}
}
```
:::

## 「ZJOI 2007」捉迷藏

（注意，这里所说的所有的「子树」「父亲」「儿子」「祖先」等均指点分树上的）

在每一个点 $x$ 处维护两个可删堆 $dis[x],ch[x]$。其中 $dis[x]$ 代表 $x$ 子树里所有点到 $x$ 父亲的距离组成的集合，$ch[x]$ 代表 $x$ 的所有儿子的 $dis$ 的最大值组成的集合。

那么所有在 $x$ 这个点被统计的路径中，最长的合法路径长度一定是 $ch[x]$ 的最大值与次大值的和。我们再开一个可删堆来维护每一个点上 $ch$ 的最大值与次大值的和组成的集合。

- 假设我们要关掉 $x$ 处的灯，那么我们在 $x$ 的所有祖先 $y$ 处的 $dis[y]$ 插入 $\operatorname{dist}(x,y)$，然后维护 $ch$ 和 $ans$ 的变化。
- 假设我们要打开 $x$ 处的灯，那么我们在 $x$ 的所有祖先 $y$ 处的 $dis[y]$ 删除 $\operatorname{dist}(x,y)$，然后维护 $ch$ 和 $ans$ 的变化。
- 假设我们要查询答案，那么只需要求出 $ans$ 堆里的最大值就行了。

:::spoiler 代码
```cpp
#include <algorithm>
#include <cstdio>
#include <cstring>
#include <queue>

typedef std::pair<int, int> pii;
const int N = 1e5 + 51, LN = 18;

std::vector<int> g[N];
struct {
	int occ[N << 1], dep[N], idx;
	pii st[N << 1][LN];
	void dfs2(int x, int p = 0, int d = 0) {
		st[x[occ] = ++idx][0] = {d, x}, x[dep] = d;
		for (int nx : x[g])
			if (nx != p) dfs2(nx, x, d + 1), st[++idx][0] = {d, x};
	}
	void init() {
		dfs2(1);
		for (int j = 1; (1 << j) <= idx; j++)
			for (int i = 1; i + (1 << j) - 1 <= idx; i++)
				st[i][j] = std::min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
	}
	int lca(int x, int y) {
		int l = x[occ], r = y[occ];
		if (l > r) std::swap(l, r);
		int k = 31 - __builtin_clz(r - l + 1);
		return std::min(st[l][k], st[r - (1 << k) + 1][k]).second;
	}
	inline int operator()(int x, int y) { return x[dep] + y[dep] - 2 * lca(x, y)[dep]; }
} dist;

struct {
	std::priority_queue<int> pq, rm;
	int top() {
		while (!pq.empty() && !rm.empty() && pq.top() == rm.top()) pq.pop(), rm.pop();
		return pq.size() ? pq.top() : -1e9;
	}
	void pop() {
		while (!pq.empty() && !rm.empty() && pq.top() == rm.top()) pq.pop(), rm.pop();
		pq.pop();
	}
	inline void erase(int x) { rm.push(x); }
	inline void push(int x) { pq.push(x); }
	inline int size() { return pq.size() - rm.size(); }
	inline int stop2() {
		int r = top(), x = top();
		pop(), r += top(), push(x);
		return r;
	}
} dis[N], ch[N], ans;

int mx[N], sz[N], p[N], rt;
bool vis[N];
void dfs2(int x, int p, int sum) {
	x[sz] = 1, x[mx] = 0;
	for (int nx : x[g])
		if (!nx[vis] && nx != p) {
			dfs2(nx, x, sum), x[sz] += nx[sz];
			x[mx] = std::max(x[mx], nx[sz]);
		}
	x[mx] = std::max(x[mx], sum - x[sz]);
	if (!rt || x[mx] < rt[mx]) rt = x;
}
void dfs(int x, int p, int d, int t) {
	dis[t].push(d);
	for (int nx : x[g])
		if (!nx[vis] && nx != p) dfs(nx, x, d + 1, t);
}
void divi(int x, int sum) {
	x[vis] = true;
	for (int nx : x[g])
		if (!nx[vis]) {
			int ns = nx[sz] < x[sz] ? nx[sz] : sum - x[sz];
			rt = 0, dfs2(nx, x, ns);
			dfs(nx, x, 1, rt);
			ch[x].push(dis[rt].top());
			rt[p] = x, divi(rt, ns);
		}
	ch[x].push(0);
	if (ch[x].size() > 1)
		ans.push(ch[x].stop2());
	else if (ch[x].size())
		ans.push(ch[x].top());
}
void add(int x) {
	if (ch[x].size() > 1) ans.erase(ch[x].stop2());
	ch[x].push(0);
	if (ch[x].size() > 1) ans.push(ch[x].stop2());
	for (int cur = x, f; f = cur[p]; cur = f) {
		if (ch[f].size() > 1) ans.erase(ch[f].stop2());
		if (dis[cur].size()) ch[f].erase(dis[cur].top());
		dis[cur].push(dist(x, f));
		ch[f].push(dis[cur].top());
		if (ch[f].size() > 1) ans.push(ch[f].stop2());
	}
}
void del(int x) {
	if (ch[x].size() > 1) ans.erase(ch[x].stop2());
	ch[x].erase(0);
	if (ch[x].size() > 1) ans.push(ch[x].stop2());
	for (int cur = x, f; f = cur[p]; cur = f) {
		if (ch[f].size() > 1) ans.erase(ch[f].stop2());
		ch[f].erase(dis[cur].top());
		dis[cur].erase(dist(x, f));
		if (dis[cur].size()) ch[f].push(dis[cur].top());
		if (ch[f].size() > 1) ans.push(ch[f].stop2());
	}
}

int n, m, x, y, col[N];
char op[2];
int main() {
	scanf("%d", &n);
	for (int i = 1; i < n; i++) {
		scanf("%d%d", &x, &y);
		x[g].push_back(y);
		y[g].push_back(x);
	}
	dist.init();
	dfs2(1, 0, n);
	divi(rt, n);
	for (int i = 1; i <= n; i++) i[col] = 1;
	for (scanf("%d", &m); m--;) {
		scanf("%s", op);
		if (*op == 'G')
			printf("%d\n", ans.size() ? ans.top() : -1);
		else {
			scanf("%d", &x);
			x[col] ? del(x) : add(x);
			x[col] ^= 1;
		}
	}
}
```
:::

## 「WC 2014」紫荆花之恋

考虑计算新加的点对答案的贡献。

$\operatorname{dist}(i,j)\le r_i+r_j\implies\operatorname{dist}(i,j)-r_j\le r_i$，然后和震波（例题 1）就没啥区别了。

加完点之后，判断是否存在某个点 $x$，满足 $\operatorname{size}(x)\ge\alpha\cdot\operatorname{size}(fa_x)$，如果存在就重构这棵子树，如果有多个就重构最浅的那一个。

然后可以使用高速平衡树 Qiuly Tree 有效提升运行速度。

:::spoiler 代码
```cpp
#include <algorithm>
#include <cassert>
#include <cstdio>
#include <cstring>
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
#include <queue>

typedef std::pair<int, int> pii;
const int N = 1e5 + 51, M = 3e7 + 73, LN = 18, P = 1e9;
const float alpha = 0.77;

std::vector<std::pair<int, int>> g[N];
struct {
	int fa[N][LN], dep[N], dis[N];
	void ins(int x, int p, int w) {
		x[fa][0] = p, x[dep] = p[dep] + 1, x[dis] = p[dis] + w;
		for (int i = 1; i < LN; i++) x[fa][i] = x[fa][i - 1][fa][i - 1];
	}
	int lca(int x, int y) {
		if (x[dep] < y[dep]) std::swap(x, y);
		for (int i = LN - 1; i >= 0; i--)
			if (x[fa][i][dep] >= y[dep]) x = x[fa][i];
		if (x == y) return x;
		for (int i = LN - 1; i >= 0; i--)
			if (x[fa][i] != y[fa][i]) x = x[fa][i], y = y[fa][i];
		return x[fa][0];
	}
	inline int operator()(int x, int y) { return x[dis] + y[dis] - 2 * lca(x, y)[dis]; }
} dist;

struct Qiuly_AK_IOI {
	std::vector<int> tmp, nod;
	inline void rebuild() {
		sort(tmp.begin(), tmp.end());
		std::vector<int> qwq = nod;
		nod.resize(tmp.size() + qwq.size());
		int i = 0, j = 0, l1 = tmp.size(), l2 = qwq.size();
		while (i < l1 && j < l2)
			(tmp[i] < qwq[j]) ? (nod[i + j] = tmp[i], ++i) : (nod[i + j] = qwq[j], ++j);
		while (i < l1) nod[i + j] = tmp[i], ++i;
		while (j < l2) nod[i + j] = qwq[j], ++j;
		tmp.clear();
	}
	inline int qry(int x) {
		if (tmp.size() >= 275) rebuild();
		int ans = lower_bound(nod.begin(), nod.end(), x + 1) - nod.begin();
		for (int i : tmp) ans += (bool)(i <= x);
		return ans;
	}
	inline void upd(int x) { return tmp.push_back(x); }
	inline void clear() { tmp.clear(), nod.clear(); }
	inline int size() { return tmp.size() + nod.size(); }
} S1[N], S2[N];

int mx[N], sz[N], val[N], dep[N], p[N], rt;
bool vis[N], dfs0_ban[N];
int dfs0(int x, int fa, int lim) {
	x[vis] = false, x[p] = 0;
	x[dep] = 0;
	x[S1].clear(), x[S2].clear();
	int r = 1;
	for (int i = 0, nx; i < x[g].size(); i++)
		if ((nx = x[g][i].first) != fa && !nx[dfs0_ban] && nx[dep] > lim)
			r += dfs0(nx, x, lim);
	return r;
}
void dfs(int x, int fa, int sum) {
	x[sz] = 1, x[mx] = 0;
	for (int i = 0, nx; i < x[g].size(); i++)
		if (!(nx = x[g][i].first)[vis] && nx != fa && !nx[dfs0_ban]) {
			dfs(nx, x, sum), x[sz] += nx[sz];
			x[mx] = std::max(x[mx], nx[sz]);
		}
	x[mx] = std::max(x[mx], sum - x[sz]);
	if (!rt || x[mx] < rt[mx]) rt = x;
}
void dfs2(int x, int fa, int d, int t) {
	t[S1].upd(d - x[val]);
	if (t[p]) t[S2].upd(dist(x, t[p]) - x[val]);
	x[sz] = 1;
	for (int i = 0, nx; i < x[g].size(); i++)
		if (!(nx = x[g][i].first)[vis] && nx != fa && !nx[dfs0_ban])
			dfs2(nx, x, d + x[g][i].second, t), x[sz] += nx[sz];
}
void divi(int x, int sum) {
	x[vis] = true;
	for (int i = 0, nx; i < x[g].size(); i++)
		if (!(nx = x[g][i].first)[vis] && !nx[dfs0_ban]) {
			int ns = nx[sz] < x[sz] ? nx[sz] : sum - x[sz];
			rt = 0, dfs(nx, x, ns);
			rt[p] = x;
			rt[dep] = x[dep] + 1;
			dfs2(rt, 0, 0, rt);
			divi(rt, ns);
		}
}
void rebuild(int x) {
	int xp = x[p];
	for (int i = xp; i; i = i[p]) i[dfs0_ban] = true;
	int sub_sz = dfs0(x, xp, xp[dep]);
	xp[vis] = true;
	rt = 0, dfs(x, xp, sub_sz);
	rt[p] = xp, rt[dep] = xp[dep] + 1;
	dfs2(rt, 0, 0, rt), divi(rt, sub_sz);
	for (int i = xp; i; i = i[p]) i[dfs0_ban] = false;
	xp[vis] = false;
}
void upd(int x, int r) {
	x[vis] = true;
	for (int cur = x, f; f = cur[p], cur; cur = f) {
		cur[S1].upd(dist(cur, x) - r);
		if (f) cur[S2].upd(dist(f, x) - r);
	}
	int y = 0;
	for (int i = x; i[p]; i = i[p])
		if (i[S1].size() > i[p][S1].size() * alpha) y = i[p];
	if (y) rebuild(y);
}
int qry(int x, int r) {
	int ret = 0;
	for (int cur = x, last = 0; cur; last = cur, cur = cur[p]) {
		int d = dist(x, cur);
		ret += cur[S1].qry(r - d);
		if (last) ret -= last[S2].qry(r - d);
	}
	return ret;
}

int n, m, x, y, z, col[N];
long long la;
char op[2];
int main() {
	scanf("%*d%d", &n);
	for (int i = 1; i <= n; i++) {
		scanf("%d%d%d", &x, &y, &z), x ^= la % P;
		i[val] = z;
		if (i == 1) {
			i[S1].upd(-z);
			puts("0");
			continue;
		}
		x[g].push_back({i, y});
		i[g].push_back({x, y});
		i[p] = x, i[dep] = x[dep] + 1;
		dist.ins(i, x, y);
		printf("%lld\n", la += qry(i, z));
		upd(i, z);
	}
}
```
:::