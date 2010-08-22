class Contact < ActiveRecord::Base
  TYPES = {
   'sms' => 'Text Message',
   'call' => 'Phone Call'
  }

  belongs_to :user

  def description
    (self.nickname.present? ? "\"#{self.nickname}\", a " : '') +
      "#{TYPES[self.contact_type].downcase} to #{self.value}"
  end
end
