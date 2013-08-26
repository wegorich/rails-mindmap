OpenMindMap.config.mindmap = {
	name: 'Mind Map',
    node: {
        size: {
            width: 70,
            height: 40,
			w: 70,
			h: 40
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
                y: 50
            },
            style: OpenMindMap.node.classic
        },
		style: OpenMindMap.node.textonpath        
    },
    paper: {
        size: {
            width: 1388,
            height: 600
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
		style: OpenMindMap.connection.bicubic
    },
    allowedNodes: { mindmapl : { name : '', icon:'mindmap', callback: function(menu, element){
                                    omml.paper.getById(element.$trigger[0].raphaelid).ommnode.switchToNodeStyle(OpenMindMap.node.textonpath);                      
                                }, accesskey:"c" },

                    classic	: { name : '', icon:'roundbox', callback: function(menu, element){
                                    omml.paper.getById(element.$trigger[0].raphaelid).ommnode.switchToNodeStyle(OpenMindMap.node.classic);						
								}, accesskey:"c" },

                    square : { name : '', icon:'rectbox', callback: function(menu, element){
                                    omml.paper.getById(element.$trigger[0].raphaelid).ommnode.switchToNodeStyle( OpenMindMap.node.square );                      
                                }, accesskey:"q" },

                    ellipse : { name : '', icon:'ellipse', callback: function(menu, element){
                                    omml.paper.getById(element.$trigger[0].raphaelid).ommnode.switchToNodeStyle( OpenMindMap.node.ellipse );                      
                                }, accesskey:"l" },
                               
					noborder : { name : '', icon:'borderless', callback: function(menu, element){
                                    omml.paper.getById(element.$trigger[0].raphaelid).ommnode.switchToNodeStyle(OpenMindMap.node.noborder);  									
								}, accesskey:"b" },
					idea : { name : 'Idea', icon:'idea', callback: function(menu, element){
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
								}, accesskey:"q" },
					youtube :	{ name : 'YouTube', icon:'question', callback: function(menu, element){
                                    omml.paper.getById(element.$trigger[0].raphaelid).ommnode.switchToNodeStyle(OpenMindMap.node.youtube);  									
								}, accesskey:"y" }
					
				}
};