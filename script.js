/* --- Dataset URLs --- */

// USA Albers County Geographic Data 
let countyURL = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json"

// NY Times Rolling Average Local Data Before [Dec 12, 2020]
let covidBeforeURL = "data/us_covid_data_before.csv"

// NY Times Rolling Average Local Data After [July 26, 2021]
let covidAfterURL = "data/us_covid_data_after.csv"

// CDC Vaccination Data [July 26, 2021]
let vaccinationURL = "data/vaccination_data.csv"

/* -------------------- */

// Initialize variables to hold respective data 
let countyData
let covidDataBefore
let vaccinationData
let covidDataAfter

// Select SVG canvas and initialize attributes
var canvas

//   .classed("svg-content", true);

// let canvas = d3.select("#canvas")

// Select tooltip
let tooltip = d3.select("#tooltip")

// Color Range
var color
var title
// color = d3.scaleQuantize([0, 200], d3.schemeReds[5])
covidCasesColorScale = d3.scaleThreshold([0, 15, 37, 70, 167, 179], d3.schemeReds[6])
covidDeathsColorScale = d3.scaleThreshold([0, 0.4, 1.2, 2.8, 5.5, 7.0], d3.schemeOranges[6])
vaccineGreenColorScale = d3.scaleQuantize([0, 60], d3.schemeGreens[4])
vaccineBlueColorScale = d3.scaleQuantize([0, 60], d3.schemeBlues[4])


