class AddLastEditByToMaps < ActiveRecord::Migration
  def change
    add_column :maps, :last_edit_by, :integer
  end
end
