class CreateBugs < ActiveRecord::Migration
  def change
    create_table :bugs do |t|
      t.string :title
      t.text :content
      t.integer :user_id
      t.integer :status_id
      t.integer :assigned_to_user_id

      t.timestamps
    end
  end
end
