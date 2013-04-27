require 'spec_helper'

describe "bugs/new.html.erb" do
  before(:each) do
    assign(:bug, stub_model(Bug,
      :title => "MyString",
      :content => "MyText",
      :user_id => 1,
      :status_id => 1,
      :assigned_to_user_id => 1
    ).as_new_record)
  end

  it "renders new bug form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => bugs_path, :method => "post" do
      assert_select "input#bug_title", :name => "bug[title]"
      assert_select "textarea#bug_content", :name => "bug[content]"
      assert_select "input#bug_user_id", :name => "bug[user_id]"
      assert_select "input#bug_status_id", :name => "bug[status_id]"
      assert_select "input#bug_assigned_to_user_id", :name => "bug[assigned_to_user_id]"
    end
  end
end
