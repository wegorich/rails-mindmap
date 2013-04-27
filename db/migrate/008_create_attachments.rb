class CreateAttachments < ActiveRecord::Migration
  def change
    create_table :attachments do |t|
      t.integer :map_id
      t.string :kind
      t.string :node_uuid
      t.text :content
      t.string :content_url

      t.timestamps
    end
  end
end
