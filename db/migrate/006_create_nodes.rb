class CreateNodes < ActiveRecord::Migration
  def self.up
    create_table :nodes do |t|
      t.text :content
      t.integer :node_uuid
      t.integer :map_id

      t.timestamps
    end
  end

  def self.down
    drop_table :nodes
  end
end
