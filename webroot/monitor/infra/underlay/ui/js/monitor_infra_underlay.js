/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 *
 * Underlay Overlay Visualisation Page
 */

var underlayRenderer = new underlayRenderer();
var PROUTER_DBL_CLICK =  'config_net_vn';
var PROUTER = 'physical-router';
var VROUTER = 'virtual-router';
var VIRTUALMACHINE = 'virtual-machine';
var LEVEL_1_DIMENSION = {width: 0, height:0};
var LEVEL_2_DIMENSION = {width: 0, height:0};
var ZOOMED_OUT = 0;

function underlayRenderer() {
    this.load = function(obj) {
        this.configTemplate = Handlebars.compile($("#visualization-template").html());
        Handlebars.registerPartial("deviceSummary", $("#device-summary-template").html());
        $("#content-container").html('');
        $("#content-container").html(this.configTemplate);
        currTab = 'mon_infra_underlay';
        this.model = new underlayModel({nodes:[], links:[]});
        this.view  = new underlayView(this.model);
        this.controller = new underlayController(this.model, this.view);
        this.controller.getModelData();
        var instanceDS = new SingleDataSource('instDS');
        instanceDS.getDataSourceObj();
    }

    this.getModel = function() {
        return this.model;
    }

    this.getView = function() {
        return this.view;
    }

    this.getController = function() {
        return this.controller;
    }

    this.destroy = function() {
        this.getModel().destroy();
        this.getView().destroy();
        this.getController().destroy();
    }
}

var underlayModel = function(data) {
    this.nodes             = [];
    this.links             = [];
    this.connectedElements = [];
    this.tors              = [];
    this.spines            = [];
    this.cores             = [];
    this.vrouters          = [];
    this.vms               = [];
    this.vns               = [];
    this.elementMap        = {
        nodes: {},
        links: {}
    };
    if(data) {
        this.setNodes(data.nodes);
        this.setLinks(data.links);
        this.updateChassisType(data.nodes);
        this.categorizeNodes(data.nodes);
    } else {
        this.setNodes([]);
        this.setLinks([]);
    }
}
underlayModel.prototype.updateChassisType = function() {
    var nodes = this.getNodes();
    for(var i=0; i<nodes.length; i++) {
        if(nodes[i].chassis_type === "-") {
            nodes[i].chassis_type = nodes[i].node_type;
        }
    }
    this.setNodes(nodes);
}

underlayModel.prototype.getNodes = function() {
    return this.nodes;
}

underlayModel.prototype.getLinks = function() {
    return this.links;
}

underlayModel.prototype.getConnectedElements = function() {
    return this.connectedElements;
}

underlayModel.prototype.getElementMap = function() {
    return this.elementMap;
}

underlayModel.prototype.getTors = function() {
    return this.tors;
}

underlayModel.prototype.getSpines = function() {
    return this.spines;
}

underlayModel.prototype.getCores = function() {
    return this.cores;
}

underlayModel.prototype.getVrouters = function() {
    return this.vrouters;
}

underlayModel.prototype.getVMs = function() {
    return this.vms;
}

underlayModel.prototype.getVNs = function() {
    return this.vns;
}

underlayModel.prototype.clearOtherNodes = function(nodeType) {
    var nodes = this.getNodes();
    var links = this.getLinks();
    var elements = this.getConnectedElements();
    var elementMap = this.getElementMap();

    for(var i=0; i<nodes.length; i++) {
        if(nodes[i].chassis_type === nodeType) {
            $.each(links, function(linkKey, linkValue) {
                if(linkValue.endpoints.indexOf(nodes[i].name) !== -1) {
                    links.splice(linkKey, 1);
                }
            });

            nodes.splice(i,1);

        }
    }
}

underlayModel.prototype.setTors = function(tors) {
    if(null !== tors && typeof tors !== "undefined" &&
        tors.length > 0) {
        this.tors = tors;
    } else {
        this.tors = [];
    }
}

underlayModel.prototype.setSpines = function(spns) {
    if(null !== spns && typeof spns !== "undefined" &&
        spns.length > 0) {
        this.spines = spns;
    } else {
        this.spines = [];
    }
}

underlayModel.prototype.setCores = function(crs) {
    if(null !== crs && typeof crs !== "undefined" &&
        crs.length > 0) {
        this.cores = crs;
    } else {
        this.cores = [];
    }
}

underlayModel.prototype.setVrouters = function(vrs) {
    if(null !== vrs && typeof vrs !== "undefined" &&
        vrs.length > 0) {
        this.vrouters = vrs;
    } else {
        this.vrouters = [];
    }
}

underlayModel.prototype.setVMs = function(vms) {
    if(null !== vms && typeof vms !== "undefined" &&
        vms.length > 0) {
        this.vms = vms;
    } else {
        this.vms = [];
    }
}

underlayModel.prototype.setVNs = function(vns) {
    if(null !== vns && typeof vns !== "undefined" &&
        vns.length > 0) {
        this.vns = vns;
    } else {
        this.vns = [];
    }
}
underlayModel.prototype.setConnectedElements = function(cEls) {
    if(null !== cEls && typeof cEls !== "undefined" &&
        cEls.length > 0) {
        this.connectedElements = cEls;
    } else {
        this.connectedElements = [];
    }
}

underlayModel.prototype.setElementMap = function(elMap) {
    if(null !== elMap && typeof elMap !== "undefined") {
        this.elementMap = elMap;
    } else {
        this.elementMap = [];
    }
}

underlayModel.prototype.setNodes = function(nodes) {
    if(null !== nodes && typeof nodes !== "undefined" &&
        nodes.length > 0) {
        this.nodes = nodes;
    } else {
        this.nodes = [];
    }
}

underlayModel.prototype.setLinks = function(links) {
    if(null !== links && typeof links !== "undefined" &&
        links.length > 0) {
        this.links = links;
    } else {
        this.links = [];
    }
}

underlayModel.prototype.getData = function(cfg) {
    var url = cfg.url;
    var _this = this;
    if(null !== url && "" !== url.trim()) {
        $.ajax({
            dataType: "json",
            url: url,
            type: cfg.type,
            data: cfg.data,
            success: function (response) {
                cfg.callback(response);
            }
        });
    }
}

underlayModel.prototype.categorizeNodes = function(nodes) {
    var tors = jsonPath(nodes, "$[?(@.chassis_type=='tor')]");
    if(false !== tors)
        this.setTors(tors);
    else
        this.setTors([]);

    var spines = jsonPath(nodes, "$[?(@.chassis_type=='spine')]");
    if(false !== spines)
        this.setSpines(spines);
    else
        this.setSpines([]);

    var cores = jsonPath(nodes, "$[?(@.chassis_type=='coreswitch')]");
    if(false !== cores)
        this.setCores(cores);
    else
        this.setCores([]);

    var vrs = jsonPath(nodes, "$[?(@.chassis_type=='virtual-router')]");
    if(false !== vrs)
        this.setVrouters(vrs);
    else
        this.setVrouters([]);

    var vms = jsonPath(nodes, "$[?(@.chassis_type=='virtual-machine')]");
    if(false !== vms)
        this.setVMs(vms);
    else
        this.setVMs([]);

    var vns = jsonPath(nodes, "$[?(@.chassis_type=='virtual-network')]");
    if(false !== vns)
        this.setVNs(vns);
    else
        this.setVNs([]);
}

underlayModel.prototype.appendNodes = function(nodes) {
    for(var i=0; i<nodes.length; i++) {
        this.nodes.push(nodes[i]);
    };
}

underlayModel.prototype.appendLinks = function(links) {
    for(var i=0; i<links.length; i++) {
        this.links.push(links[i]);
    };
}

underlayModel.prototype.reset = function() {
    this.nodes             = [];
    this.links             = [];
    this.connectedElements = [];
    this.tors              = [];
    this.spines            = [];
    this.cores             = [];
    this.vrouters          = []
    this.elementMap        = {
        nodes: {},
        links: {}
    };
}

underlayModel.prototype.destroy = function() {
    this.reset();
}




var underlayView = function (model) {
    LEVEL_1_DIMENSION.width = $("#topology_paper").innerWidth();
    LEVEL_1_DIMENSION.height = $("#topology_paper").innerHeight();

    this.model = model || new underlayModel();
    this.graph = new joint.dia.Graph;
    this.paper  = new joint.dia.Paper({
        el: $("#paper"),
        model: this.graph,
        height: LEVEL_1_DIMENSION.height,
        width:  LEVEL_1_DIMENSION.width,
        linkView: joint.shapes.contrail.LinkView
    });

    this.initZoomControls();
    this.contextMenuConfig = {};
    this.tooltipConfig = {};
    var _this = this;
    $("#underlay_tabstrip").contrailTabs({
        activate:function (e, ui) {
            var selTab = $(ui.newTab.context).text();
            if (selTab == 'Search Flows') {
                _this.renderFlowRecords();
            } else if (selTab == 'Trace Flows') {
                _this.renderTracePath();
            } else if (selTab == 'Details') {
            }
        }
    });
    this.renderFlowRecords();
}

