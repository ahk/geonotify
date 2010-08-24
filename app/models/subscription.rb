class Subscription < ActiveRecord::Base
  belongs_to :user
  belongs_to :area
  belongs_to :schedule
  belongs_to :contact
end
