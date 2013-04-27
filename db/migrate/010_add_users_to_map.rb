class AddUsersToMap < ActiveRecord::Migration
  def up
  	create_table 'maps_users', :id => false do |t|
    	t.column :map_id, :integer
    	t.column :user_id, :integer
  	end
  	add_index(:maps_users, [:map_id, :user_id], :unique => true)
  end

  def down
  end
end
