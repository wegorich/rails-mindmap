class RenamePublicToIsPublicToMaps < ActiveRecord::Migration
  def up
    change_table :maps do |t|
      t.rename :public, :isPublic
    end
  end

  def down
    change_table :maps do |t|
      t.rename :isPublic, :public
    end
  end
end
