#!/bin/bash

CONFIG=../config.json
BANNER="==========================================="
Q="[?]"
I="[i]"
U="[>]"
YESNO="$Q [y]es / [n]o"

function setup() {
    echo $BANNER
    echo "----------------- SETUP -------------------"
    echo $BANNER
    if test -f "$CONFIG"; then
        echo "$I $CONFIG already exists."
        start
        echo $BANNER
    else
        echo "$Q No $CONFIG file found, create one now?"
        echo $YESNO
        read -n 1 -s create
        if [ "$create" == "y" ]; then
            echo -e -n "$U Token: "
            read -r token
            echo -e -n "$U Password: "
            read password
            echo "{\"token\":\"$token\",\"password\":\"$password\"}" >$CONFIG
            echo "$I Created $CONFIG file with given info!"
            echo "$I Setup finished"
            start
        else
            echo "$I Setup canceled"
        fi
        echo $BANNER
    fi
}

function start() {
    echo "$Q Do you want to start the bot now?"
    echo $YESNO
    read -n 1 -s start
    if [ "$start" == "y" ]; then
        echo "$I Starting..."
        bash restart.sh
    else
        echo "$I Not Starting"
    fi
}

setup
