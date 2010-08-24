class Schedule < ActiveRecord::Base
  has_many :subscriptions

  def subscription_for(user)
    Subscription.find_or_initialize_by_user_id_and_schedule_id(user.to_param, self.to_param)
  end
end
