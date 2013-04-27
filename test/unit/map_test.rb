require 'test_helper'

class MapTest < ActiveSupport::TestCase
require 'pp'

  def setup
    @map = '<map version="0.9.0">
            <node CREATED="1175145935359" ID="Freemind_Link_834839151" MODIFIED="1175145939562" POSITION="left" TEXT="strengths">
              <node CREATED="1175145929140" HGAP="40" VSHIFT="-72" ID="Freemind_Link_1976030643" MODIFIED="1175145930515" TEXT="cool">
                <node CREATED="1175145985593" HGAP="115" VSHIFT="-56" ID="Freemind_Link_147556186" MODIFIED="1175145995484" TEXT="3D environment"/>
              </node>
              <node CREATED="1175145979546" HGAP="124" VSHIFT="14" ID="_" MODIFIED="1175145984421" TEXT="simple interface"/>
              <node CREATED="1175146116296" HGAP="106" VSHIFT="-62" ID="Freemind_Link_1671407849" MODIFIED="1175232237203" TEXT="video tutorials">
                <node CREATED="1175232238578" HGAP="14" VSHIFT="-42" ID="Freemind_Link_1293952761" MODIFIED="1175232250562" TEXT="at TNG site">
                  <node CREATED="1175232160500" HGAP="106" VSHIFT="14" ID="Freemind_Link_989630299" LINK="http://education.mit.edu/starlogo-tng/tutorial-videos/" MODIFIED="1175232222953" TEXT="http://education.mit.edu/starlogo-tng/tutorial-videos/"/>
                </node>
                <node CREATED="1175232251000" HGAP="106" VSHIFT="14" ID="Freemind_Link_552172966" MODIFIED="1175232256265" TEXT="created by Dennis Daniels">
                  <node CREATED="1175232308312" HGAP="106" VSHIFT="14" ID="Freemind_Link_758707439" LINK="http://video.google.com/videosearch?q=starlogo+Dennis+Daniels" MODIFIED="1175232316281" TEXT="http://video.google.com/videosearch?q=starlogo+Dennis+Daniels"/>
                </node>
              </node>
            </node>           
          </map>'
  end
  
  # Replace this with your real tests.
 	test "import empty map from FreeMind" do
		xml = "<map version=\"0.9.0\"></map>"
 		map = Map.from_freemind xml
    decoded_content = ActiveSupport::JSON.decode(map.content) 
 		assert_equal 0, decoded_content["nodes"].count
    assert_equal 0, decoded_content["connections"].count    
 	end

 	test "import a map with 1 node from FreeMind" do
 	  xml = '<map version="0.9.0"><node CREATED="1297268758077" ID="ID_823365053" MODIFIED="1297324814819" STYLE="bubble" TEXT="Nodo A" /></map>'
 		map = Map.from_freemind xml
 		decoded_content = ActiveSupport::JSON.decode(map.content) 	
 		assert_equal 1, decoded_content["nodes"].count
    assert_equal 0, decoded_content["connections"].count
 		assert_equal 'Nodo A', decoded_content["nodes"].first['text']
 	end

 	test "import a map with 2 nodes from FreeMind and test nodes have the uuid" do
 		xml = '<map version="0.9.0"><node CREATED="1297268758077" ID="ID_823365053" MODIFIED="1297324814819" STYLE="bubble" TEXT="Nodo A"><node CREATED="1297268758077" ID="ID_824234234234" MODIFIED="1297324814819" STYLE="bubble" TEXT="Nodo B" /></node></map>'
 		map = Map.from_freemind xml
 		decoded_content = ActiveSupport::JSON.decode(map.content) 		
		assert_equal 2, decoded_content["nodes"].count
 		assert_equal 'Nodo A', decoded_content["nodes"].first['text']
 		assert_equal true, decoded_content["nodes"].first['isroot']
 		assert_equal 'ID_823365053', decoded_content["nodes"].first['guid']
 		assert_equal 'Nodo B', decoded_content["nodes"].last['text']
		assert_equal 'ID_824234234234', decoded_content["nodes"].last['guid']
 		assert_equal nil, decoded_content["nodes"].last['isroot']	    
 	end
 	
 	test "import a map with many children from FreeMind" do
 		xml = @map
 		map = Map.from_freemind xml
    decoded_content = ActiveSupport::JSON.decode(map.content) 		
    assert_equal 9,                          decoded_content["nodes"].count
 		assert_equal 'strengths',                decoded_content["nodes"].first['text']
  	assert_equal 'cool',                     decoded_content["nodes"][1]['text']
  	assert_equal 'Freemind_Link_834839151',  decoded_content["nodes"][1]['parentGUID']
  	assert_equal 'Freemind_Link_1976030643', decoded_content["nodes"][2]['parentGUID']
  	assert_equal 'Freemind_Link_834839151',  decoded_content["nodes"][3]['parentGUID']  	
  	assert_equal 'Freemind_Link_834839151',  decoded_content["nodes"][4]['parentGUID']  	
  	assert_equal 'Freemind_Link_1671407849', decoded_content["nodes"][5]['parentGUID']  	
  	assert_equal 'Freemind_Link_1293952761', decoded_content["nodes"][6]['parentGUID']  	
  	assert_equal 'Freemind_Link_1671407849', decoded_content["nodes"][7]['parentGUID']
  	assert_equal 'Freemind_Link_552172966',  decoded_content["nodes"][8]['parentGUID']
 	end
 	
  test "import a complex map with coordinates" do
    xml = @map
    map = Map.from_freemind xml
    decoded_content = ActiveSupport::JSON.decode(map.content)       
    assert_equal 9,                          decoded_content["nodes"].count
    assert_equal 'strengths',                decoded_content["nodes"].first['text']
    assert_equal 500,                        decoded_content["nodes"].first['position']['x']
    assert_equal 500,                        decoded_content["nodes"].first['position']['y']
    assert_equal 700,                        decoded_content["nodes"][1]['position']['x']
    assert_equal 328,                        decoded_content["nodes"][1]['position']['y']
  end
end
