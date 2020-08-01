---
title: AGC038C LCMs
abstract: 奇妙数论
---

$$
\begin{aligned}
c_x=&\sum_{i=1}^n[a_i=x]\\
N=&\max A_i\\
&\sum_{i=1}^n\sum_{j=i+1}^n\operatorname{lcm}(a_i,a_j)\\
=&\frac12\left(\sum_{i=1}^n\sum_{j=1}^n\operatorname{lcm}(a_i,a_j)-\sum_{i=1}^na_i\right)\\
&\sum_{i=1}^n\sum_{j=1}^n\operatorname{lcm}(a_i,a_j)\\
=&\sum_{i=1}^N\sum_{j=1}^Nc_ic_j\frac{ij}{\gcd(i,j)}\\
=&\sum_{d=1}^Nd\sum_{i=1}^{N/d}\sum_{j=1}^{N/d}\sum_{k\mid\gcd(i,j)}\mu(k)c_{id}c_{jd}ij\\
=&\sum_{d=1}^Nd\sum_{k=1}^{N/d}k^2\mu(k)\sum_{i=1}^{N/dk}\sum_{j=1}^{N/dk}c_{idk}c_{jdk}ij\\
=&\sum_{d=1}^Nd\sum_{k=1}^{N/d}k^2\mu(k)\left(\sum_{j=1}^{N/dk}c_{idk}i\right)^2\\
=&\sum_{T=1}^NT\left(\sum_{k\mid T}k\mu(k)\right)\left(\sum_{j=1}^{N/T}c_{iT}i\right)^2\\
\end{aligned}
$$

:::spoiler 代码
```cpp
#include <algorithm>
#include <cstdio>
#include <cstring>

const int N = 1e6, P = 998244353;

int p[N + 5], mu[N + 5], xmu[N + 5], cnt;
bool f[N + 5];

void init() {
	f[1] = true, mu[1] = 1;
	for (int i = 2; i <= N; i++) {
		if (!f[i]) p[++cnt] = i, mu[i] = -1;
		for (int j = 1; j <= cnt && i * p[j] <= N; j++) {
			f[i * p[j]] = true;
			if (i % p[j])
				mu[i * p[j]] = -mu[i];
			else {
				mu[i * p[j]] = 0;
				break;
			}
		}
	}
	for (int i = 1; i <= N; i++)
		for (int j = i; j <= N; j += i) xmu[j] = (xmu[j] + i * mu[i] + P) % P;
}

int n, x, ans, c[N + 5];
int main() {
	init();
	scanf("%d", &n);
	for (int i = 1; i <= n; i++) scanf("%d", &x), c[x]++, ans = (ans + P - x) % P;
	for (int T = 1; T <= N; T++) {
		int la = 0;
		for (int i = 1; i <= N / T; i++) la = (la + 1ll * c[i * T] * i) % P;
		la = 1ll * la * la % P;
		ans = (ans + 1ll * la * T % P * xmu[T]) % P;
	}
	printf("%d\n", ((ans + P) * 499122177ll) % P);
}
```
:::