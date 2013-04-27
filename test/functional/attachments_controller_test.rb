require 'test_helper'

class AttachmentsControllerTest < ActionController::TestCase
  setup do
    @map = maps(:coolmap)
    @attachment = attachments(:wiki)
    sign_in users(:one)
  end
  
  test "Should get zero attachments on an empty map" do
    get :index, :map_id => @map.to_param
    assert_response :success
    assert_not_nil assigns(:maps)
  end
  
  test "should create attachment" do
    attachment = Factory.build(:attachment)
    assert_difference('Attachment.count') do
      post :create, :attachment => attachment.attributes
    end

    assert_redirected_to map_attachments_path(attachment.map)
  end
end