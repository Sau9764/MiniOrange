import React, { useEffect, useState } from 'react'
import Axios from 'axios'
import './App.css'

// If chrome does not support for http data trasfer use this to open new window in cmd
// "C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir=~/chromeTemp


function App() {
  
  // states
  const [data, setData] = useState({
    user: "",
    password: "",
  })
  const [isLoggedIn, setisLoggedIn] = useState(false)
  const [isLogout, setisLogout] = useState(false)

   // typing into the textfield handler
   function handle(e) {
    const newData = {...data}
    newData[e.target.id] = e.target.value
    setData(newData)
  }

  // onSubmit function
  function submit(e){
    e.preventDefault()

    // post call for authentication & getting token
    Axios.post("http://localhost:4000/login", {
      user: data.user,
      password: data.password
    })
    .then(res => {
      if(res.data == "Can't find user"){
        alert("Can't find user")
      }else if(res.data == 'Incorrect Password'){
        alert('Incorrect Password')
      }else if(res.data == 'Something went wrong'){
        alert('Something went wrong');
      }else{
        // setting login variable if(false) makes true
        if(!isLoggedIn) setisLoggedIn(!isLoggedIn)

        // Store in local session 
        const now = new Date()
        const dataStorage = {
          user: data.user,
          isLoggedIn: true,
          token: res.data.id_token,
          expiry: now.getTime() + (3000000) // this is for login component display after 3000000ms = 5min
        }

        // saves data on local storage for next time jwt
        localStorage.setItem('dataStorage', JSON.stringify(dataStorage));
      }
    })
  }

  // getting data from local storage every refresh
   useEffect(() => {
    const dataObj = JSON.parse(localStorage.getItem('dataStorage'))
    const now = new Date()
    // check present or not
    if(dataObj != null ){
      // check expire or not or pressed logout
      if (now.getTime() > dataObj.expiry || isLogout) {
        if(!isLogout) alert('Session Expired')
        localStorage.removeItem('dataStorage')
      }else{
        // 2nd time login through token stored in LocalStorage
        Axios.get('http://localhost:4000/callback', {
            headers: {
                Authorization: `token ${dataObj.token}`
            }
        })
        .then(async (res) => {
          if(res.data == 'Token not found' || res.data == 'Incorrect Token'){
            // if(true) makes false
            if(isLoggedIn) setisLoggedIn(!isLoggedIn)
            alert('Session Expired')
            localStorage.removeItem('dataStorage')
          }else{
            // after loading it getting false so make it true
            if(!isLoggedIn) setisLoggedIn(!isLoggedIn)
            setData(dataObj)
          }
        })  
      }
    }
  })

  // logout functionlity 
  function logout(e) {
    e.preventDefault()
    if(!isLogout) setisLogout(!isLogout)
    window.location.reload();
  }

  return (
    <div className="login">
      
      {!isLoggedIn &&
       <form onSubmit={(e) => submit(e)} className='login-form'>
         <h2 className="h2-text"> Log IN </h2>
            <label className="text">Enter User Name</label>
            <input 
                className="text-field"
                placeholder="Enter User Name" 
                type="text" 
                onChange={(e) => handle(e)} 
                id="user" 
                value={data.user}
                required
            />

            <label className="text">Enter Password</label>
            <input 
                className="text-field"
                placeholder="Enter Password" 
                type="password" 
                onChange={(e) => handle(e)} 
                id="password" 
                value={data.password}
                required
            />

            <button type="submit" className="btn">Submit</button>
        </form>
      }

      {isLoggedIn && 
        <div className="inner">
          <h4> Welcome {data.user}. You get automatically logout after 5 minutes or you can logout session :) </h4>
          <form onSubmit={(e) => logout(e)}>
            <button className="btn-logout" type="submit">Logout</button>
          </form>
        </div>
      }

    </div>
  );
}

export default App