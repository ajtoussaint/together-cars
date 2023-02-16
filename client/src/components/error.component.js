import { Link } from "react-router-dom";

export default function Error(props){
 const {text, link} = props;

 return(
    <div id="errorPage">
      <h1>{text || "My Bad! An unexpected error has occured."}</h1>
      <h2><Link to={link || '/'}>Click here to return to Together Cars!</Link></h2>
    </div>
 )
}