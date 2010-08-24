class User < ActiveRecord::Base
  acts_as_authentic do |conf|
    conf.ignore_blank_passwords = false
  end
  
  def deliver_password_reset!
    reset_perishable_token!
    UserMailer.deliver_password_reset!(self)
  end

  has_many :contacts
  has_many :areas
  has_many :subscriptions
end