underlayView.prototype.getModel = function() {
    return this.model;
}

underlayView.prototype.getGraph = function() {
    return this.graph;
}

underlayView.prototype.getPaper = function() {
    return this.paper;
}

underlayView.prototype.createElements = function() {
    this.createNodes();
    this.createLinks();
}

underlayView.prototype.createNodes = function() {
        var newElement, nodeName;
        var tors      = this.getModel().getTors();
        var spines    = this.getModel().getSpines();
        var cores     = this.getModel().getCores();
        var vrouters  = this.getModel().getVrouters();
        var vms       = this.getModel().getVMs();
        var elements  = [];
        var elementMap = {
            nodes: {},
            links: {}
        };

        for (var i = 0; i < tors.length; i++) {
            newElement = this.createNode(tors[i], i, tors.length);
            nodeName = tors[i]['name'];
            elements.push(newElement);
            elementMap.nodes[nodeName] = newElement.id;
        }
        for (var i = 0; i < spines.length; i++) {
            newElement = this.createNode(spines[i], i, spines.length);
            nodeName = spines[i]['name'];
            elements.push(newElement);
            elementMap.nodes[nodeName] = newElement.id;
        }
        for (var i = 0; i < cores.length; i++) {
            newElement = this.createNode(cores[i], i, cores.length);
            nodeName = cores[i]['name'];
            elements.push(newElement);
            elementMap.nodes[nodeName] = newElement.id;
        }

        for (var i = 0; i < vrouters.length; i++) {
            newElement = this.createNode(vrouters[i], i, vrouters.length);
            nodeName = vrouters[i]['name'];
            elements.push(newElement);
            elementMap.nodes[nodeName] = newElement.id;
            var vms = 
            jsonPath(globalObj.dataSources.instDS.dataSource.getItems(), "$[?(@.vRouter =='" + nodeName + "')]");
            for (var j = 0; j < vms.length; j++) {
                var vmObj = jsonPath(this.getModel().getVMs(), "$[?(@.name =='" + vms[j].name + "')]");
                if(false == vmObj)
                    continue;
                newElement = this.createNode(vmObj[0], j, vms.length);
                nodeName = vmObj[0]['name'];
                elements.push(newElement);
                elementMap.nodes[nodeName] = newElement.id;
            }
        }
        this.getModel().setConnectedElements(elements);
        this.getModel().setElementMap(elementMap);
}

underlayView.prototype.createNode = function(node, i, cnt) {
    var nodeName = node['name'],
        type = node.node_type,
        chassis_type = node.chassis_type,
        width = 40,
        height = 40,
        imageLink, element, options, imageName;
        var yPos = 0, xPos = 0;
        switch(chassis_type) {
            case "tor":
                xPos = (i+1)*275;
                yPos = 220;
                break;
            case "spine":
                xPos = (i+1)*275;
                yPos = 120;
                break;
            case "coreswitch":
                //tbd - make it 'core' here and in backend
                xPos = (i+1)*425;
                yPos = 20;
                break;
            case "virtual-router":
                chassis_type = 'vrouter';
                xPos = (i+1)*150;
                yPos = 320;
                break;
            case "virtual-machine":
                xPos = (i+1)*150;
                yPos = 420;
                break;
            case "virtual-network":
                xPos = (i+1)*150;
                yPos = 420;
                break;
        }
        imageName = getImageName(node);
        imageLink = '/img/icons/' + imageName;
        options = {
            attrs: {
                image: {
                    'xlink:href': imageLink,
                    width: width,
                    height: height
                },
                text: {
                    text: contrail.truncateText(nodeName,20)
                }
            },
            size: {
                width: width,
                height: height
            },
            position: {
                x: xPos,
                y: yPos
            },
            nodeDetails: node,
            font: {
                iconClass: 'icon-contrail-' + chassis_type
            }
        };
    element = new ContrailElement(type, options);
    return element;
}

underlayView.prototype.createLinks = function() {
    var links = this.getModel().getLinks();
    var elementMap = this.getModel().getElementMap();
    var elements = this.getModel().getConnectedElements();

    for (var i = 0; i < links.length; i++) {
        var link = this.createLink(links[i], elements, elementMap, 0);
        elements.push(link);
        elementMap.links[link.attributes.linkDetails.endpoints[0] + '<->' + link.attributes.linkDetails.endpoints[1]] = link.id;
        elementMap.links[link.attributes.linkDetails.endpoints[1] + '<->' + link.attributes.linkDetails.endpoints[0]] = link.id;
    }

    this.getModel().setConnectedElements(elements);
    this.getModel().setElementMap(elementMap);
}

underlayView.prototype.createLink = function(link, elements, elementMap, layer) {
        var options;
        var link_type ="link";
        var linkElement;
        var endPoint0 = jsonPath(elements, "$.*[?(@.id=='" + elementMap.nodes[[link.endpoints[0]]] + "')]")[0].nodeDetails.node_type;
        var endPoint1 = jsonPath(elements, "$.*[?(@.id=='" + elementMap.nodes[[link.endpoints[1]]] + "')]")[0].nodeDetails.node_type;

        var endpoint0 = endPoint0.split('-');
        var endpoint1 = endPoint1.split('-');
        link.link_type = endpoint0[0][0] + endpoint0[1][0] + '-' + endpoint1[0][0] + endpoint1[1][0];
        options = {
            direction   : "bi",
            linkType    : link.link_type,
            linkDetails : link
        };
        var newX = 0;
        var newY = 0;
        if(layer === 0) {
            link['connectionStroke'] = '#637939';
        } else {
            link['connectionStroke'] = '#498AB9';

        }

        options['sourceId'] = elementMap.nodes[link.endpoints[0]];
        options['targetId'] = elementMap.nodes[link.endpoints[1]];
        linkElement = new ContrailElement('link', options);
        return linkElement;
}

underlayView.prototype.initZoomControls = function() {
    $("#topology_paper").panzoom({
        $zoomIn: $("#zoomcontrols").find(".zoom-in"),
        $zoomOut: $("#zoomcontrols").find(".zoom-out"),
        $reset: $("#zoomcontrols").find(".zoom-reset"),
        disablePan: true
    });
}

