SONIQ SPACE (Audio-Reactive 3D Visualiser)

Soniq Space is a web app that transforms your audio file into an inviting immersive, interactive 3D visual experience.
The core purpose is to create a personalised audio-reactive room where colours, shapes, particles, and lighting respond in real time to sound. Users can upload audio, customise visuals, and save unique rooms to revisit in a scrollable gallery.

FEATURES

Audio-reactive 3D room using Web Audio API + Three.js

Custom colours, shapes, particles, and branding

Upload audio files (Multer) with file data stored in MongoDB

Loop, shuffle, and switch between uploaded tracks

Save multiple visual rooms per user

Secure login system (JWT)

TECHNOLOGY STACK
Frontend

React

React Three Fiber + Three.js

Bootstrap (UI layout)

Web Audio API

Backend

Node.js + Express

Multer (audio uploads)

MongoDB + Mongoose

JWT Authentication

ARCHITECTURE FLOW

1.React + R3F (3D visuals)


      
2.Express API (auth, uploads, room data)


      
3.MongoDB (users, audio files, room settings)

      
Local/Cloud Storage (audio + logos)


Frontend and backend are developed separately for safety, clarity, and iterative testing.

UI / UX CONSIDERATIONS

Simple Bootstrap layout for uploads and settings

Clean panel for colours, shapes, particles, and branding

Fullscreen interactive 3D room

Scroll-to-view gallery for saved rooms


MVP FEATURES

-User login/register

-Audio upload + storage

-Audio-reactive 3D environment

-Basic customisation (colour, shape, particles, branding)

-Save/load room settings

-Loop and shuffle audio


CHALLENGES

-Large GLB models caused loading issues

-Need to optimise 3D visuals for performance

-Audio files are large — store paths, not raw files, in MongoDB

-Syncing audio data smoothly with 3D visuals


EXPERIMENTS

-Tested Web Audio API for frequency and amplitude analysis

-Loaded GLB models from Blender (learned file-size limits)

-Tried 2D animated textures

-Built early Express routes for uploads + room saving

-UI experiments with custom CSS before switching to Bootstrap


LEARNING POINTS

-Separating frontend and backend improves workflow and prevents crashes

-Three.js scenes must stay lightweight

-Bootstrap speeds up reliable UI building

-Audio storage requires careful planning

-Mapping audio data to visuals requires experimentation

