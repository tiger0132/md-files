---
title: 洛谷 P4240 毒瘤之神的考验（待续）
abstract: 奇妙数论
---

$$
\begin{aligned}
&f(n)=\sum_{d\mid n}\frac{d\mu(n/d)}{\varphi(d)}\\
&g(n,m)=\sum_{i=1}^n\varphi(im)\\
&\sum_{i=1}^n\sum_{j=1}^m\varphi(ij)\\
=&\sum_{i=1}^n\sum_{j=1}^m\frac{\varphi(i)\varphi(j)\gcd(i,j)}{\varphi(\gcd(i,j))}\\
=&\sum_{d=1}^n\sum_{i=1}^{n/d}\sum_{j=1}^{m/d}\varphi(id)\varphi(jd)\frac d{\varphi(d)}[\gcd(i,j)=1]\\
=&\sum_{d=1}^n\sum_{i=1}^{n/d}\sum_{j=1}^{m/d}\varphi(id)\varphi(jd)\frac d{\varphi(d)}\sum_{k\mid\gcd(i,j)}\mu(k)\\
=&\sum_{d=1}^n\frac d{\varphi(d)}\sum_{k=1}^{n/d}\mu(k)\sum_{i=1}^{n/dk}\sum_{j=1}^{m/dk}\varphi(idk)\varphi(jdk)\\
=&\sum_{T=1}^n\sum_{d\mid T}\frac{d\mu(T/d)}{\varphi(d)}\sum_{i=1}^{n/T}\varphi(iT)\sum_{j=1}^{m/T}\varphi(jT)\\
=&\sum_{T=1}^n\left(\sum_{d\mid T}\frac{d\mu(T/d)}{\varphi(d)}\right)\left(\sum_{i=1}^{n/T}\varphi(iT)\right)\left(\sum_{j=1}^{m/T}\varphi(jT)\right)\\
=&\sum_{T=1}^nf(T)g(n/T,T)g(m/T,T)
\end{aligned}
$$