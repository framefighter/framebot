#!/bin/bash
git pull -q
git show --shortstat --oneline
set -e
npm i
npm update
tsc
set +e
tmux ls
tmux new-session -d -s restart "tmux kill-session -t teleframe; tmux new -d -s teleframe 'npm start'"
