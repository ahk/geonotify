ActionController::Routing::Routes.draw do |map|
  map.resource :user_session
  map.login    'login', :controller => "user_sessions", :action => "new"
  map.logout   'logout', :controller => "user_sessions", :action => "destroy"
    
  map.resource :account, :controller => "users"
  map.resources :users
  
  map.resources :password_resets
  
  map.root :controller => "user_sessions", :action => "new"
  # map.connect ':controller/:action/:id'
  # map.connect ':controller/:action/:id.:format'
end