underlayView.prototype.initTooltipConfig = function() {
    var _this = this;
    this.tooltipConfig = {
        PhysicalRouter: {
            title: function(element, graph) {
                return 'Physical Router';
            },
            content: function(element, graph) {
                var viewElement = graph.getCell(element.attr('model-id'));
                var tooltipContent = contrail.getTemplate4Id('tooltip-content-template');

                var ifLength = 0;
                if(viewElement.attributes && viewElement.attributes.hasOwnProperty('nodeDetails') &&
                    viewElement.attributes.nodeDetails.hasOwnProperty('more_attributes') &&
                    viewElement.attributes.nodeDetails.more_attributes.hasOwnProperty('ifTable') &&
                    viewElement.attributes.nodeDetails.more_attributes.ifTable.length) {
                    ifLength = viewElement.attributes.nodeDetails.more_attributes.ifTable.length;
                }
                return tooltipContent([
                    {
                        lbl:'Name',
                        value: viewElement.attributes.nodeDetails['name']
                    },
                    {
                        lbl:'Interfaces',
                        value: ifLength
                    }
                ]);
            }
        },
        VirtualMachine: {
            title: function(element, graph) {
                return 'Virtual Machine';
            },
            content: function(element, graph) {
                var viewElement = graph.getCell(element.attr('model-id'));
                var tooltipContent = contrail.getTemplate4Id('tooltip-content-template');
                var instances = globalObj['dataSources']['instDS']['dataSource'].getItems();
                var instanceName = "";
                var lbl = "UUID";
                var instanceUUID = viewElement.attributes.nodeDetails['name'];
                var vmIp = "";
                var vn = "";
                for(var i=0; i<instances.length; i++) {
                    if(instances[i].name === instanceUUID) {
                        lbl = "Name";
                        instanceName = instances[i].vmName;
                        if(instances[i].ip && instances[i].ip.length>0) {
                            vmIp = instances[i].ip.join();
                        }
                        if(instances[i].vn && instances[i].vn.length>0) {
                            vn = instances[i].vn.join();
                        }
                        break;
                    }
                }
                if("" == instanceName)
                    instanceName = viewElement.attributes.nodeDetails['name'];
                var tooltip = [];
                tooltip.push({
                    lbl:lbl,
                    value: instanceName
                });
                if(vmIp !== "") {
                    tooltip.push({
                        lbl: "IP",
                        value: vmIp
                    });
                }
                if(vn !== "") {
                    tooltip.push({
                        lbl: "Network(s)",
                        value: vn
                    });
                }
                if(viewElement.attributes && viewElement.attributes.hasOwnProperty('nodeDetails'))
                    return tooltipContent(tooltip);
            }
        },
        VirtualRouter: {
            title: function(element, graph) {
                return 'Virtual Router';
            },
            content: function(element, graph) {
                var viewElement = graph.getCell(element.attr('model-id'));
                var tooltipContent = contrail.getTemplate4Id('tooltip-content-template');
                var instances = globalObj['dataSources']['instDS']['dataSource'].getItems();
                var vms = 0;
                for(var i=0; i<instances.length; i++) {
                    if(instances[i].vRouter === viewElement.attributes.nodeDetails['name']) {
                        vms++;
                    }
                }
                if(viewElement.attributes && viewElement.attributes.hasOwnProperty('nodeDetails'))
                return tooltipContent([
                    {
                        lbl:'Name',
                        value: viewElement.attributes.nodeDetails['name']
                    },
                    {
                        lbl: "Number of VMs",
                        value: vms
                    }
                ]);
            }
        },
        link: {
            title: function(element, graph) {
                var viewElement = graph.getCell(element.attr('model-id'));
                var instances = globalObj['dataSources']['instDS']['dataSource'].getItems();
                var instanceName1 = "";
                var instanceName2 = "";
                var endpoint1 = viewElement.attributes.linkDetails.endpoints[0];
                var endpoint2 = viewElement.attributes.linkDetails.endpoints[1];
                for(var i=0; i<instances.length; i++) {
                    if(instances[i].name === endpoint1) {
                        instanceName1 = instances[i].vmName;
                    } else if (instances[i].name === endpoint1) {
                        instanceName2 = instances[i].vmName;
                    }
                }
                if("" == instanceName1)
                    instanceName1 = endpoint1;
                if("" == instanceName2)
                    instanceName2 = endpoint2;
                return "<div class='row-fluid'><div class='span1' style='margin-right:5px'>" + "Link" + "</div>" +
                    "<div class='span5'>" + instanceName1 + "</div>" +
                    "<div class='span5'>" + instanceName2 + "</div></div>";
            },
            content: function(element, graph) {
                var viewElement = graph.getCell(element.attr('model-id'));
                var tooltipContent = contrail.getTemplate4Id('two-column-content-template');
                var local_interfaces = [];
                var remote_interfaces = [];
                if(viewElement.attributes && viewElement.attributes.hasOwnProperty('linkDetails') &&
                    viewElement.attributes.linkDetails.hasOwnProperty('more_attributes') &&
                    viewElement.attributes.linkDetails.more_attributes &&
                    "-" !== viewElement.attributes.linkDetails.more_attributes &&
                    viewElement.attributes.linkDetails.more_attributes.length > 0) {
                    var moreAttrs = viewElement.attributes.linkDetails.more_attributes;
                    for(var i=0; i<moreAttrs.length; i++) {
                        local_interfaces.push(moreAttrs[i].local_interface_name + " (" + moreAttrs[i].local_interface_index + ")");
                        remote_interfaces.push(moreAttrs[i].remote_interface_name + " (" + moreAttrs[i].remote_interface_index + ")");
                    }
                }

                return tooltipContent([
                    {
                        lbl: viewElement.attributes.linkDetails.endpoints[0],
                        value: local_interfaces
                    },
                    {
                        lbl: viewElement.attributes.linkDetails.endpoints[1],
                        value: remote_interfaces
                    }
                ]);
            }
        }
    };
    $.each(this.tooltipConfig, function(keyConfig, valueConfig){
        $('g.' + keyConfig).popover({
            trigger: 'hover',
            html: true,
            delay: { show: 200, hide: 10 },
            title: function(){
                return valueConfig.title($(this), _this.getGraph());
            },
            content: function(){
                return valueConfig.content($(this), _this.getGraph());
            },
            container: $('body')
        });
    });
}

underlayView.prototype.initContextMenuConfig = function() {
    this.contextMenuConfig =  {
        PhysicalRouter: function(element, viewObj) {
            var viewElement = viewObj.getGraph().getCell(element.attr('model-id')),
                  jointElementFullName = viewElement.attributes.nodeDetails['name'],
                  items = {
                    configure: {
                          name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Physical Router</span>',
                          callback: function(key, options) {
                            loadFeature({p:PROUTER_DBL_CLICK});
                          }
                    }
                  };
            return {items: items};
        }
    };
    var _this = this;
    $.contextMenu('destroy', 'g');
    $.contextMenu({
        selector: 'g',
        position: function(opt, x, y){
            opt.$menu.css({top: y + 5, left: x + 5});
        },
        build: function($trigger, e){
            if(!$trigger.hasClassSVG('element')){
                $trigger = $trigger.parentsSVG('g.element');
                if($trigger.length > 0){
                    $trigger = $($trigger[0]);
                }
            }
            var contextMenuItems = false;
            if(contrail.checkIfExist($trigger)){
                $.each(_this.contextMenuConfig, function(keyConfig, valueConfig){
                    if($trigger.hasClassSVG(keyConfig)){
                        contextMenuItems = valueConfig($trigger, _this);
                        $('g.' + keyConfig).popover('hide');
                        return false;
                    }
                });
            }
            return contextMenuItems;
        }
    });
}

underlayView.prototype.clearHighlightedConnectedElements = function() {
    var g = this.getGraph();
    $('div.font-element')
        .removeClass('elementHighlighted')
        .removeClass('dimHighlighted');
    $('g.element')
        .removeClassSVG('elementHighlighted')
        .removeClassSVG('dimHighlighted');
    $('div.font-element')
        .css('fill', "")
        .css('stroke', "");
    $('g.element').find('text').css('fill', "#333");
    $('g.element').find('rect').css('fill', "#FFF");
    $('g.link')
        .removeClassSVG('elementHighlighted')
        .removeClassSVG('dimHighlighted');
    $("g.link").find('path.connection')
        .css("stroke", "#333");
    $("g.link").find('path.marker-source')
        .css("fill", "#333")
        .css("stroke", "#333");
    $("g.link").find('path.marker-target')
        .css("fill", "#333")
        .css("stroke", "#333");
    $("g.link").find('path.connection-wrap')
        .css("opacity", "")
        .css("fill", "")
        .css("stroke", "");
}

