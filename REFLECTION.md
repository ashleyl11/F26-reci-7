# Reflection

**Name / Andrew ID: Ashley Leung / aleung2**

**Recitation group members (Task 2): Rohan Bhagra**

---

### 1. Valid but weak

Pick a property you wrote that passes on the correct implementation but
kills few or no mutants. Why is it still a *valid* property? Describe a
concrete bug (not one of our mutants) that it *would* catch.

The property “every input interval lies inside some output interval” is valid
because the specification requires the output to cover every point covered by
the input. It is weak and does not kill many mutants because it does not check if extra covereage has been added to the output interval. It is still a valid property because it does check that the output interval is not too small. One bug it would catch would be if a few input intervals were left out or not covered in the output interval. 


### 2. A generator problem, not a property problem

Describe a mutant, from either task, that survived or was flaky because of your
**generator** rather than your property. What did the generator fail to
produce? How did you fix it? Paste the runner output from before and after.

The general interval-list generator does not reliably produce two intervals
whose integer endpoints are neighbors, such as `[n, n]` and `[n + 1, n + 1]`.
The `mergesIntegerNeighbors` mutant incorrectly combines those intervals even
though there is a real-number gap between them. I added the targeted
`alreadyDisjointIntervals` generator, which constructs each next interval to
start one integer after the previous interval ends, and checks that merging
preserves the list:

```text
Before: ✘ mergesIntegerNeighbors SURVIVED
After:  ✔ mergesIntegerNeighbors killed by: leaves already-disjoint input unchanged
Counterexample: [[[0,0],[1,1]]]
```

### 3. Reading a counterexample

Paste one counterexample that the mutation runner printed for a killed
mutant. In 2–3 sentences, explain using the *specification* why that input
exposes the bug.
For touchingNotMerged, a listed counter example was [[0,2],[2,4]] which was a valid input to expose the bug because the inputs here are touching at value 2, meaning both input intervals cover 2, but are seperate apart from 2. Therefore, this input tests to see if the program can recognize touching inputs. 

### 4. Your project

Name one function or module in your team's project that would benefit from
property-based testing. State two properties in English, name the pattern of
each, and describe the generator you'd need, including anything about its
inputs that a naive generator would get wrong.

The theme button I worked on in
[packages/tui/src/feature-plugins/system/theme-button.tsx](../opencode/packages/tui/src/feature-plugins/system/theme-button.tsx)
would benefit from property-based tests:

1. **Invariant:** The button's foreground color always matches the current
   theme's accent color. Generate valid colors by choosing each RGBA channel
   from 0 through 255 and provide the generated color as `api.theme.current.accent`.
2. **Metamorphic:** Changing only the current theme's accent changes the
   button's foreground color, while clicking the button still opens the theme
   picker. Generate two distinct valid RGBA colors, render the button with
   each mocked theme, and verify the click handler in both cases replaces the
   dialog with `DialogThemeList`. A naive test using only one fixed theme color
   could miss a button that hard-codes its color instead of reading the
   current theme.
