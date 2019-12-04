function buildMetadata(sample) {
  // Use `d3.json` to fetch the metadata for a sample
  var url = `/metadata/${sample}`;
  console.log(`The sample URL being used is: ${url}`);
  var response = d3.json(url).then(function(response) {
    // Use d3 to select the panel with id of `#sample-metadata`
    var samplePanel = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    samplePanel.html("");


    ********* Just need to add the below results into a table **********
    
    samplePanel.html(`${Object.keys(response)}`);
    for(i in response) {
      samplePanel.append("br").text(`${i}: ${response[i]}`);
      console.log(`KV Pair: ${i}: ${response[i]}`);
    };

    /*
    First attempt:
    samplePanel.html("<table></table>").classed("sampleTable");
    var sampleTable = d3.select(".sampleTable");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    response.forEach((element) => {
      var row = sampleTable.selectAll("td").data(element).enter().append("tr");
      row
        .append("td")
        .append("td")
    });
    */

    /*
    Example of metadata:
    "AGE": 24,
    "BBTYPE": "I",
    "ETHNICITY": "Caucasian",
    "GENDER": "F",
    "LOCATION": "Beaufort/NC",
    "WFREQ": 2,
    "sample": 940
    */

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
  });
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  var url = `/samples/${sample}`;
  console.log(`The sample URL being used is: ${url}`);
  var response = d3.json(url).then(function(response) {
    var otu_ids = response.otu_ids;
    var otu_labels = response.otu_labels;
    var sample_values = `response.${sample}`;

    console.log(response);

    // Replace the Labels' ';' with ', '
    for(var i = 0; i < otu_labels.length; i++)
    {
      otu_labels[i] = otu_labels[i].replace(';', ', ');
    }



    //Build a Bubble Chart using the sample data

    // Build the data object from the source DB
    var data = [{
      x: otu_ids,
      y: sample_values,
      mode: 'markers',
      text: otu_labels,
      marker: {
        size: sample_values,
        color: otu_ids
      }
    }]

    // Create the desired layout
    var layout = {
      title: 'Belly Button Data',
      showlegend: true,
      height: 600,
      width: 600
    };

    // Create the plot
    Plotly.newPlot("bubble", data, layout);



    // Build a Pie Chart

    // Combine the two arrays into a list of objects
    var list = [];
    for (var i = 0; i < sample_values.length; i++)
      list.push({'sample_values': sample_values[i], 'otu_ids': otu_ids[i]
    });

    // Sort the array by the objects' otu_ids
    list.sort(function(a, b) {
      return ((a.sample_values < b.sample_values) ? -1 : ((a.otu_ids == b.otu_ids) ? 0 : 1));
    });

    // Clear the arrays
    var sample_values = [];
    var otu_ids = [];
    // Split the object back out into two separate arrays, but only take the first ten records
    for (var i = 0; i < 10; i++) {
      sample_values[i] = list[i].sample_values;
      otu_ids[i] = list[i].otu_ids;
    }

    // Build the data object from the source DB
    var data = [{
      values: sample_values,
      labels: otu_ids,
      type: 'pie'
    }]

    // Create the desired layout
    var layout = {
      height: 400,
      width: 500
    };

    // Create the plot
    Plotly.newPlot('pie', data, layout);

    });

}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
    console.log(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
