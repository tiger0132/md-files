---
title: Z 算法（扩展 KMP）复习
abstract: 存档点，希望以后忘了之后不需要重新学
---

# 定义

- $z_i=\left|\operatorname{LCP}(S,S_{i\ldots n-1})\right|,z_0=0$
- $Z(S)=[z_0,z_1,\ldots,z_{n-1}]$

## 例子

- $Z({\tt aaaaa})=[0,4,3,2,1]$
- $Z({\tt 114514})=[0,1,0,0,1,0]$
- $Z({\tt qwqwwq})=[0,0,2,0,0,1]$
- $Z({\tt aabcaaab})=[0,1,0,0,2,3,1,0]$

# 快速计算

假设我们已经计算出了 $z_1,z_2,\ldots,z_{i-1}$，现在需要计算 $z_i$。

定义 z-box 为形如 $[j,j+z_j-1]$ 的区间，$j\in[1,i-1]$ 里右端点最大的 z-box 为 $[l,r]$。然后分两种情况讨论：

- $i>r$，即 $i$ 在所有 z-box 之外。那么直接暴力计算出 $z_i$，然后更新 $[l,r]$。
- $i\le r$，即 $i$ 在某个 z-box 中。

	那么我们先用 $\min(z_{i-l},r-i+1)$ 初始化 $z_i$。

	如果 $i+z_{i-l}<r$，那么再往后显然一定会失配。如果 $i+z_{i-l}\ge r$，那么有可能在 z-box 外能继续匹配，所以需要暴力往后匹配，最后更新 $[l,r]$。

	（……当然实际上实现的时候不需要判这个，因为前一种情况反正是 $O(1)$ 的）

具体可以看 [这个](https://personal.utdallas.edu/~besp/demo/John2010/z-algorithm.htm)（懒

# 时间复杂度

注意到每次操作只会让 $r$ 增加，而且对于 $r$ 的每次自增，进行的操作复杂度是 $O(1)$ 的，那么显然总复杂度就是 $O(n)$。

# Z 函数转前缀函数

问题：给出 $Z(S)$，求出 $[p_0,p_1,\ldots,p_{n-1}]$。其中 $p_i$ 是最大的满足 $S_{0\ldots p_i-1}=S_{i-p_i+1\ldots i}$ 的数。

做法：注意到对于任意的 $i$，有 $S_{0\ldots z_i-1}=S_{i,i+z_i-1}$，那么意味着 $p_{i+z_i-1}\ge z_i$。

但是这样只求出了极大的情况，没有考虑包含在 z-box 内部的部分。

然后注意到 $p_i\ge p_{i+1}-1$ 很好地刻画了 z-box 内部的 next 数组，于是倒着扫一遍就好了。

```cpp
for (int i = 1; i < n; i++)
	p[i + z[i] - 1] = std::max(p[i + z[i] - 1], z[i]);
for (int i = n - 2; i >= 0; i--)
	p[i] = std::max(p[i], p[i + 1] - 1);
```

# 前缀函数转 Z 函数

咕咕咕

# 例题

## 洛谷 P5410 【模板】扩展 KMP（Z 函数）

板子。`b#a` 的 Z 函数的后 $|b|$ 项就是 $p$ 的权值。

```cpp
#include <algorithm>
#include <cstdio>
#include <cstring>

const int N = 4e7 + 74;

char a[N], b[N];
int n, m, z[N];
long long ans;
int main() {
	scanf("%s%s", a, b);
	b[n = strlen(b)] = '#';
	strcat(b, a);
	m = strlen(b);
	for (int i = 1, l = 0, r = 0; i < m; i++) {
		if (i <= r) z[i] = std::min(z[i - l], r - i + 1);
		while (i + z[i] < m && b[i + z[i]] == b[z[i]]) z[i]++;
		if (i + z[i] - 1 > r) l = i, r = i + z[i] - 1;
	}
	z[0] = n;
	for (int i = 0; i < n; i++) ans ^= (i + 1ll) * (z[i] + 1);
	printf("%lld\n", ans);
	ans = 0;
	for (int i = n + 1; i < m; i++) ans ^= (i - n) * (z[i] + 1ll);
	printf("%lld\n", ans);
}
```

## 洛谷 P3375 【模板】KMP字符串匹配

板子。直接用 Z 算法匹配，然后把 Z 函数转成前缀函数。

```cpp
#include <algorithm>
#include <cstdio>
#include <cstring>

const int N = 2e6 + 62;

int z[N], p[N], n, m;
char a[N], b[N];
int main() {
	scanf("%s%s", b, a);
	a[n = strlen(a)] = '#';
	strcat(a, b);
	m = strlen(a);
	for (int i = 1, l = 0, r = 0; i < m; i++) {
		if (i <= r) z[i] = std::min(z[i - l], r - i + 1);
		while (i + z[i] < m && a[i + z[i]] == a[z[i]]) z[i]++;
		if (i + z[i] - 1 > r) l = i, r = i + z[i] - 1;
	}
	for (int i = n + 1; i < m; i++)
		if (z[i] == n) printf("%d\n", i - n);
	for (int i = 1; i < n; i++) p[i + z[i] - 1] = std::max(p[i + z[i] - 1], z[i]);
	for (int i = n - 2; i >= 0; i--) p[i] = std::max(p[i], p[i + 1] - 1);
	for (int i = 0; i < n; i++) printf("%d%c", p[i], " \n"[i == n - 1]);
}
```

# CF 1313E Concatenation with intersection

首先，$a[l_1\ldots r_1]$ 一定是 $s$ 的前缀，$b[l_2\ldots r_2]$ 一定是 $s$ 的后缀。

然后我们可以用 Z 算法求出 $a$ 每一个后缀和 $s_{0\ldots n-2}$ 的 LCP，以及 $b$ 每一个前缀和 $s_{1,\ldots n-1}$ 的 LCS（最长公共后缀），设它们为 $za_i,zb_i$。

然后考虑枚举两个点 $i,j$，它们对应的区间是 $[i,i+za_i-1],[j-zb_j+1,j]$。这两个区间对答案有贡献的条件是 $i\le j\le i+m-2$ 且 $za_i+zb_j-m+1>0$，对答案的贡献是 $za_i+zb_j-m+1)$。

