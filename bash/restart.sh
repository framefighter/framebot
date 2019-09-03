#!/bin/bash


echo "Pulling new git version"
git pull -q
echo "Installing possible new npm modules"
npm i -qe
echo "Compiling new typescript build"
set -e
tsc
set +e
echo "Preparing to restart bot"
echo "This may take a few seconds"
echo "Killing sessions"

tmux ls
tmux new-session -d -s restart "bash bash/kill.sh; bash bash/start.sh"