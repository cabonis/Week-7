function simulate(data,svg)
{
    let width = parseInt(svg.attr("viewBox").split(' ')[2]);
    let height = parseInt(svg.attr("viewBox").split(' ')[3]);
    let main_group = svg.append("g").attr("transform", "translate(0, 50)");

    var linked = {};
    data.links.forEach(function(d) {
        linked[d.source + "," + d.target] = 1;
    });

    let scale_radius = d3.scaleSqrt()
        .domain(d3.extent(data.nodes, (d) => d.weight))
        .range([5,30]);

    let scale_link_stroke_width = d3.scaleLinear()
        .domain(d3.extent(data.links, (d) => d.weight))
        .range([.5,4]);

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let link_elements = main_group.append("g")
        .attr('transform',`translate(${width/2},${(height/2)-60})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke-width", (d) => scale_link_stroke_width(d.weight));
        
    let node_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2},${(height/2)-60})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append('g')
        .attr("class",function (d){return "gr_"+d.id.toString()})
        .attr("class", "blah")
        .on("mouseenter", (m,d) => {
            node_elements.classed("inactive",true);
            link_elements.classed("inactive", true);
            node_elements.filter((o) => linked[d.id + "," + o.id] || linked[o.id + "," + d.id] || d.id == o.id)
                .classed("inactive", false);
            link_elements.filter((o) => o.source.id === d.id || o.target.id === d.id)
                .classed("inactive", false);
        })
        .on("mouseleave", (m,d) => {
            node_elements.classed("inactive",false);
            link_elements.classed("inactive", false);
        });

    node_elements.append("circle")
        .attr("r", (d) => scale_radius(d.weight))
        .attr("fill", (d) => color(d.id));

    node_elements.append("text")
        .attr("class","label")
        .text((d) => d.id);

    d3.forceSimulation(data.nodes)
        .force("collide", d3.forceCollide().radius((d) => scale_radius(d.weight)*6))        
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink(data.links)
           .id((d) => d.id)
           .distance((d) => d.weight*.1)
           .strength((d) => d.weight*.1)
        )
        .on("tick", () => {
            node_elements.attr('transform', function(d){return `translate(${d.x},${d.y})`})
            link_elements
                .attr("x1", (d) => d.source.x)
                .attr("x2", (d) => d.target.x)
                .attr("y1", (d) => d.source.y)
                .attr("y2", (d) => d.target.y)
        }); 

    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 2])
        .on("zoom", ({transform}) => {
            main_group.attr("transform", transform);
        }));

}
