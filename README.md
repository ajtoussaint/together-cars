<h1>Together Cars</h1>
<a href="https://togethercars.dev">
  <img align="center" src="https://raw.githubusercontent.com/ajtoussaint/Profile-Images/main/TogetherCars.PNG" />
</a>
<p>Live Website: <a href="https://togethercars.dev">https://togethercars.dev</a></p>

<h2>Under the Hood:</h2>
<p>
  <b>Tech Used:</b> HTML, CSS, SASS, JavaScript, Node, Express, React, MongoDB, Nginx, AWS EC2
 <p align="center">
   <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original-wordmark.svg" alt="html5" width="40" height="40"/>
   <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original-wordmark.svg" alt="css3" width="40" height="40"/> 
   <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/sass/sass-original.svg" alt="sass" width="40" height="40"/>
   <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="40" height="40"/>
   <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="40" height="40"/>
 <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original-wordmark.svg" alt="express" width="40" height="40"/>
   <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" alt="react" width="40" height="40"/>
   <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original-wordmark.svg" alt="mongodb" width="40" height="40"/>
   <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nginx/nginx-original.svg" alt="nginx" width="40" height="40"/>
   <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" alt="aws" width="40" height="40"/>
 </p>
 <p>
  The core of this app is a react frontend which interacts with a node.js/express backend. MongoDB serves as the database. The app is hosted using AWS EC2 and nginx to organize the server. I also use pm2 to keep tasks organized on the server. 
 </p>
 
</p>

<h2>Future Optimizations and Fixes:</h2>
<p>
  I could probably whittle away at this app forever. There are a lot of things that can be done better and some are baked in from the beginning so I think it will be more productive to keep moving and focus on new projects. A short list of some things I would change/fix:
  <ul>
    <li>The client should have its own folder on the same level as the server rather than being a sub folder. This would make things less confusing in a lot of places.</li>
    <li>Using react-router made linking pages together very easy but linking to a page on the website from outside very difficult once it was hosted. Maybe there is a quick fix to this that I didn't discover. Since this issue came so late in the process and didn't seem to cause major inconvenience to the user I let it be.</li>
    <li>If the above issue were fixed I would allow users to share links to trips inorder to join them</li>
    <li>Authentication through Google/Github/etc. would be cool...</li>
    <li>On any of the inputs where the user can add other users by name I would like some kind of search functionality or a suggestions dropdown to help them out. (At one point I planned to have a whole friends system and discovery page with profiles and stuff but that was massive scope creep for this project so I dialed it back)</li>
    <li>If you have a slow connection sometimes the previous screen will flash between the "Loading" and next screen. My whole loading flow is a bit tact on anyway and I would definitely make that a feature sooner if I redid the app.</li>
  </ul>
  
  I'm sure there are a lot of optimizations that more senior engineers could point out. Feel free to let me know your thoughts so I can keep improving :)
</p>

<h2>Lessons Learned:</h2>
<p>So many things were learned while making this app. I finally got the hang of how to split up the front end and the backend and have them both running. One of the key tricks was setting the request headers so that the frontend and backend could communiate effectively. This was also my first experience fully managing a server, getting into the weeds of DNS and SSL so it could run and look official. There were a lot of "aha" moments such as when I found out how to configure nginx to forward certain route endings to a separate port. Suddenly I understand why all the examples I saw use /api/... in their node routes! I'm really excited to build another app like this now that I have my feet wet. I can tell there is still a lot to learn but having that intial experience has made me more confident and also more curious about what else I am able to achieve.
</p>

<h2>Other Projects:</h2>
<p>See the links for more examples of my work:</p>
<a href="https://github.com/ajtoussaint/note-taking-app">Bekenstein Limit</a>
<br></br>
<a href="https://play.google.com/store/apps/details?id=com.Saint2.MMR">Arithmagic</a>
<br></br>
<a href="https://github.com/ajtoussaint/personal-website">Personal Portfolio Website</a>
