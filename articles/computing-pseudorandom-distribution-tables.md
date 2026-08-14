---
title: Computing pseudorandom distribution tables
date: 2026-08-04
tag: math
description: How games use pseudorandom distributions to make critical-hit chance feel fair, how to solve for the PRD constant, and how to compute the probability tables.
---

Critical chance in video games is not calculated how you think. Video games have a sophisticated way of applying probability, and it's called pseudorandom distribution (PRD).

## Uniform distribution

You already know what a uniform distribution is. It's your intuitive idea of probability where every outcome is equiprobable. The simple example is a d10; no side has a higher chance to land than any other. This creates a swingy distribution where outcomes could land high or low without skew.

In video games, a uniform distribution can generate Bernoulli (binary) outcomes. For example, let's say {1, 2, 3, 4, 5, 6, 7, 8, 9} are non-crit values and {10} is a crit value. There's an underlying uniform distribution, but our selection process for the outcome is Bernoulli. This is just a fancy way of saying we can have only two types of outcomes. However, players find the outcomes frustratingly unpredictable.

Consider a crit chance of 10%; intuition says you will crit 1-in-10 times. [This is wrong](https://en.wikipedia.org/wiki/Gambler%27s_fallacy). In a uniform distribution, you could miss crit 20 times in a row. *The chance of a 20-hit streak without crit is 12.16%*, a near 1-in-8 chance. Humans underestimate the chances of streaks, and eventually experience disappointment.

This pain point is solved via PRD, a trick to make probability feel more fair.

## Pseudorandom distribution

Say you have a desired crit chance $p^* = 10\%$. PRD can help you crit 1-in-10 times more consistently. Instead of having a $10\%$ crit chance on every hit, your initial crit chance is $1.47\%$. After each missed crit, you gain a flat constant of $+1.47\%$; this stacks until a crit is guaranteed. Once you crit, it resets back to $1.47\%$ again. PRD serves as a pity mechanic, eventually guaranteeing the desired outcome. You can be unlucky now, but you will never be unlucky forever. Sophisticated, no?

The equation is $P(n)=Cn$, capped at the smallest $n$ where $P(n)\ge1$. $P(n)$ is crit chance, $n$ is the number of hits since the last crit, and $C$ is the additive increment to crit chance per consecutive miss. Note, $C$ is also the initial crit chance. On proc, $n$ resets to 1.

Now, you might be wondering how we got $C$. Well, we have to solve for $C$ backwards.

### Solving for the PRD constant

$C$ is the PRD constant. There's only one exact $C$ for each $p^*$, but the smaller $C$ is, the more rows you'll have to compute. $1\%$ crit requires computing 6,409 rows. $50\%$ crit requires only 4 rows. For now, let's try finding $C$ for $10\%$ crit.

**Example.** Let's say I want to find $C$ where $p^* = 10\%$.

Recall that $P(n) = C \times n$.

1. Guess and check $C = 0.10$.  

2. $P(n) = 0.10 \times n$

3. Find the hit number where crit is guaranteed ($M$).

    - $M = \lceil 1/C \rceil = \lceil 1/0.10 \rceil = 10$

4. Find the chance to reach each hit $n$ without crit. You can use one of the two following equations; they're equivalent. I use the recursive form.

    Product form.

$$
R(n) = (1 - P(1)) \times (1 - P(2)) \times \cdots \times (1 - P(n-1))
$$
    
    Recursive form.

$$
R(n+1) = R(n) \times (1 - P(n))
$$

|  hit $n$ | $R(n)$ calculation                           |       $R(n)$ |
| -------: | -------------------------------------------- | -----------: |
|        1 | $1$                                          |   $1.000000$ |
|        2 | $1 \times (1 - 0.10)$                        |   $0.900000$ |
|        3 | $0.900000 \times (1 - 0.20)$                 |   $0.720000$ |
|        4 | $0.720000 \times (1 - 0.30)$                 |   $0.504000$ |
|        5 | $0.504000 \times (1 - 0.40)$                 |   $0.302400$ |
|        6 | $0.302400 \times (1 - 0.50)$                 |   $0.151200$ |
|        7 | $0.151200 \times (1 - 0.60)$                 |   $0.060480$ |
|        8 | $0.060480 \times (1 - 0.70)$                 |   $0.018144$ |
|        9 | $0.018144 \times (1 - 0.80)$                 |  $0.0036288$ |
|       10 | $0.0036288 \times (1 - 0.90)$                | $0.00036288$ |

5. Find crit chance for hit $n$.

$$
f(n) = R(n) \times P(n)
$$

6. Find average hits per crit.

    Calculate the weighted average $n \times f(n)$ for every $n$.
    
$$
\begin{aligned}
E[n] &= 1(0.10) + 2(0.18) + 3(0.216) + 4(0.2016) + 5(0.1512) \\
&\quad + 6(0.09072) + 7(0.042336) + 8(0.0145152) + 9(0.00326592) + 10(0.00036288) \\
&= 3.66021568
\end{aligned}
$$

7. Find the actual crit chance.

$$
p = 1/E[n] = 1/3.66021568 = 0.273208\ldots \rightarrow 27.32\%
$$

Here's the comprehensive table:

| hit ($n$) | crit chance $P(n)$ | chance to reach $n$ $R(n)$ | chance crit procs on $n$ ($f(n)$) | $n \times f(n)$ |
| --------- | -----------------: | -------------------------: | --------------------------------: | --------------: |
| $1$       |             $10\%$ |                    $100\%$ |                            $10\%$ |          $0.10$ |
| $2$       |             $20\%$ |                     $90\%$ |                            $18\%$ |          $0.36$ |
| $3$       |             $30\%$ |                     $72\%$ |                          $21.6\%$ |         $0.648$ |
| $4$       |             $40\%$ |                   $50.4\%$ |                         $20.16\%$ |        $0.8064$ |
| $5$       |             $50\%$ |                  $30.24\%$ |                         $15.12\%$ |         $0.756$ |
| $6$       |             $60\%$ |                  $15.12\%$ |                         $9.072\%$ |        $0.5443$ |
| $7$       |             $70\%$ |                  $6.048\%$ |                         $4.234\%$ |        $0.2964$ |
| $8$       |             $80\%$ |                  $1.814\%$ |                         $1.452\%$ |        $0.1161$ |
| $9$       |             $90\%$ |                  $0.363\%$ |                         $0.327\%$ |        $0.0294$ |
| $10$      |            $100\%$ |                  $0.036\%$ |                         $0.036\%$ |        $0.0036$ |

Sum of $n \times f(n)$: $E[n] = 3.66$ (average hits per crit) $\rightarrow$ actual crit chance $p = 1/E[n] = 27.32\%$

Well damn, we didn't find $C$ for $10\%$ crit. We found $C$ for $27.32\%$ crit.

Did we do something wrong? No, we did everything right; we're just not finished yet. You know whether your guess for $C$ is too high or too low by calculating the actual crit rate $p$ and comparing it to desired crit rate $p^*$. Then, we'll set an interval $[a, b]$.

- If $p > p^*$, then $C$ is too high. Set the interval $[a, C]$.
- If $p < p^*$, then $C$ is too low. Set the interval $[C, b]$.

Our $C$ for $27.32\%$ crit is too high, but we know that $C$ for $0\%$ must be too low, so the answer must exist in $[0, 0.10]$.

In the inverse case, if $C$ were too low, we know that $C$ for $100\%$ would be too high, so the answer would exist in $[0.10, 1]$.

### Bisection

I'm not going to check every number in this interval; I'm going to bisect it. Bisection is uber simple, just slash the interval of candidate values in half at the midpoint, calculate $p$, compare $p$ and $p^*$ values, and keep the half that still contains the answer. Repeat this, and we converge towards the answer.

For each iteration $k$, find the midpoint $C_k = \dfrac{a_k + b_k}{2}$.

$$
C_0 = \dfrac{0 + 0.10}{2} = 0.05.
$$

Using $C_0$, I calculate for $p$ again, and we get $p = 18.89\%$.

At this point, I continue iterating until we converge to the answer.

This is the bisection recurrence and midpoint equations.

$$
C_k =
\begin{cases}
C_{k-1} - \dfrac{b_0-a_0}{2^{k+1}} & \text{if } p_{k-1} > p^* \\[0.5em]
C_{k-1} + \dfrac{b_0-a_0}{2^{k+1}} & \text{if } p_{k-1} < p^*
\end{cases}
$$

$$
C_0 = \frac{a_0+b_0}{2}
$$

where $p_{k-1}$ is the actual crit chance produced by $C_{k-1}$.

### Iteration table

| iteration $k$ |         interval $[a_k,b_k]$ |  midpoint $C_k$ | actual crit rate $p$ | comparison to $p^*$ |
| ------------: | ---------------------------: | --------------: | -------------------: | ------------------: |
|           $0$ |                  $[0, 0.10]$ |      $0.050000$ |          $18.8908\%$ |                high |
|           $1$ |                  $[0, 0.05]$ |      $0.025000$ |          $13.1421\%$ |                high |
|           $2$ |                 $[0, 0.025]$ |      $0.012500$ |           $9.1845\%$ |                 low |
|           $3$ |            $[0.0125, 0.025]$ |      $0.018750$ |          $11.3208\%$ |                high |
|           $4$ |          $[0.0125, 0.01875]$ |      $0.015625$ |          $10.3031\%$ |                high |
|           $5$ |         $[0.0125, 0.015625]$ |     $0.0140625$ |           $9.7585\%$ |                 low |
|           $6$ |      $[0.0140625, 0.015625]$ |    $0.01484375$ |          $10.0342\%$ |                high |
|           $7$ |    $[0.0140625, 0.01484375]$ |   $0.014453125$ |           $9.8972\%$ |                 low |
|           $8$ |  $[0.014453125, 0.01484375]$ |  $0.0146484375$ |           $9.9659\%$ |                 low |
|           $9$ | $[0.0146484375, 0.01484375]$ | $0.01474609375$ |         $10.00009\%$ |                high |

By iteration 9, we've converged to the answer:

$$
C_9 \approx 0.01474609375 = 1.474609375\%.
$$

If you're serious about precision, bisect 65 times; this will saturate float64. At this precision, precomputing C for every integer in $[1, 100]$ will still be 5 times faster than the visible flash of lightning (lightning flash $\approx 301\,\mathrm{ ms}$, precomputation on my machine $\approx 60\,\mathrm{ ms}$).

Curious whether I'm right? Don't be; see it for yourself.

## Computing the PRD table for [1, 100]

```python
from math import ceil
from time import perf_counter


def find_prd_constant(desired_crit_chance):
    if desired_crit_chance == 1:
        return 1.0

    low, high = 0.0, 1.0

    for _ in range(65):
        C = (low + high) / 2
        p = actual_crit_chance(C)

        if p > desired_crit_chance:
            high = C
        else:
            low = C

    return (low + high) / 2


def actual_crit_chance(C):
    average_hits = 0.0
    reach_chance = 1.0

    for n in range(1, ceil(1 / C) + 1):
        crit_chance = min(C * n, 1.0)
        proc_chance = reach_chance * crit_chance

        average_hits += n * proc_chance
        reach_chance *= 1 - crit_chance

    return 1 / average_hits


results = []
elapsed_ms = 0.0

for percent in range(1, 101):
    start = perf_counter()
    C = find_prd_constant(percent / 100)
    elapsed_ms += (perf_counter() - start) * 1000

    results.append((percent, C))

print(f"{'p':>3}  {'C':>4}")

for percent, C in results:
    print(f"{percent:3}%  {C * 100:>12.8f}")

print(f"\nDone in {elapsed_ms:.3f} ms")
```

## Addenda

- The average lightning flash lasts 301 ms [according to NOAA's Geostationary Lightning Mapper (GLM)](https://repository.library.noaa.gov/view/noaa/45194).
- The most popular video game known to use PRD for crit chance is [Dota 2](https://en.wikipedia.org/wiki/Dota_2); this is where I first learned it. I spent ~1,600 hrs playing Dota 2 when I was in high school.



