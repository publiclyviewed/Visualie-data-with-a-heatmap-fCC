fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
    .then(response => response.json())
    .then(data => {
        const dataset = data.monthlyVariance;
        const baseTemperature = data.baseTemperature;

        const width = 1200;
        const height = 500;
        const padding = 100;

       
        const svg = d3.select("#heatmap-container")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        
        const xScale = d3.scaleLinear()
            .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)])
            .range([padding, width - padding]);

        const yScale = d3.scaleBand()
            .domain(d3.range(1, 13))
            .range([padding, height - padding])
            .padding(0.05);

        const colorScale = d3.scaleSequential(d3.interpolateRdBu)
            .domain(d3.extent(dataset, d => d.variance).reverse());

        
        const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft(yScale).tickFormat(d => {
            const date = new Date(0);
            date.setUTCMonth(d - 1);
            return d3.timeFormat("%B")(date);
        });

        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", `translate(0, ${height - padding})`)
            .call(xAxis);

        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", `translate(${padding}, 0)`)
            .call(yAxis);

        
        svg.selectAll(".cell")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr("x", d => xScale(d.year))
            .attr("y", d => yScale(d.month))
            .attr("width", (width - 2 * padding) / (d3.max(dataset, d => d.year) - d3.min(dataset, d => d.year)))
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(d.variance))
            .attr("data-year", d => d.year)
            .attr("data-month", d => d.month - 1)
            .attr("data-temp", d => baseTemperature + d.variance)
            .on("mouseover", function (event, d) {
                const tooltip = d3.select("#tooltip");
                tooltip.attr("data-year", d.year) 
                    .style("display", "block")
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`)
                    .html(`
                        Year: ${d.year}<br>
                        Month: ${d3.timeFormat("%B")(new Date(0, d.month - 1))}<br>
                        Temperature: ${(baseTemperature + d.variance).toFixed(2)}°C<br>
                        Variance: ${d.variance.toFixed(2)}°C
                    `);
            })
            .on("mouseout", function () {
                d3.select("#tooltip").style("display", "none");
            });

        
        const legendWidth = 400;
        const legendHeight = 20;

        const legendSvg = d3.select("#legend")
            .append("svg")
            .attr("width", legendWidth)
            .attr("height", legendHeight + 30);

        const legendScale = d3.scaleLinear()
            .domain(d3.extent(dataset, d => d.variance))
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale).ticks(5).tickFormat(d => `${(baseTemperature + d).toFixed(2)}°C`);

        legendSvg.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis);

        const legendColors = d3.range(
            d3.min(dataset, d => d.variance),
            d3.max(dataset, d => d.variance),
            (d3.max(dataset, d => d.variance) - d3.min(dataset, d => d.variance)) / 10
        );

        legendSvg.selectAll("rect")
            .data(legendColors)
            .enter()
            .append("rect")
            .attr("x", d => legendScale(d))
            .attr("y", 0)
            .attr("width", legendWidth / legendColors.length)
            .attr("height", legendHeight)
            .attr("fill", d => colorScale(d));
    });
