import React, { createContext, useEffect, useState } from "react";
//Create a context to provide network status across the app
const NetworkStatusContext = createContext();
//Provider component to wrap components that need network status info
const NetworkStatusProvider = ({ children }) => {
  //Set initial network status using navigator.onLine property
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  //UseEffect to setup event listeners once when component mounts
  useEffect(() => {
    //Handler: When the browser is online, set isOnline to true
    const handleOnline = () => {
      setIsOnline(true); //Update state
    };
    //Handler: When the browser is offline, set isOnline to false
    const handleOffline = () => {
      setIsOnline(false); //Update state
    };
    //Attach event listeners for online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    //Cleanup function to remove event listeners on unmount
    return () => {
      //Remove event listeners
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  //Provide the current online status to all child components
  return (
    <NetworkStatusContext.Provider value={{ isOnline }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};
//Export the context and provider
export { NetworkStatusContext, NetworkStatusProvider };
