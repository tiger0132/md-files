---
title: FWT 复习
abstract: 存档点
---

# 简介

可以用来快速计算位运算卷积。

# 流程

首先我们定义 $\displaystyle[x^i]\operatorname{FWT}(A)=\sum_{j=0}^{n-1}a_jf(i,j)$。

然后我们希望 FWT 有类似 DFT 的性质：$[x^i]\operatorname{FWT}(A)[x^i]\operatorname{FWT}(B)=[x^i]\operatorname{FWT}(A\cdot B)$，这里的 $\cdot$ 是位运算卷积。

然后有

$$
\begin{aligned}
&[x^i]\operatorname{FWT}(A)[x^i]\operatorname{FWT}(B)\\
=&\sum_{j=0}^{n-1}a_jf(i,j)\sum_{k=0}^{n-1}b_kf(i,k)\\
=&\sum_{j=0}^{n-1}\sum_{k=0}^{n-1}a_jb_kf(i,j)f(i,k)\\
&[x^i]\operatorname{FWT}(A\cdot B)\\
=&\sum_{t=0}^{n-1}\sum_{j\otimes k=t}a_jb_kf(i,j\otimes k)\\
\end{aligned}
$$

其中的 $\otimes$ 是位运算。

然后注意到 $\displaystyle\sum_{j=0}^{n-1}\sum_{k=0}^{n-1}$ 和 $\displaystyle\sum_{t=0}^{n-1}\sum_{j\otimes k=t}$ 是枚举的同一个东西，那么可以得到 $f(i,j)f(i,k)=f(i,j\otimes k)$。

然后因为 $\otimes$ 是位运算，所以 $f$ 也应该可以拆位处理：设 $i_x$ 为 $i$ 的二进制的第 $x$ 高位，则有 $f(i,j)=f(i_0,j_0)f(i_1,j_1)\ldots$。

假设我们已经知道 $f$ 是啥了，现在我们需要快速计算 FWT。和 FFT 一样，为了方便，设 $n=2^k,k\in\mathbb Z$。

$$
\begin{aligned}
&[x^i]\operatorname{FWT}(A)\\
=&\sum_{j=0}^{n-1}a_jf(i,j)\\
=&\sum_{j=0}^{n/2-1}a_jf(i,j)+\sum_{j=n/2}^{n-1}a_jf(i,j)\\
=&f(i_0,0)\sum_{j=0}^{n/2-1}a_jf(i_{[1,k)},j_{[1,k)})+f(i_0,1)\sum_{j=n/2}^{n-1}a_jf(i_{[1,k)},j_{[1,k)})\\
\end{aligned}
$$

然后设 $\displaystyle A_L(x)=\sum_{i=0}^{n/2-1}a_ix^i,A_R(x)=\sum_{i=0}^{n/2-1}a_{i+n/2}x^i$，那么对于 $i\in[0,n/2)$，有

$$
\begin{aligned}
[x^i]\operatorname{FWT}(A)&=f(0,0)[x^i]\operatorname{FWT}(A_L)+f(0,1)[x^i]\operatorname{FWT}(A_R)\\
[x^{i+n/2}]\operatorname{FWT}(A)&=f(1,0)[x^i]\operatorname{FWT}(A_L)+f(1,1)[x^i]\operatorname{FWT}(A_R)
\end{aligned}
$$

或者说：

$$
\begin{bmatrix}
f(0,0)&f(0,1)\\
f(1,0)&f(1,1)
\end{bmatrix}
\begin{bmatrix}
[x^i]\operatorname{FWT}(A_L)\\
[x^i]\operatorname{FWT}(A_R)
\end{bmatrix}=
\begin{bmatrix}
[x^i]\operatorname{FWT}(A)\\
[x^{i+n/2}]\operatorname{FWT}(A)
\end{bmatrix}
$$

那么 IFWT 的流程也十分显然：

$$
\begin{bmatrix}
f(0,0)&f(0,1)\\
f(1,0)&f(1,1)
\end{bmatrix}^{-1}
\begin{bmatrix}
[x^i]\operatorname{IFWT}(A_L)\\
[x^i]\operatorname{IFWT}(A_R)
\end{bmatrix}=
\begin{bmatrix}
[x^i]\operatorname{IFWT}(A)\\
[x^{i+n/2}]\operatorname{IFWT}(A)
\end{bmatrix}
$$

然后我们就可以 $O(n\log n)$ 计算了。

那么接下来我们要做的就是构造这个矩阵。

我们已经知道 $f(i,j)f(i,k)=f(i,j\otimes k)$，而且 $\begin{bmatrix}
f(0,0)&f(0,1)\\
f(1,0)&f(1,1)
\end{bmatrix}$ 必须要有逆，也就是说 $\begin{vmatrix}
f(0,0)&f(0,1)\\
f(1,0)&f(1,1)
\end{vmatrix}\ne0$。

那么对于任意一种位运算 $\otimes$，我们只需要根据上面的条件，解出一个可以用的矩阵，就能拿来跑 FWT 了。

## OR 卷积

真值表：$\begin{bmatrix}0&1\\1&1\end{bmatrix}$。

