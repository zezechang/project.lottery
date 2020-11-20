// https://observablehq.com/@richdayandnight/one-chart-a-day-zoom-in-to-per-country-in-the-world-map@394
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["countries-110m.json",new URL("./files/5b7bb44872469fc6f9f4256d902fba909728666ad0d5263654ce95f4470ec90527fdc39a1d1b70490f457d65c31795d651a4afc0745f72351916e715fddc7352",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# One chart a day - Zoom in to per country in the world map

Objectives:
1. Zoom in to per country in the world map
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md `## Load files`
)});
  main.variable(observer("topojson_countries")).define("topojson_countries", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("countries-110m.json").json()
)});
  main.variable(observer("countries_objects")).define("countries_objects", ["topojson","topojson_countries"], function(topojson,topojson_countries){return(
topojson.feature(topojson_countries, topojson_countries.objects.countries)
)});
  main.variable(observer("countries")).define("countries", ["topojson","topojson_countries"], function(topojson,topojson_countries){return(
topojson.feature(topojson_countries, topojson_countries.objects.countries).features
)});
  main.variable(observer("mesh_countries")).define("mesh_countries", ["topojson","topojson_countries"], function(topojson,topojson_countries){return(
topojson.mesh(topojson_countries, topojson_countries.objects.countries, function(a, b) { return a !== b; })
)});
  main.variable(observer()).define(["md"], function(md){return(
md `## Zoom to countries`
)});
  main.variable(observer("globe")).define("globe", ["d3","dimensions","colors","countries_objects","countries","tooltip","mesh_countries"], function(d3,dimensions,colors,countries_objects,countries,tooltip,mesh_countries)
{ 
   const svg = d3.create("svg")
      .attr("viewBox", [0, 0, dimensions.width, dimensions.height])
      .attr("class", "globe")
      .on("click", reset);
  
  svg.append("rect")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)
    .attr("fill", colors.background_color);
  var projectionMercator = d3.geoEquirectangular()
                            .translate([dimensions.width / 2, dimensions.height / 2])
                            .rotate([0, 0])
                            .fitSize([dimensions.width, dimensions.height], countries_objects);
                             // note: use topojson objects (w/ type: FeatureCollection) to fitsize
  
  var geoMercator = d3.geoMercator()
                      .center([0, 0])
                      .fitSize([dimensions.width, dimensions.height], countries);
  var path = d3.geoPath()
                .projection(projectionMercator);
  
  const zoom = d3.zoom()
                  .scaleExtent([1, 10])
                  .on("zoom", zoomed);

  var g = svg.append("g");

  g.selectAll("path")
    .data(countries)
    .enter().append("path")
    .attr("d", path)
    .style("fill", colors.inactive_color)
    .attr("class", "country")
    .on("click", clicked)
    .on('mouseenter', function(d) { 
      d3.select(this)
        .transition()
        .delay(100)
        .style("fill", colors.active_color);
      tooltip.html(
          `<div><strong> ${d.properties.name}</strong></div>`)
           .style('visibility', 'visible');
    })
    .on('mouseleave', function(d) { 
      d3.select(this)
        .transition()
        .delay(100)
        .style("fill", colors.inactive_color);
      tooltip.html(``).style('visibility', 'hidden');
    })     
   .on('mousemove', function () {
          tooltip
            .style('top', d3.event.pageY - 10 + 'px')
            .style('left', d3.event.pageX + 10 + 'px');
    });
  
   g.append("path")
      .data(mesh_countries)
      .attr("class", "mesh")
      .attr('stroke-linejoin', 'round')
      .style("stroke", colors.stroke_color)
      .style("stroke-width", "1px")
      .attr("d", path);

  svg.call(zoom);
  function clicked(d) {
    const [[x0, y0], [x1, y1]] = path.bounds(d);
    d3.event.stopPropagation();

    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(dimensions.width / 2, dimensions.height / 2)
        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / dimensions.width, (y1 - y0) / dimensions.height)))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
      d3.mouse(svg.node())
    );
  }
  
  function reset() {
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity,
      d3.zoomTransform(svg.node()).invert([dimensions.width / 2, dimensions.height / 2])
    );
  }
  
  function zoomed() {
    const {transform} = d3.event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
  }
  
  return svg.node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md `## Conclusion

Did I reach my objective/s?
1. ✔️ 1. Zoom in to per country in the world map

Some things to note:
- TIL: learned about topojson.mesh 
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md `---
## Appendix`
)});
  main.variable(observer()).define(["md"], function(md){return(
md `### Initialize constants`
)});
  main.variable(observer("dimensions")).define("dimensions", function(){return(
{
  width: 1000,
  height: 700,
  margin: 50,
}
)});
  main.variable(observer("colors")).define("colors", function(){return(
{
  stroke_color: "white",
  active_color: "#2c4566",
  inactive_color: "#9daabd",
  background_color: "#e4e9f0",
  tooltip_color: "#21334f",
  tooltip_background: "rgba(237, 244, 255, 0.7)"
}
)});
  main.variable(observer("tooltip")).define("tooltip", ["d3","colors"], function(d3,colors){return(
d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('visibility', 'hidden')
    .style('padding', '10px')
    .style('background-color', colors.tooltip_background)
    .style('-moz-border-radius', '10px')
    .style('-webkit-box-shadow', '2px 2px 5px rgba(0, 0, 0, 0.2)')
    .style('-moz-box-shadow', '2px 2px 5px rgba(0, 0, 0, 0.2)')
    .style('box-shadow', '2px 2px 5px rgba(0, 0, 0, 0.2)')
    .style('backdrop-filter', 'blur(2px)')
    .style('color', colors.tooltip_color) 
    .style('font-family','sans-serif')
    .text('a simple tooltip')
)});
  main.variable(observer()).define(["md"], function(md){return(
md `### Load libraries`
)});
  main.variable(observer("topojson")).define("topojson", ["require"], function(require){return(
require("topojson@3")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@v5")
)});
  return main;
}
