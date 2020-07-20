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

板子。匹配其它串和匹配自己的做法十分类似，具体见代码。

```cpp
#include <algorithm>
#include <cstdio>
#include <cstring>

const int N = 2e7 + 72;

int z[N], p[N], n, m;
char a[N], b[N];
long long ans;
int main() {
	scanf("%s%s", a, b);
	n = strlen(a), m = strlen(b);
	for (int i = 1, l = 0, r = 0; i < m; i++) {
		if (i <= r) z[i] = std::min(z[i - l], r - i + 1);
		while (i + z[i] < m && b[i + z[i]] == b[z[i]]) z[i]++;
		if (i + z[i] - 1 > r) l = i, r = i + z[i] - 1;
	}
	z[0] = m;
	for (int i = 0; i < m; i++) ans ^= (i + 1ll) * (z[i] + 1);
	printf("%lld\n", ans);
	for (int i = 0, l = 0, r = -1; i < n; i++) {
		if (i <= r) p[i] = std::min(z[i - l], r - i + 1);
		while (i + p[i] < n && a[i + p[i]] == b[p[i]]) p[i]++;
		if (i + p[i] - 1 > r) l = i, r = i + p[i] - 1;
	}
	for (int i = ans = 0; i < n; i++) ans ^= (i + 1ll) * (p[i] + 1);
	printf("%lld\n", ans);
}
```

## 洛谷 P3375 【模板】KMP字符串匹配

板子。直接用 Z 算法匹配，然后把 Z 函数转成前缀函数。

```cpp

```