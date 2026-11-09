# Farm model and interpretation

Decision vector: new cows C, new hens H, soybean acres S, corn acres K, wheat acres W, winter/spring neighbor hours N1, summer/fall neighbor hours N2. All are nonnegative continuous variables.

Maximize `700C + 3.5H + soy*S + corn*K + wheat*W + 5N1 + 5.5N2 + constant`.

`constant = 850*30 + 4.25*2000 + investment + 0.9*existingCowValue + 0.75*5000 - 40000`.

New-cow marginal contribution is `850 - 1500 + 0.9*1500 = 700`. New-hen contribution is `4.25 - 3 + 0.75*3 = 3.5`. Crop coefficients represent net cash income or feed savings, so required feed acres still contribute to the objective.

| Constraint | Algebra |
| --- | --- |
| Cow barn capacity | C ≤ 12 |
| Henhouse capacity | H ≤ 3000 |
| Corn feed | K − C ≥ 30 |
| Wheat feed | W − 0.05H ≥ 100 |
| Purchases | 1500C + 3H ≤ investment |
| Acreage including cow grazing | 2C + S + K + W ≤ land − 60 |
| Winter/spring work | 60C + 0.3H + S + 0.9K + 0.6W + N1 = winterHours − 2400 |
| Summer/fall work | 60C + 0.3H + 1.4S + 1.2K + 0.7W + N2 = summerHours − 2400 |

The 60 existing grazing acres and 2,400 existing-livestock labor hours per season are subtracted on the RHS. The farm has 30 existing cows and 2,000 existing hens; it does not sell them. Acreage need not all be planted.

## Weather data

| Weather | Probability | Soy | Corn | Wheat |
| --- | ---: | ---: | ---: | ---: |
| Good weather | 0.40 | 70 | 60 | 40 |
| Drought | 0.20 | -10 | -15 | 0 |
| Flood | 0.10 | 15 | 20 | 10 |
| Early frost | 0.15 | 50 | 40 | 30 |
| Drought and frost | 0.10 | -15 | -20 | -10 |
| Flood and frost | 0.05 | 10 | 10 | 5 |

Probabilities are assumptions from the academic problem, not live climate probabilities. Expected crop coefficients are soy 34, corn 27.5, wheat 20.75. This is a fixed-plan expected-value LP, not a recourse or robust optimization model. Perfect-information value is the probability-weighted scenario-optimal worth minus the optimal expected-plan worth. Payoff rows are plans and columns are outcomes.

## Reproduction and corrections

Using the LINGO $35,000 existing-cow value reproduces these worths: good 99,367; drought 67,863.80; flood 74,055.0667; frost 88,767; drought/frost 66,648.80; flood/frost 69,859.7667; expected 80,537. Using the stated $30,000 value subtracts 4,500 from every result and leaves the optimal decisions unchanged.

The expected plan purchases 12 cows and zero hens, plants 414 soybean, 42 corn, and 100 wheat acres, and sells 368.2 winter/spring and 680 summer/fall labor hours. Expected-model land shadow price is 21.3. Its soybean lower coefficient limit is 33.6 and wheat upper limit is 21.15; these are separate one-at-a-time bounds. The original document contains inconsistent sensitivity commentary and rounded payoff substitutions, so the app computes these results independently.

Shadow prices hold the objective constant fixed. Increasing the investment fund changes that constant as well as the budget RHS, so the full local worth change is `1 + purchase-budget dual` per added dollar. Reduced cost conventions are signed objective improvement for a nonbasic decision variable; they differ from LINGO's printed penalty sign for maximization.
