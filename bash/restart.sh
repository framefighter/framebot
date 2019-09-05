#!/bin/bash
echo "Pulling new git version"
git pull -q
git show --shortstat --oneline
set -e
echo "Installing possible new npm modules"
npm i
echo "Updating modules"
npm update
echo "Compiling new typescript build"
tsc
set +e
echo "Preparing to restart bot"
echo "Killing sessions"
tmux ls
tmux new-session -d -s restart "tmux kill-session -t teleframe; tmux new -d -s teleframe 'npm start'"
echo "Finished Script"