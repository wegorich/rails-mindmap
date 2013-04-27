class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  require 'uuidtools'
  
  def facebook
    oauthorize "Facebook"
  end
  
  def twitter
    oauthorize "Twitter"
  end
  
  def linkedin
    oauthorize "LinkedIn"
  end

  def github
    oauthorize "GitHub"    
  end

  def windowslive
    oauthorize "WindowsLive"
  end

  def yahoo
    @user = User.find_for_open_id(request.env["omniauth.auth"], current_user)

    if @user.persisted?
      flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => "Yahoo"
      sign_in_and_redirect @user, :event => :authentication
    else
      session["devise.yahoo_data"] = request.env["omniauth.auth"]
      redirect_to new_user_registration_url
    end
  end
  
  def google
    @user = User.find_for_open_id(request.env["omniauth.auth"], current_user)

    if @user.persisted?
      flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => "Google"
      sign_in_and_redirect @user, :event => :authentication
    else
      session["devise.google_data"] = request.env["omniauth.auth"]
      redirect_to new_user_registration_url
    end
  end

  def google_apps
     # You need to implement the method below in your model
     @user = User.find_for_googleapps_oauth(request.env["omniauth.auth"], current_user)

     if @user.persisted?
       flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => "Google Apps"
       sign_in_and_redirect @user, :event => :authentication
     else
       session["devise.googleapps_data"] = request.env["omniauth.auth"]
       redirect_to new_user_registration_url
     end
   end

  private
  def oauthorize(kind)
    @user = find_for_ouath(kind, request.env["omniauth.auth"], current_user)
    if @user
      flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => kind
      session["devise.#{kind.downcase}_data"] = env["omniauth.auth"]
      sign_in_and_redirect @user, :event => :authentication
    end    
  end

  def find_for_ouath(provider, access_token, resource=nil)
    user, email, name, uid, auth_attr = nil, nil, nil, {}
    pp(access_token)
    case provider
    when "Facebook"
      uid = access_token['uid']
      email = access_token['info']['email']
      auth_attr = { :uid => uid, :token => access_token['credentials']['token'], :secret => nil, :name => access_token['info']['name'], :link => access_token['info']['urls'] }
    when "Twitter"
      uid = access_token['uid']
      name = access_token['info']['nickname']
      auth_attr = { :uid => uid, :token => access_token['credentials']['token'], :secret => access_token['credentials']['secret'], :name => name, :link => "http://twitter.com/#{name}" }
    when 'GitHub','WindowsLive'
      uid = access_token['uid']
      name = access_token['info']['name']
      auth_attr = { :uid => uid, :token => access_token['credentials']['token'], :name => name, :link => access_token['extra']['raw_info']['html_url'] }    
    else
      raise 'Provider #{provider} not handled'
    end
    if resource.nil?
      if email
        user = find_for_oauth_by_email(email, resource)
      elsif uid && name
        user = find_for_oauth_by_uid(uid, resource)
        if user.nil?
          user = find_for_oauth_by_name(name, resource)
        end
      end
    else
      user = resource
    end
    
    auth = user.authorizations.find_by_provider(provider)
    if auth.nil?
      auth = user.authorizations.build(:provider => provider)
      user.authorizations << auth
    end
    auth.update_attributes auth_attr
    
    return user
  end

  def find_for_oauth_by_uid(uid, resource=nil)
    user = nil
    if auth = Authorization.find_by_uid(uid.to_s)
      user = auth.user
    end
    return user
  end

  def find_for_oauth_by_email(email, resource=nil)
    if user = User.find_by_email(email)
      user
    else
      user = User.new(:email => email, :password => Devise.friendly_token[0,20]) 
      user.save
    end
    return user
  end
  
  def find_for_oauth_by_name(name, resource=nil)
    if user = User.find_by_name(name)
      user
    else
      user = User.new(:name => name, :password => Devise.friendly_token[0,20], :email => "#{UUIDTools::UUID.random_create}@openmindmap.me")
      user.name = name
      user.save :validate => false
    end
    return user
  end

end