$$
\begin{cases}
f(0,0)^2=f(0,0),\quad f(0,1)^2=f(0,1),\quad f(0,0)f(0,1)=f(0,1)\\
f(1,0)^2=f(1,0),\quad f(1,1)^2=f(1,1),\quad f(1,0)f(1,1)=f(1,1)\\
f(0,0)f(1,1)-f(0,1)f(1,0)\ne0
\end{cases}
$$

然后可以得到两个可行的矩阵 $\begin{bmatrix}1&0\\1&1\end{bmatrix},\begin{bmatrix}1&1\\1&0\end{bmatrix}$，它们的逆分别是 $\begin{bmatrix}1&0\\-1&1\end{bmatrix},\begin{bmatrix}0&1\\1&-1\end{bmatrix}$。

注意到前者可以写成 $f(i,j)=[i\&j=j]$，并且 $\displaystyle\sum_{i\&j=j}a_j=\sum_{j\subseteq i}a_j$，也就是说相当于是高维前缀和（子集和）。

然后后者可以写成 $f(i,j)=[i\&j=0]$，并且 $\displaystyle\sum_{i\&j=0}a_j=\sum_{i\cap j=\varnothing}a_j=\sum_{j\subseteq i^C}a_j$
，也就是说相当于 $i$ 的补集的子集和。

## AND 卷积

真值表：$\begin{bmatrix}0&0\\0&1\end{bmatrix}$。

$$
\begin{cases}
f(0,0)^2=f(0,0),\quad f(0,1)^2=f(0,1),\quad f(0,0)f(0,1)=f(0,0)\\
f(1,0)^2=f(1,0),\quad f(1,1)^2=f(1,1),\quad f(1,0)f(1,1)=f(1,0)\\
f(0,0)f(1,1)-f(0,1)f(1,0)\ne0
\end{cases}
$$

然后可以得到两个可行的矩阵 $\begin{bmatrix}0&1\\1&1\end{bmatrix},\begin{bmatrix}1&1\\0&1\end{bmatrix}$，它们的逆分别是 $\begin{bmatrix}-1&1\\1&0\end{bmatrix},\begin{bmatrix}1&-1\\0&1\end{bmatrix}$。

注意到前者可以写成 $f(i,j)=[i\&j=i]$，并且 $\displaystyle\sum_{i\&j=i}a_j=\sum_{i\subseteq j}a_j$，也就是说相当于是高维后缀和（超集和）。

然后后者可以写成 $f(i,j)=[i\mid j=1]$，并且 $\displaystyle\sum_{i\mid j=1}a_j=\sum_{i\cup j=U}a_j=\sum_{i\subseteq j^C}a_j$
，也就是说相当于 $i$ 的补集的超集和。

## XOR 卷积

真值表：$\begin{bmatrix}0&1\\1&0\end{bmatrix}$。

$$
\begin{cases}
f(0,0)^2=f(0,0),\quad f(0,1)^2=f(0,0),\quad f(0,0)f(0,1)=f(0,1)\\
f(1,0)^2=f(1,0),\quad f(1,1)^2=f(1,0),\quad f(1,0)f(1,1)=f(1,1)\\
f(0,0)f(1,1)-f(0,1)f(1,0)\ne0
\end{cases}
$$

然后可以得到两个可行的矩阵 $\begin{bmatrix}1&-1\\1&1\end{bmatrix},\begin{bmatrix}1&1\\1&-1\end{bmatrix}$，它们的逆分别是 $\begin{bmatrix}0.5&0.5\\-0.5&0.5\end{bmatrix},\begin{bmatrix}-0.5&0.5\\0.5&0.5\end{bmatrix}$。

这次我找不到实际意义了，告辞

## IMPLY 卷积

真值表：$\begin{bmatrix}1&1\\0&1\end{bmatrix}$。

这™能做？？？

当然能。

```cpp
(~i | j) == t
~(~i | j) == ~t
(i & ~j) == ~t
```

也就是说，对于任意的 $j$，把 $b_j$ 和 $b_{\sim j}$ swap 一下，然后做完与卷积之后，假设得到的系数数组是 $c$，那么对于任意的 $j$，再把 $c_t$ 和 $c_{\sim t}$ swap 一下就好了。

## 总结

第二行\第一行|$[0\quad 0]$|$[0\quad 1]$|$[1\quad 0]$|$[1\quad 1]$
:-:|:-:|:-:|:-:|:-:
$[0\quad 0]$|`0`|`~i & j`|`~(i | j)`|`~i`
$[0\quad 1]$|`i & j`|`j`|`~(i ^ j)`|`~i | j`
$[1\quad 0]$|`i & ~j`|`i ^ j`|`~j`|`~(i & j)`
$[1\quad 1]$|`i`|`i | j`|`i | ~j`|`1`

具体操作方式见 IMPLY 卷积。

<!--
第二行\第一行|$[0\quad 0]$|$[0\quad 1]$|$[1\quad 0]$|$[1\quad 1]$
:-:|:-:|:-:|:-:|:-:
$[0\quad 0]$|||或非|
$[0\quad 1]$|与||同或|蕴含
$[1\quad 0]$|蕴含非|异或||与非
$[1\quad 1]$||或||
-->

# 扩展

## 多进制

咕咕咕