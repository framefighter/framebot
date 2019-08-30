bash bash/pull.sh
echo installing possible new npm modules
npm i
bash bash/build.sh
echo Preparing to restart bot
echo This may take a few seconds
echo Killing sessions
tmux ls
tmux new-session -d -s restart "bash bash/kill.sh; bash bash/start.sh"