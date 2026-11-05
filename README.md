# Mine-Decorating
A Web-Room-Decorating Game based on WebGL 
This Link Might Work: [Mine-Decorating][1]
If it does not work, please use this link: [Mine-Decorating][2]

[1]: https://i6.cims.nyu.edu/~jz5751/graphics/final_project/
[2]: https://suqichen777.github.io/Mine-Decorating/

## Running locally

Textures do not load from `file://`, so serve the folder:

```bash
python3 -m http.server
```

and open http://localhost:8000.

## Tests

The game logic has tests that run with Node 18+ and need nothing installed:

```bash
node --test
```

`tests/harness.js` loads `lib.js` (matrix and shape helpers) and `lib2.js` into a Node `vm` context without WebGL, and the tests press the same buttons a player would.
