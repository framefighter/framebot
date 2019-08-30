# First time setup:

1. create `config.json` file in home directory
2. Fill it with a `token` and a `password`
```json
        {
            "token": "<bot token>",
            "password": "<password>"
        }
```
- `token`: Bot token from _@BotFather_ 
- `password`: Used for declaring a user as admin  
    **Careful! Everyone with the `password` can make any users admin**
3. create a `data` directory also in home directory
4. run `./bash/restart.sh`  
    - this will pull new git versions
    - install missing npm packages
    - build typescript
    - create new `tmux` session called `teleframe` with the bot  
    **(You need to have `tmux` installed on your system)**
5. After that you can just restart and update the bot with the `/restart` command right from Telegram  
    - You will see the update progress in Telegram as well

# Updating

1. Promote a Telegram account you trust to **admin** with `/admin <password>, <username>` 
2. With that account execute the command `/restart` from within Telegram
3. The bot will automatically update and send progress messages to you