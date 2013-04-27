=begin
require 'spec_helper'

describe MapsController do

  describe "GET 'show'" do
    
    it "should be successful" do
      response.should be_success
    end
    
    it "should find the right user" do
      get :show, :id => @user.id
      assigns(:user).should == @user
    end
    
  end

end
=end