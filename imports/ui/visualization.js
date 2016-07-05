/* global $ */
/* global d3 */
import Tooltip from './Tooltip.js';

export default function Network() {
  //old width = 960, height = 800
  
  var showNames = false;
  
  const width = 960;
  const height = 700;
  
  const charge = -1000;
  const linkDistance = 75;
  const radius = 15;
  const friction = 0.8;
  
  // allData will store the unfiltered data
  var allData = [];
  var curLinksData = [];
  var curNodesData = [];

  // these will hold the svg groups for
  // accessing the nodes and links display
  var nodesG = null;
  var linksG = null;
  var textG = null;
  
  // these will point to the circles and lines
  // of the nodes and links
  var node = null;
  var link = null;
  var text = null;
  
  //tooltip object used to display node info
  var tooltip = Tooltip("vis-tooltip", 230);
  
  var done = false;

  // our force directed layout
  var force = d3.layout.force();
  // color function used to color nodes
  var nodeColors = d3.scale.ordinal()
                  .domain(["w", "r", "g"])
                  .range(["#b2b2b1", "#ff0000", "#00cc00"]);

  function network(selection, data) {
    // format data
    allData = setupData(data);
    
    // create svg container and group elements
    var vis = d3.select(selection).append("svg")
                .attr("width", width)
                .attr("height", height);
    linksG = vis.append("g").attr("id", "links");
    nodesG = vis.append("g").attr("id", "nodes");
    textG = vis.append("g").attr("id", "text");
    
    // setup the size of the force environment
    force.size([width, height]);
    
    force.friction([friction]);
    
    // configure layout of the force environment
    force.on("tick", forceTick)
        .charge(charge)
        .linkDistance(linkDistance);
        
    force.on("end", function() {
      done = true;
    });
        
    // perform rendering and start force layout
    update();
  }
  
  function update() {
    curNodesData = allData.nodes;
    curLinksData = allData.links;
    
    // reset nodes in force layout
    force.nodes(curNodesData);
    updateNodes();
    
    // reset links in force layout
    force.links(curLinksData);
    updateLinks();
    
    done = false;
    force.start();
  }
  
  // enter/exit display for nodes
  function updateNodes() {
    node = nodesG.selectAll("circle.node")
          .data(curNodesData, function(d) { return d.id; });
          
    node.enter().append("circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return d.radius + d.radiusdelta; })
        .style("fill", function(d) { return nodeColors(d.color); })
        .style("stroke", function(d) { return strokeFor(d); })
        .style("stoke-width", 0)
        .text(function(d) { return d.name; });
        
    text = textG.selectAll("text")
          .data(curNodesData, function(d) { return d.id })
          .text(function(d) { return showNames ? d.name : d.id; });
          
    text.enter().append("text")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .text(function(d) { return showNames ? d.name : d.id; });
        
    node.on("mouseover", showDetails)
        .on("mouseout", hideDetails);
    
    node.exit().remove();    
  }
  
  // enter/exit display for links
  function updateLinks() {
    link = linksG.selectAll("link.link")
          .data(curLinksData);
    
    link.enter().append("line")
        .attr("class", "link")
        .attr("stroke", "#ddd")
        .attr("stroke-opacity", 1.0)
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
        
    link.exit().remove();
  }
  
  // tick function for force directed layout
  function forceTick(e) {
    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
        
    text.attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; });
        
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  }
  
  // Helper function that returns stroke color for
  // particular node.
  function strokeFor(d) {
    return d3.rgb(nodeColors(d.color)).toString();
  }
  
  // called once to clean up raw data and switch links to
  // point to node instances
  // Returns modified data
  function setupData(data) {
    data.nodes.forEach(function(n) {
      // set initial x/y to values within the width/height
      // of the visualization; chosen randomly
      n.x = Math.floor(Math.random()*width);
      n.y = Math.floor(Math.random()*(height-50) + 25);
      // add radius to the node
      n.radius = radius;
    });
      
    // id's -> node objects
    var nodesMap = mapNodes(data.nodes);
    
    // switch links to point to node objects instead of id's
    data.links.forEach(function(l) {
      l.source = nodesMap.get(l.source);
      l.target = nodesMap.get(l.target);
    });
  
    return data;
  }
  
  // Helper function to map node id's to node objects.
  // Returns d3.map of ids -> nodes
  function mapNodes(nodes) {
    var nodesMap = d3.map();
    nodes.forEach(function(n) {
      nodesMap.set(n.id, n);
    });
    return nodesMap;
  }
  
  // Mouseover tooltip function
  function showDetails(d, i) {
    if (done) {
      var content = "<p class=\"main\">" + d.name + "</span></p>";
      content += "<hr class=\"tooltip-hr\">";
      content += "<p class=\"info\">ID: " + d.id + "</p>";
      content += "<p class=\"info\">Preference: " + d.preference + "</p>";
      content += "<p class=\"info\">Communication: " + d.communication + "</p>";
      content += "<p class=\"info\">Message: " + d.message + "</p>";
      tooltip.showTooltip(content,d3.event);
      
      //highlight the node being moused over
      d3.select(this).style("stroke","black")
        .style("stroke-width", 3.0);
    }
  }
  
  // Mouseout function
  function hideDetails(d, i) {
    if (done) {
      tooltip.hideTooltip();
    
      node.style("stroke", function(d) { return strokeFor(d); })
          .style("stroke-width", 0);
    }
  }
  
  //function to give the network a new dataset, representing a new session
  network.updateData = function(data) {
    allData = setupData(data);
    link.remove();
    node.remove();
    update();
  }
  
  //function to give the network a new state, representing a single action taken
  //returns true if network was able to successfully update, false otherwise, due to ongoing simulation
  network.updateState = function(data) {
    if (done) {
      allData = setupData(data);
      curNodesData = allData.nodes;
      curLinksData = allData.links;
      
      node = nodesG.selectAll("circle.node")
            .data(curNodesData, function(d) { return d.id; });
            
      node.style("fill", function(d) { return nodeColors(d.color); })
          .attr("r", function(d) { return radius + d.radiusdelta; });
      
      return true;
    } else {
      return false;
    }
  };
  
  network.setShowNames = function(names) {
    showNames = names;
    console.log('showNames: ' + showNames);
    updateNodes();
  };
  
  return network;
}