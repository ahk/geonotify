TROPO_API_TOKEN = '37ef85400d3eb14ab168db8cdc1ee9d248ceef82e223e0b050488c144195a23b80d646dc80663b09a2fe9784'

class TropoParty
  include HTTParty
  base_uri "http://api.tropo.com/1.0/sessions"

  def self.send_message(via, to, message)
    self.get '', :query => {:action => 'create',
                            :token => TROPO_API_TOKEN,
                            :msg => message,
                            :to => to,
                            :via => via }
  end
end