underlayView.prototype.initGraphEvents = function() {
    var paper = this.getPaper();
    var graph = this.getGraph();
    var selectorId = paper.el.id;
    var _this      = this;

    paper.on('blank:pointerclick', function (evt, x, y) {
        evt.stopImmediatePropagation();
        _this.resetTopology();
    });

    paper.on("cell:pointerdblclick", function (cellView, evt, x, y) {
        evt.stopImmediatePropagation();
        var dblClickedElement = cellView.model,
            elementType       = dblClickedElement['attributes']['type'];

        switch(elementType) {
            case 'contrail.PhysicalRouter':
                var chassis_type    = dblClickedElement['attributes']['nodeDetails']['chassis_type'];
                if(chassis_type === "tor") {
                    _this.resetTopology();
                    _this.showVRouter(dblClickedElement, "virtual-router");
                }
                $('g.PhysicalRouter').popover('hide');
                break;

            case 'contrail.VirtualRouter':
                if(LEVEL_2_DIMENSION.height == 0) {
                    LEVEL_2_DIMENSION.height = LEVEL_1_DIMENSION.height + 200;
                    LEVEL_2_DIMENSION.width = LEVEL_1_DIMENSION.width;
                }

                var model_id          = $(dblClickedElement).attr('id');
                //Faint all
                _this.clearHighlightedConnectedElements();
                $('div.font-element')
                    .removeClass('elementHighlighted')
                    .addClass('dimHighlighted');
                $('g.element')
                    .removeClassSVG('elementHighlighted')
                    .addClassSVG('dimHighlighted');
                $('g.link')
                    .removeClassSVG('elementHighlighted')
                    .addClassSVG('dimHighlighted')
                    .css('')

                //Highlight selected vrouter
                $('div.font-element[font-element-model-id="' + model_id + '"]')
                    .addClass('elementHighlighted')
                    .removeClass('dimHighlighted');

                $('g.element[model-id="' + model_id + '"]')
                    .addClassSVG('elementHighlighted')
                    .removeClassSVG('dimHighlighted');

                _this.getPaper().setDimensions(LEVEL_2_DIMENSION.width,LEVEL_2_DIMENSION.height);
                $('.viewport')
                    .height(LEVEL_2_DIMENSION.width)
                    .width(LEVEL_2_DIMENSION.height);

                if(ZOOMED_OUT == 0) {
                    ZOOMED_OUT = 0.8;
                    $("#topology_paper").panzoom("zoom", true, ZOOMED_OUT);
                }
                _this.hideVMs();
                _this.showVRouter(dblClickedElement, "virtual-machine");
                /*$.ajax({
                    dataType: "json",
                    url: "/api/tenant/get-data",
                    type: "POST",
                    data: {
                        "data":
                            [
                                {
                                    "kfilt" : dblClickedElement['attributes']['nodeDetails']['name'],
                                    "cfilt" : "VrouterAgent:virtual_machine_list",
                                    "type"  : "vrouter"
                                }
                            ]
                    },
                    success: function (response) {
                        if(null !== response && typeof response !== undefined && response.length > 0 &&
                            response[0].hasOwnProperty('value') && response[0].value.length > 0) {
                            var vms        = response[0].value[0].value['VrouterAgent'].virtual_machine_list;
                            if(vms.length <= 0) {
                                showGridMessage('Error', 'No Virtual Machines found for ' + dblClickedElement['attributes']['nodeDetails']['name']);
                                return;
                            }
                            _this.getPaper().setDimensions(LEVEL_2_DIMENSION.width,LEVEL_2_DIMENSION.height);
                            $('.viewport')
                                .height(LEVEL_2_DIMENSION.width)
                                .width(LEVEL_2_DIMENSION.height);

                            if(ZOOMED_OUT == 0) {
                                ZOOMED_OUT = 0.8;
                                $("#topology_paper").panzoom("zoom", true, ZOOMED_OUT);
                            }
                            var vrouterName= response[0].value[0].name;
                            var elementMap = _this.getModel().getElementMap();
                            var nodes      = _this.getModel().getNodes();
                            var links      = _this.getModel().getLinks();
                            var elements   = _this.getModel().getConnectedElements();

                            var newElements = [];
                            var vrouterToVMlinks = [];
                            for (var i = 0; i < vms.length; i++) {
                                var node = {
                                    "name"          : vms[i],
                                    "chassis_type"  : "virtual-machine",
                                    "node_type"     : "virtual-machine"
                                };
                                var newElement = _this.createNode(node, i, vms.length);
                                var nodeName = node['name'];
                                newElements.push(newElement);
                                elements.push(newElement);
                                elementMap.nodes[nodeName] = newElement.id;
                                nodes.push(node);
                                vrouterToVMlinks.push({
                                    "endpoints": [vrouterName, nodeName]
                                });

                            }
                            if(newElements.length > 0) {
                                _this.getGraph().addCells(newElements);
                                for(var i=0; i<newElements.length; i++) {
                                    $('g.element[model-id="' + newElements[i].id + '"]')
                                        .find('text')
                                        .css('stroke', "#498AB9")
                                        .css('fill', "#498AB9");
                                    $('div.font-element[font-element-model-id="' + newElements[i].id + '"]')
                                        .find('i.icon-contrail-virtual-machine')
                                        .css('color', "#498AB9");
                                }
                            }
                            newElements = [];
                            for (var i = 0; i < vrouterToVMlinks.length; i++) {
                                var link = {
                                    "connectionStroke" : "#637939",
                                    "linkType" : 'logical',
                                    "endpoints" : vrouterToVMlinks[i].endpoints
                                };
                                var newElement = _this.createLink(link, elements, elementMap);
                                newElements.push(newElement);
                                elements.push(newElement);
                                elementMap.links[newElement.attributes.linkDetails.endpoints[0] + '<->' + newElement.attributes.linkDetails.endpoints[1]] = newElement.id;
                                elementMap.links[newElement.attributes.linkDetails.endpoints[1] + '<->' + newElement.attributes.linkDetails.endpoints[0]] = newElement.id;
                                links.push(link);

                            }
                            if(newElements.length > 0) {
                                _this.getGraph().addCells(newElements);
                            }
                            _this.getModel().setNodes(nodes);
                            _this.getModel().setLinks(links);
                            _this.getModel().setConnectedElements(elements);
                            _this.getModel().setElementMap(elementMap);
                            _this.initTooltipConfig();
                        }
                        else {
                            showInfoWindow("No Virtual Machines found for " + dblClickedElement['attributes']['nodeDetails']['name'], "Info");
                            return false;
                        }
                    }
                });*/
                break;
            case 'link':
                var modelId = dblClickedElement.id;
                var targetElement = graph.getCell(dblClickedElement['attributes']['target']['id']),
                    sourceElement = graph.getCell(dblClickedElement['attributes']['source']['id']);
                break;
        }
    });

    paper.on('cell:pointerclick', function (cellView, evt, x, y) {
        evt.stopImmediatePropagation();
        var clickedElement = cellView.model,
            elementType    = clickedElement['attributes']['type'],
            data           = {};

        switch(elementType) {
            case 'contrail.PhysicalRouter':
                var nodeDetails = clickedElement['attributes']['nodeDetails'];
                data = {
                    host_name : ifNull(nodeDetails['name'],'-'),
                    description: ifNull(nodeDetails['more_attributes']['lldpLocSysDesc'],'-'),
                    intfCnt   : ifNull(nodeDetails['more_attributes']['ifTable'],[]).length,
                };
                data['type'] = 'node';
                _this.populateDetailsTab(data);
                $("#underlay_topology").data('nodeType',ifNull(nodeDetails['node_type'],'-'));
                $("#underlay_topology").data('nodeName',ifNull(nodeDetails['name'],'-'));
                break;
            case 'contrail.VirtualRouter':
                var nodeDetails = clickedElement['attributes']['nodeDetails'];
                $("#underlay_topology").data('nodeType',ifNull(nodeDetails['node_type'],'-'));
                $("#underlay_topology").data('nodeName',ifNull(nodeDetails['name'],'-'));
                _this.updateWhereClause();
                break;
            case 'contrail.VirtualMachine':
                var nodeDetails = clickedElement['attributes']['nodeDetails'];
                var instances = globalObj['dataSources']['instDS']['dataSource'].getItems();
                var ip = [],vnList = [];
                for(var i = 0; i < instances.length; i++) {
                    if(instances[i]['name'] == nodeDetails['name']) {
                        var intfList = ifNull(instances[i]['rawData']['UveVirtualMachineAgent']['interface_list'],[]);
                        if (intfList.length > 1) {
                            for(var j = 0; j < intfList.length; j++) {
                                ip.push(intfList['ip_address']);
                                vnList.push(intfList['virtual_network']);
                            }
                        } else {
                           ip[0] =  intfList[0]['ip_address'];
                           vnList[0] = intfList[0]['virtual_network'];
                        }
                        break;
                    }
                }
                $("#underlay_topology").data('nodeType',ifNull(nodeDetails['node_type'],'-'));
                $("#underlay_topology").data('nodeName',ifNull(nodeDetails['name'],'-'));
                $("#underlay_topology").data('nodeIp',ip);
                $("#underlay_topology").data('vnList',vnList);
                _this.updateWhereClause();
                break;
            case 'link':
                var targetElement = graph.getCell(clickedElement['attributes']['target']['id']),
                    sourceElement = graph.getCell(clickedElement['attributes']['source']['id']);
                var endpoints = [sourceElement['attributes']['nodeDetails']['name'],
                                 targetElement['attributes']['nodeDetails']['name']];
                data['endpoints'] = endpoints;
                data['type'] = 'link';
                data['sourceElement'] = sourceElement;
                data['targetElement'] = targetElement;
                _this.populateDetailsTab(data);
                break;
        }
    });

    $(selectorId + " text").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });

    $(selectorId + " image").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });

    $(selectorId + " polygon").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });
    $(selectorId + " path").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });
    $(selectorId + " rect").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });
    $(selectorId + " .font-element").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });
}

underlayView.prototype.hideVMs = function() {
    this.hideNodesOfType('virtual-machine');
}

underlayView.prototype.hideVNs = function() {
    this.hideNodesOfType('virtual-network');
}

underlayView.prototype.hideNodesOfType = function(type) {
    var link_type = type.split('-');
    link_type = link_type[0][0] + link_type[1][0];
    var elements = this.getModel().getConnectedElements();
    var _this = this;
    $.each(elements, function(key, value){
        if(value.attributes && value.attributes.linkDetails && value.attributes.linkDetails.link_type &&
            value.attributes.linkDetails.link_type.indexOf(link_type) !== -1) {
            $('g.link[model-id="' + value.id + '"]')
                .removeClassSVG('elementHighlighted')
                .removeClassSVG('dimHighlighted')
                .addClassSVG('hidden');
        }
    });
    $.each(elements, function(key, value) {
        if(value.attributes && value.attributes.nodeDetails && value.attributes.nodeDetails.chassis_type &&
            value.attributes.nodeDetails.chassis_type == type) {
            $('g.element[model-id="' + value.id + '"]')
                .removeClassSVG('elementHighlighted')
                .removeClassSVG('dimHighlighted')
                .addClassSVG('hidden');
            $('div.font-element[font-element-model-id="' + value.id + '"]')
                .removeClassSVG('elementHighlighted')
                .removeClassSVG('dimHighlighted')
                .addClassSVG('hidden');
            if(type == 'virtual-machine' && value.hasOwnProperty('old_position') &&
                null !== value.old_position &&
                typeof value.old_position !== 'undefined') {
                var old_position = value.old_position;
                _this.getGraph().getCell(value.id).transition('position/x', old_position.x);
                _this.getGraph().getCell(value.id).transition('position/y', old_position.y);
                delete value.old_position;
            }
        }/* else {
            $('g.element[model-id="' + value.id + '"]')
                .addClassSVG('elementHighlighted')
                .removeClassSVG('hidden');
            $('div.font-element[font-element-model-id="' + value.id + '"]')
                .removeClass('hidden');
        }*/
    });
    /*var elements = this.getModel().getConnectedElements();
    var elementMap = this.getModel().getElementMap();
    var delElements = [];
    for(var i=0; i<elements.length; i++) {
        var element = elements[i];
        if(element.attributes && element.attributes.hasOwnProperty('nodeDetails') &&
            element.attributes.nodeDetails.chassis_type == type) {
            delElements.push(element);
            $('div.font-element[font-element-model-id="' + element.id + '"]').remove();
            $('svg').find('g.element[model-id="' + element.id + '"]').remove();
            delete elementMap.nodes[element.attributes.nodeDetails.name];
            $.each(elementMap.links, function(linkKey, linkValue) {
                if(linkKey.indexOf(element.attributes.nodeDetails.name) !== -1) {
                    $('svg').find('g.link[model-id="' + linkValue + '"]').remove();
                    delete elementMap.links[linkKey];
                }
            });
            elements.splice(i,1);
        }
    }
    this.getModel().clearOtherNodes(type);*/

}

