#!/bin/bash

echo "Pulling new git version"
git pull -q
echo "Installing possible new npm modules"
npm i -qe
echo "Updating modules"
npm update
echo "Compiling new typescript build"
set -e
tsc
set +e
echo "Preparing to restart bot"
echo "This may take a few seconds"
echo "Killing sessions"

tmux ls
tmux new-session -d -s restart "tmux kill-session -t teleframe; tmux new -d -s teleframe 'npm start'"

