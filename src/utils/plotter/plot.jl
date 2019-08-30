## INSTALLTION:
# - download and install julia from official sources
# - install JSON, Plots, PlotThemes
# - open $julia in this folder "src/utils/plotter"
# - run: "julia .\plot.jl"

import JSON
import PlotThemes
import Plots
using Plots
pyplot()
function run()
    s = open("../../../data/times.json")
    j = JSON.parse(s)

    times = j["times"]
    meassurements = length(times)

    y = map(x->x["minutes"] * 60 + x["seconds"], times)
    y2 = map(x->x[2] / x[1], enumerate(cumsum(y)))
    theme(:solarized)

    scatter(1:meassurements, y, label = "Meassurements")
    plot!(y2, c = :orange, label = "Average over time")
    plot!(1:meassurements, map(x->sum(y) / meassurements, y), 
    label = "Total Average: $(round(sum(y) / meassurements))",
    c = :white)

    colors = [:orangered, :steelblue, :olivedrab]
    for stage in 1:3
        group = map(x->x["stage"] == stage, times)
        grouped_t = map(x->x["minutes"] * 60 + x["seconds"], times[group])
        gy = map(x->x[2] / x[1], enumerate(cumsum(grouped_t)))
        start = 15
        plot!((1:meassurements)[group][start:end], 
        gy[start:end], 
        label = "Stage: $(stage) | Avg: $(round(gy[end]))",
        c = colors[stage])
        xlabel!("#Meassurements")
        ylabel!("Playtime in Seconds")
    end
    title!("Average playtime of Sortie stages")
    gui()
    show()
end
run();
