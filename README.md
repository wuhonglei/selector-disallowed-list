# selector-disallowed-list

Specify a list of disallowed selectors.

<!-- prettier-ignore -->
```css
    .foo > .bar
/** ↑
 * This is selector */
```

## Options

`array|string|regexp`: `["array", "of", "selectors", /or/, "/regex/"]|"selector"|"/regex/"|/regex/`

If a string is surrounded with `"/"` (e.g. `"/\.foo/"`), it is interpreted as a regular expression.

Given:

```json
["a > .foo", "/\\[data-.+]/"]
```

The following patterns are considered problems:

<!-- prettier-ignore -->
```css
a > .foo {}
```

<!-- prettier-ignore -->
```css
a[data-auto="1"] {}
```

<!-- prettier-ignore -->
```css
.foo, [data-auto="1"] {}
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
.foo {}
```

<!-- prettier-ignore -->
```css
a
>
.foo {}
```

<!-- prettier-ignore -->
```css
.bar > a > .foo {}
```

<!-- prettier-ignore -->
```css
.data-auto {}
```

<!-- prettier-ignore -->
```css
a[href] {}
```

## Optional secondary options

### `resolveNestedSelectors: true | false` (default: `false`)

This option will resolve nested selectors with `&` interpolation.

For example, with `true`.

Given the string:

```
"^\.[A-Z]+$"
```

The following patterns are considered problems:

<!-- prettier-ignore -->
```css
.A {
  &B {} /* resolved to ".AB" */
}
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
.A {
  &__B {} /* resolved to ".A__B" */
}
```
