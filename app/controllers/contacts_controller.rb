class ContactsController < ApplicationController
  autocomplete :user, :email

  def destroy
  	@map = Map.find(params[:map_id])
  	if @map.user == current_user
		user = @map.users.find(params[:id])
  		if user
  			@map.users.delete(user)
  		end  	
  	end
    respond_to do |format|
      format.js
    end
  end
end
