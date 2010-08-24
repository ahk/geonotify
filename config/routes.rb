ActionController::Routing::Routes.draw do |map|
  map.resource :user_session
  map.login    'login', :controller => "user_sessions", :action => "new"
  map.logout   'logout', :controller => "user_sessions", :action => "destroy"
    
  map.resource :account, :controller => "users"
  map.resources :users do |user|
    map.resources :contacts, :except => [:index], :member => [:send_test_message]
    map.resources :areas, :except => [:index]
    map.resources :subscriptions
  end

  map.resources :schedules
  
  map.resources :password_resets
  
  map.root :controller => "user_sessions", :action => "new"
end
