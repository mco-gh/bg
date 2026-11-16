# BG

Peer-to-peer backgammon for two, played in the browser at [mco.dev/bg](https://mco.dev/bg/). Start a game, share the code with a friend and roll; there is nothing to sign up for, and you can turn on video or chat while you play.

It is a static app with no build step: open `index.html` from any web server. The two players connect directly to each other using [PeerJS](https://peerjs.com/) (vendored in `vendor/`).

This repo is mounted in [mco-gh/mco.dev](https://github.com/mco-gh/mco.dev) as a git submodule at `static/bg`. After pushing a change here, update the submodule pointer there to publish it:

```bash
cd mco.dev
git submodule update --remote static/bg
git commit -am "Update bg"
git push
```
