Subscription.all.each do |subscription|
  require 'ap'
  url = "http://data.pdxapi.com/#{subscription.schedule.db_name}/_design/geojson/_spatiallist/intersect/points?callback=jsonp&bbox=-180,180,-90,90&poly=#{JSON.parse(subscription.area.geometry)['coordinates'].to_json}"
  puts url
  results = HTTParty.get(url)
  ap results
  if results.length > "jsonp({\"rows\":[]});".length
    subscription.contact.send_message("New #{subscription.schedule.name} points in your #{subscription.area.name} area!")
  end
end