underlayView.prototype.resetTopology = function() {
    this.clearHighlightedConnectedElements();
    $("#topology_paper").panzoom("reset");
    ZOOMED_OUT = 0;
    this.hideVRouters();
    this.hideVMs();
    $("#underlay_topology").removeData('nodeType');
    $("#underlay_topology").removeData('nodeName');
}

underlayView.prototype.renderTopology = function(response) {
    this.createElements();
    this.renderUnderlayViz();
    this.hideVRouters();
    this.hideVMs();

    var data = this.getPostDataFromHashParams();
    var _this = this;
    if(JSON.stringify(data) !== '{"data":{}}') {
        var cfg = {
            url      : "api/tenant/networking/underlay-path",
            type     : "POST",
            data     : data,
            view     : this,
            callback : function(response) {
                this.view.highlightPath(response, data);
            }
        };
        this.getModel().getData(cfg);
    }
}

underlayView.prototype.highlightPath = function(response, data) {
    if(null !== response && typeof response !== "undefined" &&
        null !== response.nodes && typeof response.nodes !== "undefined"){

    } else if(response.nodes <=0){
        showInfoWindow("No Underlay paths found for the selected flow.", "Info");
        return false;
    } else if("" !== response && typeof response === "string") {
        showInfoWindow(response, "Info");
        return false;
    }
    var _this = null;
    if(null !== this && typeof this !== "undefined" && this.hasOwnProperty('view') &&
        this.view instanceof underlayView) {
        _this = this.view;
    } else {
        _this = this;
    }
    _this.resetTopology();
    highlightedElements = {
        nodes: [],
        links: []
    };
    var elementMap = _this.getModel().getElementMap();
    var conElements = _this.getModel().getConnectedElements();
    var graph      = _this.getGraph();
    var nodes      = response.nodes;
    var links      = response.links;

    for(var i=0; i<nodes.length; i++) {
        highlightedElements.nodes.push(nodes[i]);
    }

    for (var i = 0; i < links.length; i++) {
        highlightedElements.links.push(links[i].endpoints[0] + "<->" + links[i].endpoints[1]);
    }

    if(highlightedElements.nodes.length > 0) {
        if(LEVEL_2_DIMENSION.height == 0) {
            LEVEL_2_DIMENSION.height = LEVEL_1_DIMENSION.height + 200;
            LEVEL_2_DIMENSION.width = LEVEL_1_DIMENSION.width;
        }
        _this.getPaper().setDimensions(LEVEL_2_DIMENSION.width,LEVEL_2_DIMENSION.height);
        $('.viewport')
            .height(LEVEL_2_DIMENSION.width)
            .width(LEVEL_2_DIMENSION.height);

        if(ZOOMED_OUT == 0) {
            ZOOMED_OUT = 0.8;
            $("#topology_paper").panzoom("zoom", true, ZOOMED_OUT);
        }
    }
    highlightedElements.nodes = $.unique(highlightedElements.nodes);
    for(var i=0; i<highlightedElements.nodes.length; i++) {
        var node = elementMap.nodes[highlightedElements.nodes[i].name];
        if($('g.element[model-id="' + node + '"]').hasClassSVG('hidden'))
            $('g.element[model-id="' + node + '"]').removeClassSVG('hidden');

        if($('div[font-element-model-id="' + node + '"]').hasClass('hidden'))
            $('div[font-element-model-id="' + node + '"]').removeClass('hidden');
    }
    highlightedElements.links = $.unique(highlightedElements.links);
    var linkEl = [];
    $.each(highlightedElements.links, function(linkKey, linkValue) {
        var nodeElement = graph.getCell(elementMap.links[linkValue]);
        $("g.link[model-id='" + nodeElement.id + "']").removeClassSVG('hidden');
        $("g.link[model-id='" + nodeElement.id + "']")
            .find('path.connection-wrap')
                .css("opacity", ".2")
                .css("fill", "#498AB9")
                .css("stroke", "#498AB9");
    });

    var srcIP = data.data['srcIP'];
    var destIP = data.data['destIP'];
    var instances = globalObj['dataSources']['instDS']['dataSource'].getItems();
    var srcVM = jsonPath(instances, "$[?(@.ip=='" + srcIP + "')]");
    if(false !== srcVM) {
        srcVM = srcVM[0].name;
    }
    var destVM = jsonPath(instances, "$[?(@.ip=='" + destIP + "')]");
    if(false !== destVM) {
        destVM = destVM[0].name;
    }
    for(var i=0; i<highlightedElements.nodes.length; i++) {
        var hlNode = highlightedElements.nodes[i];
        if(hlNode.node_type === 'virtual-machine') {
            var model_id = elementMap.nodes[hlNode.name];
            var associatedVRouter =
            jsonPath(globalObj.dataSources.instDS.dataSource.getItems(), "$[?(@.name =='" + hlNode.name + "')]");
            var associatedVRouterUID = "";
            if(false !== associatedVRouter &&
                "string" !== typeof associatedVRouter &&
                associatedVRouter.length > 0 ) {
                associatedVRouter = associatedVRouter[0].vRouter;
                if(null !== associatedVRouter && typeof associatedVRouter !== "undefined") {
                    associatedVRouterUID = _this.getModel().getElementMap().nodes[associatedVRouter];
                }
            }
            if(hlNode.name == srcVM) {
                //Plot green
                $('div.font-element[font-element-model-id="' + model_id + '"]')
                    .css('stroke', "green")
                    .css('fill', "green");

                $('g.element[model-id="' + model_id + '"]')
                    .css('stroke', "green")
                    .css('fill', "green");

                if(associatedVRouterUID !== "") {
                    var cell = _this.getGraph().getCell(associatedVRouterUID);
                    var vrouterPosition = cell.attributes.position;
                    var vmNode = jsonPath(conElements, "$[?(@.id=='" + model_id + "')]");
                    if(false !== vmNode && vmNode.length == 1) {
                        vmNode[0].old_position = _this.getGraph().getCell(model_id).attributes.position;
                    }
                    _this.getGraph().getCell(model_id).transition('position/x', vrouterPosition.x);
                    _this.getGraph().getCell(model_id).transition('position/y', vrouterPosition.y + 80);
                }
            } else if(hlNode.name == destVM) {
                //Plot red
                $('div.font-element[font-element-model-id="' + model_id + '"]')
                    .css('stroke', "red")
                    .css('fill', "red");

                $('g.element[model-id="' + model_id + '"]')
                    .css('stroke', "red")
                    .css('fill', "red");
                if(associatedVRouterUID !== "") {
                    var cell = _this.getGraph().getCell(associatedVRouterUID);
                    var vrouterPosition = cell.attributes.position;
                    var vmNode = jsonPath(conElements, "$[?(@.id=='" + model_id + "')]");
                    if(false !== vmNode && vmNode.length == 1) {
                        vmNode[0].old_position = _this.getGraph().getCell(model_id).attributes.position;
                    }
                    _this.getGraph().getCell(model_id).transition('position/x', vrouterPosition.x);
                    _this.getGraph().getCell(model_id).transition('position/y', vrouterPosition.y + 80);
                }
            }
            _this.getModel().setConnectedElements(conElements);
        }
    }
};

