OpenMindMap.config.dialoguemap = {
	name: 'Dialogue Map',
    node: {
        size: {
            width: 100,
            height: 60,
			w: 100,
			h: 60
        },
        padding: 15,
        shape: 'rect',
        text: 'New node',
		defaultText : 'New map',
        color: '#00f',
        radius: 10,
        root: {
            size: {
                width: 100,
                height: 60
            },
            position: {
                x: 50,
                y: $(window).height() /2 
            },
            style: OpenMindMap.node.ibis.question
        },
		style: OpenMindMap.node.ibis.question
    },
    paper: {
        size: {
            width: $(window).width(),
            height: $(window).height()
        },
        color: '#333'
    },
    connection: {
        node: {
            mindistance: 60,
            onmovemindistance: 10
        },
        font: {
            name: 'Myriad Pro Regular',
            size: 20,
            spacing: 2,
            space: 4
        },
        direction: 'reverse',
		style: OpenMindMap.connection.arrow
    },
	allowedNodes: { idea : { name : 'Idea', icon:'idea', callback: function(menu, element){
                                    omml.paper.getById(element.$trigger[0].raphaelid).ommnode.switchToNodeStyle(OpenMindMap.node.ibis.idea);  
                                    }, accesskey:"i" },
                    pros : { name : 'Pros', icon:'pros', callback: function(menu, element){
                                    omml.paper.getById(element.$trigger[0].raphaelid).ommnode.switchToNodeStyle(OpenMindMap.node.ibis.pros);                                    
                                }, accesskey:"p" },
                    cons : { name : 'Cons', icon:'cons', callback: function(menu, element){
                                    omml.paper.getById(element.$trigger[0].raphaelid).ommnode.switchToNodeStyle(OpenMindMap.node.ibis.cons);                                    
                                }, accesskey:"c" },
                    question : { name : 'Question', icon:'question', callback: function(menu, element){
                                    omml.paper.getById(element.$trigger[0].raphaelid).ommnode.switchToNodeStyle(OpenMindMap.node.ibis.question);                                    
                                }, accesskey:"q" }
                }
					
	
};