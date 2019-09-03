set -e
echo "Commiting any changes"
git add .
git commit -qm "database"
echo "Pulling new git version"
git pull -q
echo "Installing possible new npm modules"
npm i -q
echo "Compiling new typescript build"
tsc
echo "Preparing to restart bot"
echo "This may take a few seconds"
echo "Killing sessions"
tmux ls
tmux new-session -d -s restart "bash bash/kill.sh; bash bash/start.sh"