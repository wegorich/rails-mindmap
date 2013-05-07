class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :set_locale
  private
 
  def require_login
    unless user_signed_in?
      flash[:error] = "You must be logged in to access this section"
      redirect_to new_user_session_path # halts request cycle
    end
  end

  def set_locale
    I18n.locale = params[:locale] || I18n.default_locale
  end
end