然后就是二维数点了，开两个 BIT 搞一下就行了。

```cpp
#include <algorithm>
#include <cstdio>
#include <cstring>

const int N = 2e6 + 62;

void getZ(char *s, int *z) {
	int n = strlen(s);
	for (int i = 1, l = 0, r = 0; i < n; i++) {
		if (i <= r) z[i] = std::min(z[i - l], r - i + 1);
		while (i + z[i] < n && s[i + z[i]] == s[z[i]]) z[i]++;
		if (i + z[i] - 1 > r) l = i, r = i + z[i] - 1;
	}
}

struct {
	long long tr[N * 2];
	void add(int i, int x) {
		for (i++; i < N; i += i & -i) tr[i] += x;
	}
	long long qry(int i) {
		long long r = 0;
		for (i++; i > 0; i -= i & -i) r += tr[i];
		return r;
	}
} b1, b2;

int n, m, saz[N], sbz[N], *za, *zb;
char a[N], b[N], sa[N], sb[N];
long long ans;
int main() {
	scanf("%d%d%s%s%s", &n, &m, a, b, sb);
	strcpy(sa, sb);
	std::reverse(sb, sb + m);
	sa[m - 1] = sb[m - 1] = '#';
	std::reverse(b, b + n);
	strcat(sa, a), strcat(sb, b);
	getZ(sa, saz), getZ(sb, sbz);
	za = saz + m;
	zb = sbz + m;
	std::reverse(zb, zb + n);
	for (int j = 0; j < m - 1; j++) b1.add(zb[j], 1), b2.add(zb[j], zb[j]);
	for (int i = 0; i < n; i++) {
		long long v1 = b1.qry(N - 1) - b1.qry(m - za[i] - 1);
		long long v2 = b2.qry(N - 1) - b2.qry(m - za[i] - 1);

		ans += v1 * (za[i] - m + 1ll) + v2;

		b1.add(zb[i], -1), b2.add(zb[i], -zb[i]);
		if (i + m - 1 < n) b1.add(zb[i + m - 1], 1), b2.add(zb[i + m - 1], zb[i + m - 1]);
	}
	printf("%lld\n", ans);
}
```