/*
* drawMap(): displays COVID maps for cases, deaths, and vaccinations.
* @param bool displayCovidCases: if true, draw covid cases map, else draw vaccine map
* @param bool displayDefaultOption: if true, draw covid cases map OR 2 dose vaccine percentage map (depending on displayCovidCases value),
*                                   else, draw covid deaths map OR 1 dose vaccine percentage map (depending on displayCovidCases value)
* @param bool displayBeforeData: if true, draw covid maps for Dec 12, 2020, else draw covid maps for July 26, 2021
* @param string locationId: the name of the html id in which the map is to be placed
*/
let drawMap = (displayCovidCases, displayDefaultOption, displayBefore, locationId) => {

    // Clear previous content
    d3.select(locationId).select("svg").remove();

    // Select appropriate location to draw map
    canvas = d3.select(locationId)
    .append("svg")
    .attr("viewBox", "-80 -60 1100 800")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("height", "100%")
    .attr("width", "100%");

  
    // Draw county borders
    canvas.selectAll("path")
        .data(topojson.feature(countyData, countyData.objects.counties).features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath())
        .attr("class", "county")
        .attr("z-index", "2")
        .attr("fill", (countyDataItem) => {

            // Attain County FIPS code
            let countyId = countyDataItem["id"]
            let county
            let dataset

            /* Determine appropriate dataset:
            * 1)  vaccinationData
            * 2) covidDataBefore
            * 3) covidDataAfter
            */
            if(!displayCovidCases) {
                dataset = vaccinationData
            }
            else if (displayBefore) {
                dataset = covidDataBefore
            } 
            else {
                dataset = covidDataAfter
            }

            // Find matching FIPS Code in COVID dataset
            county = dataset.find((educationDataItem) => {
                return (educationDataItem["fips"] == countyId)
            })
            
            // Display County Array
            // console.log("County Array:")
            // console.log(county)
            // console.log("")

            // If true, display COVID map, else display vaccination map
            if(displayCovidCases) {

                // If true, display COVID Cases map, else display COVID deaths map
                if(displayDefaultOption) {

                    // Select fill color based on covid cases
                    try {
                        
                        color = covidCasesColorScale
                        title = "Average Cases Per 100k"
                        let cases_avg_per_100k = county["cases_avg_per_100k"]
                        return color(cases_avg_per_100k)


                        if(cases_avg_per_100k == 0) {
                            return "rgb(230, 230, 230)"
                        }
                        else if(cases_avg_per_100k <= 15) {
                            return "rgb(255, 127, 92)"
                        }
                        else if(cases_avg_per_100k <= 37) {
                            return "rgb(255, 79, 52)"
                        }
                        else if(cases_avg_per_100k <= 70) {
                            return "rgb(224, 28, 14)"
                        }
                        else if(cases_avg_per_100k <= 167) {
                            return "rgb(165, 0, 0)"
                        }
                        else {
                            return "rgb(102, 0, 0)"
                        }
                    }
                    catch {
                        return "rgb(230, 230, 230)"
                    }
                }

                // Else display COVID deaths map
                else {

                    // Select fill color based on covid deaths
                    try {
                        color = covidDeathsColorScale
                        title = "Average Deaths Per 100k"
                        let deaths_avg_per_100k = county["deaths_avg_per_100k"]
                        return color(deaths_avg_per_100k)

                        if(deaths_avg_per_100k == 0) {
                            return "rgb(230, 230, 230)"
                            
                        }
                        else if(deaths_avg_per_100k <= 0.4) {
                            return "rgb(255, 161, 49)"
                        }
                        else if(deaths_avg_per_100k <= 1.2) {
                            return "rgb(255, 126, 3)"
                        }
                        else if(deaths_avg_per_100k <= 2.8) {
                            return "rgb(215, 94, 0)"
                        }
                        else if(deaths_avg_per_100k <= 5.5) {
                            return "rgb(174, 65, 0)"
                        }
                        else {
                            return "rgb(134, 36, 0)"
                        }
                    }
                    catch {
                        return "rgb(230, 230, 230)"
                    }
                }
            }

            // Else, display vaccination map
            else {

                // if true, display percentage of 2 dose, else display percentage of 1 dose
                if(displayDefaultOption) {

                    try {
                        color = vaccineGreenColorScale
                        title = "Fully Vaccinated Percentage"
                        let fully_vaccinated_percentage = county["Series_Complete_Pop_Pct"]
                        return color(fully_vaccinated_percentage)
                    }
                    catch {
                        return "rgb(230, 230, 230)"
                    }
                }
                else {
                    try {
                        color = vaccineBlueColorScale
                        title = "One Dose Percentage"
                        let half_vaccinated_percentage = county["Administered_Dose1_Pop_Pct"]
                        return color(half_vaccinated_percentage)
                    }
                    catch {
                        return "rgb(230, 230, 230)"
                    }
                }
            }
        })

        .attr("stroke", "white")
        .attr("stroke-width", "0.75px")
        .attr("opacity", "0.85")
        .attr("z-index", "2")

        .on("mouseover", (countyDataItem) => {
            
            tooltip.transition().duration(0)
                .style("visibility", "visible")
            
            let countyId = countyDataItem["id"]
            let county
            let dataset

            /* Determine appropriate dataset:
            * 1)  vaccinationData
            * 2) covidDataBefore
            * 3) covidDataAfter
            */
            if(!displayCovidCases) {
                dataset = vaccinationData
            }
            else if (displayBefore) {
                dataset = covidDataBefore
            } 
            else {
                dataset = covidDataAfter
            }

            // Find matching FIPS Code in COVID dataset
            county = dataset.find((educationDataItem) => {
                return (educationDataItem["fips"] == countyId)
            })

            if(displayCovidCases) {
                // Add tooltip information
                tooltip.select("#tooltip-header").text(county["county"] + " County "/* + county["state"]*/)
                tooltip.select("#tooltip-date").text(county["date"])
                tooltip.select("#cases").text("Cases: " + county["cases"])
                tooltip.select("#cases-avg").text("Avg Cases: " + county["cases_avg"])
                tooltip.select("#cases-avg-per-100k").text("Avg Cases Per 100k: " + county["cases_avg_per_100k"])
                tooltip.select("#deaths").text("Deaths: " + county["deaths"])
                tooltip.select("#deaths-avg").text("Avg Deaths: " + county["deaths_avg"])
                tooltip.select("#deaths-avg-per-100k").text("Avg Deaths Per 100k: " + county["deaths_avg_per_100k"])
            }
            else {
                // Add tooltip information

                tooltip.select("#tooltip-header").text(county["Recip_County"])
                tooltip.select("#tooltip-date").text(county["date"])
                tooltip.select("#cases").text("Fully Vaccinated: " + county["Series_Complete_Pop_Pct"] + "%")
                tooltip.select("#cases-avg").text("# Fully Vaccinated: " + county["Series_Complete_Yes"])
                tooltip.select("#cases-avg-per-100k").text("Fully Vaccinated Ages 12+: " + county["Series_Complete_12PlusPop_Pct"]+ "%")

                tooltip.select("#deaths").text("One Dose: " + county["Administered_Dose1_Pop_Pct"] + "%")
                tooltip.select("#deaths-avg").text("# One Dose: " + county["Administered_Dose1_Recip"])
                tooltip.select("#deaths-avg-per-100k").text("One Dose Ages 12+: " + county["Administered_Dose1_Recip_12PlusPop_Pct"]+ "%")
            }
        })
        .on("mouseout", (countyDataItem) => {
            tooltip.transition().duration(0)
                .style("visibility", "hidden")
        })

        .on('mousemove', function() {
            d3.select('#tooltip').style('left', (d3.event.pageX+15) + 'px').style('top', (d3.event.pageY+15) + 'px')
            })

    // Draw state borders
    canvas.append("path")
        .datum(topojson.mesh(countyData, countyData.objects.states, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", "1.75px")
        .attr("stroke-linejoin", "round")
        .attr("z-index", "1")
        .attr("d", d3.geoPath())
    
    // Add legend
    canvas.append("g")
        .attr("transform", "translate(-80,-50)")
        .append(() => legend({color: color, title: title, width: 300, height: 55}));      

    // Add annonations
    var annotations = [
        {
          note: {
            label: "Basic settings with subject position(x,y) and a note offset(dx, dy)",
            title: "d3.annotationLabel"
          },
          x: 50,
          y: 150,
          dy: 137,
          dx: 162
        },{
          note: {
            label: "Added connector end 'arrow', note wrap '180', and note align 'left'",
            title: "d3.annotationLabel",
            wrap: 150,
            align: "left"
          },
          connector: {
            end: "dot" // 'dot' also available
          },
          x: 200,
          y: 200,
          dy: 137,
          dx: 162
        },{
          //below in makeAnnotations has type set to d3.annotationLabel
          //you can add this type value below to override that default
          type: d3.annotationCalloutCircle,
          note: {
            label: "States such as Indiana faced increasing cases due to relaxed restrictions on COVID-19 protols.",
            title: "Midwest Serge",
            wrap: 190
          },
          //settings for the subject, in this case the circle radius
          subject: {
            radius: 55
          },
          x: 670,
          y: 270,
          dy: 150,
          dx: 150
        },{
            //below in makeAnnotations has type set to d3.annotationLabel
            //you can add this type value below to override that default
            type: d3.annotationCalloutCircle,
            note: {
              label: "Populated cities such as LA, Chicago, and New York all suffered from skyrocketing COVID cases.",
              title: "Populated Cities",
              wrap: 190
            },
            //settings for the subject, in this case the circle radius
            subject: {
              radius: 55
            },
            x: 150,
            y: 360,
            dy: 55,
            dx: -55
          },{
            note: {
              label: "On Dec 12, 2020, the U.S was in full lockdown as health officials struggled to flatten the curve.",
              title: "Full Lockdown",
              wrap: 150
            },
            connector: {
              end: "dot"
              // type: "curve",
              //can also add a curve type, e.g. curve: d3.curveStep
              // points: [[100, -100],[150, -250]]
            },
            x: 425,
            y: 300,
            dy: -220,
            dx: 275
          }].map(function(d)
        { 
            d.color = "navy"; 
            return d
        })


    if(displayCovidCases) {

        if(displayBefore) {
            if(displayDefaultOption) {

                // Remove first 2 annotations
                annotations.splice(0, 2);
            }
            else {
                
                // Remove first 3 annotations
                annotations.splice(0, 3);

                // Annotated Circle
                annotations[0].note.label = "Iowa sees significant death rates compared to other states."
                annotations[0].note.title = "Death Rates"
                annotations[0].x = 545,
                annotations[0].y = 225,
                annotations[0].dy = -150,
                annotations[0].dx = 150

                // Dot annotation
                annotations[1].note.label = "Despite having a high survival rate, COVID-19 resulted in over half a million lives being lost."
                annotations[1].note.title = "The Cost"
                annotations[1].x = 342,
                annotations[1].y = 300,
                annotations[1].dy = 45,
                annotations[1].dx = -325
            }
        } 
        else {
            if(displayDefaultOption) {
                // Remove first annotation
                annotations.splice(0, 1);

                // Arrow annotation
                annotations[0].note.label = "Despite only 49% of Americans being fully vaccinated, COVID-19 cases have dropped dramatically due to the vaccine."
                annotations[0].note.title = "A lot better"
                annotations[0].x = 320,
                annotations[0].y = 200,
                annotations[0].dy = 125,
                annotations[0].dx = -400

                // Remove second annotation
                annotations.splice(1, 1);

                // Annotated Circle
                annotations[1].note.label = "Missouri, Alabama, and Louisana all had low vaccination rates. The result: an increase in COVID-19 cases."
                annotations[1].note.title = "No Coincidence"
                annotations[1].subject.radius = 70
                annotations[1].x = 570,
                annotations[1].y = 325,
                annotations[1].dy = 85,
                annotations[1].dx = 260

                // Arrow annotation
                annotations[2].connector.end = "arrow"
                annotations[2].note.label = "Despite having decent vaccination rates, Florida sees an uprise in cases due to relaxing protocols."
                annotations[2].note.title = "Relaxing Protocols"
                annotations[2].x = 775,
                annotations[2].y = 475,
                annotations[2].dy = 75,
                annotations[2].dx = -150
            }
            else {
                // Remove first 3 annotations
                annotations.splice(0, 3);

                // Annotated Circle
                annotations[0].note.label = "Iowa death rates have dropped drammatically since the vaccine."
                annotations[0].note.title = "Iowa Now"
                annotations[0].x = 545,
                annotations[0].y = 225,
                annotations[0].dy = -150,
                annotations[0].dx = 150

                // Dot annotation
                annotations[1].note.label = "Although the vaccine does not prevent getting COVID-19, it does diminish hospitalizations and death rates across the nation."
                annotations[1].note.title = "Vaccine Success"
                annotations[1].x = 342,
                annotations[1].y = 300,
                annotations[1].dy = 45,
                annotations[1].dx = -350
}
        }
    }
    else {
        if(displayDefaultOption) {
            
            // Remove first annotation
            annotations.splice(0, 1);

            // Arrow annotation
            annotations[0].note.label = "At this point, approximately 49% of Americans are fully vaccinated. More vaccinations are required in order to truly overcome the pandemic."
            annotations[0].note.title = "Need More Vaccines"
            annotations[0].x = 320,
            annotations[0].y = 200,
            annotations[0].dy = 75,
            annotations[0].dx = -400

            // Remove second annotation
            annotations.splice(1, 1);

            // Annotated Circle
            annotations[1].note.label = "Missouri, Alabama, and Louisana all have low vaccination rates. This effect will be evident in the next slide."
            annotations[1].note.title = "Low Vaccination %"
            annotations[1].subject.radius = 70
            annotations[1].x = 570,
            annotations[1].y = 325,
            annotations[1].dy = 85,
            annotations[1].dx = 260

            // Arrow annotation
            annotations[2].connector.end = "arrow"
            annotations[2].note.label = "Ignore Texas, Georgia, Virginia, and West Virginia as the CDC received insufficent/inaccurate data from these states."
            annotations[2].note.title = "Insufficient Data"
            annotations[2].x = 450,
            annotations[2].y = 475,
            annotations[2].dy = 75,
            annotations[2].dx = 150

        }
        else {

            // Remove first annotation
            annotations.splice(0, 1);


            // Dot annotation
            annotations[0].note.label = "Many Americans have received a dosage of the vaccine. If these Americans get their next shot, the US will edge closer to becoming fully vaccinated."
            annotations[0].note.title = "Just One More"
            annotations[0].x = 625,
            annotations[0].y = 250,
            annotations[0].dy = 175,
            annotations[0].dx = 225


            annotations.splice(1, 2);

            // Arrow annotation
            annotations[1].connector.end = "arrow"
            annotations[1].note.label = "Ignore Texas, Nebraska, Georgia, and Virginia as the CDC received insufficent/inaccurate data from these states."
            annotations[1].note.title = "Insufficient Data"
            annotations[1].x = 450,
            annotations[1].y = 475,
            annotations[1].dy = 75,
            annotations[1].dx = 150
        }

        // Alter annotation color to white
        annotations.map(function(d) {
            d.color = "white";
            return d;
        })
    }

    var makeAnnotations = d3.annotation()
        .type(d3.annotationLabel)
        .annotations(annotations)


    d3.select(locationId + " svg")
        .append("g")
        .attr("class", "annotation-group")
        .style("stroke-width", "2.5px")
        .attr("class", "animate__animated animate__fadeInRight animate__delay-1s")
        .call(makeAnnotations)

}

/* 
    Load External Data:
    1) County Geography Data
    2) US COVID-19 County 'Before' Data [Dec 12, 2020]
    3) US COVID-19 Vaccination Data [July 26, 2021]
    4) US COVID-19 County 'After' Data [July 26, 2021]
*/
d3.json(countyURL).then(
    (data, error) => {
        if(error) {
            console.log(log)
        }
        else {
            countyData = data

            // console.log("County Data:")
            // console.log(countyData)
            // console.log("")

            d3.csv(covidBeforeURL).then(
                (data, error) => {
                    if(error) {
                        console.log(error)
                    }
                    else {
                        covidDataBefore = data

                        // console.log("COVID Data Before:")
                        // console.log(covidDataBefore)
                        // console.log("")

                        d3.csv(vaccinationURL).then(
                            (data, error) => {
                                if(error) {
                                    console.log(error)
                                }
                                else {
                                    vaccinationData = data

                                    // console.log("Vaccination Data:")
                                    // console.log(vaccinationData)
                                    // console.log("")

                                    d3.csv(covidAfterURL).then(
                                        (data, error) => {
                                            if(error) {
                                                console.log(error)
                                            }
                                            else {
                                                covidDataAfter = data

                                                // console.log("COVID Data After:")
                                                // console.log(covidDataAfter)
                                                // console.log("")

                                                // Draw Choropleth Map:
                                                // displayCovidCases?
                                                // displayCases/Fully Vaccinated?
                                                // displayBefore? 

                                                // Draw Initial Maps at respective locations
                                                drawMap(true, true, true, "#slide1")
                                                drawMap(false, true, false, "#slide2")
                                                drawMap(true, true, false, "#slide3")
                                            }
                                        }
                                    )
                                }
                            }
                        )
                    }
                }
            )
        }
    }
)


/* Legend Library 
* Source: https://observablehq.com/@d3/color-legend
*/
function legend({
  color,
  title,
  tickSize = 6,
  width = 320, 
  height = 44 + tickSize,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 0,
  ticks = width / 64,
  tickFormat,
  tickValues
} = {}) {

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("overflow", "visible")
      .style("display", "block");

  let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;

  // Continuous
  if (color.interpolate) {
    const n = Math.min(color.domain().length, color.range().length);

    x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
  }

  // Sequential
  else if (color.interpolator) {
    x = Object.assign(color.copy()
        .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
        {range() { return [marginLeft, width - marginRight]; }});

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.interpolator()).toDataURL());

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
      }
      if (typeof tickFormat !== "function") {
        tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
      }
    }
  }

  // Threshold
  else if (color.invertExtent) {
    const thresholds
        = color.thresholds ? color.thresholds() // scaleQuantize
        : color.quantiles ? color.quantiles() // scaleQuantile
        : color.domain(); // scaleThreshold

    const thresholdFormat
        = tickFormat === undefined ? d => d
        : typeof tickFormat === "string" ? d3.format(tickFormat)
        : tickFormat;

    x = d3.scaleLinear()
        .domain([-1, color.range().length - 1])
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.range())
      .join("rect")
        .attr("x", (d, i) => x(i - 1))
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", d => d);

    tickValues = d3.range(thresholds.length);
    tickFormat = i => thresholdFormat(thresholds[i], i);
  }

  // Ordinal
  else {
    x = d3.scaleBand()
        .domain(color.domain())
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.domain())
      .join("rect")
        .attr("x", x)
        .attr("y", marginTop)
        .attr("width", Math.max(0, x.bandwidth() - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", color);

    tickAdjust = () => {};
  }

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues))
      .call(tickAdjust)
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("class", "title")
        .text(title));

  return svg.node();
}

