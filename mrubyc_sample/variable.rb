sensor = SenStickIF.new([:temperature])

while true do
  t = sensor.get(:temperature)
  if t>30 then
    led 1
  else
    led 0
  end
  sleep 0.5
end

  
