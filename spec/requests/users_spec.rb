require 'spec_helper'

describe "Users" do
  describe "User registration" do
    it "Try to register a new user" do
      user = Factory(:user)
      visit new_user_registration_path
      page.should have_content('Sign up')
      fill_in "Email", :with => user.email
      fill_in "Password", :with => user.password
      fill_in "Password confirmation", :with => user.password            
      click_button "Sign up"
      page.should have_content('Public maps')
    end
  end
end