underlayView.prototype.showVRouter = function(dblClickedElement, type) {
    var elMap  = this.getModel().getElementMap();
    var clickedNodeName = dblClickedElement['attributes']['nodeDetails']['name'];
    var vrouters = [];
    var linkToVrouters = [];
    var links = this.getModel().getLinks();
    var nodes = this.getModel().getNodes();
    var graph = this.getGraph();
    var srcPoint = jsonPath(links, "$[?(@.endpoints[0]=='" + clickedNodeName + "')]");
    var dstPoint = jsonPath(links, "$[?(@.endpoints[1]=='" + clickedNodeName + "')]");
    if(false !== srcPoint && srcPoint.length > 0) {
        for(var i=0; i<srcPoint.length; i++) {
            var sp = srcPoint[i].endpoints;
            if(elMap.links.hasOwnProperty(sp[0] + "<->" + clickedNodeName)) {
                var otherEndNode =
                jsonPath(nodes, "$[?(@.name=='" + sp[0] + "')]");
                if(false !== otherEndNode && otherEndNode.length == 1 &&
                    otherEndNode[0].chassis_type == type) {
                    vrouters.push(elMap.nodes[sp[0]]);
                    linkToVrouters.push(elMap.links[sp[0] + "<->" + clickedNodeName]);
                }
            } else if(elMap.links.hasOwnProperty(clickedNodeName + "<->" + sp[0])) {
                var otherEndNode =
                jsonPath(nodes, "$[?(@.name=='" + sp[0] + "')]");
                if(false !== otherEndNode && otherEndNode.length == 1 &&
                    otherEndNode[0].chassis_type == type) {
                    vrouters.push(elMap.nodes[sp[0]]);
                    linkToVrouters.push(elMap.links[clickedNodeName + "<->" + sp[0]]);
                }
            } else if(elMap.links.hasOwnProperty(sp[1] + "<->" + clickedNodeName)) {
                var otherEndNode =
                jsonPath(nodes, "$[?(@.name=='" + sp[1] + "')]");
                if(false !== otherEndNode && otherEndNode.length == 1 &&
                    otherEndNode[0].chassis_type == type) {
                    vrouters.push(elMap.nodes[sp[1]]);
                    linkToVrouters.push(elMap.links[sp[1] + "<->" + clickedNodeName]);
                }
            } else if(elMap.links.hasOwnProperty(clickedNodeName + "<->" + sp[1])) {
                var otherEndNode =
                jsonPath(nodes, "$[?(@.name=='" + sp[1] + "')]");
                if(false !== otherEndNode && otherEndNode.length == 1 &&
                    otherEndNode[0].chassis_type == type) {
                    vrouters.push(elMap.nodes[sp[1]]);
                    linkToVrouters.push(elMap.links[clickedNodeName + "<->" + sp[1]]);
                }
            }
        }
    }
    if(false !== dstPoint && dstPoint.length > 0) {
        for(var i=0; i<dstPoint.length; i++) {
            var sp = dstPoint[i].endpoints;
            if(elMap.links.hasOwnProperty(sp[0] + "<->" + clickedNodeName)) {
                var otherEndNode =
                jsonPath(nodes, "$[?(@.name=='" + sp[0] + "')]");
                if(false !== otherEndNode && otherEndNode.length == 1 &&
                    otherEndNode[0].chassis_type == type) {
                    vrouters.push(elMap.nodes[sp[0]]);
                    linkToVrouters.push(elMap.links[sp[0] + "<->" + clickedNodeName]);
                }
            } else if(elMap.links.hasOwnProperty(clickedNodeName + "<->" + sp[0])) {
                var otherEndNode =
                jsonPath(nodes, "$[?(@.name=='" + sp[0] + "')]");
                if(false !== otherEndNode && otherEndNode.length == 1 &&
                    otherEndNode[0].chassis_type == type) {
                    vrouters.push(elMap.nodes[sp[0]]);
                    linkToVrouters.push(elMap.links[clickedNodeName + "<->" + sp[0]]);
                }
            } else if(elMap.links.hasOwnProperty(sp[1] + "<->" + clickedNodeName)) {
                var otherEndNode =
                jsonPath(nodes, "$[?(@.name=='" + sp[1] + "')]");
                if(false !== otherEndNode && otherEndNode.length == 1 &&
                    otherEndNode[0].chassis_type == type) {
                    vrouters.push(elMap.nodes[sp[1]]);
                    linkToVrouters.push(elMap.links[sp[1] + "<->" + clickedNodeName]);
                }
            } else if(elMap.links.hasOwnProperty(clickedNodeName + "<->" + sp[1])) {
                var otherEndNode =
                jsonPath(nodes, "$[?(@.name=='" + sp[1] + "')]");
                if(false !== otherEndNode && otherEndNode.length == 1 &&
                    otherEndNode[0].chassis_type == type) {
                    vrouters.push(elMap.nodes[sp[1]]);
                    linkToVrouters.push(elMap.links[clickedNodeName + "<->" + sp[1]]);
                }
            }
        }
    }

    if(vrouters.length > 0) {
        if($('g.element[model-id="' + vrouters[0] + '"]').hasClassSVG('hidden')) {
            $('div.font-element').removeClass('elementHighlighted').addClass('dimHighlighted');
            $('g.element').removeClassSVG('elementHighlighted').addClassSVG('dimHighlighted');
            $('g.link').removeClassSVG('elementHighlighted').addClassSVG('dimHighlighted');
            this.hideNodesOfType(type);
        } else {
            $('div.font-element').removeClass('elementHighlighted').removeClass('dimHighlighted');
            $('g.element').removeClassSVG('elementHighlighted').removeClassSVG('dimHighlighted');
            $('g.link').removeClassSVG('elementHighlighted').removeClassSVG('dimHighlighted');
            this.hideNodesOfType(type);
            return;
        }
    }

    for(var i=0; i<vrouters.length; i++) {
        var vrouter_model_id = vrouters[i];
        if($('g.element[model-id="' + vrouter_model_id + '"]').hasClassSVG('hidden')){
            $('div[font-element-model-id="'+ dblClickedElement.id  + '"]')
                .removeClass('dimHighlighted')
                .addClass('elementHighlighted');
            $('g.element[model-id="' + dblClickedElement.id + '"]')
                .removeClassSVG('dimHighlighted')
                .addClassSVG('elementHighlighted');
            $('g.element[model-id="' + vrouter_model_id + '"]')
                .removeClassSVG('hidden')
                .removeClassSVG('dimHighlighted')
                .addClassSVG('elementHighlighted');
        }

        if($('div.font-element[font-element-model-id="' + vrouter_model_id + '"]').hasClass('hidden')) {
            $('div.font-element[font-element-model-id="' + vrouter_model_id + '"]')
                .removeClass('hidden')
                .removeClass('dimHighlighted')
                .addClass('elementHighlighted');
        }
    }

    for(var i=0; i<linkToVrouters.length; i++) {
        var link_model_id = linkToVrouters[i];
        if($('g.link[model-id="' + link_model_id + '"]').hasClassSVG('hidden')) {
            $('g.link[model-id="' + link_model_id + '"]')
                .removeClassSVG('hidden')
                .removeClassSVG('dimHighlighted')
                .addClassSVG('elementHighlighted');

            $('g.link[model-id="' + link_model_id + '"]')
                .find('path.connection')
                    .css("stroke", "#498AB9");
            $('g.link[model-id="' + link_model_id + '"]')
                .find('path.marker-source')
                    .css("fill", "#498AB9")
                    .css("stroke", "#498AB9");
            $('g.link[model-id="' + link_model_id + '"]')
                .find('path.marker-target')
                    .css("fill", "#498AB9")
                    .css("stroke", "#498AB9");
            $('g.link[model-id="' + link_model_id + '"]')
                .find('path.connection-wrap')
                    .css("opacity", "")
                    .css("fill", "")
                    .css("stroke", "");
        }
    }
}

underlayView.prototype.hideVRouters = function() {
    this.hideNodesOfType('virtual-router');
}

underlayView.prototype.renderUnderlayViz = function() {
    var elements = this.getModel().getConnectedElements();
    //this.initContextMenuConfig();
    this.graph.addCells(elements);
    this.initGraphEvents();
    this.initTooltipConfig();
}

underlayView.prototype.renderFlowRecords = function() {
    if($("#fr-results").data('contrailGrid') == null || $("#underlay_topology").data('nodeType') != null) {
        var whereClauseStr;
        $("#flows-tab").html($("#qe-template").html());
        setFRValidValues();
        initFRQueryView('fr');
        initWidgetBoxes();
        queries['fr'].queryViewModel.timeRange([
                                                {"name":"Last 5 Mins", "value":300},
                                                {"name":"Last 10 Mins", "value":600},
                                                {"name":"Last 20 Mins", "value":1200},
                                                {"name":"Last 30 Mins", "value":1800},
                                                {"name":"Last 1 Hr", "value":3600},
                                                {"name":"Custom", "value":0},
                                     ]);
        queries['fr'].queryViewModel.defaultTRValue("600");
        queries['fr'].queryViewModel.isCustomTRVisible(false);
        ko.applyBindings(queries.fr.queryViewModel, document.getElementById('fr-query'));
        whereClauseStr = this.updateWhereClause();
    }
}
/*
 * This method updates the where clause in search flow based on the selection of
 * device in the topology(currently we are updating vrouter and VM details ) 
 */
