class AddConfToMaps < ActiveRecord::Migration
  def change
    add_column :maps, :conf, :string
  end
end
