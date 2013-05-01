OpenMindMap::Application.routes.draw do

  ActiveAdmin.routes(self)

  devise_for :admin_users, ActiveAdmin::Devise.config

  resources :news

  resources :bugs

#  Mercury::Engine.routes
  devise_for :users, controllers: {omniauth_callbacks: 'users/omniauth_callbacks',
                                   registrations: 'registrations'}
  
  get 'maps/public'
  get 'maps/import'
  post 'maps/import'
  resources :maps do
    resources :versions
    member do
      post 'share'
      get  'share'     
      post 'event'             
    end
    resources :attachments 
    resources :nodes do 
      resources :attachments 
    end
    resources :contacts

  end
  
  resources :contacts do
    get :autocomplete_user_email, on: :collection
  end
  
  match ':controller(/:action(/:id(.:format)))'

  root to: 'maps#index'
end