underlayView.prototype.updateWhereClause = function () {
    var nodeType = $("#underlay_topology").data('nodeType');
    var nodeName = $("#underlay_topology").data('nodeName');
    var whereClauseStr;
    if(nodeType == VROUTER) {
        whereClauseStr = '(vrouter = '+nodeName+')';
    } else if(nodeType == VIRTUALMACHINE) {
        var nodeIp = ifNull($("#underlay_topology").data('nodeIp'),[]);
        var vnList = ifNull($("#underlay_topology").data('vnList'),[]);
        whereClauseStr = '(';
        for(var i = 0; i < nodeIp.length; i++) {
            whereClauseStr += 'sourcevn = '+vnList[i]+' AND sourceip = '+nodeIp[i];
            if((i+1) < nodeIp.length)
                whereClauseStr += 'AND';
        }
        whereClauseStr += ')';
    }
    $('#fr-where').val(whereClauseStr);
}
underlayView.prototype.renderTracePath = function(options) {
    
}
underlayView.prototype.renderTracePath = function(options) {
    var _this = this;
    var nodeType = $("#underlay_topology").data('nodeType');
    var nodeName = $("#underlay_topology").data('nodeName');
    var tracePathTemplate = Handlebars.compile($("#tracePath-template").html())();
    var defaultValue = '',ip = '';
    var isAllPrevFirstTimeClicked = true;
    $("#traceFlow").html(tracePathTemplate);
    var computeNodes = globalObj['dataSources']['computeNodeDS']['dataSource'].getItems(),computeNodeCombobox = [];
    if(nodeType == VROUTER && nodeName != null) {
        defaultValue = nodeName;
    } else {
        defaultValue = computeNodes[0]['name'];
        ip = computeNodes[0]['ip'];
    }
    for(var i = 0; i < computeNodes.length; i++) {
        if(computeNodes[i]['name'] == defaultValue)
            ip = computeNodes[i]['ip'];
        computeNodeCombobox.push({
            text:computeNodes[i]['name'],
            value:computeNodes[i]['name']
        });
    }
    $("#tracePathDropdown").contrailDropdown({
        dataTextField: "text",
        dataValueField: "value",
        change: function(e) {
            var ajaxConfig = {};
            if($('#vrouterRadiobtn').is(':checked') == true) {
                ajaxConfig = getInstFlowsUrl(e['val'],VROUTER);
                
            } else if($('#instRadiobtn').is(':checked') == true) {
                ajaxConfig = getInstFlowsUrl(e['val'],VIRTUALMACHINE);
            }
            reloadFlowsGrid(ajaxConfig);
        }
    });
    var tracePathDropdown = $("#tracePathDropdown").data('contrailDropdown');
    tracePathDropdown.setData(computeNodeCombobox);
    tracePathDropdown.text(defaultValue);
    
    $("#vrouterRadiobtn").prop('checked',true);
    var instances = globalObj['dataSources']['instDS']['dataSource'].getItems(),instComboboxData = [];
    var instMap = {};
    for(var i = 0; i < instances.length; i++) {
        var instObj = instances[i];
        instComboboxData.push({
            text: instObj['vmName']+' ('+instObj['name']+')',
            value: instances[i]['name'],
        });
        instMap[instances[i]['name']] = instances[i];
    }
    var vRouterAjaxReq = getInstFlowsUrl(defaultValue,VROUTER);
    var options = getFRDefaultOptions();
    options['elementId'] = 'vrouterflows';
    var selectArray = parseStringToArray(vRouterAjaxReq['data']['select'], ',');
    selectArray = selectArray.concat(queries['fr']['defaultColumns']);
    var columnDisplay = getColumnDisplay4Grid(queries['fr']['columnDisplay'], selectArray, true);
    loadFlowResultsForUnderlay(options,vRouterAjaxReq['data'],columnDisplay,null,true);
    function reloadFlowsGrid(newAjaxConfig) {
        loadFlowResultsForUnderlay(options,newAjaxConfig['data'],columnDisplay,null,true);
    }
    $('input[name="flowtype"]').change(function(){
        var ajaxConfig = {},selItem = {};
        if($('#vrouterRadiobtn').is(':checked') == true) {
            tracePathDropdown.setData(computeNodeCombobox);
            selItem = $("#tracePathDropdown").data('contrailDropdown').getAllData()[0];
            ajaxConfig = getInstFlowsUrl(selItem['id'],VROUTER);
        } else if($('#instRadiobtn').is(':checked') == true) {
            tracePathDropdown.setData(instComboboxData);
            selItem = $("#tracePathDropdown").data('contrailDropdown').getAllData()[0];
            ajaxConfig = getInstFlowsUrl(selItem['value'],VIRTUALMACHINE);
        }
        reloadFlowsGrid(ajaxConfig);
    });
    
    $("#traceFlowBtn").die('click').live('click',function(e){
        var flowGrid = $("#vrouterflows").data('contrailGrid');
        var checkedRows = flowGrid.getCheckedRows();
        var dataItem = ifNull(checkedRows[0],{});
        var item = tracePathDropdown.getSelectedData();
        /*
         * For egress flows the source vm ip may not spawned in the same vrouter,
         * so need to pick the peer_vrouter
         */
        var postData = {};
        var postData = {
                srcIP: dataItem['sourceip'],
                destIP: dataItem['destip'],
                srcPort: dataItem['sport'],
                destPort: dataItem['dport'],
                protocol: dataItem['protocol'],
         };
        if(dataItem['direction_ing'] == 1) {
            postData['nodeIP'] = dataItem['vrouter_ip'];
            postData['vrfName'] = (dataItem['sourcevn'] +":"+ dataItem['sourcevn'].split(':')[2]);
        } else if(dataItem['direction_ing'] == 0) {
            postData['nodeIP'] = dataItem['other_vrouter_ip'];
            postData['vrfName'] = (dataItem['destvn'] +":"+ dataItem['destvn'].split(':')[2]);
        }
        $.ajax({
            url:'/api/tenant/networking/trace-flow',
            type:'POST',
            data:{
                data: postData
            }
        }).success(function(response){
            _this.highlightPath(response, {data: postData});
        }).always(function(response){
        });
    });
    $("#revTraceFlowBtn").die('click').live('click',function(e){
        var flowGrid = $("#vrouterflows").data('contrailGrid');
        var checkedRows = flowGrid.getCheckedRows();
        var dataItem = ifNull(checkedRows[0],{});
        /*
         * For egress flows the source vm ip may not spawned in the same vrouter,
         * so need to pick the peer_vrouter
         */
        var postData = {
               srcIP: dataItem['destip'],
               destIP: dataItem['sourceip'],
               srcPort: dataItem['dport'],
               destPort: dataItem['sport'],
               protocol: dataItem['protocol'],
        };
        if(dataItem['direction_ing'] == 0) {
            postData['nodeIP'] = dataItem['vrouter_ip'];
            postData['vrfName'] = (dataItem['sourcevn'] +":"+ dataItem['sourcevn'].split(':')[2]);
        } else if(dataItem['direction_ing'] == 1) {
            postData['nodeIP'] = dataItem['other_vrouter_ip'];
            postData['vrfName'] = (dataItem['destvn'] +":"+ dataItem['destvn'].split(':')[2]);
        }
        $.ajax({
            url:'/api/tenant/networking/trace-flow',
            type:'POST',
            data:{
                data: postData
            }
        }).success(function(response){
            _this.highlightPath(response, {data: postData});
        }).always(function(response){
        });
    });
    function getInstFlowsUrl(name,type){
        var req = {};
        var ajaxData = {
                pageSize: 50,
                timeRange: 300,
                select: 'setup_time, teardown_time, agg-bytes, agg-packets,vrouter_ip,other_vrouter_ip',
                fromTimeUTC: 'now-300s',
                toTimeUTC: 'now',
                queryId: randomUUID(),
                async: true,
                table:'FlowRecordTable'
        };
        if(type == VIRTUALMACHINE) {
            var vmData = instMap[name];
            var intfData = ifNull(vmData['rawData']['UveVirtualMachineAgent']['interface_list'],[]);
            var where = '';
            for(var i = 0; i < intfData.length; i++) {
                where += '(sourcevn = '+intfData[i]['virtual_network']+' AND sourceip = '+intfData[i]['ip_address']+')';
                if(i+1 > intfData.length)
                    where+= 'OR';
            }
            ajaxData['where'] = where;
        } else if(type == VROUTER) {
            ajaxData['where'] = "(vrouter = "+name+")";
        }
        ajaxData['engQueryStr'] = getEngQueryStr(ajaxData);
        req['data'] = ajaxData;
        req['url'] = '/api/admin/reports/query';
        return req;
    }
}

underlayView.prototype.runTracePath = function(context, obj, response) {
    var data = {};
    for(var i = 0; i < obj.length; i++) {
        if ($("#"+obj[i]['key']).data('contrailCombobox').value() != "")
            data[obj[i]['key']] = $("#"+obj[i]['key']).data('contrailCombobox').value();
    }
    if(JSON.stringify(data) !== "{}") {
        var ajaxCfg = {
            url      : "/api/tenant/networking/trace-flow",
            type     : "POST",
            data     : data,
            view     : this,
            callback : function(response) {
                this.view.highlightPath(response, data);
            }
        };
        this.getModel().getData(ajaxCfg);
    }
}

