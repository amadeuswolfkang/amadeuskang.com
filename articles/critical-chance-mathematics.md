---
title: Critical chance mathematics
date: 2026-08-04
tag: math
description: How games use pseudorandom distributions to make critical chance feel fair, and how to solve for the PRD constant.
---

Critical chance isn't calculated like you think. Modern games have sophisticated ways of calculating probability and applying statistics to solve player pain points.

## Uniform distributions

You already know what a uniform distribution is. It's your intuitive idea of probability where every outcome is equiprobable. The simple example is a d6; no side has a higher chance to land than any other. This creates a swingy distribution with a standard deviation of 1.71.

This distribution allows equal chance for unlucky and lucky rolls, but most games add a flat modifier like +1 to cushion the unlucky rolls.

For critical hits, it's worse; players find it frustratingly unpredictable. Modern game design solves this grievance by using a pseudorandom distribution.

## Normal distribution

You should already know this.

## Pseudorandom distribution

Consider a crit chance of 10%; intuition says you will crit 1-in-10 times. This is wrong. In a uniform distribution, you could miss the crit 20 times in a row. *The chance of a 20-hit streak without crit is 12.16%*, a near 1-in-8 chance. Humans underestimate the chances of streaks, and eventually experience disappointment.

There is a solution: a pseudorandom distribution (PRD). PRDs alleviate the mismatch between intuition and statistical reality. This is the interesting distribution; it's how games compute crit chance more consistently.

Say you have a desired crit chance of $p^* = 10\%$. PRD is a trick to help you crit 1-in-10 times. Instead of having a 10% crit chance on every hit, your initial crit chance is 1.47%. After each missed crit, you gain a flat constant of +1.47%; this stacks until a critical hit is guaranteed. Once you crit, it resets back to 1.47% again. PRD serves as a pity mechanic, eventually guaranteeing the desired outcome. Sophisticated, no?

The equation is $P(n) = C \times n$ where $P(n)$ is crit chance, $n$ is the number of hits since the last crit, and $C$ is the additive increment to crit chance per consecutive miss. Note, $C$ is also the initial crit chance. On proc, $n$ resets to 1.

Now, you might be wondering how we got the initial crit chance. Well, *we have to solve for $C$ backwards*.

### Solving for pseudorandom probabilities

You guess a value for $C$, compute the actual crit chance $p$ it produces, and check $p$ against your target $p^*$. There's only one exact $C$ for each $p^*$, but the smaller $C$ is, the more rows you'll have to compute. 1% crit requires computing 6,409 rows. 50% crit requires at most 4 rows.

Example. Let's say I want a crit chance of $p^* = 10\%$, I'll guess and check $C = 0.10$.

Recall, $P(n) = C \times n$.

1. $P(n) = 0.10 \times n$
2. Find the hit number where crit is guaranteed ($M$).
	- $M = \lceil 1/C \rceil = \lceil 1/0.10 \rceil = 10$
3. Find the chance to reach each hit $n$ without crit.
	$$R(n) = (1 - P(1)) \times (1 - P(2)) \times \cdots \times (1 - P(n-1))$$
	You can also use the recursive form.
	$$R(n+1) = R(n) \times (1 - P(n))$$

	| hit $n$ | $R(n)$ calculation                    | $R(n)$  |
	| ------- | ------------------------------------- | ------: |
	| 1       | $1 \times (1 - 0) = 1.0$              | 1.00000 |
	| 2       | $1 \times (1 - 0.10) = 0.9$           | 0.90000 |
	| 3       | $0.9 \times (1 - 0.20) = 0.72$        | 0.72000 |
	| 4       | $0.72 \times (1 - 0.30) = 0.504$      | 0.50400 |
	| 5       | $0.504 \times (1 - 0.40) = 0.3024$    | 0.30240 |
	| 6       | $0.3024 \times (1 - 0.50) = 0.1512$   | 0.15120 |
	| 7       | $0.1512 \times (1 - 0.60) = 0.06048$  | 0.06048 |
	| 8       | $0.06048 \times (1 - 0.70) = 0.01814$ | 0.01814 |
	| 9       | $0.01814 \times (1 - 0.80) = 0.00363$ | 0.00363 |
	| 10      | $0.00363 \times (1 - 0.90) = 0.00036$ | 0.00036 |

4. Find crit chance for hit $n$.
	$$f(n) = R(n) \times P(n)$$
5. Find average hits per crit.
	Calculate the weighted average $n \times f(n)$ for every $n$.
	$$\begin{aligned} E[n] &= 1(0.10) + 2(0.18) + 3(0.216) + 4(0.2016) + 5(0.1512) \\ &\quad + 6(0.09072) + 7(0.042336) + 8(0.0145152) + 9(0.00326592) + 10(0.00036288) \\ &= 3.66021568 \end{aligned}$$
6. Find the actual crit chance.
	$$p = 1/E[n] = 1/3.66021568 = 0.273208\ldots \rightarrow 27.32\%$$

Here's the comprehensive table:

| hit ($n$) | crit chance $P(n)$ | chance to reach $n$ $R(n)$ | chance crit procs on $n$ ($f(n)$) | $n \times f(n)$ |
| --------- | -----------------: | -------------------------: | --------------------------------: | --------------: |
| 1         | 10%                | 100%                       | 10%                               | 0.10            |
| 2         | 20%                | 90%                        | 18%                               | 0.36            |
| 3         | 30%                | 72%                        | 21.6%                             | 0.648           |
| 4         | 40%                | 50.4%                      | 20.16%                            | 0.8064          |
| 5         | 50%                | 30.24%                     | 15.12%                            | 0.756           |
| 6         | 60%                | 15.12%                     | 9.072%                            | 0.5443          |
| 7         | 70%                | 6.048%                     | 4.234%                            | 0.2964          |
| 8         | 80%                | 1.814%                     | 1.453%                            | 0.1161          |
| 9         | 90%                | 0.363%                     | 0.327%                            | 0.0294          |
| 10        | 100%               | 0.036%                     | 0.036%                            | 0.0036          |

Sum of $n \times f(n)$: $E[n] = 3.66$ (average hits per crit) $\rightarrow$ actual crit chance $p = 1/E[n] = 27.32\%$

Well damn, we didn't find $C$ for 10% crit. We found $C$ for 27.32% crit.

Does this mean you have to resort to trial-and-error? No. You can slash your set of candidate values in half with every check, dialing in on $C$ gradually.

Compare what your guess *gives* against what you *want*. Our guess gave $p = 27.32\%$ when we wanted $p^* = 10\%$; $p$ is too high, so we dial $C$ down. If $p$ is too low, we dial up.

$$C_k = \begin{cases} C_{k-1} - \dfrac{C_0}{2^k} & \text{if } p_{k-1} > p^* \\[0.5em] C_{k-1} + \dfrac{C_0}{2^k} & \text{if } p_{k-1} < p^* \end{cases}$$

where $p_{k-1}$ is the actual crit chance produced by $C_{k-1}$.

If you're serious about precision, check and dial it in 53 times; this will saturate float64 and precomputing C for every integer [1, 100] will still be faster than a flash of lightning (lightning flash ≈ 200ms, precomputation ≈ 90ms).
