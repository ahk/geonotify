class Contact < ActiveRecord::Base
  TYPES = {
   'sms' => 'Text Message',
   'call' => 'Phone Call'
  }

  belongs_to :user
  has_many :subscriptions

  def description
    (self.nickname.present? ? "\"#{self.nickname}\", a " : '') +
      "#{TYPES[self.contact_type]} to #{self.value}"
  end

  def send_message(message)
    case contact_type
      when 'sms', 'call'
        send_message_via_tropo(message)
    end
  end

  def send_message_via_tropo(message)
    TropoParty.send_message(contact_type, self.value, message)
  end
end
