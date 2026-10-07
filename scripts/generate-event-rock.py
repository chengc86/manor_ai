# Original instrumental: distorted power chords, bass, kick, snare and hi-hats. No sampled music.
import math,random,wave,struct
from pathlib import Path
rate=22050;beat=.4;duration=beat*32;n=int(duration*rate);rng=random.Random(12)
roots=[82.4069,82.4069,65.4064,73.4162,82.4069,97.9989,65.4064,73.4162]
Path('public/audio').mkdir(exist_ok=True)
with wave.open('public/audio/admin-abuse-rock.wav','wb') as out:
 out.setnchannels(1);out.setsampwidth(2);out.setframerate(rate)
 data=bytearray()
 for i in range(n):
  t=i/rate;b=t/beat;bar=int(b)//4;f=roots[bar];eighth=(b*2)%1;phase=2*math.pi*f*t
  guitar=math.tanh(3*(math.sin(phase)+.65*math.sin(phase*1.5)+.4*math.sin(phase*2)))*math.exp(-eighth*2.8)
  bass=.18*math.sin(phase/2)*math.exp(-(b%1)*2)
  kick_age=(b%2)*beat;kick=.45*math.sin(2*math.pi*(48*kick_age+9*(1-math.exp(-kick_age*30))))*math.exp(-kick_age*18)
  snare_age=((b-1)%2)*beat;noise=rng.uniform(-1,1);snare=.28*noise*math.exp(-snare_age*23)
  hat=.09*noise*math.exp(-eighth*35)
  value=.28*guitar+bass+kick+snare+hat
  # Eight complete bars form a seamless rhythmic loop.
  data.extend(struct.pack('<h',int(max(-.95,min(.95,value))*32767)))
 out.writeframes(data)
