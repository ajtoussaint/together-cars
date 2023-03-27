import img1 from "../images/Tutorial1.PNG"
import img2 from "../images/Tutorial2.PNG"
import img3 from "../images/Tutorial3.PNG"
import img4 from "../images/Tutorial4.PNG"
import img5 from "../images/Tutorial5.PNG"
import img6 from "../images/Tutorial6.PNG"
import img7 from "../images/Tutorial7.PNG"
import img8 from "../images/Tutorial8.PNG"
import img9 from "../images/Tutorial9.PNG"
import img10 from "../images/Tutorial10.PNG"
import img11 from "../images/Tutorial11.PNG"
import img12 from "../images/Tutorial12.PNG"

import { Link } from "react-router-dom";

export default function Demo(){
    return(
        <div id="demoWrapper">
            <Link to="/"><h2>Return Home</h2></Link>
            <h1>1.Sign in or Create an Account</h1>
            <p>If you havent done so already you will need to create an account to use Together Cars. 
                Doing so is easy, just enter a unique username and a password containing uppercase and lowercase letters, numbers, and a special character: !@#$%^&*().
                After registering you will be taken to the home page.</p>
            <img src={img1} alt="Login screen"></img>

            <h1>2.Creating Trips</h1>
            <p>If you have just registered your account you won't have been added to any trips yet.</p>
            <img src={img2} alt="Empty home screen"></img>
            <p>That's fine! You can crete a trip yourself. Click on the navigation button on the top left of the screen that says "Create a Trip".
                Once you do so you'll be taken to a screen that looks like this:
            </p>
            <img src={img3} alt="Create a trip screen"></img>
            <p>Enter the basic information for the trip you want to go on.
                Other users you invite on the trip will be able to see all of this information so they know whats happening.
                To add a participant to the trip type their Together Cars username in the designated box and click "Add participant".
                If the username is correct it will appear on a list below. If you don't know everyone going on the trip right away don't worry. 
                More users can be added later. Once you are satisfied with the details click on "Create my trip!"
            </p>
            
            <h1>3.Managing Trips</h1>
            <p>After you have created a trip you will be taken to a screen like this:</p>
            <img src={img4} alt="trip screen"></img>
            <p>At the top you will see all of the details of the trip that you entered on the previous page. There is also a button to delte the trip if you no longer need it.
                The left pannel shows everyone who has signed up to be a driver for the trip. Since the trip was just created no one has signed up.
                The right pannel shows a list of current participants and as the trip organizer you have the option to add more. 
                Let's go back to the home screen to see how you can access your trip. Click on the button at the very top left that says "Your Trips".
            </p>
            <img src={img5} alt="Home screen with a trip"></img>
            <p>As you can see the home screen has populated with the trip you just created. Notice that the stars by the title indicate that you are the trip organizer.</p>
            
            <h1>4.Joining Trips</h1>
            <p>If you are invited to a trip it will automatically show up on your home screen. Trips are sorted by arrival date so the soonest upcoming trip will be at the top.</p>
            <img src={img6} alt="Home screen with 2 trips"></img>
            <p>A new trip has appeared, let's check it out.</p>
            <img src={img7} alt="Andrew's Trip screen"></img>
            <p>You'll notice that when you join someone elses trip you won't have authority to invite other users.
                Also the "Delete Trip" button has been replaced with a "Leave Trip" button which you can use to remove yourself if you no longer want to go on the trip.
                In the left pannel you can see another user has offered to drive.
            </p>
            
            <h1>5.Being a Passenger</h1>
            <p>Signing up to become a passenger for a trip is simple. Find a driver in the drivers section with an open seat and click on it to join</p>
            <img src={img8} alt="become a passenger button"></img>
            <p>If you decide you would rather drive yourself or ride in a different car, leaving a seat is equally easy. Click on the X beneath your name and you will be removed.</p>
            <img src={img9} alt="exit vehicle button"></img>

            <h1>6.Being a Driver</h1>
            <p>If you want to drive yourself there are a few extra steps.
                To start, click on the big green button that says "I can Drive!" </p>
            <img src={img10} alt="Drive Button"></img>
            <p>After you do this you will see a driver form:</p>
            <img src={img11} alt="Driver form"></img>
            <p>Fill out the information as directed and click submit. You should appear in the list of drivers.
                If at any point you want to stop driving click the red "Stop Driving" button at the top right of your driver information. 
                Any passengers you may have will automatically be unassigned from your car.
            </p>
            <img src={img12} alt="Driver form"></img>
            <h1 id="thanksHeader">Thank you for using Together Cars!</h1>
            <br></br>
            <br></br>
            <Link to="/"><h2>Return Home</h2></Link>
            <br></br>
            <br></br>
        </div>
    )
}