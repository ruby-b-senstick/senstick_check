sensor = SenStickIF.new([:temperature])

while true do
  $ondo = sensor.get(:temperature)
  sleep 0.5
end

  
