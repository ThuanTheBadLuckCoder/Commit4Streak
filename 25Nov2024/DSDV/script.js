const width = 800;
const height = 600;
const margin = {top: 20, right: 20, bottom: 20, left: 20};

// Create the SVG element to draw the map
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Create the tooltip that will appear when hovering over provinces
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

// Create the projection and path generator for the map
const projection = d3.geoMercator()
    .scale(1500) // Reduced scale value to make the map smaller
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Load the map data and province data
Promise.all([ 
    d3.json("vn-provinces.json"),
    d3.csv("vn-provinces-data.csv")
]).then(([geoData, csvData]) => {
    // Create a map of province data for easy lookup by province code (ma)
    const dataMap = new Map(csvData.map(d => {
        const area = +d.area;
        const population = +d.population;
        const cases = casesData[d.province] || 0;  // Default value for cases if not available
        return [d.ma, { area, population, cases }];
    }));
    
    // Calculate the center of the map for proper translation
    const center = d3.geoCentroid(geoData);
    projection.center(center);

    // Create a color scale for the provinces based on area size
    const colorScale = d3.scaleSequential()
        .domain([0, d3.max(csvData, d => +d.area)])
        .interpolator(d3.interpolateBlues);

    // Draw the provinces on the map using the path generator
    svg.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("class", "province")
        .attr("d", path)
        .style("fill", d => {
            const value = dataMap.get(d.properties.Ma);
            return value ? colorScale(value.area) : "#ccc"; // Default color if no data available
        })
        .on("mouseover", function(event, d) {
            // Display the tooltip with additional population and density info
            const provinceData = dataMap.get(d.properties.Ma);
            const density = provinceData ? (provinceData.population / provinceData.area).toFixed(2) : "N/A";
            tooltip
                .style("display", "block")
                .html(`
                    <strong>${d.properties.Ten}</strong><br/>
                    Cases: ${provinceData ? provinceData.cases : "N/A"}
                `);
        })
        .on("mousemove", function(event) {
            // Position the tooltip relative to the mouse cursor
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function() {
            // Hide the tooltip when mouse moves away from the province
            tooltip.style("display", "none");
        })
        .on("click", function(event, d) {
            // Get bounds of the clicked province for zooming
            const bounds = path.bounds(d);
            const dx = bounds[1][0] - bounds[0][0];
            const dy = bounds[1][1] - bounds[0][1];
            const x = (bounds[0][0] + bounds[1][0]) / 2;
            const y = (bounds[0][1] + bounds[1][1]) / 2;
            const scale = 0.9 / Math.max(dx / width, dy / height);
            const translate = [width / 2 - scale * x, height / 2 - scale * y];

            // Animate zoom into the province
            svg.selectAll("path")
                .transition()
                .duration(750)
                .attr("transform", `translate(${translate}) scale(${scale})`);

            // Store the current zoom state and listen for click events outside
            svg.on("click", function(event) {
                const [x, y] = d3.pointer(event);
                // Check if the click is outside any province (not on a province path)
                if (!event.target.classList.contains('province')) {
                    zoomOut(); // Perform zoom out if click is outside a province
                }
            });
        });

    // Function to zoom out when clicking outside a province
    function zoomOut() {
        svg.selectAll("path")
            .transition()
            .duration(750)
            .attr("transform", "translate(0, 0) scale(1)"); // Reset to initial zoom level
    }

});

        const casesData = {
            "Hà Nội": 1646923,
            "Hồ Chí Minh": 629018,
            "Hải Phòng": 537527,
            "Nghệ An": 502049,
            "Bắc Giang": 391440,
            "Vĩnh Phúc": 375686,
            "Hải Dương": 372391,
            "Quảng Ninh": 356404,
            "Bắc Ninh": 353869,
            "Thái Nguyên": 347519,
            "Phú Thọ": 331520,
            "Bình Dương": 325667,
            "Nam Định": 301101,
            "Thái Bình": 296789,
            "Hưng Yên": 244028,
            "Hoà Bình": 239941,
            "Lào Cai": 188846,
            "Thanh Hóa": 178595,
            "Đắk Lắk": 172439,
            "Lạng Sơn": 160752,
            "Yên Bái": 158046,
            "Sơn La": 153602,
            "Cà Mau": 147734,
            "Tuyên Quang": 147582,
            "Tây Ninh": 140444,
            "Bình Định": 139890,
            "Quảng Bình": 129648,
            "Hà Giang": 122610,
            "Khánh Hòa": 122036,
            "Bình Phước": 120003,
            "Bà Rịa - Vũng Tàu": 110822,
            "Đà Nẵng": 108712,
            "Đồng Nai": 107518,
            "Ninh Bình": 104800,
            "Vĩnh Long": 103505,
            "Bến Tre": 99799,
            "Cao Bằng": 99051,
            "Lâm Đồng": 98238,
            "Hà Nam": 91467,
            "Điện Biên": 90757,
            "Quảng Trị": 86293,
            "Bắc Kạn": 77048,
            "Cần Thơ": 76925,
            "Lai Châu": 75519,
            "Trà Vinh": 75174,
            "Đắk Nông": 73427,
            "Gia Lai": 70961,
            "Hà Tĩnh": 55279,
            "Bình Thuận": 54300,
            "Đồng Tháp": 51614,
            "Quảng Ngãi": 50513,
            "Long An": 50297,
            "Quảng Nam": 49556,
            "Thừa Thiên Huế": 48186,
            "Bạc Liêu": 46949,
            "Phú Yên": 44481,
            "Kiên Giang": 43659,
            "An Giang": 43297,
            "Tiền Giang": 39902,
            "Sóc Trăng": 34457, 
            "Kon Tum": 26342,
            "Hậu Giang": 17900,
            "Ninh Thuận": 9001
        };