function swatches({
  color,
  columns = null,
  format = x => x,
  swatchSize = 15,
  swatchWidth = swatchSize,
  swatchHeight = swatchSize,
  marginLeft = 0
}) {
  const id = DOM.uid().id;

  if (columns !== null) return html`<div style="display: flex; align-items: center; margin-left: ${+marginLeft}px; min-height: 33px; font: 10px sans-serif;">
  <style>

.${id}-item {
  break-inside: avoid;
  display: flex;
  align-items: center;
  padding-bottom: 1px;
}

.${id}-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - ${+swatchWidth}px - 0.5em);
}

.${id}-swatch {
  width: ${+swatchWidth}px;
  height: ${+swatchHeight}px;
  margin: 0 0.5em 0 0;
}

  </style>
  <div style="width: 100%; columns: ${columns};">${color.domain().map(value => {
    const label = format(value);
    return html`<div class="${id}-item">
      <div class="${id}-swatch" style="background:${color(value)};"></div>
      <div class="${id}-label" title="${label.replace(/["&]/g, entity)}">${document.createTextNode(label)}</div>
    </div>`;
  })}
  </div>
</div>`;

  return html`<div style="display: flex; align-items: center; min-height: 33px; margin-left: ${+marginLeft}px; font: 10px sans-serif;">
  <style>

.${id} {
  display: inline-flex;
  align-items: center;
  margin-right: 1em;
}

.${id}::before {
  content: "";
  width: ${+swatchWidth}px;
  height: ${+swatchHeight}px;
  margin-right: 0.5em;
  background: var(--color);
}

  </style>
  <div>${color.domain().map(value => html`<span class="${id}" style="--color: ${color(value)}">${document.createTextNode(format(value))}</span>`)}</div>`;
}

function entity(character) {
  return `&#${character.charCodeAt(0).toString()};`;
}

function ramp(color, n = 256) {
  const canvas = DOM.canvas(n, 1);
  const context = canvas.getContext("2d");
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 1, 1);
  }
  return canvas;
}
/* END */