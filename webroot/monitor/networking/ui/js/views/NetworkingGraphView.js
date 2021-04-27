/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-graph-model',
    'graph-view',
    'contrail-element',
    'core-basedir/js/common/graph.utils'
], function (_, ContrailView, ContrailGraphModel, GraphView, ContrailElement, grUtils) {

    var NetworkingGraphView = ContrailView.extend({
        render: function () {
            var self = this,
                graphTemplate = contrail.getTemplate4Id(cowc.TMPL_NETWORKING_GRAPH_VIEW),
                viewConfig = self.attributes.viewConfig,
                connectedGraph = viewConfig['connectedGraph'],
                configGraph = viewConfig['configGraph'],
                selectorId = '#' + ctwl.NETWORKING_GRAPH_ID,
                connectedSelectorId = '#' + ctwl.GRAPH_CONNECTED_ELEMENTS_ID,
                configSelectorId = '#' + ctwl.GRAPH_CONFIG_ELEMENTS_ID,
                graphLoadingSelectorId = '#' + ctwl.GRAPH_LOADING_ID,
                connectedGraphView, connectedGraphModel,
                configGraphView, configGraphModel;

            self.$el.html(graphTemplate());

            // setTimeout(function () {
                connectedGraphView = self.renderConnectedGraph(configGraph, connectedGraph, selectorId, connectedSelectorId, configSelectorId);
                connectedGraphModel = connectedGraphView.model;
                if (contrail.checkIfExist(configGraph)) {
                    configGraphView = self.renderConfigGraph(configGraph, connectedGraph, selectorId, configSelectorId, connectedSelectorId, connectedGraphView);
                    configGraphModel = configGraphView.model;

                    if ((!configGraphModel.isRequestInProgress()
                        && !connectedGraphModel.isRequestInProgress())
                        || (configGraphModel.loadedFromCache && connectedGraphModel.loadedFromCache)) {

                        $(graphLoadingSelectorId).hide();
                    } else {
                        if (configGraphModel.isRequestInProgress()) {
                            configGraphModel.onAllRequestsComplete.subscribe(function () {
                                if (!connectedGraphModel.isRequestInProgress()) {
                                    $(graphLoadingSelectorId).hide();
                                }
                            });
                        }
                        if (connectedGraphModel.isRequestInProgress()) {
                            connectedGraphModel.onAllRequestsComplete.subscribe(function () {
                                if (!configGraphModel.isRequestInProgress()) {
                                    $(graphLoadingSelectorId).hide();
                                }
                            });
                        }
                    }
                } else {
                    if (!connectedGraphModel.isRequestInProgress() || connectedGraphModel.loadedFromCache) {
                        $(graphLoadingSelectorId).hide();
                    } else {
                        connectedGraphModel.onAllRequestsComplete.subscribe(function () {
                            $(graphLoadingSelectorId).hide();
                        });
                    }
                }
            // }, 10);
        },

        renderConnectedGraph: function (configGraph, connectedGraph, selectorId, connectedSelectorId, configSelectorId) {
            var connectedGraphView = new GraphView(getConnectedGraphViewConfig(configGraph, connectedGraph, selectorId, connectedSelectorId, configSelectorId, this));
            connectedGraphView.render();
            return connectedGraphView;
        },

        renderConfigGraph: function (configGraph, connectedGraph, selectorId, configSelectorId, connectedSelectorId, connectedGraphView) {
            var self = this,
                confGraphModelConfig = $.extend(true, {}, configGraph, {
                forceFit: false,
                generateElementsFn: getElements4ConfigGraph
            });

            var confGraphViewConfig = {
                el: $(configSelectorId),
                width: 150,
                graphModelConfig: confGraphModelConfig,
                tooltipConfig: nmwgrc.getConfigGraphTooltipConfig(),
                clickEvents: {
                    'cell:pointerclick': getConfgPointerClickFn(connectedGraphView)
                },
                successCallback: function (graphView) {
                    var configGraphModel = graphView.model;

                    $(configSelectorId).data('graph-size', {height: configGraphModel.elementsDataObj.configSVGHeight ? configGraphModel.elementsDataObj.configSVGHeight : 0});

                    if (adjustGraphDimension(configGraph, connectedGraph, selectorId, connectedSelectorId, configSelectorId, true)) {
                        onAdjustGraphDimension(configGraph, selectorId, connectedSelectorId, self);
                    }
                }
            };

            var configGraphView = new GraphView(confGraphViewConfig);
            configGraphView.render();
            return configGraphView;
        }
    });

    function getConnectedGraphModelConfig(graphConfig) {
        return $.extend(true, {}, graphConfig, {
            forceFit: true,
            generateElementsFn: getElements4ConnectedGraphFn(graphConfig),
            remote: {
                successCallback: function (response, contrailGraphModel) {
                    if (!contrail.checkIfExist(contrailGraphModel.elementsDataObj)
                        || (contrailGraphModel.attributes.focusedElement.type == ctwc.GRAPH_ELEMENT_PROJECT
                        && contrailGraphModel.elementsDataObj.elements.length == 0)
                        || (contrailGraphModel.attributes.focusedElement.type == ctwc.GRAPH_ELEMENT_NETWORK
                        && (contrailGraphModel.elementsDataObj.zoomedElements.length == 0
                        || contrailGraphModel.elementsDataObj.zoomedNodeElement.attributes.nodeDetails.more_attributes.vm_count == 0))) {

                        contrailGraphModel.empty = true;
                        return false;
                    }
                }
            }
        });
    }

    function getConnectedGraphViewConfig(configGraph, connectedGraph, selectorId, connectedSelectorId, configSelectorId, self) {
        return {
            el: $(connectedSelectorId),
            linkView: joint.shapes.contrail.LinkView,
            async: true,
            graphModelConfig: getConnectedGraphModelConfig(connectedGraph),
            tooltipConfig: nmwgrc.getConnectedGraphTooltipConfig(),
            clickEvents: {
                'cell:pointerclick': getCgPointerClick(self, connectedSelectorId),
                'cell:pointerdblclick': cgPointerDblClick,
                'blank:pointerdblclick': getCgBlankDblClick(self, connectedSelectorId, connectedGraph)
            },
            controlPanel: getControlPanelConfig(self, configGraph, connectedGraph, selectorId, connectedSelectorId, configSelectorId),
            emptyCallback: function (contrailGraphModel) {
                var notFoundTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                    notFoundConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_NOT_FOUND_PAGE, {
                        iconClass: false,
                        defaultErrorMessage: false,
                        defaultNavLinks: false
                    }),
                    blankDblClickFn = getCgBlankDblClick(self, connectedSelectorId, connectedGraph);

                if (!contrail.checkIfExist(contrailGraphModel.elementsDataObj)) {
                    notFoundConfig.title = ctwm.NO_DATA_FOUND;
                } else if (contrailGraphModel.attributes.focusedElement.type == ctwc.GRAPH_ELEMENT_PROJECT && contrailGraphModel.elementsDataObj.elements.length == 0) {
                    notFoundConfig.title = ctwm.NO_NETWORK_FOUND;
                } else if (contrailGraphModel.attributes.focusedElement.type == ctwc.GRAPH_ELEMENT_NETWORK) {
                    notFoundConfig.title = ctwm.NO_VM_FOUND;
                }
                $(selectorId).html(notFoundTemplate(notFoundConfig));

                $(selectorId)
                    .off('dblclick', blankDblClickFn)
                    .on('dblclick', blankDblClickFn);
            },
            failureCallback: function (contrailGraphModel) {
                var xhr = contrailGraphModel.errorList[0],
                    notFoundTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                    notFoundConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ERROR_PAGE, {errorMessage: xhr.responseText}),
                    blankDblClickFn = getCgBlankDblClick(self, connectedSelectorId, connectedGraph);

                if (!(xhr.status === 0 && xhr.statusText === 'abort')) {
                    $(selectorId).html(notFoundTemplate(notFoundConfig));

                    $(selectorId)
                        .off('dblclick', blankDblClickFn)
                        .on('dblclick', blankDblClickFn);
                }
            },
            successCallback: function (graphView) {
                var connectedGraphModel = graphView.model,
                    directedGraphSize = connectedGraphModel.directedGraphSize;


                $(connectedSelectorId).data('graph-size', directedGraphSize);
                $(connectedSelectorId).data('graphView', graphView);

                if (adjustGraphDimension(configGraph, connectedGraph, selectorId, connectedSelectorId, configSelectorId, true)) {
                    onAdjustGraphDimension(connectedGraph, selectorId, connectedSelectorId, self);
                }
            }
        }
    }

    function getControlPanelConfig(connectedGraphSelf, configGraph, connectedGraph, selectorId, connectedSelectorId, configSelectorId) {
        return {
            default: {
                zoom: {
                    enabled: true,
                    selectorId: connectedSelectorId,
                    config: {
                        focalZoom: true,
                        onReset: function () {
                            var focusedElement = connectedGraph.focusedElement;
                            panConnectedGraph2Center(focusedElement, connectedSelectorId);
                            $(configSelectorId).panzoom('resetPan');
                        }
                    }
                }
            },
            custom: {
                resize: {
                    iconClass: 'fa fa-expand',
                    title: 'Resize',
                    events: {
                        click: function (e, self, controlPanelSelector) {
                            $(self).find('i').addClass('fa fa-spin fa-spinner');
                            setTimeout(function () {
                                $(self).find('i').removeClass('fa-spin fa-spinner');
                                $(self).find('i').toggleClass('fa-expand').toggleClass('fa-compress');
                                adjustGraphDimension(configGraph, connectedGraph, selectorId, connectedSelectorId, configSelectorId, false);
                                $(connectedSelectorId).panzoom('reset');
                                $(controlPanelSelector).find('.control-panel-item').removeClass('disabled');
                                $(self).removeClass('refreshing');
                            }, 200);
                        }
                    }
                },
                realign: {
                    iconClass: function (graphView) {
                        var rankDir = graphView.model.rankDir;
                        return ((rankDir == ctwc.GRAPH_DIR_TB) ? 'fa fa-bars fa-rotate-90' : 'fa fa-bars');
                    },
                    title: 'Change Direction',
                    events: {
                        click: function (e, self, controlPanelSelector) {
                            var connectedGraphView = $(connectedSelectorId).data('graphView'),
                                connectedGraphModel = connectedGraphView.model;

                            setLoadingScreen(connectedGraphModel);
                            if ($(self).find('i').hasClass('fa-rotate-90')) {
                                $(self).find('i').removeClass('fa-rotate-90').toggleClass('fa-spin fa-spinner');
                                setTimeout(function () {
                                    connectedGraphModel.reLayoutGraph(ctwc.GRAPH_DIR_LR);
                                    //Hack to set width for Webkit browser
                                    var width = $(connectedSelectorId + ' svg').attr('width');
                                    $(connectedSelectorId + ' svg').attr('width', width);
                                }, 200)
                            } else if ($(self).find('i').hasClass('fa-bars')) {
                                $(self).find('i').removeClass('fa-bars').toggleClass('fa-spin fa-spinner');
                                setTimeout(function () {
                                    connectedGraphModel.reLayoutGraph(ctwc.GRAPH_DIR_TB);
                                    var width = $(connectedSelectorId + ' svg').attr('width');
                                    $(connectedSelectorId + ' svg').attr('width', width);
                                }, 200);
                            }
                        }
                    }
                },
                search: {
                    iconClass: 'fa fa-search',
                    title: 'Search',
                    events: {
                        click: function (e, self, controlPanelSelector) {
                            var connectedGraphView = $(connectedSelectorId).data('graphView'),
                                connectedGraphModel = connectedGraphView.model,
                                chartControlPanelExpandedSelector = $(selectorId).find('.control-panel-expanded-container'),
                                controlPanelExpandedTemplateConfig = {},
                                elementMap = connectedGraphModel.elementMap,
                                nodeSearchDropdownData = connectedGraphModel.nodeSearchDropdownData;

                            if (chartControlPanelExpandedSelector.find('.control-panel-filter-container').length == 0) {
                                var controlPanelExpandedTemplate = contrail.getTemplate4Id(ctwc.TMPL_GRAPH_CONTROL_PANEL_SEARCH);

                                chartControlPanelExpandedSelector.html(controlPanelExpandedTemplate(controlPanelExpandedTemplateConfig));
                            }

                            $(self).toggleClass('active');
                            $(self).toggleClass('refreshing');

                            chartControlPanelExpandedSelector.toggleElement();

                            if (chartControlPanelExpandedSelector.is(':visible')) {
                                if (!contrail.checkIfExist(nodeSearchDropdownData)) {

                                    nodeSearchDropdownData = $.map(elementMap.node, function (value, name) {
                                        var nameArray = name.split(':'),
                                            nameLength = nameArray.length;

                                        return {
                                            name: nameArray[nameLength - 1],
                                            value: name
                                        };
                                    });

                                    connectedGraphModel.nodeSearchDropdownData = nodeSearchDropdownData;
                                }

                                chartControlPanelExpandedSelector.find('.graph-control-panel-search-dropdown').contrailDropdown({
                                    placeholder: 'Search',
                                    dataTextField: 'name',
                                    dataValueField: 'value',
                                    data: nodeSearchDropdownData,
                                    selecting: function (e) {

                                        var elementName = e.object['value'],
                                            elementObj = connectedGraphModel.getCell(elementMap.node[elementName]);

                                        $(connectedSelectorId).panzoom("reset");
                                        panConnectedGraph2Element(elementObj, connectedSelectorId);
                                        showClickedElement(connectedGraphSelf, elementObj, connectedSelectorId);
                                    }
                                })

                            } else {
                                $(controlPanelSelector).find('.control-panel-item').removeClass('disabled');
                            }
                        }
                    }
                },
                refresh: {
                    iconClass: 'fa fa-repeat',
                    title: 'Refresh',
                    events: {
                        click: function (e, self, controlPanelSelector) {
                            var connectedGraphView = $(connectedSelectorId).data('graphView'),
                                connectedGraphModel = connectedGraphView.model;

                            setLoadingScreen(connectedGraphModel);
                            if ($(self).find('i').hasClass('fa-repeat')) {
                                $(self).find('i').removeClass('fa-repeat').toggleClass('fa-spin fa-spinner');
                                connectedGraphView.refreshData();
                            }
                        }
                    }
                }
            }
        };
    };

    function setLoadingScreen(connectedGraphModel) {
        var graphLoadingSelectorId = '#' + ctwl.GRAPH_LOADING_ID;
        $(graphLoadingSelectorId).show();

        connectedGraphModel.onAllRequestsComplete.subscribe(function () {
            $(graphLoadingSelectorId).hide();
        });
    }

    function getElements4ConnectedGraphFn(graphconfig) {
        var focusedElementType = graphconfig.focusedElement.type,
            fqName = decodeURIComponent(graphconfig.focusedElement.name.fqName);

        return function (response, elementMap, rankDir) {
            var elements4ConnectedGraph = [],
                nodes = response['nodes'],
                zoomedNodeElement = null, zoomedElements = [], zoomedNodeKey = null,
                links = response['links'];

            if (focusedElementType == ctwc.GRAPH_ELEMENT_PROJECT) {
                createNodeElements(nodes, elements4ConnectedGraph, elementMap);
                createLinkElements(links, elements4ConnectedGraph, elementMap);

                var linkedElements = elementMap['linkedElements'],
                    nodeSeparation = 100, groupedElements = [],
                    groupedElementsCount, maxRowCount,
                    groupedParentWidth, groupedParentHeight;

                if (linkedElements.length > 0) {
                    return {
                        elements: elements4ConnectedGraph,
                        nodes: nodes,
                        links: links,
                        zoomedNodeElement: zoomedNodeElement,
                        zoomedElements: zoomedElements
                    };
                } else {
                    groupedElements = elements4ConnectedGraph;
                    groupedElementsCount = groupedElements.length;
                    maxRowCount = Math.ceil(Math.sqrt(groupedElementsCount));
                    groupedParentWidth = maxRowCount * nodeSeparation;
                    groupedParentHeight = maxRowCount * nodeSeparation;

                    for (var i = 0; i < groupedElements.length; i++) {
                        var groupedElement = groupedElements[i],
                            position = getGroupedElementPosition(i, maxRowCount, nodeSeparation);

                        groupedElement.attributes.position.x = position.x;
                        groupedElement.attributes.position.y = position.y;
                    }

                    if (groupedElements.length > 0) {
                        var groupParentElement = new joint.shapes.contrail.GroupParentElement({
                            size: {width: groupedParentWidth, height: groupedParentHeight}
                        });

                        linkedElements.push(groupParentElement);
                    }

                    return {
                        elements: linkedElements,
                        nodes: nodes,
                        links: links,
                        zoomedNodeElement: groupParentElement,
                        zoomedElements: groupedElements
                    };
                }

            } else if (focusedElementType == ctwc.GRAPH_ELEMENT_NETWORK) {
                $.each(nodes, function (nodeKey, nodeValue) {
                    if (nodeValue.name === fqName) {
                        zoomedNodeKey = nodeKey;
                        zoomedNodeElement = createZoomedVNNode(nodeValue, getZoomedVNSize(rankDir, nodeValue));
                        zoomedElements = generateVMGraph(rankDir, zoomedNodeElement, nodeValue, elementMap, elements4ConnectedGraph);

                        return;
                    }
                });

                nodes.splice(zoomedNodeKey, 1);
                createNodeElements(nodes, elements4ConnectedGraph, elementMap);
                createLinkElements(links, elements4ConnectedGraph, elementMap);

                return {
                    elements: elements4ConnectedGraph,
                    nodes: nodes,
                    links: links,
                    zoomedNodeElement: zoomedNodeElement,
                    zoomedElements: zoomedElements
                };
            } else if (focusedElementType == ctwc.GRAPH_ELEMENT_INSTANCE) {
                createNodeElements(nodes, elements4ConnectedGraph, elementMap);
                createInterfaceLink(links, elements4ConnectedGraph, elementMap);

                return {
                    elements: elements4ConnectedGraph,
                    nodes: nodes,
                    links: links,
                    zoomedNodeElement: zoomedNodeElement,
                    zoomedElements: zoomedElements
                };
            }
        };
    };

    function getGroupedElementPosition(index, maxRowCount, nodeSeparation) {
        index = index + 1;

        var row = Math.floor(index / maxRowCount),
            column = index % maxRowCount;

        return {
            x: nodeSeparation * (column == 0 ? (maxRowCount - 1) : (column - 1)),
            y: nodeSeparation * (column == 0 ? (row - 1) : row)
        }
    };

    function getElements4ConfigGraph(response, elementMap) {
        var elements4ConfigGraph = [],
            collections = {},
            configData = response['configData'],
            configSVGHeight = 0;

        createNodes4ConfigData(configData, collections);

        configSVGHeight = createCollectionElements(collections, elements4ConfigGraph, elementMap);

        return {
            elements: elements4ConfigGraph,
            configSVGHeight: configSVGHeight
        };
    };

    function adjustGraphDimension(configGraph, connectedGraph, selectorId, connectedSelectorId, configSelectorId, initResizeFlag) {
        /*
         * Condition to check if config and connected graph exists and if exists, are loaded
         */
        if ((!contrail.checkIfExist(configGraph) || contrail.checkIfExist($(configSelectorId).data('graph-size'))) &&
            (!contrail.checkIfExist(connectedGraph) || contrail.checkIfExist($(connectedSelectorId).data('graph-size')))) {
            var resizeFlag = ($(selectorId).parents('.visualization-container').find('.fa-compress').is(':visible')),
                tabHeight = resizeFlag ? 140 : 510, //TODO - move to constants
                minHeight = 275,
                availableHeight = window.innerHeight - tabHeight,
                connectedGraphSize = $(connectedSelectorId).data('graph-size'),
                configGraphSize = $(configSelectorId).data('graph-size'),
                connectedGraphView = $(connectedSelectorId).data('graphView');

            if (!contrail.checkIfExist(connectedGraphView)) {
                return;
            }

            var connectedGraphWidth = contrail.checkIfKeyExistInObject(true, connectedGraphSize, 'width') ? connectedGraphSize.width : 0,
                connectedGraphHeight = contrail.checkIfKeyExistInObject(true, connectedGraphSize, 'height') ? connectedGraphSize.height : 0,
                configGraphHeight = contrail.checkIfKeyExistInObject(true, configGraphSize, 'height') ? configGraphSize.height : 0,
                actualGraphHeight = Math.max(configGraphHeight, (connectedGraphHeight - cowc.GRAPH_MARGIN_BOTTOM - cowc.GRAPH_MARGIN_TOP)),
                adjustedHeight = availableHeight;

            if (!resizeFlag) {
                if (availableHeight < minHeight) {
                    adjustedHeight = minHeight;
                } else {
                    if (actualGraphHeight < minHeight) {
                        adjustedHeight = minHeight;
                    } else {
                        if (actualGraphHeight < availableHeight) {
                            adjustedHeight = actualGraphHeight;
                        }
                    }
                }
            }

            if (initResizeFlag && ((actualGraphHeight - adjustedHeight) > 20)) {
                $(selectorId).parents('.visualization-container').find('.fa-expand')
                    .removeClass('fa-expand').addClass('fa fa-compress');

                adjustedHeight = window.innerHeight - 140;
            }

            connectedGraphView.setDimensions(connectedGraphWidth, connectedGraphHeight, 1);

            $(connectedSelectorId).width(connectedGraphWidth);

            $(selectorId).parent().height(adjustedHeight);
            $(selectorId).parent().css('width', '100%');

            $(connectedSelectorId).parents('.col1').height(adjustedHeight);
            $(configSelectorId).parents('.col2').height(adjustedHeight + 5);

            if (connectedGraphHeight < adjustedHeight) {
                $(connectedSelectorId + ' svg').attr('height', adjustedHeight);
            }

            if (configGraphHeight < adjustedHeight) {
                $(configSelectorId + ' svg').attr('height', configGraphHeight);
            }

            return true;
        }
        return false;
    };

    /*
     * Function to perform actions (panning to center, highlighting focused element etc) after adjustGraphDimension
     */
    function onAdjustGraphDimension(graphConfig, selectorId, connectedSelectorId, self) {
        var connectedGraphView = $(connectedSelectorId).data('graphView'),
            connectedGraphModel = connectedGraphView.model,
            currentHashParams = layoutHandler.getURLHashParams(),
            focusedElement = graphConfig.focusedElement,
            elementMap = connectedGraphModel.elementMap,
            elementObj;

        panConnectedGraph2Center(focusedElement, connectedSelectorId);

        highlightElement4ZoomedElement(connectedSelectorId, graphConfig);

        if (contrail.checkIfExist(currentHashParams.clickedElement)) {
            elementObj = connectedGraphModel.getCell(elementMap.node[currentHashParams.clickedElement.fqName]);
            panConnectedGraph2Element(elementObj, connectedSelectorId);
            showClickedElement(self, elementObj, connectedSelectorId);
        } else if (focusedElement.type == ctwc.GRAPH_ELEMENT_PROJECT) {
            removeFaint4AllElements();
            removeHighlight4AllElements();
        }

        if (!$(selectorId).find('.refresh i').hasClass('fa-repeat')) {
            setTimeout(function () {
                $(selectorId).find('.refresh i').removeClass('fa-spin fa-spinner').addClass('fa fa-repeat');
            }, 200);
        }
    }

    function panConnectedGraph2Center(focusedElement, connectedSelectorId) {
        var directedGraphSize = $(connectedSelectorId).data('graph-size'),
            connectedGraphWidth = contrail.checkIfKeyExistInObject(true, directedGraphSize, 'width') ? directedGraphSize.width : 0,
            connectedGraphHeight = contrail.checkIfKeyExistInObject(true, directedGraphSize, 'height') ? directedGraphSize.height : 0,
            availableGraphWidth = $(connectedSelectorId).parents('.col1').width(),
            availableGraphHeight = $(connectedSelectorId).parents('.col1').height(),
            actualConnectedGraphWidth = connectedGraphWidth - cowc.GRAPH_MARGIN_LEFT - cowc.GRAPH_MARGIN_RIGHT,
            actualConnectedGraphHeight = connectedGraphHeight - cowc.GRAPH_MARGIN_BOTTOM - cowc.GRAPH_MARGIN_TOP,
            panX = (availableGraphWidth - connectedGraphWidth) / 2,
            panY = (availableGraphHeight - connectedGraphHeight) / 2,
            zoomFocal, zoomScale, zoomScaleX = 1, zoomScaleY = 1;

        if (actualConnectedGraphHeight > availableGraphHeight) {
            //if (focusedElement.type == ctwc.GRAPH_ELEMENT_PROJECT) {
            //    panY = 35 - cowc.GRAPH_MARGIN_TOP;
            //}
            zoomScaleX = availableGraphHeight / actualConnectedGraphHeight;
        }

        if (actualConnectedGraphWidth > availableGraphWidth) {
            //if (focusedElement.type == ctwc.GRAPH_ELEMENT_PROJECT) {
            //    panX = 35 - cowc.GRAPH_MARGIN_LEFT;
            //}
            zoomScaleY = availableGraphWidth / actualConnectedGraphWidth;
        }

        zoomScale = Math.min(zoomScaleX, zoomScaleY);

        $(connectedSelectorId).panzoom("resetPan");
        $(connectedSelectorId).panzoom("pan", panX, panY, {relative: true});
        $(connectedSelectorId).css({'backface-visibility': 'initial'});

        //Safari related hack to orient the graph correctly
        $(connectedSelectorId).redraw();
    };

    function panConnectedGraph2Element(elementObj, connectedSelectorId) {
        if (contrail.checkIfExist(elementObj)) {
            var availableGraphWidth = $(connectedSelectorId).parents('.col1').width(),
                availableGraphHeight = $(connectedSelectorId).parents('.col1').height(),
                panX = (availableGraphWidth / 2) - (elementObj.attributes.position.x + (elementObj.attributes.size.width / 2)),
                panY = (availableGraphHeight / 2) - (elementObj.attributes.position.y + (elementObj.attributes.size.height / 2));

            $(connectedSelectorId).panzoom("resetPan");
            $(connectedSelectorId).panzoom("pan", panX, panY, {relative: true});
        }
    }

    function createZoomedVNNode(nodeDetails, size) {
        var zoomedVNNode = new joint.shapes.contrail.ZoomedVirtualNetwork({
            size: size,
            attrs: {
                rect: size,
                text: {
                    text: contrail.truncateText(nodeDetails['name'].split(":")[2], 20),
                    'ref-x': .5,
                    'ref-y': -20
                }
            },
            elementType: ctwc.GRAPH_ELEMENT_NETWORK
        });
        zoomedVNNode['attributes']['nodeDetails'] = nodeDetails;
        return zoomedVNNode;
    }

    function createVMNode(position, size, vmName, srcVNDetails, uve, elementOrientation) {
        var nodeType = ctwc.GRAPH_ELEMENT_INSTANCE,
            element, options,
            iconClass = 'icon-contrail-virtual-machine', interfaceCount = 0;

        if (contrail.checkIfExist(uve)) {
            interfaceCount = uve.UveVirtualMachineAgent.interface_list.length;
            iconClass += (interfaceCount > 1) ? '-interface' : '';
        }

        iconClass += (contrail.checkIfExist(elementOrientation) ? '-' + elementOrientation : '');

        options = {
            type: 'contrail.VirtualMachine.no-drag-element',
            position: position,
            size: size,
            font: {
                iconClass: iconClass
            },
            nodeDetails: {
                fqName: vmName,
                srcVNDetails: srcVNDetails,
                uve: uve
            },
            elementType: nodeType
        };
        element = new ContrailElement(nodeType, options);
        return element;
    };

    function createVMCenterLink(position, size) {
        var rect = new joint.shapes.basic.Rect({
            type: 'VirtualMachineLink no-drag-element',
            position: position, size: size,
            attrs: {rect: {stroke: '#3182bd', opacity: 1, fill: '#3182bd'}}
        });
        return rect;
    };

    function getZoomedVNSize(rankDir, zoomedVNDetails) {
        var vmCount = zoomedVNDetails.more_attributes.vm_count,
            vmWidth = ctwc.VM_GRAPH_SIZE.width + ctwc.VM_GRAPH_MARGIN.left + ctwc.VM_GRAPH_MARGIN.right,
            vmHeight = ctwc.VM_GRAPH_SIZE.height + ctwc.VM_GRAPH_MARGIN.top + ctwc.VM_GRAPH_MARGIN.bottom,
            zoomedVNWidth, zoomedVNHeight;

        if (rankDir == ctwc.GRAPH_DIR_TB) {
            zoomedVNWidth = vmHeight * ((vmCount > 1) ? 2 : 1);
            zoomedVNHeight = ((vmCount < ctwc.MAX_VM_TO_PLOT) ? vmCount : ctwc.MAX_VM_TO_PLOT) * vmWidth;
        } else if (rankDir == ctwc.GRAPH_DIR_LR) {
            zoomedVNWidth = ((vmCount < ctwc.MAX_VM_TO_PLOT) ? vmCount : ctwc.MAX_VM_TO_PLOT) * vmWidth;
            zoomedVNHeight = vmHeight * ((vmCount > 1) ? 2 : 1);
        }

        return {
            width: zoomedVNWidth + ctwc.ZOOMED_VN_MARGIN.left + ctwc.ZOOMED_VN_MARGIN.right,
            height: zoomedVNHeight + ctwc.ZOOMED_VN_MARGIN.top + ctwc.ZOOMED_VN_MARGIN.bottom
        };
    }

    function generateVMGraph(rankDir, zoomedNodeElement, nodeValue, elementMap, elements4ConnectedGraph) {
        var zoomedElements = [];
        elements4ConnectedGraph.push(zoomedNodeElement);
        elementMap.node[nodeValue.name] = zoomedNodeElement.id;

        if (rankDir == ctwc.GRAPH_DIR_TB) {
            zoomedElements = generateVerticalVMGraph(zoomedNodeElement, nodeValue, elementMap);
        } else if (rankDir == ctwc.GRAPH_DIR_LR) {
            zoomedElements = generateHorizontalVMGraph(zoomedNodeElement, nodeValue, elementMap);
        }

        return zoomedElements;
    }

    function generateHorizontalVMGraph(zoomedNodeElement, zoomedVNDetails, elementMap) {
        var zoomedElements = [],
            vmCount = zoomedVNDetails.more_attributes.vm_count,
            vmList = zoomedVNDetails.more_attributes.virtualmachine_list,
            vmDetailsMap = zoomedVNDetails.more_attributes.virtualmachine_details,
            vmWidth = ctwc.VM_GRAPH_SIZE.width + ctwc.VM_GRAPH_MARGIN.left + ctwc.VM_GRAPH_MARGIN.right,
            vmHeight = ctwc.VM_GRAPH_SIZE.height + ctwc.VM_GRAPH_MARGIN.top + ctwc.VM_GRAPH_MARGIN.bottom,
            vmToPlot = (vmCount > ctwc.MAX_VM_TO_PLOT) ? ctwc.MAX_VM_TO_PLOT : vmCount,
            vmCenterLinkThickness = ctwc.VM_CENTER_LINK_THICKNESS,
            zoomedVNPositionX = ctwc.ZOOMED_VN_MARGIN.left,
            zoomedVNPositionY = ctwc.ZOOMED_VN_MARGIN.top + ctwc.VM_GRAPH_MARGIN.top,
            vmCenterLinkPosition = {
                x: zoomedVNPositionX,
                y: zoomedVNPositionY + ctwc.VM_GRAPH_SIZE.height
            },
            vmCenterLinkSize = {width: vmToPlot * vmWidth, height: vmCenterLinkThickness},
            vmCenterLinkNode = createVMCenterLink(vmCenterLinkPosition, vmCenterLinkSize),
            vmNode, vmUVE, vmPosition = {};

        zoomedElements.push(vmCenterLinkNode);
        zoomedNodeElement.embed(vmCenterLinkNode);

        for (var i = 0; i < vmToPlot; i++) {
            vmUVE = contrail.checkIfExist(vmDetailsMap) ? vmDetailsMap[vmList[i]] : null;
            vmPosition = {
                x: zoomedVNPositionX + ctwc.VM_GRAPH_MARGIN.left + (vmWidth * i),
                y: zoomedVNPositionY
            };

            if (i % 2 == 0) {
                vmNode = createVMNode(vmPosition, ctwc.VM_GRAPH_SIZE, vmList[i], zoomedVNDetails, vmUVE, 'top');
            } else {
                vmPosition.y += ctwc.VM_GRAPH_SIZE.height + vmCenterLinkThickness;
                vmNode = createVMNode(vmPosition, ctwc.VM_GRAPH_SIZE, vmList[i], zoomedVNDetails, vmUVE, 'bottom');
            }

            elementMap.node[(vmUVE != null) ? vmUVE['UveVirtualMachineAgent']['vm_name'] : vmList[i]] = vmNode.id;
            zoomedElements.push(vmNode);
            zoomedNodeElement.embed(vmNode);
        }

        return zoomedElements;
    };

    function generateVerticalVMGraph(zoomedNodeElement, zoomedVNDetails, elementMap) {
        var zoomedElements = [],
            vmCount = zoomedVNDetails.more_attributes.vm_count,
            vmList = zoomedVNDetails.more_attributes.virtualmachine_list,
            vmDetailsMap = zoomedVNDetails.more_attributes.virtualmachine_details,
            vmWidth = ctwc.VM_GRAPH_SIZE.width + ctwc.VM_GRAPH_MARGIN.left + ctwc.VM_GRAPH_MARGIN.right,
            vmHeight = ctwc.VM_GRAPH_SIZE.height + ctwc.VM_GRAPH_MARGIN.top + ctwc.VM_GRAPH_MARGIN.bottom,
            vmToPlot = (vmCount > ctwc.MAX_VM_TO_PLOT) ? ctwc.MAX_VM_TO_PLOT : vmCount,
            vmCenterLinkThickness = ctwc.VM_CENTER_LINK_THICKNESS,
            zoomedVNPositionX = ctwc.ZOOMED_VN_MARGIN.left + ctwc.VM_GRAPH_MARGIN.top + ctwc.ZOOMED_VN_OFFSET_X,
            zoomedVNPositionY = ctwc.ZOOMED_VN_MARGIN.top,
            vmCenterLinkPosition = {
                x: zoomedVNPositionX + ctwc.VM_GRAPH_SIZE.height,
                y: zoomedVNPositionY
            },
            vmCenterLinkSize = {width: vmCenterLinkThickness, height: vmToPlot * vmWidth},
            vmCenterLinkNode = createVMCenterLink(vmCenterLinkPosition, vmCenterLinkSize),
            vmNode, vmUVE, vmPosition = {};

        zoomedElements.push(vmCenterLinkNode);
        zoomedNodeElement.embed(vmCenterLinkNode);

        for (var i = 0; i < vmToPlot; i++) {
            vmUVE = contrail.checkIfExist(vmDetailsMap) ? vmDetailsMap[vmList[i]] : null;
            vmPosition = {
                x: zoomedVNPositionX,
                y: zoomedVNPositionY + ctwc.VM_GRAPH_MARGIN.left + (vmWidth * i)
            };

            if (i % 2 === 0) {
                vmNode = createVMNode(vmPosition, ctwc.VM_GRAPH_SIZE, vmList[i], zoomedVNDetails, vmUVE, 'left');
            } else {
                vmPosition.x += ctwc.VM_GRAPH_SIZE.height + vmCenterLinkThickness;
                vmNode = createVMNode(vmPosition, ctwc.VM_GRAPH_SIZE, vmList[i], zoomedVNDetails, vmUVE, 'right');
            }

            elementMap.node[vmList[i]] = vmNode.id;
            zoomedElements.push(vmNode);
            zoomedNodeElement.embed(vmNode);
        }

        return zoomedElements;
    };

    function showClickedElement(self, clickedElementModel, connectedSelectorId) {
        var clickedElement = clickedElementModel.attributes,
            elementNodeType = clickedElement.elementType,
            elementNodeId = clickedElementModel.id,
            bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
            tabConfig = {};

        switch (elementNodeType) {
            case ctwc.GRAPH_ELEMENT_NETWORK:
                var networkFQN = clickedElement.nodeDetails.name,
                    networkUUID = nmwu.getUUIDByName(networkFQN);

                if (!ctwu.isServiceVN(networkFQN)) {
                    clickedElement = {
                        fqName: networkFQN,
                        uuid: networkUUID,
                        type: elementNodeType
                    };

                    layoutHandler.setURLHashParams({clickedElement: clickedElement}, {
                        merge: true,
                        triggerHashChange: false
                    });

                    highlightCurrentNodeElement(elementNodeId);

                    if ($('g[model-id="' + elementNodeId + '"]').hasClassSVG('ZoomedElement')) {
                        highlightNetwork4ZoomedElement(connectedSelectorId)
                    }

                    tabConfig = ctwgrc.getTabsViewConfig(elementNodeType, clickedElement);
                    self.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);
                }

                break;

            case ctwc.GRAPH_ELEMENT_INSTANCE:
                var networkFQN = clickedElement.nodeDetails.srcVNDetails.name,
                    instanceUUID = clickedElement.nodeDetails.fqName;

                clickedElement = {
                    fqName: networkFQN,
                    uuid: instanceUUID,
                    type: elementNodeType
                };

                layoutHandler.setURLHashParams({clickedElement: clickedElement}, {
                    merge: true,
                    triggerHashChange: false
                });

                highlightCurrentNodeElement(elementNodeId);
                tabConfig = ctwgrc.getTabsViewConfig(elementNodeType, clickedElement);
                self.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);

                break;

            case ctwc.GRAPH_ELEMENT_CONNECTED_NETWORK:
                var connectedGraphView = $(connectedSelectorId).data('graphView'),
                    connectedGraphModel = connectedGraphView.model,
                    sourceNode = connectedGraphModel.getCell(clickedElement.source),
                    targetNode = connectedGraphModel.getCell(clickedElement.target),
                    sourceType = sourceNode.attributes.elementType,
                    targetType = targetNode.attributes.elementType,
                    sourceElement = clickedElement.linkDetails.dst,
                    targetElement = clickedElement.linkDetails.src;

                if (!(sourceType === ctwc.TYPE_VIRTUAL_NETWORK && targetType === ctwc.TYPE_VIRTUAL_MACHINE)) {
                    clickedElement = {
                        sourceElement: sourceElement,
                        targetElement: targetElement,
                        linkDetails: clickedElement.linkDetails
                    };

                    highlightCurrentLinkElement(elementNodeId);
                    tabConfig = ctwgrc.getTabsViewConfig(elementNodeType, clickedElement);
                    self.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);
                }

                break;
        }
        ;
    };

    function getCgPointerClick(self, connectedSelectorId) {
        return function (cellView, evt, x, y) {
            var clickedElement = cellView.model.attributes;

            setTimeout(function () {
                $('.popover').remove();
            }, cowc.TOOLTIP_DELAY);

            showClickedElement(self, cellView.model, connectedSelectorId);

        };
    };

    function cgPointerDblClick(cellView, evt, x, y) {
        var dblClickedElement = cellView.model.attributes,
            elementNodeType = dblClickedElement.elementType,
            elementNodeId = cellView.model.id;

        setTimeout(function () {
            $('.popover').remove();
        }, cowc.TOOLTIP_DELAY);

        switch (elementNodeType) {
            case ctwc.GRAPH_ELEMENT_NETWORK:
                var networkFQN = dblClickedElement.nodeDetails['name'];

                if (!ctwu.isServiceVN(networkFQN)) {
                    loadFeature({
                        p: 'mon_networking_networks',
                        q: {
                            focusedElement: {
                                fqName: networkFQN,
                                type: elementNodeType
                            },
                            view: 'details',
                            type: 'network'
                        }
                    });
                    $('g.VirtualNetwork').popover('hide');
                }
                break;

            case ctwc.GRAPH_ELEMENT_INSTANCE:
                var srcVN = dblClickedElement.nodeDetails.srcVNDetails.name,
                    vmUVE = dblClickedElement.nodeDetails.uve,
                    vmName = contrail.checkIfExist(vmUVE) ? vmUVE['UveVirtualMachineAgent']['vm_name'] : null;

                loadFeature({
                    p: 'mon_networking_instances',
                    q: {
                        type: 'instance',
                        view: 'details',
                        focusedElement: {
                            fqName: srcVN,
                            uuid: dblClickedElement.nodeDetails['fqName'],
                            vmName: vmName,
                            type: ctwc.GRAPH_ELEMENT_INSTANCE
                        }
                    }
                });
                $('g.VirtualMachine').popover('hide');
                break;

        }
    };

    function getCgBlankDblClick(self, connectedSelectorId, graphConfig) {

        return function () {
            var currentHashParams = layoutHandler.getURLHashParams(),
                focusedElementType = graphConfig.focusedElement.type,
                bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
                tabConfig = {};

            switch (focusedElementType) {
                case ctwc.GRAPH_ELEMENT_PROJECT:
                    removeFaint4AllElements();
                    removeHighlight4AllElements();

                    if (contrail.checkIfExist(currentHashParams.clickedElement)) {
                        var projectFQN = graphConfig.focusedElement.name.fqName,
                            projectUUID = nmwu.getUUIDByName(projectFQN);

                        tabConfig = ctwgrc.getTabsViewConfig(focusedElementType, {
                            fqName: projectFQN,
                            uuid: projectUUID
                        });

                        ctwu.setProjectURLHashParams(null, projectFQN, false);
                    }

                    break;

                case ctwc.GRAPH_ELEMENT_NETWORK:
                    var networkFQN = decodeURIComponent(graphConfig.focusedElement.name.fqName);

                    if (contrail.checkIfExist(currentHashParams.clickedElement)) {
                        var networkUUID = nmwu.getUUIDByName(networkFQN);

                        tabConfig = ctwgrc.getTabsViewConfig(focusedElementType, {
                            fqName: networkFQN,
                            uuid: networkUUID
                        });

                        highlightNetwork4ZoomedElement(connectedSelectorId);
                        ctwu.setNetworkURLHashParams(null, networkFQN, false);

                    } else {
                        var projectFQN = networkFQN.split(':').splice(0, 2).join(':');
                        ctwu.setProjectURLHashParams(null, projectFQN, true);
                    }

                    break;

                case ctwc.GRAPH_ELEMENT_INSTANCE:
                    var networkFQN = decodeURIComponent(graphConfig.focusedElement.name.fqName);

                    if (contrail.checkIfExist(currentHashParams.clickedElement)) {
                        var instanceUUID = graphConfig.focusedElement.name.instanceUUID;

                        tabConfig = ctwgrc.getTabsViewConfig(focusedElementType, {
                            fqName: networkFQN,
                            uuid: instanceUUID
                        });

                        ctwu.setInstanceURLHashParams(null, networkFQN, instanceUUID, false);
                    } else {
                        ctwu.setNetworkURLHashParams(null, networkFQN, true);
                    }

                    break;
            }
            ;

            if (!$.isEmptyObject(tabConfig)) {
                self.renderView4Config(bottomContainerElement, null, tabConfig, null, null, null);
            }
        };
    };

    function highlightElement4ZoomedElement(connectedSelectorId, graphConfig) {
        var focusedElementType = graphConfig.focusedElement.type;

        if (focusedElementType == ctwc.GRAPH_ELEMENT_NETWORK) {
            highlightNetwork4ZoomedElement(connectedSelectorId);
        }
    };

    function highlightNetwork4ZoomedElement(connectedSelectorId) {
        faintElements([$(connectedSelectorId).find('div.font-element')]);
        faintSVGElements([$(connectedSelectorId).find('g.element'), $(connectedSelectorId).find('g.link')]);
        highlightElements([$('div.VirtualMachine')]);
        highlightSVGElements([$('g.ZoomedElement'), $('g.VirtualMachine'), $('.VirtualMachineLink')]);
    };

    function getConfgPointerClickFn(connectedGraphView) {
        return function (cellView, evt, x, y) {
            var clickedElement = cellView.model.attributes,
                elementNodeType = clickedElement.elementType;

            switch (elementNodeType) {
                case ctwc.GRAPH_ELEMENT_NETWORK_POLICY:
                    onClickNetworkPolicy(cellView.model, connectedGraphView);
                    break;
            }
            ;
        }
    };

    function onClickNetworkPolicy(elementObj, connectedGraphView) {
        var elementMap = connectedGraphView.model.elementMap,
            cellAttributes = elementObj.attributes;

        var policyRules = (contrail.checkIfExist(cellAttributes.nodeDetails.network_policy_entries)) ? cellAttributes.nodeDetails.network_policy_entries.policy_rule : [],
            highlightedElements = {nodes: [], links: []};

        highlightCurrentNodeElement(cellAttributes.id);

        $.each(policyRules, function (policyRuleKey, policyRuleValue) {
            var sourceNode = policyRuleValue.src_addresses[0],
                destinationNode = policyRuleValue.dst_addresses[0],
                serviceInstanceNode = policyRuleValue.action_list.apply_service,
                serviceInstanceNodeLength = 0,
                policyRuleLinkKey = [];

            highlightedElements = {nodes: [], links: []};

            $.each(sourceNode, function (sourceNodeKey, sourceNodeValue) {
                if (contrail.checkIfExist(sourceNodeValue) && !$.isArray(sourceNodeValue)) {
                    highlightedElements.nodes.push(sourceNodeValue);
                    policyRuleLinkKey.push(sourceNodeValue);

                    if (serviceInstanceNode) {
                        serviceInstanceNodeLength = serviceInstanceNode.length;
                        $.each(serviceInstanceNode, function (serviceInstanceNodeKey, serviceInstanceNodeValue) {
                            highlightedElements.nodes.push(serviceInstanceNodeValue);
                            policyRuleLinkKey.push(serviceInstanceNodeValue);
                        });
                        policyRuleLinkKey.push(destinationNode[sourceNodeKey]);
                        highlightedElements.links.push(policyRuleLinkKey.join('<->'));
                        highlightedElements.links.push(policyRuleLinkKey.reverse().join('<->'));

                    } else {
                        policyRuleLinkKey.push(destinationNode[sourceNodeKey]);
                        highlightedElements.links.push(destinationNode[sourceNodeKey] + '<->' + sourceNodeValue);
                        highlightedElements.links.push(sourceNodeValue + '<->' + destinationNode[sourceNodeKey]);
                    }
                }
            });
            $.each(destinationNode, function (destinationNodeKey, destinationNodeValue) {
                if (contrail.checkIfExist(destinationNodeValue) && !$.isArray(destinationNodeValue)) {
                    highlightedElements.nodes.push(destinationNodeValue);
                }
            });

            if (elementMap.link[policyRuleLinkKey.join('<->')] || elementMap.link[policyRuleLinkKey.reverse().join('<->')]) {
                highlightedElements.nodes = $.unique(highlightedElements.nodes);
                $.each(highlightedElements.nodes, function (nodeKey, nodeValue) {
                    var nodeElement = connectedGraphView.model.getCell(elementMap.node[nodeValue]);
                    $('g[model-id="' + nodeElement.id + '"]').removeClassSVG('fainted').addClassSVG('highlighted');
                    $('div[font-element-model-id="' + nodeElement.id + '"]').removeClass('fainted').addClass('highlighted');

                    if ($('g[model-id="' + nodeElement.id + '"]').hasClassSVG('ZoomedElement')) {
                        highlightElements([$('div.VirtualMachine')]);
                        highlightSVGElements([$('g.VirtualMachine'), $('.VirtualMachineLink')]);
                    }
                });

                if (policyRuleValue.action_list.simple_action == 'pass') {
                    highlightedElements.links = $.unique(highlightedElements.links);
                    $.each(highlightedElements.links, function (highlightedElementLinkKey, highlightedElementLinkValue) {
                        if (elementMap.link[highlightedElementLinkValue]) {
                            if (typeof elementMap.link[highlightedElementLinkValue] == 'string') {
                                highlightLinkElementByName(connectedGraphView, elementMap.link[highlightedElementLinkValue]);
                            } else {
                                $.each(elementMap.link[highlightedElementLinkValue], function (linkKey, linkValue) {
                                    highlightLinkElementByName(connectedGraphView, linkValue)
                                });
                            }

                        }
                    });
                }
            }
        });
    };

    function highlightCurrentNodeElement(elementNodeId) {
        if ($('g[model-id="' + elementNodeId + '"]').length != 0) {
            faintAllElements();

            highlightElements([$('div.font-element[font-element-model-id="' + elementNodeId + '"]')]);
            highlightSVGElements([$('g[model-id="' + elementNodeId + '"]')]);
        }
    };

    function highlightCurrentLinkElement(elementNodeId) {
        if ($('g[model-id="' + elementNodeId + '"]').length != 0) {
            faintAllElements();
            highlightSVGElements([$('g[model-id="' + elementNodeId + '"]')]);
        }
    };

    function highlightLinkElementByName(connectedGraphView, elementId) {
        var linkElement = connectedGraphView.model.getCell(elementId);
        if (linkElement) {
            highlightSVGElements([$('g[model-id="' + linkElement.id + '"]')]);
        }
    };

    function highlightElements(elements) {
        $.each(elements, function (elementKey, elementValue) {
            $(elementValue).removeClass('fainted').addClass('highlighted');
        });
    };

    function highlightSVGElements(elements) {
        $.each(elements, function (elementKey, elementValue) {
            $(elementValue).removeClassSVG('fainted').addClassSVG('highlighted');
        });
    };

    function faintElements(elements) {
        $.each(elements, function (elementKey, elementValue) {
            $(elementValue).removeClass('highlighted').addClass('fainted');
        });
    };

    function faintSVGElements(elements) {
        $.each(elements, function (elementKey, elementValue) {
            $(elementValue).removeClassSVG('highlighted').addClassSVG('fainted');
        });
    };

    function faintAllElements() {
        $('div.font-element').removeClass('highlighted').addClass('fainted');
        $('g.element').removeClassSVG('highlighted').addClassSVG('fainted');
        $('g.link').removeClassSVG('highlighted').addClassSVG('fainted');
    };

    function removeFaint4AllElements() {
        $('div.font-element').removeClass('fainted');
        $('g.element').removeClassSVG('fainted');
        $('g.link').removeClassSVG('fainted');
    };

    function removeHighlight4AllElements() {
        $('div.font-element').removeClass('highlighted');
        $('g.element').removeClassSVG('highlighted');
        $('g.link').removeClassSVG('highlighted');
    };

    function createNodes4ConfigData(configData, collections) {
        var networkPolicys = configData['network-policys'],
            securityGroups = configData['security-groups'],
            networkIPAMS = configData['network-ipams'],
            name, i;

        if (networkPolicys != null && networkPolicys.length > 0) {
            var font = {
                iconClass: 'icon-contrail-network-policy'
            };
            collections.networkPolicys = {name: 'Network Policies', node_type: 'collection-element', nodes: []};
            for (i = 0; networkPolicys != null && i < networkPolicys.length; i++) {
                name = networkPolicys[i]['fq_name'].join(':');
                collections.networkPolicys.nodes.push({
                    name: name,
                    node_type: 'network-policy',
                    elementType: 'network-policy',
                    nodeDetails: networkPolicys[i],
                    font: font
                });
            }
        }

        if (securityGroups != null && securityGroups.length > 0) {
            var font = {
                iconClass: 'icon-contrail-security-group'
            };
            collections.securityGroups = {name: 'Security Groups', node_type: 'collection-element', nodes: []};
            for (i = 0; securityGroups != null && i < securityGroups.length; i++) {
                name = securityGroups[i]['fq_name'].join(':');
                collections.securityGroups.nodes.push({
                    name: name,
                    node_type: 'security-group',
                    elementType: 'security-group',
                    nodeDetails: securityGroups[i],
                    font: font
                });
            }
        }

        if (networkIPAMS != null && networkIPAMS.length > 0) {
            var font = {
                iconClass: 'icon-contrail-network-ipam'
            };
            collections.networkIPAMS = {name: 'Network IPAMS', node_type: 'collection-element', nodes: []};
            for (i = 0; networkIPAMS != null && i < networkIPAMS.length; i++) {
                name = networkIPAMS[i]['fq_name'].join(':');
                collections.networkIPAMS.nodes.push({
                    name: name,
                    node_type: 'network-ipam',
                    elementType: 'network-ipam',
                    nodeDetails: networkIPAMS[i],
                    font: font
                });
            }
        }
    }

    function createNodeElements(nodes, elements, elementMap, config) {
        var newElement, nodeName;
        var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
        var selectedProject = contrail.getCookie(cowc.COOKIE_PROJECT);
        if (nodes && nodes.length){
            for (var i = 0; i < nodes.length; i++) {
            	 var node = nodes[i];
                 if (node != null && node['name'] != null) {
                     var nodeName = node['name'];
                     if (domain === ctwc.DEFAULT_DOMAIN &&
                         selectedProject === ctwc.DEFAULT_PROJECT &&
                         typeof nodeName == 'string' &&
                         ctwc.SERVICE_VN_EXCLUDE_LIST.indexOf(nodeName.split(':')[2]) >= 0) {
                        continue;
                     }
                 }
            	newElement = createNodeElement(nodes[i], config);
                nodeName = nodes[i]['name'];
                elements.push(newElement);
                elementMap.node[nodeName] = newElement.id;
            }
        }
    }

    function createNodeElement(node, config) {
        var nodeFQN = node['name'],
            nodeType = node['node_type'],
            width = (config != null && config.width != null) ? config.width : 35,
            height = (config != null && config.height != null) ? config.height : 35,
            element, options,
            nodeNameList, nodeName;

        nodeNameList = nodeFQN.split(":");
        nodeName = (nodeNameList.length > 2) ? nodeNameList[2] : nodeFQN;
        options = {
            attrs: {
                text: {
                    text: contrail.truncateText(nodeName, 10)
                }
            },
            size: {
                width: width,
                height: height
            },
            nodeDetails: node,
            font: {
                iconClass: 'icon-contrail-' + nodeType
            },
            elementType: nodeType
        };
        element = new ContrailElement(nodeType, options);
        return element;
    }

    function createCollectionElements(collections, elements, elementMap) {
        var elementDimension = {
            width: 37,
            height: 37,
            marginLeft: 17,
            marginRight: 17,
            marginTop: 10,
            marginBottom: 0,
            firstRowMarginTop: 10
        };
        var collectionPositionX = 10,
            collectionPositionY = 20,
            width = 0,
            height = 0;
        $.each(collections, function (collectionKey, collectionValue) {
            var nodeRows = 1;
            collectionPositionX = 0,
                collectionPositionY += height,
                width = (elementDimension.width + elementDimension.marginLeft + elementDimension.marginRight) * collectionValue.nodes.length;
            height = nodeRows * (elementDimension.width + elementDimension.marginTop + elementDimension.marginBottom) + elementDimension.marginTop + elementDimension.marginBottom + elementDimension.firstRowMarginTop;
            var options = {
                position: {
                    x: collectionPositionX,
                    y: collectionPositionY
                },
                attrs: {
                    rect: {
                        width: width,
                        height: height
                    },
                    text: {
                        text: collectionValue.name
                    }
                }
            };

            var collectionElement = new ContrailElement(collectionValue.node_type, options);
            elements.push(collectionElement);
            elementMap.node[collectionValue.name] = collectionElement.id;

            var collectionNodePositionX = 0,
                collectionNodePositionY = 0;

            $.each(collectionValue.nodes, function (collectionNodeKey, collectionNodeValue) {
                collectionNodePositionX = collectionPositionX + (collectionNodeKey % 2) * (elementDimension.width + elementDimension.marginLeft + elementDimension.marginRight)
                    + elementDimension.marginLeft;
                collectionNodePositionY = elementDimension.firstRowMarginTop + (collectionPositionY + height * parseInt(collectionNodeKey / 2));

                var nodeName = collectionNodeValue['name'],
                    nodeType = collectionNodeValue['node_type'],
                    imageName = grUtils.getImageName(collectionNodeValue),
                    imageLink = '/img/icons/' + imageName,
                    options = {
                        position: {
                            x: collectionNodePositionX,
                            y: collectionNodePositionY
                        },
                        attrs: {
                            image: {
                                'xlink:href': imageLink,
                                width: elementDimension.width,
                                height: elementDimension.height
                            },
                            text: {
                                text: contrail.truncateText(nodeName.split(":")[2], 15)
                            }
                        },
                        nodeDetails: collectionNodeValue.nodeDetails,
                        elementType: collectionNodeValue.elementType,
                        font: collectionNodeValue.font
                    },
                    element = new ContrailElement(nodeType, options);

                collectionElement.embed(element);
                elements.push(element);
                elementMap.node[nodeName] = element.id;
            });

            collectionPositionY = collectionNodePositionY;
        });

        return collectionPositionY + elementDimension.height + elementDimension.firstRowMarginTop;
    }

    function createLinkElements(links, elements, elementMap) {
        var link, linkedElements = [];
        if (links && links.length){
            for (var i = 0; i < links.length; i++) {
                var sInstances = links[i] ['service_inst'],
                    dir = links[i]['dir'],
                    source = {}, target = {};

                if (sInstances == null || sInstances.length == 0) {
                    source = {
                        id: elementMap.node[links[i]['src']],
                        name: links[i]['src']
                    };
                    target = {
                        id: elementMap.node[links[i]['dst']],
                        name: links[i]['dst']
                    };

                    link = createLinkElement(source, target, links[i], elements, elementMap);
                    linkedElements.push(link);
                } else {
                    var linkElements = [],
                        linkElementKeys = [],
                        linkElementKeyString = '',
                        linkElementKeyStringBi = '';
                    for (var j = 0; j < sInstances.length; j++) {
                        if (j == 0) {
                            source = {
                                id: elementMap.node[links[i]['src']],
                                name: links[i]['src']
                            };
                        } else {
                            source = {
                                id: elementMap.node[sInstances[j - 1]],
                                name: sInstances[j - 1]
                            };
                        }
                        target = {
                            id: elementMap.node[sInstances[j]],
                            name: sInstances[j]
                        };
                        linkElements.push({
                            source: source,
                            target: target
                        });
                        linkElementKeys.push(source.name);
                    }

                    source = {
                        id: elementMap.node[sInstances[j - 1]],
                        name: sInstances[j - 1]
                    };

                    target = {
                        id: elementMap.node[links[i]['dst']],
                        name: links[i]['dst']
                    };
                    linkElements.push({
                        source: source,
                        target: target
                    });
                    linkElementKeys.push(source.name);
                    linkElementKeys.push(target.name);

                    linkElementKeyString = linkElementKeys.join('<->');
                    elementMap.link[linkElementKeyString] = [];

                    if (dir == 'bi') {
                        linkElementKeyStringBi = linkElementKeys.reverse().join('<->');
                        elementMap.link[linkElementKeyStringBi] = [];
                    }

                    $.each(linkElements, function (linkElementKey, linkElementValue) {
                        link = createLinkElement(linkElementValue.source, linkElementValue.target, links[i], elements, elementMap);
                        linkedElements.push(link);

                        elementMap.link[linkElementKeyString].push(link.id);
                        if (dir == 'bi') {
                            elementMap.link[linkElementKeyStringBi].push(link.id);
                        }
                    });
                }
            }
        }
        elementMap['linkedElements'] = linkedElements;
    };

    function createLinkElement(source, target, linkDetails, elements, elementMap) {
        var direction = linkDetails.dir,
            linkConfig = {
                source: {id: source.id},
                target: {id: target.id},
                linkDetails: linkDetails,
                elementType: 'connected-network',
                attrs: {}
            };

        if (direction == 'bi') {
            linkConfig.attrs = {
                '.marker-source': {fill: '#333', d: 'M 6 0 L 0 3 L 6 6 z'},
                '.marker-target': {fill: '#333', d: 'M 6 0 L 0 3 L 6 6 z'}
            };

        } else if (direction == 'uni') {

            linkConfig.attrs = {
                '.marker-source': {fill: '#333', d: 'M 6 0 L 0 3 L 6 6 z'},
                '.marker-target': {fill: '#e80015', stroke: '#e80015', d: 'M 6 0 L 0 3 L 6 6 z'},
                '.connection': {stroke: '#e80015', 'stroke-width': 1, 'stroke-dasharray': '4 4'}
            };
        }

        var link = new ContrailElement('link', {linkConfig: linkConfig});
        elements.push(link);
        elementMap.link[source.name + '<->' + target.name] = link.id;
        if (link.attributes.linkDetails.dir == 'bi') {
            elementMap.link[target.name + '<->' + source.name] = link.id;
        }

        return link;
    }

    function createInterfaceLink(links, elements, elementMap) {
        var link, linkedElements = [];
        for (var i = 0; i < links.length; i++) {
            var sInstances = links[i] ['service_inst'],
                source = {}, target = {},
                isHealthCheckActive = links[i]['more_attributes']['is_health_check_active'];

            if (sInstances == null || sInstances.length == 0) {
                source = {
                    id: elementMap.node[links[i]['src']],
                    name: links[i]['src']
                };
                target = {
                    id: elementMap.node[links[i]['dst']],
                    name: links[i]['dst']
                };

                var options = {
                    linkConfig: {
                        source: {id: source.id},
                        target: {id: target.id},
                        smooth: false,
                        connector: {name: 'normal'},
                        attrs: {
                            '.connection': {
                                'stroke': (isHealthCheckActive) ? '#333' : '#e80015',
                                'stroke-width': 2,
                                'stroke-dasharray': '4 4'
                            },
                            '.connection-wrap': {
                                'stroke': '#333'
                            }
                        },
                        linkDetails: links[i],
                        elementType: 'connected-network'
                    }
                };

                link = new ContrailElement('link', options);
                elements.push(link);
                elementMap.link[source.name + ':-:' + target.name] = link.id;

                linkedElements.push(link);
            }
        }
        elementMap['linkedElements'] = linkedElements;
    };

    return NetworkingGraphView;
});