underlayView.prototype.getPostDataFromHashParams = function() {
    var hashParams = layoutHandler.getURLHashObj();
    var data = {"data" : {}};
    if(null !== hashParams && null !== hashParams.q && typeof hashParams.q !== "undefined") {
        var hasPostData = false;
        if(hashParams.q.hasOwnProperty('srcIP') && "" !== hashParams.q['srcIP']) {
            data.data["srcIP"] = hashParams.q['srcIP'];
            hasPostData = true;
        }
        if(hashParams.q.hasOwnProperty('sport') && "" !== hashParams.q['sport']) {
            data.data["sport"] = hashParams.q['sport'];
            hasPostData = true;
        }
        if(hashParams.q.hasOwnProperty('destIP') && "" !== hashParams.q['destIP']) {
            data.data["destIP"] = hashParams.q['destIP'];
            hasPostData = true;
        }
        if(hashParams.q.hasOwnProperty('dport') && "" !== hashParams.q['dport']) {
            data.data["dport"] = hashParams.q['dport'];
            hasPostData = true;
        }
        if(hashParams.q.hasOwnProperty('protocol') && "" !== hashParams.q['protocol']) {
            data.data["protocol"] = hashParams.q['protocol'];
            hasPostData = true;
        }
        if(hashParams.q.hasOwnProperty('srcVN') && "" !== hashParams.q['srcVN']) {
            data.data["srcVN"] = hashParams.q['srcVN'];
            hasPostData = true;
        }
        if(hashParams.q.hasOwnProperty('destVN') && "" !== hashParams.q['destVN']) {
            data.data["destVN"] = hashParams.q['destVN'];
            hasPostData = true;
        }
        if(hasPostData === true) {
            data.data["minsSince"] = 300;
        }
     }
     return data;
}

underlayView.prototype.populateDetailsTab = function(data) {
    var type = data['type'],details,content;
    $("#detailsLink").show();
    $("#underlay_tabstrip").tabs({active:2});
    if(type == 'node') {
        content = {
            host_name : ifNull(data['host_name'],'-'),
            description: ifNull(data['description'],'-'),
            intfCnt   : ifNull(data['intfCnt'],0)
        };
        details = Handlebars.compile($("#device-summary-template").html())(content);
        $("#detailsTab").html(details);
    } else if (type == 'link') {
        var endpoints = ifNull(data['endpoints'],[]);
        var sourceType = data['sourceElement']['attributes']['nodeDetails']['node_type'];
        var targetType = data['targetElement']['attributes']['nodeDetails']['node_type'];
        var url = '',link = 'vrouter';
        var type = 'GET';
        var ajaxData = {};
        if(sourceType == PROUTER && targetType == PROUTER) {
            url = '/api/tenant/networking/underlay/prouter-link-stats';
            type = 'POST';
            ajaxData = {
                    "data": {
                        "endpoints": endpoints,
                        "sampleCnt": 150, 
                        "minsSince":60
                      }
                    };
            link = 'prouter';
            details = Handlebars.compile($("#link-summary-template").html())({link:link,intfObjs:[{}]});
            $("#detailsTab").html(details);
        } else if(sourceType == VROUTER || targetType == VROUTER) {
            var vrouter = (sourceType == VROUTER) ? data['sourceElement']['attributes']['nodeDetails']['name']
                           : data['targetElement']['attributes']['nodeDetails']['name'];
            url = 'api/tenant/networking/vrouter/stats';
            ajaxData = {
                    minsSince: 60,
                    sampleCnt: 120,
                    useServerTime: true,
                    vrouter:vrouter
            };
            //url ='/vrouterifstats.json';
            var title = contrail.format('Traffic Statistics of {0}',vrouter);
            details = Handlebars.compile($("#link-summary-template").html())({link:link,title:title});
            $("#detailsTab").html(details);
            //$("#detailsTab").find('.icon-spinner').show();
        }
        $.ajax({
            url:url,
            type:type,
            data:ajaxData
        }).success(function(response){
            var chartObj = {
                    data:[]
            };
            var selector = '';
            if(link == 'vrouter') {
                selector = 'vrouter-ifstats';
                var flows = ifNull(response['flow-series'],[]);
                var inBytes = [];
                var outBytes = [];
                for(var i = 0; i < flows.length; i++) {
                    var flowObj = flows[i];
                    inBytes.push({
                        x:flowObj['time'],
                        y:flowObj['inBytes']
                    });
                    outBytes.push({
                        x:flowObj['time'],
                        y:flowObj['outBytes']
                    });
                }
                chartObj['data'][0] = {
                                key:'InBytes',
                                values:inBytes,
                };
                chartObj['data'][1] = {
                        key:'OutBytes',
                        values:outBytes,
                }
                initMemoryLineChart('#'+selector,chartObj['data'],{height:300});
            } else if (link == 'prouter') {
                details = Handlebars.compile($("#link-summary-template").html())({link:link,intfObjs:response});
                $("#detailsTab").html(details);
                for(var i = 0; i < response.length; i++) {
                    var rawFlowData = response[i];
                    var lclData = ifNull(rawFlowData[0],{});
                    var rmtData = ifNull(rawFlowData[1],{});
                    var intfFlowData = [],lclInBytesData = [],lclOutBytesData = [],rmtInBytesData = [],rmtOutBytesData = [];
                    var lclFlows = ifNull(lclData['flow-series']['value'],[]);
                    var rmtFlows = ifNull(rmtData['flow-series']['value'],[]),lclTitle,rmtTitle;
                    lclTitle = contrail.format('Traffic statistics of link {0} ({1}) --> {2} ({3})',lclData['summary']['name'],
                            lclData['summary']['if_name'],rmtData['summary']['name'],rmtData['summary']['if_name']);
                    rmtTitle = contrail.format('Traffic statistics of link {0} ({1}) --> {2} ({3})',rmtData['summary']['name'],
                            rmtData['summary']['if_name'],lclData['summary']['name'],lclData['summary']['if_name']);
                    for(var j = 0; j < lclFlows.length; j++) {
                        var lclFlowObj = lclFlows[j];
                        lclInBytesData.push({
                            x: lclFlowObj['T='],
                            y: ifNull(lclFlowObj['SUM(ifStats.ifInUcastPkts)'],0)
                        });
                        lclOutBytesData.push({
                            x: lclFlowObj['T='],
                            y: ifNull(lclFlowObj['SUM(ifStats.ifOutUcastPkts)'],0)
                        });
                    }
                    var lclChartObj = {
                            title: lclTitle,
                            data:[{
                                key:'Transmit',
                                values:lclInBytesData,
                            },{
                                key:'Receive',
                                values:lclOutBytesData
                            }]
                    }
                    for(var j = 0; j < rmtFlows.length; j++) {
                        var rmtFlowObj = rmtFlows[j];
                        rmtInBytesData.push({
                            x: rmtFlowObj['T='],
                            y: ifNull(rmtFlowObj['SUM(ifStats.ifInUcastPkts)'],0)
                        });
                        rmtOutBytesData.push({
                            x: rmtFlowObj['T='],
                            y: ifNull(rmtFlowObj['SUM(ifStats.ifOutUcastPkts)'],0)
                        });
                    }
                    var rmtChartObj = {
                            title: rmtTitle,
                            data:[{
                                key:'Transmit',
                                values:rmtInBytesData,
                            },{
                                key:'Receive',
                                values:rmtOutBytesData
                            }]
                    }
                    var icontag = "<i id='prouter-ifstats-loading-0' class='icon-spinner icon-spin blue bigger-125' " +
                            "style='display: none;'></i>";
                    $("#prouter-lclstats-widget-"+i).find('.widget-header > h4').html(icontag+lclTitle);
                    initMemoryLineChart('#prouter-lclstats-'+i,lclChartObj['data'],{height:300});
                    $("#prouter-rmtstats-widget-"+i).find('.widget-header > h4').html(icontag+rmtTitle);
                    initMemoryLineChart('#prouter-rmtstats-'+i,rmtChartObj['data'],{height:300});
                }
            } 
        }).always(function(response){
            $("#detailsTab").find('.icon-spinner').hide();
        });
    }
}

underlayView.prototype.destroy = function() {
    var vizTemplate = $("#visualization-template");
    if(isSet(vizTemplate)) {
        vizTemplate.remove();
        vizTemplate = $();
    }
}



var underlayController = function (model, view) {
    this.model = model || new underlayModel({nodes:[], links:[]});
    this.view  = view  || new new underlayView(this._model);
}

underlayController.prototype.getModel = function() {
    return this.model;
}

underlayController.prototype.getView = function() {
    return this.view;
}

underlayController.prototype.getModelData = function(cfg) {
    var data   = this.getView().getPostDataFromHashParams();
    var _this  = this;
    var tmpCfg = {
        url      : "/api/tenant/networking/underlay-topology",
        type     : "GET",
        data     : data,
        callback : function (response) {
            _this.getView().resetTopology();
            _this.getModel().setNodes(response['nodes']);
            _this.getModel().setLinks(response['links']);
            _this.getModel().updateChassisType(response['nodes']);
            _this.getModel().categorizeNodes(response['nodes']);
            _this.getView().renderTopology(response);
        }
    };
    if(null !== cfg && typeof cfg !== "undefined")
        this.getModel().getData(cfg);
    else
        this.getModel().getData(tmpCfg);
}

underlayController.prototype.destroy = function() {
    //tbd
}