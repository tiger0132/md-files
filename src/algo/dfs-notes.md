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

## BZOJ 1095 捉迷藏

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

# Todo

- P3676 小清新数据结构题
- 「WC 2014」紫荆花之恋
- 「WC 2018」通道
- 「CTSC 2018」暴力写挂