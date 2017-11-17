Read this document with <typings/global/index.d.ts>

## Rule String

### AutoProxy (ruletype = 0)

Use RuleString to check a path.

| RuleString      | Explain  
| :-------------- | :-------------------
| `foo`           | Containing `foo`
| `|foo`          | Starts with `foo`
| `bar|`          | Ends with `bar`
| `||foobar.com`  | foobar.com and its subdomains

You may use these prefix to change lines' behavior:

| Prefix  | Explain
| :------ | :------------------------
| `@@`    | Exclude this condition.
| `!`     | Comment line.

Examples:

- `!Aloha` Doesn't work; it is just a comment.
- `foo`   Matches all path containing `foo`.
- `@@bar` Excludes all path containing `bar`.
- `||google.com` Matches `https://google.com` and all sites under google.com (eg. `https://plus.google.com/`)

EZProxySwitch first check if there is a matched exclusive rule (beginning with `@@`). If found, abort following check and this Rule Group will not work. 
Then check if there is a normal rule that the path matches. If found, this rule group works and a Profile(could be a proxy, or just make a direct connection) is applied.