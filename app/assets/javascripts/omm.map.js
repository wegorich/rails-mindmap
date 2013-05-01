/**
 * @author Piero Bozzolo
 */
$(document).ready(function () {

    var baseHeight = $('footer.page').height() + $('header.page').height() + 3;

    function resizeDiv() {
        vpw = $(window).width();
        vph = $(window).height() - baseHeight;
        $('.map').css({height: vph + 'px', width: vpw + 'px'});
    }

    $(window).resize(function () {
        resizeDiv();
    });
    resizeDiv();
    setTimeout(function () {
        var map = $('.map');
        map.animate({ scrollTop: map.find('svg').height() / 2.5, scrollLeft: map.find('svg').width() / 2.5  }, "fast");
    }, 300);
    $(".alert").delay(3200).fadeOut(300);
});


OpenMindMap.map = function (holder, toolbar, auth, conf, startWorkingCallback, stopWorkingCallback) {
    var omm = this;
    this.classSetup = function () {
        this.startWorkingCallback = startWorkingCallback || function () {
        };
        this.stopWorkingCallback = stopWorkingCallback || function () {
        };
        this.mapid = null;
        this.hudBox = null;
        this.isDefaultEventHandler = true;
        this.connections = [];
        this.connectionsHashMap = {};
        this.authtoken = auth.authtoken;
        this.user = auth.user;
        this.nodes = [];
        this.nodesGuid = {};
        this.paper = null;
        this.root = null;
        this.holder = holder;
        this.toolbar = toolbar;
        this.saved = 0;
        this.savedCount = 0;
        this.scaleratio = 1;
        this.shared = 0;
        this.haveCollaborators = false;
        this.attachments = [];
        this.converter = null;
        this.conf = conf;
        this.changed = false;
        this.setup = OpenMindMap.config[conf] ? OpenMindMap.config[conf] : OpenMindMap.config.mindmap;
        this.clientID = OpenMindMap.utils.guidGenerator();
        this.images = [];
        this.backgroundColor = 'fff';
        this.backgroundImg = null;
        this.color = this.setup.node.color;
        this.title = this.setup.node.defaultText;
        this.paper = Raphael(holder, this.setup.paper.size.width, this.setup.paper.size.height);
        $('#' + this.holder).css('width', this.setup.paper.size.width + 'px');
        /* Setup viewbox for enabling zoom */
        this.viewBox = this.paper.setViewBox(0, 0, this.paper.width, this.paper.height);
        this.zoomViewBox = {};
        this.zoomViewBox.width = this.paper.width;
        this.zoomViewBox.height = this.paper.height;
        this.zoomX = 0;
        this.zoomY = 0;
        this.usedColors = [];
        this.readOnly = false;
        this.isDraggingNode = false;
        this.oldScrollPosition = {x: 0, y: 0};
        this.selectedConnection = null;
        this.fullscreenOpen = false;
        this.inPlaying = false;

        $(document).on('keyup', this.keyUpCallback);
        $(document).on('keydown', this.keyDownCallback);

        $(String.format('#{0} svg', this.holder)).on('click', function (ev) {
            if (ev.target != this) return;
            omm.setSelectedNode(null);
            if (!omm.hud()) return;
            //omm.hud().chooseMap();
            omm.hud().hud.hide();
            omm.hud().pin.hide();
        });
        $(String.format('#{0} svg', this.holder)).on('mousemove', function (ev) {
            if (ev.target != this || ev.isPropagationStopped()) return;

            /* Left click */
            if (!omm.isDraggingNode && omm.isDraggingMap) {
                if (omm.oldScrollPosition.x == 0) {
                    omm.oldScrollPosition.x = ev.screenX;
                    omm.oldScrollPosition.y = ev.screenY;
                    return;
                }
                var dx = ev.screenX - omm.oldScrollPosition.x;
                var dy = ev.screenY - omm.oldScrollPosition.y;
                $(document).scrollTop($(document).scrollTop() - dy);
                $(document).scrollLeft($(document).scrollLeft() - dx);
                omm.oldScrollPosition.x = ev.screenX;
                omm.oldScrollPosition.y = ev.screenY;
            }
        });
        $(String.format('#{0} svg', this.holder)).on('mouseup', function (ev) {
            if (ev.target != this) return;
            omm.oldScrollPosition = {x: 0, y: 0};
            omm.isDraggingMap = false;
        });
        $(String.format('#{0} svg', this.holder)).on('mousedown', function (ev) {
            if (ev.target != this || ev.isPropagationStopped()) return;
            omm.isDraggingMap = true;
        });
    };

    this.hud = function (hud) {
        if (this.isReadOnly()) return;
        if (hud) this.hudBox = hud;
        this.hudBox.omm = this;
        return this.hudBox;
    };

    this.subscribeChannel = function () {
        if (typeof(Pusher) == 'undefined') return;
        // Enable pusher logging - don't include this in production
        Pusher.log = function (message) {
            if (window.console && window.console.log) window.console.log(message);
        };
        this.pusher = new Pusher('82895ab25883d45294b1');
        this.channel = this.pusher.subscribe('map-' + this.mapid);
        this.channel.bind('node-new', this.eventNodeNew);
        this.channel.bind('node-moved', this.eventNodeMoved);
        this.channel.bind('node-deleted', this.eventNodeDeleted);
        this.channel.bind('node-change-text', this.eventNodeChangeText);
        this.channel.bind('node-change-connection-text', this.eventChangeConnectionText);
        this.channel.bind('node-switched-style', this.eventNodeSwitchedStyle);
        this.channel.bind('background-changed', this.eventBackgroundChanged);
        this.channel.bind('image-insert', this.eventImageInsert);
        this.channel.bind('image-delete', this.eventImageDelete);
    };

    this.runCachedEvents = function (data) {
        var cachedEvent;
        for (var i = 0, ii = data.status.length; i < ii; i++) {
            cachedEvent = JSON.parse(data.status[i]);
            if (cachedEvent.event == 'node-new') omm.eventNodeNew(cachedEvent.data, true);
            if (cachedEvent.event == 'node-moved') omm.eventNodeMoved(cachedEvent.data, true);
            if (cachedEvent.event == 'node-deleted') omm.eventNodeDeleted(cachedEvent.data, true);
            if (cachedEvent.event == 'node-change-text') omm.eventNodeChangeText(cachedEvent.data, true);
            if (cachedEvent.event == 'node-change-connection-text') omm.eventChangeConnectionText(cachedEvent.data, true);
            if (cachedEvent.event == 'node-switched-style') omm.eventNodeSwitchedStyle(cachedEvent.data, true);
            if (cachedEvent.event == 'background-change') omm.eventBackgroundChanged(cachedEvent.data, true);
            if (cachedEvent.event == 'image-insert') omm.eventImageInsert(cachedEvent.data, true);
            if (cachedEvent.event == 'image-delete') omm.eventImageDelete(cachedEvent.data, true);
        }
    };

    this.eventNodeNew = function (data, doNotSkipMyEvent) {
        if (omm.eventTriggedByMe(data, doNotSkipMyEvent)) return;
        var newNodeFunc = OpenMindMap.utils.getNameSpacedFunction(data.style);
        data.omm = omm;
        data = omm.cleanPushNodeData(data);
        node = new newNodeFunc(data);
        omm.addconnection(node.parent, node, node.color);
        node.parent.children.push(node);
        omm.nodes.push(node);
        node.text(data.text);
        omm.updateconnections();
        omm.nodesGuid[node.guid] = node;
    };

    this.eventNodeMoved = function (data, doNotSkipMyEvent) {
        if (omm.eventTriggedByMe(data, doNotSkipMyEvent)) return;
        node = omm.getNodeByGUID(data.node);
        node.drag();
        node.childLocked = ("true" == data.childLocked);
        var dx = parseInt(data.position.x) - node.box.ox;
        var dy = parseInt(data.position.y) - node.box.oy;
        node.onMove(dx, dy);
        node.box.animate({"fill-opacity": node.fill_opacity}, 500);
    };

    this.eventNodeDeleted = function (data, doNotSkipMyEvent) {
        if (omm.eventTriggedByMe(data, doNotSkipMyEvent)) return;
        node = omm.getNodeByGUID(data.node);
        node.remove(true);
    };

    this.eventNodeChangeText = function (data, doNotSkipMyEvent) {
        if (omm.eventTriggedByMe(data, doNotSkipMyEvent)) return;
        node = omm.getNodeByGUID(data.node);
        node.text(data.text);
        node.fixSize();
    };

    this.eventChangeConnectionText = function (data, doNotSkipMyEvent) {
        if (omm.eventTriggedByMe(data, doNotSkipMyEvent)) return;
        var nodeTo = omm.getNodeByGUID(data.to);
        nodeTo.connections.from[0].text(data.text);
    };

    this.eventNodeSwitchedStyle = function (data, doNotSkipMyEvent) {
        if (omm.eventTriggedByMe(data, doNotSkipMyEvent)) return;
        var node = omm.getNodeByGUID(data.node);
        node.switchToNodeStyle(data.style, true);
    };

    this.eventBackgroundChanged = function (data, doNotSkipMyEvent) {
        if (omm.eventTriggedByMe(data, doNotSkipMyEvent)) return;
        omm.backgroundImg = data.backgroundImg;
        omm.backgroundColor = data.backgroundColor;
        omm.updateBackground(true);
    };

    this.eventImageInsert = function (data, doNotSkipMyEvent) {
        if (omm.eventTriggedByMe(data, doNotSkipMyEvent)) return;
        omm.setImage(data);
    };

    this.eventImageDelete = function (data, doNotSkipMyEvent) {
        if (omm.eventTriggedByMe(data, doNotSkipMyEvent)) return;

    };

    this.cleanPushNodeData = function (data) {
        data.position.x = parseInt(data.position.x);
        data.position.y = parseInt(data.position.y);
        data.size.w = data.size.width = parseInt(data.size.w);
        data.size.h = data.size.height = parseInt(data.size.h);
        data.radius = parseInt(data.radius);
        return data;
    };

    this.eventTriggedByMe = function (data, doNotSkipMyEvent) {
        if (doNotSkipMyEvent) return false;
        return (data.clientID == this.clientID)
    };

    this.triggerEvent = function (event, data) {
        if (data) data.clientID = this.clientID;
        if (this.haveCollaborators) $.post('/maps/' + this.mapid + '/event', {event: event, data: data}, function (data) {
            if (data.status instanceof Array) {
                omm.runCachedEvents(data);
            }
        });
    };

    this.ready = function (fn) {
        this.readytrigger = fn;
    };

    this.getcolor = function () {
        var newColor = Raphael.getColor();
        var firstFoundColor = newColor;
        var stop = false;
        while (this.usedColors.indexOf(newColor) > -1) {
            newColor = Raphael.getColor();
            if (firstFoundColor == newColor) {
                this.usedColors = [];
                stop = true;
            }
        }
        ;
        this.usedColors.push(newColor);
        return newColor;
    }

    this.drawroot = function () {
        if (this.root) {
            throw 'Root node alrady drawed';
        }
        var positionxy = this.setup.node.root.position;
        var sizewh = OpenMindMap.utils.size(this.setup.node.root.size.width, this.setup.node.root.size.height);
        this.root = new this.setup.node.root.style({omm: this, position: positionxy, size: sizewh, text: this.title, color: this.color, radius: this.setup.node.radius, isroot: true});
        this.nodes.push(this.root);
        this.nodesGuid[this.root.guid] = this.root;
    };

    this.addnode = function (params) {
        var parentnode = params.parent;
        var position = params.position;
        var text = params.text;
        var map = this;
        if (params.color) {
            var nodecolor = params.color;
        } else if (parentnode.isroot) {
            var nodecolor = this.getcolor();
        } else {
            var nodecolor = parentnode.color;
        }
        if (params.positionxy) {
            var positionxy = params.positionxy;
        } else {
            var positionxy = this.getNewPostion(parentnode, position);
        }
        if (params.style) {
            var newNodeWithStyle = params.style
        } else {
            var newNodeWithStyle = this.setup.node.style
        }
        var childnode = new newNodeWithStyle({omm: this, position: positionxy, parent: parentnode, text: this.setup.node.text, color: nodecolor, radius: this.setup.node.radius});
        var self = this;
        this.addconnection(parentnode, childnode, nodecolor);
        parentnode.children.push(childnode);
        this.nodes.push(childnode);
        this.updateconnections();
        this.nodesGuid[childnode.guid] = childnode;
        childnode.showEditor(function () {
            map.triggerEvent('node-new', childnode.getAllProperties())
        });
        this.changed = true;
        childnode.afterInsert();
        this.setSelectedNode(childnode);
    };

    this.getNewPostion = function (node, position) {
        var cx = node.box.getBBox().x;
        var cy = node.box.getBBox().y;
        var w = node.box.getBBox().width;
        if ((position && position == 'left') || node.leftOfRoot()) {
            return OpenMindMap.utils.point(cx - omm.setup.connection.node.mindistance - omm.setup.node.size.width, cy);
        } else {
            return OpenMindMap.utils.point(cx + omm.setup.connection.node.mindistance + omm.setup.node.size.width, cy);
        }
    };

    this.addconnection = function (parent, node, color, text) {
        var opts = {
            startNode: parent,
            endNode: node,
            color: color,
            direction: this.setup.connection.direction,
            text: text,
            paper: omm.paper,
            omm: omm
        };
        var conn = new omm.setup.connection.style();
        conn.create(opts);
        return omm.connections.push(conn);
    };

    this.updateconnections = function () {
        for (var i = omm.connections.length; i--;) {
            omm.connections[i].update();
        }
        omm.paper.safari();
    };

    this.is_saved = function () {
        return !this.is_not_saved();
    };

    this.is_not_saved = function (message) {
        var not_saved = this.mapid === null;
        if (not_saved && message) {
            alert(message);
        }
        ;
        return not_saved;
    };

    /* Load and save functions */
    this.save = function (opts) {
        if (this.isReadOnly()) return;
        this.startWorkingCallback();
        var nodesData = [];
        var imagesData = [];
        for (var i = 0, ii = this.nodes.length; i < ii; i++) {
            nodesData.push(this.nodes[i].getAllProperties());
        }
        for (var i = 0, ii = this.images.length; i < ii; i++) {
            imagesData.push(this.images[i].getAllProperties());
        }
        var content = {
            nodes: nodesData,
            connections: this.getConnectionsObj(),
            images: imagesData,
            backgroundColor: this.backgroundColor,
            backgroundImg: this.backgroundImg,
            scaleratio: this.scaleratio
        };
        if (omm.inPlaying) {
            content.scaleratio = 1;
        }
        var urlAction = 'update';
        if (!omm.saved) {
            urlAction = 'create';
        }
        var httpData = {};
        httpData.authenticity_token = omm.authtoken;
        httpData.map = {};
        httpData.map.title = omm.root.text();
        httpData.map.content = JSON.stringify(content);

        httpData.map.conf = this.conf;
        if (opts && opts.versioning)    httpData.versioning = true;

        if (omm.savedCount % 3 == 0 || httpData.versioning) {
            var svgdata = $('#' + omm.holder).html();
            httpData.map.svgdata = svgdata;
        }
        omm.savedCount++;
        if (this.mapid) {
            var httpUrl = '/maps/' + this.mapid + '.json';
            var httpMethod = 'PUT';
        } else {
            var httpUrl = '/maps.json';
            var httpMethod = 'POST';
        }

        var callback = (opts && opts.callback) ? opts.callback : omm.mapsaved;
        $.ajax({
            type: httpMethod,
            url: httpUrl,
            data: httpData,
            success: callback
        });
        this.changed = false;
    };

    this.share = function () {
        this.startWorkingCallback();
        if (!this.mapid) {
            alert('You need to save map before you share it');
            return;
        }
        var httpData = {};
        httpData.authenticity_token = omm.authtoken;
        this.shared = !this.shared;
        httpData.isPublic = this.shared;
        httpData.map = {};
        var httpUrl = '/maps/' + this.mapid + '/share.json';
        $.ajax({
            type: 'POST',
            url: httpUrl,
            data: httpData,
            success: omm.mapshared
        });
    };

    this.getConnectionsObj = function (save) {
        var obj = {};
        var key = null;
        for (var i = 0, ii = this.connections.length; i < ii; i++) {
            key = this.connections[i].startNode.guid + '-' + this.connections[i].endNode.guid;
            obj[key] = this.connections[i].text();
        }
        if (save)this.connectionsHashMap = obj;
        return obj;
    };

    this.cleanConnectionsHashMap = function () {
        delete this.connectionsHashMap;
        this.connectionsHashMap = {};
    };

    this.mapshared = function (data) {
        if (data.isPublic) {
            $('#share_button').text('Public');
        } else {
            $('#share_button').text('Private');
        }
        omm.stopWorkingCallback();
    };

    this.mapsaved = function (data) {
        if (!omml.mapid) {
            window.location.replace('/maps/' + data.map.id + '/edit');
            return;
        }
        $('#toolbar > h3 > div > span.version').text('Version: ' + data.map.version);
        omm.stopWorkingCallback();
    };

    this.load = function (id) {
        this.mapid = id;
        $.get('/maps/' + id + '.json', function (data) {
            omm.maploaded(data);
            /* Chrome fix for auto scroll on last saved scroll */
            setTimeout(function () {
                omm.centerRootNode()
            }, 10);
        }, 'json');
    };

    this.maploaded = function (data) {
        var content = JSON.parse(data.map.content);
        var node, guidKey;
        var nodes = content.nodes;
        var connections = content.connections;
        var images = content.images || [];
        var backgroundColor = content.images || [];
        var backgroundImg = content.images || [];
        this.backgroundColor = content.backgroundColor || 'fff';
        this.backgroundImg = content.backgroundImg || null;
        this.updateBackground();
        this.attachments = data.map.attachments;
        this.shared = data.isPublic;
        this.isLoadingMap = true;

        this.collaborators = data.map.users;
        if (this.haveCollaborators) {
            this.subscribeChannel();
        }
        for (var i = 0, ii = images.length; i < ii; i++) {
            images[i].omm = omm;
            var pos = omm.images.push(new OpenMindMap.image(images[i]));
            omm.images[pos - 1].draw();
        }
        for (var i = 0, ii = nodes.length; i < ii; i++) {
            if (nodes[i].delta) {
                nodes[i].position = this.decodeDeltaPosition(nodes[i]);
            } else {
                if (!nodes[i].position) {
                    if (nodes[i].isroot) {
                        nodes[i].position = this.setup.node.root.position
                    } else {
                        nodes[i].position = this.getPositionFromRelPosition(nodes[i])
                    }
                }
            }

            nodes[i].omm = omm;
            if (nodes[i].style && (typeof nodes[i].style == 'string')) {
                /* Due to a incompatibiliti issue */
                if (nodes[i].style == 'OpenMindMap.node.baselinetext') {
                    nodes[i].style = 'OpenMindMap.node.textonpath';
                }
                var newNodeFunc = OpenMindMap.utils.getNameSpacedFunction(nodes[i].style);
            } else {
                var newNodeFunc = this.setup.node.style;
            }
            node = new newNodeFunc(nodes[i]);
            this.nodesGuid[node.guid] = node;
            this.nodes.push(node);
            if (node.isroot) {
                this.root = node;
                $('title').text(String.format('OpenMindMap - {0}', node.text()));
            } else {
                guidKey = node.parent.guid + '-' + node.guid;
                node.parent.children.push(node);
                this.usedColors.push(node.color);
                this.addconnection(node.parent, node, node.color, connections[guidKey]);
                node.parent.fixSize();
                node.fixSize();
                if (nodes[i].c_delta) {
                    node.connections.from[0].deltaA = nodes[i].c_delta.deltaA;
                    node.connections.from[0].deltaB = nodes[i].c_delta.deltaB;
                    node.connections.from[0].update();
                    node.connections.from[0].endNode.afterUpdate(false);
                }
            }
            if (nodes[i].weight) {
                node.weight(nodes[i].weight);
            }
            if (nodes[i].italic) {
                node.style('italic');
            }
            if (nodes[i].font) {
                node.font(nodes[i].font);
            }
            node.afterInsert();
        }
        this.load_attachments();
        this.triggerEvent('user-connected');
        if (this.readytrigger) this.readytrigger.call();
        this.isLoadingMap = false;
        if (content.scaleratio) {
            content.scaleratio = Math.floor(content.scaleratio * 100);
            setZoomSlider(content.scaleratio);
            this.zoomUpdateViewBox(content.scaleratio);
        }
    };


    this.decodeDeltaPosition = function (node) {
        if (node.isroot) {
            return this.setup.node.root.position;
        }

        if (node.parentGUID) {
            var parent = this.getNodeByGUID(node.parentGUID)
        } else {
            var parent = node.parent;
        }
        var x = parent.margin().x + node.delta.x;
        var y = parent.margin().y + node.delta.y;
        return OpenMindMap.utils.point(x, y);
    }

    this.getPositionFromRelPosition = function (node) {
        var parentNode = this.getNodeByGUID(node.parentGUID);
        var position = node.rel_position;
        var cx = parentNode.box.getBBox().x;
        var w = parentNode.box.getBBox().width;
        var cy = 1 + parentNode.children.length * (parentNode.margin().height);

        if ((position && position == 'left') || parentNode.leftOfRoot()) {
            return OpenMindMap.utils.point(cx - omm.setup.connection.node.mindistance - omm.setup.node.size.width, cy);
        } else {
            return OpenMindMap.utils.point(cx + omm.setup.connection.node.mindistance + omm.setup.node.size.width, cy);
        }
    };

    this.openattachment = function (j) {
        //non implementato
        throw('openattachment non implementato');
    };

    this.load_attachments = function () {
        var node;
        var attachment;
        var badge;
        var badge_i;
        var attachmentonclick;
        var i;
        if (!this.converter) this.converter = new Markdown.Converter();
        for (var j = 0, ii = this.attachments.length; j < ii; j++) {
            var attachment = this.attachments[j];
            (function (attachment) {
                if (attachment.kind == 'wiki') {
                    node = omm.getNodeByGUID(attachment.node_uuid);
                    if (!node) {
                        console.log('Orphan attachment found: ' + attachment.id);
                        return;
                    }
                    node.wiki = attachment;
                } else {
                    node.attachments.push(attachment);
                    attachmentonclick = (function (j) {
                        return function () {
                            omm.openattachment(j);
                        }
                    })(j);
                    badge = new OpenMindMap.node.badge({
                        icon: '/assets/wiki.png',
                        width: 18,
                        height: 18,
                        omm: this,
                        title: 'Wiki page',
                        onclick: attachmentonclick
                    });
                    node.badges.push(badge);
                    node.badges.draw();
                    node.badges.hide();
                    node.badges.hover();
                }
            })(attachment);
        }
    };

    this.getNodeByGUID = function (guid) {
        return this.nodesGuid[guid];
    };

    this.updateNodesRef = function () {
        var newNodes = [];
        var newNodesGuid = {};
        var newNodesConnections = [];
        for (var i = 0, ii = this.nodes.length; i < ii; i++) {
            if (!this.nodes[i].removed) {
                newNodes.push(this.nodes[i]);
                newNodesGuid[this.nodes[i].guid] = this.nodes[i];
            }
        }
        for (var i = 0, ii = this.connections.length; i < ii; i++) {
            if (!this.connections[i].removed) {
                newNodesConnections.push(this.connections[i]);
            }
        }
        delete this.nodes;
        delete this.nodesGuid;
        delete this.connections;
        this.connections = newNodesConnections;
        this.nodes = newNodes;
        this.nodesGuid = newNodesGuid;
    };

    this.dropImage = function (event, ui) {
        var opt = {};
        var clipPos = parseInt(ui.draggable[0].alt);
        opt.filename = OpenMindMap.images.clipart[clipPos].filename
        opt.size = OpenMindMap.images.clipart[clipPos].size;
        opt.position = OpenMindMap.utils.point(ui.offset.left / omm.scaleratio, ui.offset.top / omm.scaleratio);
        opt.omm = omm;
        omm.setImage(opt);
        delete opt.omm;
        omm.triggerEvent('image-insert', opt);
        omm.changed = true;
    };

    this.setImage = function (opt) {
        var pos = omm.images.push(new OpenMindMap.image(opt));
        omm.images[pos - 1].draw();
    };

    this.removeImage = function (image) {
        var i = $.inArray(image, omm.images);
        if (i >= 0) omm.images.splice(i, 1);
        omm.changed = true;
    };

    this.changeBackgroundColor = function (color) {
        this.backgroundColor = color;
        this.updateBackground();
    };

    this.changeBackgroundImage = function (url) {
        this.backgroundImg = url;
        this.updateBackground();
    };

    this.updateBackground = function (doNotTrig) {
        $(String.format('#{0}', this.holder)).css('backgroundColor', '#' + this.backgroundColor);
        if (this.backgroundImg) {
            $(String.format('#{0}', this.holder)).css('backgroundImage', "url('" + this.backgroundImg + "')");
        } else {
            $(String.format('#{0}', this.holder)).css('backgroundImage', '');
        }
        if (!doNotTrig) {
            this.triggerEvent('background-changed', {backgroundColor: this.backgroundColor, backgroundImg: this.backgroundImg});
        }
    };

    this.resetBackgroundColor = function () {
        this.updateBackground(this.backgroundColor)
    };

    this.resetBackgroundImage = function () {
        $(String.format('#{0}', this.holder)).css('backgroundImage', '');
    };

    this.resetBackground = function () {
        this.backgroundImg = null;
        this.backgroundColor = 'fff';
        this.resetBackgroundImage();
        this.resetBackgroundColor();
    };

    this.setSelectedNode = function (node) {
        if (node && node.toString() == "OpenMindMap.node.dummy") return;
        if (node && node == this.selectedNode) return;
        if (this.selectedNode) {
            this.selectedNode.deselect();
        }
        this.selectedNode = node;
        if (node) {
            this.selectedNode.select();
        }
        if (this.hud()) {
            this.hud().chooseNode(this.selectedNode);
        }
        this.deselectConnection();
    };

    this.deselectConnection = function () {
        if (this.selectedConnection) {
            this.selectedConnection.hideBullets();
            this.selectedConnection = null;
        }
    };

    this.keyDownCallback = function (e) {
        if (omm.editorOpened) {
            return true;
        }
        if (omm.inPlaying && e.which == OpenMindMap.utils.KEY_SPACE) {
            omm.next();
        }
        var keyToSkip = [OpenMindMap.utils.KEY_BACKSPACE, OpenMindMap.utils.KEY_TAB, OpenMindMap.utils.KEY_SPACE];
        return keyToSkip.indexOf(e.which) == -1;
    }

    this.keyUpCallback = function (e) {
        if (!omm.isDefaultEventHandler) {
            return false;
        }
        e.preventDefault();
        e.stopPropagation();
        switch (e.which) {
            case OpenMindMap.utils.KEY_BACKSPACE:
            case OpenMindMap.utils.KEY_DEL:
                omm.selectedNodeActions('delete');
                break;
            case OpenMindMap.utils.KEY_ENTER:
                omm.selectedNodeActions('edit');
                break;
            case OpenMindMap.utils.KEY_TAB:
                if (!omm.selectedNode) {
                    this.setSelectedNode(omm.nodes[0]);
                } else {
                    var index = omm.nodes.indexOf(omm.selectedNode);
                    if (e.shiftKey) {
                        index--;
                        if (index < 0) index = omm.nodes.length - 1;
                    } else {
                        index++;
                    }
                    var newIndex = (index) % (omm.nodes.length);
                    omm.setSelectedNode(omm.nodes[newIndex]);
                }
                break;
            case OpenMindMap.utils.KEY_I:
            case OpenMindMap.utils.KEY_INS:
                if (e.shiftKey) {
                    omm.selectedNodeActions('insertsibling');
                } else {
                    omm.selectedNodeActions('insertnode');
                }
                break;
            case OpenMindMap.utils.KEY_F:
                omm.selectedNodeActions('foldunflodchild');
                break;
            case OpenMindMap.utils.KEY_W:
                if (e.shiftKey) {
                    omm.selectedNodeActions('editwikipage');
                } else {
                    omm.selectedNodeActions('openwikipage');
                }
                break;
            case OpenMindMap.utils.KEY_L:
                omm.selectedNodeActions('lockunlockchild');
                break;
        }
        return false;
    }

    this.selectedNodeActions = function (action) {
        if (!omm.selectedNode) {
            //	alert('Please select a node');
            return;
        }
        if (omm.editorOpened) {
            return;
        }
        switch (action) {
            case 'delete':
                omm.selectedNode.remove();
                delete omm.selectedNode;
                break;
            case 'lockunlockchild':
                omm.selectedNode.childLocked = !omm.selectedNode.childLocked
                break;
            case 'foldunflodchild':
                omm.selectedNode.childFolded = !omm.selectedNode.childFolded;
                omm.getConnectionsObj(true);
                if (omm.selectedNode.childFolded) {
                    omm.selectedNode.foldChildren();
                } else {
                    omm.selectedNode.unfoldChildren();
                }
                omm.cleanConnectionsHashMap();
                break;
            case 'edit':
                omm.selectedNode.showEditor(omm.selectedNode.setTextTrigger);
                break;
            case 'insertnode':
                omm.addnode({parent: omm.selectedNode});
                break;
            case 'editwikipage':
                gotoWikiEditor(omm.selectedNode)
                break;
            case 'openwikipage':
                showWikiPageId(omm.selectedNode.guid)
                break;
            case 'insertsibling':
                if (omm.selectedNode.isroot) {
                    alert("Cannot add a sibling node to root");
                    return;
                }
                omm.addnode({parent: omm.selectedNode.parent});
                break;
            case 'centernode':
                omm.centerNode(omm.selectedNode);
                break;
            default:
                break;
        }
    }

    this.setReadOnly = function () {
        this.readOnly = true;
    }

    this.isReadOnly = function () {
        return this.readOnly;
    }

    this.centerNode = function (node) {
        var center = omm.root.getCenter();
        var offset = $('#' + omm.holder).offset();

        var topVal = center.y - $(window).height() / 2;
        var leftVal = center.x - $(window).width() / 2;

        if (!node.isroot) {
            var delta = node.getDeltaPositionBetween(omm.root);
            topVal = topVal + delta.y * omm.scaleratio;
            leftVal = leftVal + delta.x * omm.scaleratio;
        }

        $(document).scrollTop(topVal + offset.top);
        $(document).scrollLeft(leftVal + offset.left);
    }

    this.zoomUpdateViewBox = function (newZoomLevel) {
        omm.scaleratio = newZoomLevel / 100;
        omm.zoomViewBox.height = omm.paper.height / omm.scaleratio;
        omm.zoomViewBox.width = omm.paper.width / omm.scaleratio;
        omm.zoomY = omm.root.getCenter().y - omm.zoomViewBox.height / 2;
        omm.zoomX = omm.root.getCenter().x - omm.zoomViewBox.width / 2;
        omm.paper.setViewBox(omm.zoomX, omm.zoomY, omm.zoomViewBox.width, omm.zoomViewBox.height);
        omm.paper.safari();
    };

    this.centerRootNode = function () {
        this.centerNode(this.root);
    };

    this.play = function () {
        this.playingOrder = [];
        this.playingIndex = 0;
        this.getPlayOrder(omm.root);
        this.setSelectedNode(this.root);
        setZoomSlider(300);
        omm.root.zoomAndPan();
        setSlideIndicator(0, this.playingOrder.length - 1);
        this.inPlaying = true;
    };

    this.next = function () {
        if (typeof(this.playingIndex) == 'undefined') return;
        this.playingIndex++;
        if (this.playingIndex == this.playingOrder.length || !this.playingOrder[this.playingIndex]) {
            this.setSelectedNode(this.root);
            this.centerRootNode();
            this.zoomUpdateViewBox(100);
            setZoomSlider(100);
            this.playingIndex = null;
            hidePlayingNext();
            this.inPlaying = false;
            return;
        }
        setSlideIndicator(this.playingIndex, this.playingOrder.length - 1);
        this.setSelectedNode(this.playingOrder[this.playingIndex]);
        this.playingOrder[this.playingIndex].zoomAndPan();
    }

    this.getPlayOrder = function (node) {
        this.playingOrder.push(node);
        var children = node.getOrderedChildren();
        for (var i = 0, ii = children.length; i < ii; i++) {
            this.getPlayOrder(children[i]);
        }
        ;
    };

    this.classSetup();
}