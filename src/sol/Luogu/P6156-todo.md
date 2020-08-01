---
title: 洛谷 P6156 简单题（待续）
abstract: 奇妙数论
---

$$
\begin{aligned}
S(n)=&\sum_{i=1}^n\sum_{j=1}^n(i+j)^k\\
&\sum_{i=1}^n\sum_{j=1}^n(i+j)^k\mu^2(\gcd(i,j))\gcd(i,j)\\
=&\sum_{d=1}^nd^{k+1}\mu^2(d)\sum_{i=1}^{n/d}\sum_{j=1}^{n/d}(i+j)^k\varepsilon(\gcd(i,j))\\
=&\sum_{d=1}^nd^{k+1}\mu^2(d)\sum_{t=1}^{n/d}\mu(t)t^k\sum_{i=1}^{n/dt}\sum_{j=1}^{n/dt}(i+j)^k\\
=&\sum_{T=1}^nT^kS(n/T)\sum_{d\mid T}d\mu^2(d)\mu(T/d)\\
\end{aligned}
$$