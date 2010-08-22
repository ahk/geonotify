class UserMailer < ActionMailer::Base
  def activation_code(user)
    setup_defaults!
    recipients    user.email
    subject       "Activate Your Geonotify Account"
    sent_on       Time.now
    body          :user => user, :activation_code => user.perishable_token
  end
  
  def password_reset(user)
    setup_defaults!
    recipients    user.email
    subject       "Geonotify Password Reset"
    sent_on       Time.now
    body          :user => user, :password_reset_token => user.perishable_token
  end

protected
  def setup_defaults!
    from "andrew.hay.kurtz@gmail.com"
  end
end
