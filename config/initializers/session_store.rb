# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_geonotify_session',
  :secret      => 'd74a5d89a3f0c05e1d7cbc6477739c532462409e578b221cf8c605cbbe2059674f1a7646e7ae8210a96c8f0f26527763d4bb193ed6e4750963991c0c38e9d10c'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
