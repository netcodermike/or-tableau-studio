# Solver design

1. Normalize any negative RHS, reversing its inequality. Preserve a map back to each original row.
2. Add slack to ≤ rows, surplus to ≥ rows, and artificial basic variables to ≥ or = rows.
3. Phase I maximizes the negative sum of artificials. The tableau objective row is `z - c*x = 0`; subtracting an improving negative row coefficient through a pivot updates its objective RHS.
4. Choose the smallest-index improving column. Perform the minimum positive-entry ratio test, breaking ratio ties by smallest basic-variable index (Bland's rule).
5. A negative Phase I optimum establishes infeasibility within tolerance. Pivot zero artificial basics out; remove redundant zero equations and remember their transformed RHS conditions. Drop artificial columns.
6. Restore the original objective, negated for minimization, and run Phase II. No positive pivot entry in an improving column means unboundedness. A 1,000-pivot cap returns a separate status.
7. Reconstruct decision values and validate original constraint residuals. Include the supplied constant only in the reported original objective, not tableau RHS.

Snapshots include phase, columns, basis, rows, objective, and the next selected pivot/ratios. The final selected snapshot is the final basis; the slider can return to initial Phase I.

Row operations are also applied to an identity matrix. With final row transform T and basic costs cB, normalized dual multipliers are `cB*T`; restore original row signs and minimization sense. For an original RHS perturbation delta, require every `xB + T*delta` to remain nonnegative. Removed redundant equalities impose zero transformed RHS conditions, so their individual inconsistent perturbations are excluded.

For a basic objective coefficient perturbation, retain nonnegative tableau objective coefficients for all nonbasic columns. For a nonbasic objective coefficient, its own reduced cost supplies the bound. Restore minimization signs and express intervals as absolute parameter values. Ranges hold a particular optimal basis; degeneracy and alternative optima can yield other valid ranges.

This is an original educational implementation based on standard simplex theory; no proprietary solver, code, or original academic document is bundled. For a detailed treatment see [MIT Applied Mathematical Programming, Chapter 2](https://web.mit.edu/15.053/www/AMP-Chapter-02.pdf).
