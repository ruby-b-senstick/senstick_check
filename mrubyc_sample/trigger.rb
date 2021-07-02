sensor = SenStickIF.new([:brightness])

old_value = sensor.get(:brightness)
while true do
  new_value = sensor.get(:brightness)
  if (new_value-old_value).abs > 50 then
    led 1
    sleep 0.5
  else
    led 0
    sleep 0.1
  end
  old_value = new_value
  
end

  
