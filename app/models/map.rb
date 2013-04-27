class Map < ActiveRecord::Base
  belongs_to :user
  belongs_to :last_editor, :foreign_key => "last_edit_by", :class_name => "User"
  has_and_belongs_to_many :users, :uniq => true 
  has_many :attachments
  versioned
  
  require 'pp'
  before_save :clean_svg

  def clean_svg
    opts = {}
    opts[:grid] = true
    opts[:absolute] = true
    svgdata = Nokogiri::XML(self.svgdata)
    svgdata.xpath("//*[contains(@style,'opacity: 0')]").each {|x| x.remove}
    self.svgdata = svgdata.to_s    
  end

  def self.public
    find_all_by_isPublic(true) || []
  end

  def self.from_freemind xml
  	map = self.new
  	xml_map = Nokogiri::XML(xml)
  	content = {}
  	nodes = []
  	nodes_from_xml = xml_map.xpath('/map/node')
  	connections = {}  	
  	unless nodes_from_xml.empty?
	    root_node =  get_node_data(nodes_from_xml)	    
      nodes << root_node
      map.title = root_node["text"]
	    nodes += get_child_nodes(nodes_from_xml) if nodes_from_xml.children
	  end
  	map.content = {"nodes" => nodes, "connections" => connections}.to_json    
  	map.save
  	map
  end

private
  def self.get_child_nodes xml_node
    nodes = []
    unless xml_node.children.empty?
      parent = get_node_data(xml_node)
		  xml_node.children.each do |node|		    
		    node_data = get_node_data(node, parent)
  			nodes << node_data unless node_data.empty?
  			if node.children
  			  nodes += get_child_nodes(node)
  			end
  		end  		
  	end
  	nodes  		
  end
  
  def self.get_node_data node, parent=nil
    node_hash = {}
    node_hash["text"] = node.attribute('TEXT').value if node.attribute('TEXT')
    node_hash["guid"] = node.attribute('ID').value   if node.attribute('ID')
    node_hash["rel_position"] = node.attribute('POSITION').value if node.attribute('POSITION')
    unless node_hash.empty?
      if parent 
  	    node_hash["parentGUID"] = parent["guid"]           
  	  else
  	    node_hash["isroot"] = true 
  	  end
  	  node_hash["position"]  	 
    end       
	  node_hash
  end
end
