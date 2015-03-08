/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-graph-model',
    'joint',
    'graph-view'
], function (_, Backbone, ContrailGraphModel, Joint, GraphView) {
    var NetworkingGraphView = Backbone.View.extend({
        render: function () {
            var graphTemplate = contrail.getTemplate4Id(cowc.TMPL_NETWORKING_GRAPH_VIEW),
                viewConfig = this.attributes.viewConfig,
                connectedGraph = viewConfig['connectedGraph'],
                configGraph = viewConfig['configGraph'],
                selectorId = '#networking-graph',
                connectedSelectorId = '#graph-connected-elements',
                configSelectorId = '#graph-config-elements';

            this.$el.html(graphTemplate);

            this.renderConfigGraph(configGraph, configSelectorId);
            this.renderConnectedGraph(connectedGraph, selectorId, connectedSelectorId, configSelectorId);
        },

        renderConnectedGraph: function (graphConfig, selectorId, connectedSelectorId, configSelectorId) {
            var cGraphModelConfig = $.extend(true, {}, graphConfig, {
                forceFit: true,
                generateElementsFn: getElements4ConnectedGraphFn(graphConfig, selectorId)
            });

            var cGraphViewConfig = {
                el: $(connectedSelectorId),
                graphModelConfig: cGraphModelConfig,
                tooltipConfig: ctwgrc.getTooltipConfig(),
                clickEvents: {
                //    'blank:pointerclick': cgBlankPointerClick,
                    'cell:pointerdblclick': cgPointerDblClick,
                    'cell:rightclick': ctwgrc.getContextMenuConfig()
                },
                successCallback: function (connectedGraphView, directedGraphSize, jointObject) {
                    $(selectorId).parent().find('.graph-loading').remove(); // TODO - move class name to constants

                    connectedGraphView.setDimensions((($(selectorId).width() > directedGraphSize.width) ? $(selectorId).width() : directedGraphSize.width) + GRAPH_MARGIN, directedGraphSize.height + GRAPH_MARGIN, 1);
                    $(connectedSelectorId).data('actual-size', directedGraphSize);
                    $(connectedSelectorId).data('offset', {x: 0, y: 0});

                    $(selectorId).data('joint-object', jointObject);
                    adjustNetworkingGraphHeight(selectorId, connectedSelectorId, configSelectorId);
                    //TODO: Make control panel as a common view to grid and graph
                    initNetworkingGraphControlEvents(selectorId, connectedSelectorId, configSelectorId);
                    highlightSelectedElementForZoomedElement(connectedSelectorId, jointObject, graphConfig)
                }
            };

            var connectedGraphView = new GraphView(cGraphViewConfig);
            connectedGraphView.render();
        },

        renderConfigGraph: function (graphConfig, configSelectorId) {
            var confGraphModelConfig = $.extend(true, {}, graphConfig, {
                forceFit: false,
                generateElementsFn: getElements4ConfigGraph
            });

            var confGraphViewConfig = {
                el: $(configSelectorId),
                width: 150,
                graphModelConfig: confGraphModelConfig
            };

            var configGraphView = new GraphView(confGraphViewConfig);
            configGraphView.render()
        }
    });

    var getElements4ConnectedGraphFn = function (graphconfig, selectorId) {
        var focusedElement = graphconfig.focusedElement,
            fqName = graphconfig.elementNameObject.fqName;

        return function (response, elementMap) {
            var connectedElements = [],
                zoomedElements = [],
                nodes = response['nodes'],
                zoomedNodeElement = null,
                links = response['links'],
                zoomedNode = null;

            if (focusedElement == 'Project') {
                createNodeElements(nodes, connectedElements, elementMap);
            } else {
                var zoomedNodeKey = null,
                    options = null;

                $.each(nodes, function (nodeKey, nodeValue) {
                    if (nodeValue.name == fqName) {
                        zoomedNode = nodeValue;
                        zoomedNodeKey = nodeKey;

                        options = getZoomedVMSize($(selectorId).height(), $(selectorId).width(), nodeValue);

                        zoomedNodeElement = createCloudZoomedNodeElement(zoomedNode, {
                            width: options['widthZoomedElement'],
                            height: options['heightZoomedElement']
                        });

                        connectedElements.push(zoomedNodeElement);
                        elementMap.node[fqName] = zoomedNodeElement.id;

                        generateVMGraph(zoomedElements, zoomedNodeElement, options);
                    }
                });

                nodes.splice(zoomedNodeKey, 1);

                createNodeElements(nodes, connectedElements, elementMap);

            }
            createLinkElements(links, connectedElements, elementMap);

            return {
                elements: connectedElements,
                nodes: nodes,
                links: links,
                zoomedNodeElement: zoomedNodeElement,
                zoomedElements: zoomedElements
            };
        };
    };

    function generateVMGraph(zoomedElements, zoomedNodeElement, options) {
        var vmMargin = options['VMMargin'],
            vmWidth = options['VMWidth'],
            vmHeight = options['VMHeight'],
            xSeparation = vmWidth + vmMargin,
            ySeparation = vmHeight + vmMargin,
            vmPerRow = options['vmPerRow'],
            vmLength = options['noOfVMsToDraw'],
            vmNode, vmList = options['vmList'];

        var xOrigin = vmMargin / 2,
            yOrigin = vmMargin / 2;

        var centerLineHeight = 0.1,
            xFactor = 0, yFactor = -1;

        for (var i = 0; i < vmLength; i++) {
            if (i % vmPerRow == 0) {
                xFactor = 0;
                yFactor++;
            }
            vmNode = createVirtualMachine(xOrigin + (xSeparation * xFactor), yOrigin + ((ySeparation + centerLineHeight) * yFactor), vmList[i], options['srcVNDetails']);
            xFactor++;
            zoomedElements.push(vmNode);
        }

        function createVirtualMachine(x, y, node, srcVNDetails) {
            var nodeType = 'virtual-machine',
                element, options;

            options = {
                position: {x: x, y: y},
                size: {width: vmWidth, height: vmHeight},
                font: {
                    iconClass: 'icon-contrail-virtual-machine'
                },
                nodeDetails: {
                    fqName: node,
                    srcVNDetails: srcVNDetails
                }
            };
            element = new ContrailElement(nodeType, options);
            return element;
        };

        return zoomedElements;
    };

    function getElements4ConfigGraph(response, elementMap) {
        var configElements = [],
            collections = {},
            configData = response['configData'],
            configSVGHeight = 0;

        createNodes4ConfigData(configData, collections);

        configSVGHeight = createCollectionElements(collections, configElements, elementMap);

        return {
            elements: configElements,
            configSVGHeight: configSVGHeight
        };
    };


    function adjustNetworkingGraphHeight(selectorId, connectedSelectorId, configSelectorId) {
        /*
         * Height logic (svgHeight[s], topologyHeight[t], minHeight[m])
         * t < m     = m
         * s < m < t = m
         * m < s < t = s
         * m < t < s = t
         */

        var resizeFlag = ($(selectorId).parents('.visualization-container').find('.icon-resize-small').is(':visible')),
            tabHeight = resizeFlag ? 155 : 435,
            minHeight = 300,
            graphHeight = window.innerHeight - tabHeight,
            connectedElementsHeight = ($(connectedSelectorId).data('actual-size').height) ? $(connectedSelectorId).data('actual-size').height : 0,
            svgHeight = Math.max(connectedElementsHeight, $(configSelectorId + ' svg').attr('height')),
            elementHeight = resizeFlag ? graphHeight : ((graphHeight < minHeight) ? minHeight : ((svgHeight < graphHeight) ? ((svgHeight < minHeight) ? minHeight : svgHeight) : graphHeight));

        $(selectorId).parent().height(elementHeight);
        $(selectorId).find('.col1').height(elementHeight);
        $(connectedSelectorId + ' svg').attr('height', elementHeight);
        $(selectorId).parent().css('width', '100%');
        $(selectorId).parents('.visualization-container').find('.col3').height(elementHeight);

        // Adding dotted image SVG TODO - make a separate function to handle this
        var image = document.createElementNS('http://www.w3.org/2000/svg', 'image'),
            patt = document.createElementNS('http://www.w3.org/2000/svg', 'pattern'),
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
            svg = document.getElementsByTagName('svg')[0];

        patt.setAttribute('id', 'dotted');
        patt.setAttribute('patternUnits', 'userSpaceOnUse');
        patt.setAttribute('width', '100');
        patt.setAttribute('height', '100');

        image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/img/dotted.png');
        image.setAttribute('x', '0');
        image.setAttribute('y', '0');
        image.setAttribute('width', '101');
        image.setAttribute('height', '101');

        patt.appendChild(image);
        defs.appendChild(patt);
        svg.appendChild(defs);

        translateNetworkingGraphElements(selectorId, connectedSelectorId);
    };

    function translateNetworkingGraphElements(selectorId, connectedSelectorId) {
        var connectedGraphSize = $(connectedSelectorId).data('actual-size'),
            oldOffset = $(connectedSelectorId).data('offset'),
            offset = {
                x: ($(selectorId).find('.col1').width() > connectedGraphSize.width) ? ($(selectorId).find('.col1').width() - connectedGraphSize.width - GRAPH_MARGIN) / 2 : 0,
                y: ($(selectorId).find('.col1').height() > connectedGraphSize.height) ? ($(selectorId).find('.col1').height() - connectedGraphSize.height - GRAPH_MARGIN) / 2 : 0
            },
            connectedGraph = $(selectorId).data('joint-object').connectedGraph,
            elements = connectedGraph.getElements(),
            links = connectedGraph.getLinks();
        $(connectedSelectorId).data('offset', offset);

        $.each(elements, function (elementKey, elementValue) {
            //TODO: Fix getStroke error in joint.clean
            elementValue.translate(offset.x - oldOffset.x, offset.y - oldOffset.y);
        });
    };

    function initNetworkingGraphControlEvents(selectorId, connectedSelectorId, configSelectorId) {
        var graphControlElement = $(selectorId).find('.graph-controls');

        /* Pan and Zoom events */
        $(connectedSelectorId).panzoom({
            increment: 0.3,
            minScale: 0.3,
            maxScale: 2,
            duration: 300,
            $zoomIn: graphControlElement.find(".zoom-in"),
            $zoomOut: graphControlElement.find(".zoom-out"),
            $reset: graphControlElement.find(".zoom-reset")
        });

        /* Resize Events */
        graphControlElement.find('.resize')
            .off('click')
            .on('click', function (event) {
                $(this).find('i').toggleClass('icon-resize-full').toggleClass('icon-resize-small');
                adjustNetworkingGraphHeight(selectorId, connectedSelectorId, configSelectorId);
            }
        );
    };

    function cgBlankPointerClick(evt, x, y) {
        $('g').popover('hide');
    };

    function cgPointerDblClick(cellView, evt, x, y) {
        var dblClickedElement = cellView.model,
            elementType = dblClickedElement['attributes']['type'];
        //elementMap = params.data.elementMap;
        switch (elementType) {
            case 'contrail.VirtualNetwork':
                loadFeature({
                    p: 'mon_networking_networks',
                    q: {
                        fqName: dblClickedElement['attributes']['nodeDetails']['name'],
                        view: 'details',
                        type: 'network'
                    }
                });
                $('g.VirtualNetwork').popover('hide');
                break;
            //case 'link': // TODO
            //    var modelId = dblClickedElement.id;
            //
            //    var graph = jointObject.connectedGraph,
            //        targetElement = graph.getCell(elementMap.node[dblClickedElement['attributes']['linkDetails']['dst']]),
            //        sourceElement = graph.getCell(elementMap.node[dblClickedElement['attributes']['linkDetails']['src']]);
            //
            //    if (targetElement && sourceElement) {
            //        highlightElementsToFaint([
            //            $(selectorId + '-connected-elements').find('div.font-element')
            //        ]);
            //
            //        highlightSVGElementsToFaint([
            //            $(selectorId + '-connected-elements').find('g.element'),
            //            $(selectorId + '-connected-elements').find('g.link')
            //        ]);
            //
            //        $('g.link[model-id="' + modelId + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');
            //
            //        loadVisualizationTab({
            //            container: '#topology-visualization-tabs',
            //            type: "connected-network",
            //            context: "connected-nw",
            //            sourceElement: sourceElement,
            //            targetElement: targetElement,
            //            fqName: targetElement['attributes']['nodeDetails']['name'],
            //            selfElement: dblClickedElement
            //        });
            //    }
            //    break;
            case 'contrail.VirtualMachine':
                var srcVN = dblClickedElement.attributes.nodeDetails.srcVNDetails.name;
                loadFeature({
                    p: 'mon_networking_instances',
                    q: {
                        uuid: dblClickedElement['attributes']['nodeDetails']['fqName'],
                        vn: srcVN,
                        type: 'instance',
                        view: 'details'
                    }
                });
                $('g.VirtualMachine').popover('hide');
                break;

        }
    };

    var highlightSelectedElementForZoomedElement = function(connectedSelectorId, jointObject, graphConfig) {
        highlightSelectedSVGElements([$('g.ZoomedElement')]);
        if (graphConfig.focusedElement == 'Network') {
            highlightSelectedElements([$('div.VirtualMachine')]);
            highlightSelectedSVGElements([$('g.VirtualMachine'), $('.VirtualMachineLink')]);
        }
        else if (graphConfig.focusedElement == 'Instance') {
            highlightElementsToFaint([
                $(connectedSelectorId).find('div.font-element')
            ]);

            highlightSVGElementsToFaint([
                $(connectedSelectorId).find('g.element'),
                $(connectedSelectorId).find('g.link')
            ]);
            var graphElements = jointObject.connectedGraph.getElements(),
                vmFqName = graphConfig.elementNameObject.instanceUUID;

            $.each(graphElements, function (graphElementKey, graphElementValue) {
                if (graphElementValue.attributes.type == 'contrail.VirtualMachine' && graphElementValue.attributes.nodeDetails.fqName == vmFqName) {
                    var modelId = graphElementValue.id;
                    vmLinks = jointObject.connectedGraph.getConnectedLinks(graphElementValue);

                    $('g.VirtualNetwork').find('rect').addClassSVG('faintHighlighted').removeClassSVG('elementSelectedHighlighted');
                    $('g[model-id="' + modelId + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');
                    $('div.font-element[font-element-model-id="' + modelId + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');

                    $.each(vmLinks, function (vmLinkKey, vmLinkValue) {
                        $('g.link[model-id="' + vmLinkValue.id + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');
                    });
                }
            });
        }
    };

    return NetworkingGraphView;
});