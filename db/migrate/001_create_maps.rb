class CreateMaps < ActiveRecord::Migration
  def self.up
    create_table :maps do |t|
      t.string :title
      t.text :content

      t.timestamps
    end
  end

  def self.down
    drop_table :maps
  end
end
