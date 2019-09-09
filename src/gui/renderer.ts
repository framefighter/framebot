import { COMMANDS } from '../bot/static'
import { Active } from '../bot/active/active'
import { InlineKeyboardButton, InlineKeyboardMarkup } from 'node-telegram-bot-api'

const rootID = "root"
const contentID = "content"
const keyboardID = "keyboard"

window.addEventListener('DOMContentLoaded', () => {
    const updateContent = (el: HTMLElement, act: Active) => {
        el.innerHTML = act.message.replace(/\n/g, "</br>")
    }

    let activeCommand: command.ID = "sortie"


    const c = () => {
        const root = document.getElementById(rootID)
        if (root) {
            root.innerHTML = ""

            const act = new Active({
                args: [],
                command: COMMANDS.fromID(activeCommand),
            })

            const content = document.createElement("div")
            content.id = contentID
            updateContent(content, act)


            const keyboard = document.createElement("div")
            keyboard.id = keyboardID
            buttons(keyboard, act)

            root.appendChild(content)
            root.appendChild(keyboard)
        }
    }

    const buttons = (el: HTMLElement, act: Active) => {
        el.innerHTML = ""
        const cmds = COMMANDS.list.filter(cmd => cmd.jsonKey)
        for (let cmd of cmds) {
            const li = document.createElement("div")
            li.className = "keyboardBtn"
            li.innerText = cmd.buttonText(act)
            li.onclick = () => {
                activeCommand = (cmd.id)
                c()
            }
            el.appendChild(li)
        }
    }
    setInterval(c, 1000)
})
