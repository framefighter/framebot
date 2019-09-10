window.addEventListener('DOMContentLoaded', () => {
    console.log("hi")
    const root = document.getElementById("root")
    const timesRoot = document.getElementById("keyboard")
    const songsRoot = document.getElementById("content")

    const avg = (times) => {
        let allTimes = {}
        times.forEach(time => {
            const id = time.mission.toUpperCase()
            const found = allTimes[id]
            const newTime = time.seconds + time.minutes * 60
            if (found) {
                found.seconds += newTime
                found.count++
                if (time.stage) {
                    found.stage += time.stage
                }
                if (found.max < newTime) {
                    found.max = newTime
                }
                if (found.min > newTime) {
                    found.min = newTime
                }
            } else {
                allTimes[id] = {
                    mission: id,
                    count: 1,
                    max: newTime,
                    min: newTime,
                    seconds: newTime,
                    stage: time.stage || 0
                }
            }
        })
        Object.keys(allTimes).forEach(key => {
            allTimes[key].seconds /= allTimes[key].count
            allTimes[key].stage /= allTimes[key].count
        })
        return Object.keys(allTimes).map(key => allTimes[key])
    }

    const clock = (seconds) => {
        if (seconds === undefined) return "--m --s"
        const v = seconds > 0 ? "" : "-"
        const min = Math.floor(Math.abs(seconds) / 60)
        const sec = Math.round(Math.abs(seconds) - Math.floor(min) * 60)
        if (min) {
            return `${v}${min > 9 ? min : "0" + min}m ${sec > 9 ? sec : "0" + sec}s`
        } else if (sec) {
            return `${v}${sec > 9 ? sec : "0" + sec}s`
        }
        return "0s"
    }

    if (root && timesRoot && songsRoot) {
        fetch("https://raw.githubusercontent.com/framefighter/framebot/master/data/times.json")
            .then(resp => resp.json())
            .then(json => {
                const times = json.times;
                if (times && times.length) {
                    const missionText = document.createElement("b")
                    missionText.innerText = "TOTAL"
                    missionText.classList.add("rowName", "gridHead")

                    const total = document.createElement("span")
                    total.innerText = times.length
                    total.style = "color: #606060;"
                    total.classList.add("gridHead")


                    const totalAvg = document.createElement("span")
                    totalAvg.innerText = clock(
                        times.reduce((a, time) =>
                            a += time.seconds + time.minutes * 60, 0) / times.length
                    )
                    totalAvg.classList.add("gridHead")


                    timesRoot.appendChild(missionText)
                    timesRoot.appendChild(total)
                    timesRoot.appendChild(totalAvg)

                    const avgTimes = avg(times)
                    if (avgTimes && avgTimes.length) {
                        avgTimes.sort((a, b) => a.seconds - b.seconds)
                        for (let avgTime of avgTimes) {
                            const mission = document.createElement("b")
                            mission.innerText = avgTime.mission
                            mission.classList.add("rowName")

                            const count = document.createElement("span")
                            count.innerText = avgTime.count
                            count.style = "color: #606060;"

                            const seconds = document.createElement("span")
                            seconds.innerText = clock(avgTime.seconds)


                            timesRoot.appendChild(mission)
                            timesRoot.appendChild(count)
                            timesRoot.appendChild(seconds)
                        }
                    }
                }
            })

        fetch("https://raw.githubusercontent.com/framefighter/framebot/master/data/songs.json")
            .then(resp => resp.json())
            .then(json => {
                const songs = json.songs;
                if (songs && songs.length) {
                    for (let song of songs) {
                        const songName = document.createElement("b")
                        songName.innerText = song.name.toUpperCase()
                        songName.classList.add("rowName")

                        const input = document.createElement("input")
                        input.type = "text"
                        input.value = song.string
                        input.id = song.name
                        input.disabled = true

                        const copyBtn = document.createElement("button")
                        copyBtn.innerText = "Copy"
                        copyBtn.onclick = () => {
                            input.disabled = false
                            input.select()
                            input.setSelectionRange(0, 999999)
                            document.execCommand("copy")
                            window.getSelection().removeAllRanges()
                            input.value = `Copied ${song.name}!`
                            setTimeout(() => input.value = song.string, 1000)
                            input.disabled = true
                        }
                        songsRoot.appendChild(songName)
                        songsRoot.appendChild(copyBtn)
                        songsRoot.appendChild(input)
                    }
                }
            })
    }
})