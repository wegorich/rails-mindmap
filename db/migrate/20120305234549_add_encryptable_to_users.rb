class AddEncryptableToUsers < ActiveRecord::Migration
  def change
  	# Token authenticatable      
  	add_column :users, :authentication_token, :string
    add_index :users, :authentication_token, :unique => true
  end
end
