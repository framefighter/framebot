#!/bin/bash
echo "Pulling new git version"
git pull -n
git show --shortstat
# BRAK ON ERROR
set -e
echo "Installing possible new npm modules"
npm i
echo "Updating modules"
npm update
echo "Compiling new typescript build"
tsc
set +e
# DONT BREAK ON ERROR
echo "Preparing to restart bot"
echo "Killing sessions"
tmux ls
tmux new-session -d -s restart "tmux kill-session -t teleframe; tmux new -d -s teleframe 'npm start'"
echo "Finished"