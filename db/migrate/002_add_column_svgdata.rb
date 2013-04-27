class AddColumnSvgdata < ActiveRecord::Migration
  def self.up
		add_column :maps, :svgdata, :text
  end

  def self.down
		remove_column :maps, :svgdata
  end
end
